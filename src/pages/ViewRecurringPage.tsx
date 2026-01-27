"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { RecurringTemplate } from "@/lib/recurring";
import axios from "axios";
import { toast } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ViewRecurringPage = () => {
  const navigate = useNavigate();
  const { recurringId } = useParams<{ recurringId: string }>();
  const { user, recurringTemplates, fetchRecurringTemplates } = useUser();
  const [template, setTemplate] = useState<RecurringTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const friends = user?.friends || [];

  const getFriendDetails = (userId: string) => {
    if (userId === user?.id) {
      return {
        displayName: `${user?.displayName || "You"} (You)`,
        profilePhoto: user?.profilePhoto || null,
        username: user?.username,
      };
    }
    const friend = friends.find((f) => f.id === userId);
    return {
      displayName: friend?.displayName ?? "Unknown",
      profilePhoto: friend?.profilePhoto || null,
      username: friend?.username,
    };
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const formatNextDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!recurringId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/transaction/recurring/${recurringId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/recurring");
      await fetchRecurringTemplates();
      toast.success("Recurring transaction deleted successfully");
      return;
    } catch (error) {
      console.error("Error deleting recurring template:", error);
      toast.error("Failed to delete recurring transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!template) return;

    navigate(`/recurring/edit/${recurringId}`);
  };

  useEffect(() => {
    const load = async () => {
      if (!recurringTemplates && user?.id) {
        await fetchRecurringTemplates();
      }
    };

    load();
  }, [user?.id, recurringTemplates, fetchRecurringTemplates]);

  useEffect(() => {
    if (!recurringId || !recurringTemplates) {
      return;
    }

    const foundTemplate = recurringTemplates.find((t) => t._id === recurringId);

    if (foundTemplate) {
      setTemplate(foundTemplate);
    } else {
      toast.error("Failed to load recurring transaction");
      navigate("/recurring");
    }
  }, [recurringId, recurringTemplates, navigate]);

  if (!template || !user) return null;

  const paidBy = getFriendDetails(template.paidBy);

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
            <span className="text-base font-medium">Back</span>
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil />
            </Button>

            {/* Delete Confirmation Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recurring Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this recurring transaction?
                    This action cannot be undone and will stop all future
                    associated transactions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Recurring Template Header */}
        <Card className="mb-6 shadow-none border-none bg-transparent">
          <CardContent className="px-0 pb-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-none text-3xl border mb-4">
              🔁
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">
                ${template.amount.toFixed(2)}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatFrequency(template.frequency)}
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <h2 className="font-semibold text-xl">
                {template.transactionName}
              </h2>
              <p className="text-xs text-muted-foreground">
                Next Payment: {formatNextDueDate(template.nextDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Template Details */}
        <Card className="mb-3 py-0 shadow-none">
          <CardContent className="p-0 space-y-6 py-6">
            {/* Paid By Section */}
            <div className="px-6">
              <p className="text-xs font-medium text-muted-foreground mb-3 font-medium">
                Paid By
              </p>
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={paidBy.profilePhoto || ""}
                    alt={paidBy.displayName}
                  />
                  <AvatarFallback className="text-xs">
                    {paidBy.displayName
                      .replace(" (You)", "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {paidBy.displayName}
                  </span>
                  {paidBy.username && (
                    <span className="text-[10px] text-muted-foreground">
                      @{paidBy.username}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Splits Section */}
            <div className="px-6">
              <p className="text-xs font-medium text-muted-foreground mb-4 font-medium">
                Split Among
              </p>
              <div className="space-y-4">
                {template.splitsInSgd.map((split, index) => {
                  const splitUser = getFriendDetails(split.user);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={splitUser.profilePhoto || ""}
                            alt={splitUser.displayName}
                          />
                          <AvatarFallback className="text-xs">
                            {splitUser.displayName
                              .replace(" (You)", "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {splitUser.displayName}
                          </span>
                          {splitUser.username && (
                            <span className="text-[10px] text-muted-foreground">
                              @{splitUser.username}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        ${split.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Section (if available) */}
            {template.notes && (
              <div className="px-6">
                <p className="text-xs font-medium text-muted-foreground mb-2 font-medium">
                  Notes
                </p>
                <div className="p-3 bg-secondary/50 rounded-lg text-sm border border-border/50">
                  {template.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewRecurringPage;
