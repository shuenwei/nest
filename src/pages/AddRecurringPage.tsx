"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, AlertCircle, ChevronDown, Minus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/lib/toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { startOfDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/contexts/UserContext";
import { PersonOption, PersonSelectDrawer } from "@/components/PersonSelectDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Split calculation component
interface SplitCalculationProps {
  amount: string;
  selectedPeople: string[];
  splitMethod: "even" | "manual";
  manualSplits: { user: string; amount: string }[];
  getFriendNameById: (id: string) => string;
}

const SplitCalculation: React.FC<SplitCalculationProps> = ({
  amount,
  selectedPeople,
  splitMethod,
  manualSplits,
  getFriendNameById,
}) => {
  // Don't show anything if no people are selected or amount is invalid
  if (!selectedPeople.length || !amount || isNaN(Number.parseFloat(amount))) {
    return null;
  }

  const numericAmount = Number.parseFloat(amount);

  if (splitMethod === "even") {
    // Even split calculation
    const totalPeople = selectedPeople.length;
    const perUserAmount =
      totalPeople > 0 ? Math.ceil((numericAmount / totalPeople) * 100) / 100 : 0;

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Split Preview (SGD)
        </div>
        <div className="bg-secondary rounded-lg p-3 space-y-2">
          {selectedPeople.map((user, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{getFriendNameById(user)}</span>
              <span className="font-medium">${perUserAmount.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-border flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="font-medium">${numericAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  } else {
    // Manual split calculation
    const manualSplitsInSgd = manualSplits.map((split) => {
      const splitAmount = Number.parseFloat(split.amount) || 0;
      return {
        ...split,
        amountInSgd: splitAmount,
      };
    });

    const totalManualAmount = manualSplitsInSgd.reduce(
      (sum, item) => sum + item.amountInSgd,
      0
    );
    const remainingAmount = numericAmount - totalManualAmount;
    const isExactMatch = Math.abs(remainingAmount) < 0.01;
    const isRoundUpExcess =
      remainingAmount < 0 &&
      Math.abs(remainingAmount) <= selectedPeople.length * 0.01 + 0.01;

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Split Preview (SGD)
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          {manualSplitsInSgd.map((split, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{getFriendNameById(split.user)}</span>
              <span className="font-medium">
                ${split.amountInSgd.toFixed(2)}
              </span>
            </div>
          ))}

          <div className="pt-1 mt-1 border-t border-border flex justify-between items-center">
            <span className="text-sm font-medium">Allocated</span>
            <span className="font-medium">${totalManualAmount.toFixed(2)}</span>
          </div>

          {!isExactMatch && (
            <div
              className={`flex justify-between items-center ${remainingAmount < 0
                ? isRoundUpExcess
                  ? "text-muted-foreground"
                  : "text-red-500"
                : "text-amber-500"
                }`}
            >
              <span className="text-sm font-medium">
                {remainingAmount < 0
                  ? isRoundUpExcess
                    ? "Excess (Round Up)"
                    : "Over-allocated"
                  : "Remaining"}
              </span>
              <span className="font-medium">
                ${Math.abs(remainingAmount).toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-1 mt-1 border-t border-border flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="font-medium">${numericAmount.toFixed(2)}</span>
          </div>
        </div>

        {!isExactMatch && !isRoundUpExcess && (
          <Alert variant={remainingAmount < 0 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {remainingAmount < 0
                ? "The allocated amount exceeds the total expense."
                : "The allocated amount doesn't match the total expense."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
};

const formSchema = z.object({
  templateName: z.string().min(1, "Transaction name is required"),
  amount: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: "Enter a valid amount",
  }),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.date(),
  paidBy: z.string(),
  splitMethod: z.enum(["even", "manual"]),
  selectedPeople: z.array(z.string()).min(1, "Select at least one user"),
  manualSplits: z.array(
    z.object({
      user: z.string(),
      amount: z
        .string()
        .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
          message: "Enter a valid amount",
        }),
    })
  ),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddRecurringPage = () => {
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [paidByDrawerOpen, setPaidByDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { recurringId } = useParams<{ recurringId?: string }>();
  const isEditMode = !!recurringId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const [initializing, setInitializing] = useState(true);

  const { user, refreshUser, fetchRecurringTemplates, recurringTemplates } =
    useUser();

  const [friends, setFriends] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      profilePhoto?: string | null;
    }>
  >([]);

  const currentUserId = user?.id ?? "missing user";

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
    [
      currentUserId,
      friends,
      user?.displayName,
      user?.profilePhoto,
      user?.username,
    ]
  );

  useEffect(() => {
    if (user?.friends && Array.isArray(user.friends)) {
      const formattedFriends = user.friends.map((friend) => ({
        id: friend.id,
        name: friend.displayName,
        username: friend.username,
        profilePhoto: friend.profilePhoto,
      }));

      setFriends(formattedFriends);
    }
  }, [user]);

  const getFriendNameById = (id: string) => {
    const person = participantOptions.find((option) => option.id === id);
    if (!person) return "Unknown";
    return person.isYou ? `${person.name} (You)` : person.name;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: "",
      amount: "",
      frequency: "monthly",
      startDate: new Date(),
      paidBy: currentUserId,
      splitMethod: "even",
      selectedPeople: [],
      manualSplits: [],
      notes: "",
    },
  });

  const { fields: manualSplitFields, replace: replaceManualSplits } =
    useFieldArray({
      control: form.control,
      name: "manualSplits",
    });

  // Populate form when editing an existing template
  useEffect(() => {
    if (!isEditMode) {
      setInitializing(false);
      return;
    }

    if (!recurringId || !recurringTemplates) {
      toast.error("Error loading recurring template to edit.");
      navigate(`/recurring/${recurringId}`);
      setInitializing(false);
      return;
    }

    const existing = recurringTemplates.find((t) => t._id === recurringId);
    if (!existing) {
      toast.error("Error loading recurring template to edit.");
      navigate(-1);
      setInitializing(false);
      return;
    }

    const manualSplitsData = existing.splitsInSgd.map((s) => ({
      user: s.user,
      amount: s.amount.toFixed(2),
    }));

    form.reset({
      templateName: existing.transactionName,
      amount: existing.amount.toFixed(2),
      frequency: existing.frequency,
      startDate: new Date(existing.nextDate),
      paidBy: existing.paidBy,
      splitMethod: "manual",
      selectedPeople: existing.splitsInSgd.map((s) => s.user),
      manualSplits: manualSplitsData,
      notes: existing.notes ?? "",
    });

    console.log(existing.frequency);

    replaceManualSplits(manualSplitsData);
    setInitializing(false);
  }, [
    isEditMode,
    recurringId,
    recurringTemplates,
    form,
    replaceManualSplits,
    navigate,
  ]);

  // Watch for changes to update UI
  const amount = form.watch("amount");
  const selectedPeople = form.watch("selectedPeople");
  const splitMethod = form.watch("splitMethod");
  const manualSplits = form.watch("manualSplits");
  const paidBy = form.watch("paidBy");

  // Update manual splits when selected people change
  useEffect(() => {
    if (initializing) return;

    const currentPeople = new Set(manualSplits.map((split) => split.user));
    const newSplits = [...manualSplits];

    // Add new people
    selectedPeople.forEach((user) => {
      if (!currentPeople.has(user)) {
        newSplits.push({ user, amount: "" });
      }
    });

    // Remove people who are no longer selected
    const filteredSplits = newSplits.filter((split) =>
      selectedPeople.includes(split.user)
    );

    // If amount is available and split method is even, pre-fill with even amounts
    if (
      amount &&
      !isNaN(Number.parseFloat(amount)) &&
      splitMethod === "even" &&
      selectedPeople.length > 0
    ) {
      const numericAmount = Number.parseFloat(amount);
      const evenAmount = (
        Math.ceil((numericAmount / selectedPeople.length) * 100) / 100
      ).toFixed(2);

      filteredSplits.forEach((split) => {
        split.amount = evenAmount;
      });
    }

    replaceManualSplits(filteredSplits);
  }, [selectedPeople, amount, splitMethod, replaceManualSplits]);

  // Auto-distribute remaining amount when in manual mode
  const distributeRemaining = () => {
    if (
      !amount ||
      isNaN(Number.parseFloat(amount)) ||
      selectedPeople.length === 0
    )
      return;

    const numericAmount = Number.parseFloat(amount);
    const evenAmount = (
      Math.ceil((numericAmount / selectedPeople.length) * 100) / 100
    ).toFixed(2);

    const newSplits = selectedPeople.map((user) => ({
      user,
      amount: evenAmount,
    }));

    replaceManualSplits(newSplits);
  };

  // Custom validation handler for amount field
  const validateAmount = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return false;
    }
    return true;
  };

  async function onSubmit(values: FormValues) {
    const originalAmount = Number.parseFloat(values.amount);

    // Convert manual splits to proper format
    const sgdManualSplits = values.manualSplits.map((split) => {
      const splitAmount = Number.parseFloat(split.amount) || 0;
      return {
        user: split.user,
        amount: splitAmount,
      };
    });

    // Validate that manual splits add up to the total if using manual split
    if (values.splitMethod === "manual") {
      const totalAmount = sgdManualSplits.reduce((sum, item) => {
        return sum + item.amount;
      }, 0);

      if (totalAmount < originalAmount - 0.01) {
        toast.error("Error", {
          description: "The allocated amounts are less than the total expense",
        });
        return;
      }

      // Block if OVER-allocated by more than the safe round-up limit
      const maxExcess = values.selectedPeople.length * 0.01 + 0.01;
      if (totalAmount > originalAmount + maxExcess) {
        toast.error("Error", {
          description: "The allocated amounts exceed the total expense",
        });
        return;
      }
    }

    const participants = Array.from(
      new Set([...values.selectedPeople, values.paidBy, currentUserId])
    );

    const payload = {
      transactionName: values.templateName,
      amount: originalAmount,
      frequency: values.frequency,
      nextDate: zonedTimeToUtc(startOfDay(values.startDate), "Asia/Singapore"),
      participants: participants,
      paidBy: values.paidBy,
      splitMethod: values.splitMethod,
      splitsInSgd: sgdManualSplits,
      notes: values.notes ?? "",
    };

    setIsSubmitting(true);
    try {
      if (!isEditMode) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/transaction/recurring/create`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();
        await fetchRecurringTemplates();
        console.log(response);
        toast.success("Success!", {
          description: "Recurring transaction added successfully!",
        });
        navigate("/recurring");
      } else {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL
          }/transaction/recurring/update/${recurringId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();
        await fetchRecurringTemplates();
        console.log(response);
        toast.success("Success!", {
          description: "Recurring transaction updated successfully!",
        });
        navigate(-1);
      }
    } catch (err) {
      console.error("Error saving recurring template:", err);
      toast.error("Failed to save recurring transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedPayer = participantOptions.find(
    (p) => p.id === form.getValues("paidBy")
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4 overscroll-none">
      <div className="w-full max-w-sm pt-5 pb-30">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => navigate("/recurring")}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode
              ? "Edit Recurring Transaction"
              : "Add Recurring Transaction"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode ? "" : "Add a new recurring transaction"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="p-6 mb-4">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="templateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (validateAmount(value)) {
                                field.onChange(value);
                              }
                            }}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                field.onChange(val.toFixed(2));
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl className="w-full">
                        <Select
                          key={field.value}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full pl-3 pr-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-30" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) field.onChange(date);
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6 mb-4">
              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Paid by</FormLabel>
                    <FormControl>
                      <div>
                        {selectedPayer ? (
                          <div
                            onClick={() => setPaidByDrawerOpen(true)}
                            className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl cursor-pointer hover:bg-secondary/40 transition-colors border border-border"
                          >
                            <Avatar className="h-10 w-10 border border-background">
                              <AvatarImage
                                src={selectedPayer.profilePhoto || ""}
                                alt={selectedPayer.name}
                              />
                              <AvatarFallback>
                                {selectedPayer.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-sm flex items-center">
                                {selectedPayer.name}
                                {selectedPayer.isYou && (
                                  <span className="ml-2">
                                    <Badge className="font-semibold text-[10px] px-1.5 py-0 h-5">You</Badge>
                                  </span>
                                )}
                              </span>
                              {selectedPayer.username && (
                                <span className="text-xs text-muted-foreground/60">
                                  @{selectedPayer.username}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setPaidByDrawerOpen(true)}
                            className="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors border border-dashed border-border/60"
                          >
                            <div className="h-10 w-10 rounded-full bg-secondary/30" />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-muted-foreground">
                                Select who paid
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 mb-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="splitMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Split Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="even" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Split equally
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="manual" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Split manually
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selectedPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Split Between</FormLabel>
                      <FormControl>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between text-left font-normal px-3 h-11"
                            onClick={() => setParticipantsDrawerOpen(true)}
                          >
                            {field.value.length > 0
                              ? `${field.value.length} people selected`
                              : "Select people"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                          </Button>
                        </div>
                      </FormControl>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((userId) => {
                            const person = participantOptions.find(
                              (opt) => opt.id === userId
                            );
                            if (!person) return null;
                            return (
                              <div
                                key={userId}
                                className="flex items-center gap-2 p-1.5 pr-2 bg-secondary/20 rounded-full border border-border/50"
                              >
                                <Avatar className="h-5 w-5 border border-background">
                                  <AvatarImage
                                    src={person.profilePhoto || ""}
                                    alt={person.name}
                                  />
                                  <AvatarFallback className="text-[10px]">
                                    {person.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">
                                  {person.isYou ? "You" : person.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manual Split Inputs */}
                {splitMethod === "manual" && selectedPeople.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <FormLabel>Manual Split Amounts</FormLabel>
                      <Button
                        type="button"
                        size="sm"
                        className="font-normal"
                        onClick={distributeRemaining}
                      >
                        Distribute Evenly
                      </Button>
                    </div>

                    {manualSplitFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3">
                        <div className="flex-grow-0 min-w-[120px]">
                          <span className="text-sm">
                            {getFriendNameById(field.user)}
                          </span>
                        </div>
                        <FormField
                          control={form.control}
                          name={`manualSplits.${index}.amount`}
                          render={({ field: amountField }) => (
                            <FormItem className="flex-grow mb-0">
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                  </span>
                                  <Input
                                    {...amountField}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    className="pl-8"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (validateAmount(value)) {
                                        amountField.onChange(value);
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Split Calculation Display */}
                <SplitCalculation
                  amount={amount}
                  selectedPeople={selectedPeople}
                  splitMethod={splitMethod}
                  manualSplits={manualSplits}
                  getFriendNameById={getFriendNameById}
                />
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Recurring Transaction"}
            </Button>
          </form>
        </Form>

        {/* Drawers */}
        <PersonSelectDrawer
          open={paidByDrawerOpen}
          onOpenChange={setPaidByDrawerOpen}
          people={participantOptions}
          selection={[form.getValues("paidBy")]}
          onSelectionChange={(selectedIds) => {
            if (selectedIds.length > 0) {
              form.setValue("paidBy", selectedIds[0]);
              setPaidByDrawerOpen(false);
            }
          }}
          title="Who Paid?"
          description="Select the person who paid for this."
          mode="single"
        />

        <PersonSelectDrawer
          open={participantsDrawerOpen}
          onOpenChange={setParticipantsDrawerOpen}
          people={participantOptions}
          selection={selectedPeople}
          onSelectionChange={(selectedIds) => {
            form.setValue("selectedPeople", selectedIds);
          }}
          title="Split Between"
          description="Select people to split this bill with."
          mode="multiple"
        />
      </div>
    </div>
  );
};

export default AddRecurringPage;
