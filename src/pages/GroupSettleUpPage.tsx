"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Users } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { PersonOption, PersonSelectDrawer } from "@/components/PersonSelectDrawer";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface SmartSettlementUser {
  _id: string;
  displayName?: string;
  username?: string;
  profilePhoto?: string | null;
}

interface SmartSettlementResult {
  from: string;
  to: string;
  amount: number;
  fromUser?: SmartSettlementUser;
  toUser?: SmartSettlementUser;
}

interface SmartBalance {
  userId: string;
  amount: number;
}

const GroupSettleUpPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const token = localStorage.getItem("token");

  const [friends, setFriends] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      profilePhoto?: string | null;
    }>
  >([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [smartSettlements, setSmartSettlements] = useState<SmartSettlementResult[]>([]);
  const [smartBalances, setSmartBalances] = useState<SmartBalance[]>([]);
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCreatingSmartSettle, setIsCreatingSmartSettle] = useState(false);

  const currentUserId = user?.id ?? "missing user";

  useEffect(() => {
    if (user?.friends && Array.isArray(user.friends)) {
      const formattedFriends = user.friends.map((friend) => ({
        id: friend.id,
        name: friend.displayName,
        username: friend.username,
        profilePhoto: friend.profilePhoto,
      }));

      setFriends(formattedFriends);

      setSelectedParticipants([currentUserId]);
    }
  }, [currentUserId, user]);

  const participantOptions: PersonOption[] = useMemo(
    () => [
      {
        id: currentUserId,
        name: user?.displayName ?? "You",
        username: user?.username ?? "",
        profilePhoto: user?.profilePhoto,
        isYou: true,
      },
      ...friends.map((friend) => ({
        id: friend.id,
        name: friend.name,
        username: friend.username,
        profilePhoto: friend.profilePhoto,
      })),
    ],
    [currentUserId, friends, user?.displayName, user?.profilePhoto, user?.username]
  );

  const handleSelectionChange = (selection: string[]) => {
    const withSelf = selection.includes(currentUserId)
      ? selection
      : [currentUserId, ...selection];

    setSelectedParticipants(Array.from(new Set(withSelf)));
    setSmartSettlements([]);
    setSmartBalances([]);
    setCurrentStep(1);
  };

  const getSmartSettleName = (
    id: string,
    payloadUser?: SmartSettlementUser
  ) => {
    if (payloadUser?.displayName) return payloadUser.displayName;
    if (payloadUser?.username) return `@${payloadUser.username}`;

    const person = participantOptions.find((option) => option.id === id);
    if (!person) return "Unknown user";

    return person.isYou ? `${person.name} (You)` : person.name;
  };

  const fetchSmartSettlePlan = async (): Promise<boolean> => {
    const participantsToSend = Array.from(new Set(selectedParticipants));

    if (participantsToSend.length < 2) {
      toast.error("Select at least two participants to settle");
      return false;
    }

    if (!token) {
      toast.error("Please log in again to continue");
      return false;
    }

    setIsSmartLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/transaction/smart-settle`,
        { participants: participantsToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSmartSettlements(response.data.settlements ?? []);
      setSmartBalances(response.data.balances ?? []);

      if ((response.data.settlements ?? []).length === 0) {
        toast.success("Everyone in this group is already settled!");
      }

      return true;
    } catch (error) {
      console.error("Error generating smart settle plan:", error);
      toast.error("Failed to generate smart settle plan");
      return false;
    } finally {
      setIsSmartLoading(false);
    }
  };

  const handleProceedToPreview = async () => {
    const success = await fetchSmartSettlePlan();

    if (success) {
      setCurrentStep(2);
    }
  };

  const acceptSmartSettlePlan = async () => {
    const participantsToSend = Array.from(new Set(selectedParticipants));

    if (!token) {
      toast.error("Please log in again to continue");
      return;
    }

    setIsCreatingSmartSettle(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/transaction/smart-settle/create`,
        { participants: participantsToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if ((response.data?.settlements ?? []).length === 0) {
        toast.success("Everyone in this group is already settled!");
      } else {
        toast.success("Smart settle created successfully");
      }

      setCurrentStep(3);
    } catch (error) {
      console.error("Error creating smart settle plan:", error);
      toast.error("Failed to create smart settle plan");
    } finally {
      setIsCreatingSmartSettle(false);
    }
  };

  const selectedPeople = selectedParticipants
    .map((id) => participantOptions.find((person) => person.id === id))
    .filter((person): person is PersonOption => Boolean(person));

  const steps = [
    {
      id: 1,
      title: "Select Participants",
    },
    {
      id: 2,
      title: "Preview Transfers",
    },
    {
      id: 3,
      title: "Record Settle Up",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold">Group Smart Settle</h1>
          <p className="text-muted-foreground text-sm">
            Minimise the number of transfers needed across your group.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "rounded-xl border p-3 text-left",
                currentStep === step.id
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-white"
              )}
            >
              <p className="text-xs font-semibold text-muted-foreground">Step {step.id}</p>
              <p className="text-sm font-semibold leading-tight">{step.title}</p>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <Card className="p-5 mb-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Select Participants</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-4 w-4" /> {selectedParticipants.length}
                </Badge>
              </div>

              <div>
                {selectedPeople.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={person.profilePhoto ?? undefined} />
                          <AvatarFallback>
                            {person.name?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm leading-tight">
                          <p className="font-semibold">
                            {person.isYou ? `${person.name} (You)` : person.name}
                          </p>
                          {person.username ? (
                            <p className="text-xs text-muted-foreground">
                              @{person.username}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add at least two participants to get started.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                >
                  Select participants
                </Button>
                <Button
                  type="button"
                  disabled={isSmartLoading || selectedParticipants.length < 2}
                  onClick={handleProceedToPreview}
                >
                  {isSmartLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Calculating
                    </span>
                  ) : (
                    "Preview smart settle"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-base font-semibold">Smart Settle Transfers</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-4 w-4" /> {selectedParticipants.length}
              </Badge>
            </div>

            {smartSettlements.length > 0 ? (
              <div className="space-y-4">
                {smartSettlements.map((settlement) => (
                  <div
                    key={`${settlement.from}-${settlement.to}-${settlement.amount}`}
                    className="flex items-center justify-between rounded-xl border border bg-white px-4 py-3"
                  >
                    <div className="text-sm">
                      <div className="font-semibold">
                        {getSmartSettleName(settlement.from, settlement.fromUser)}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <ArrowRight className="h-4 w-4" />
                        {getSmartSettleName(settlement.to, settlement.toUser)}
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      ${settlement.amount.toFixed(2)}
                    </div>
                  </div>
                ))}

                {smartBalances.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <p className="text-sm font-semibold">Group balances</p>
                    {smartBalances
                      .filter((balance) => Math.abs(balance.amount) > 0.009)
                      .map((balance) => (
                        <div
                          key={balance.userId}
                          className="flex items-center justify-between rounded-lg border border-muted/40 bg-muted/30 px-3 py-2 text-sm"
                        >
                          <span>{getSmartSettleName(balance.userId)}</span>
                          <span
                            className={cn(
                              "font-semibold",
                              balance.amount >= 0 ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {balance.amount >= 0 ? "+" : "-"}${
                              Math.abs(balance.amount).toFixed(2)
                            }
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-muted/50 bg-white/60 px-4 py-6 text-center text-sm text-muted-foreground">
                No transfers needed — this group is already settled.
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Change participants
              </Button>
              <Button
                type="button"
                disabled={isCreatingSmartSettle || isSmartLoading}
                onClick={acceptSmartSettlePlan}
              >
                {isCreatingSmartSettle ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving
                  </span>
                ) : (
                  "Accept suggestions"
                )}
              </Button>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-lg font-semibold">Smart settle recorded</p>
            <p className="text-sm text-muted-foreground">
              We created settle ups for your group based on the recommended transfers.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSmartSettlements([]);
                  setSmartBalances([]);
                  setCurrentStep(1);
                }}
              >
                Start another
              </Button>
              <Button className="flex-1" onClick={() => navigate(-1)}>
                Back to previous
              </Button>
            </div>
          </Card>
        )}
      </div>

      <PersonSelectDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Select participants"
        description="Pick friends to include in this settlement plan."
        people={participantOptions}
        selection={selectedParticipants}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};

export default GroupSettleUpPage;