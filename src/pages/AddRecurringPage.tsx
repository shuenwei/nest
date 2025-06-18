"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { RecurringTemplate } from "@/lib/recurring";

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
    const perUserAmount = totalPeople > 0 ? numericAmount / totalPeople : 0;

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
              className={`flex justify-between items-center ${
                remainingAmount < 0 ? "text-red-500" : "text-amber-500"
              }`}
            >
              <span className="text-sm font-medium">
                {remainingAmount < 0 ? "Over-allocated" : "Remaining"}
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

        {!isExactMatch && (
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
  selectedPeople: z.array(z.string()).nonempty("Select at least one user"),
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
  const [openPeopleSelect, setOpenPeopleSelect] = useState(false);
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

  const getFriendNameById = (id: string) =>
    id === currentUserId
      ? "You"
      : friends.find((f) => f.id === id)?.name ?? "Unknown";

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
      const evenAmount = (numericAmount / selectedPeople.length).toFixed(2);

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
    const evenAmount = (numericAmount / selectedPeople.length).toFixed(2);

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

      const difference = Math.abs(originalAmount - totalAmount);
      if (difference > 0.01) {
        toast.error("Error", {
          description: "The allocated amounts don't match the total expense",
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
          `${
            import.meta.env.VITE_API_URL
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
                          placeholder="Netflix Subscription, Rent, etc."
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
                            <SelectValue placeholder="Select frequency" />
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
                    <FormControl className="w-full">
                      <Select
                        key={field.value}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full px-4">
                          <SelectValue placeholder="Select who pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={currentUserId}>You</SelectItem>
                          {friends.map((friend) => (
                            <SelectItem key={friend.id} value={friend.id}>
                              {friend.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Popover
                          open={openPeopleSelect}
                          onOpenChange={setOpenPeopleSelect}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPeopleSelect}
                              className="w-full justify-between text-left font-normal px-3"
                            >
                              {field.value.length > 0
                                ? `${field.value.length} people selected`
                                : "Select people"}
                              <Plus className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="bottom"
                            align="center"
                            avoidCollisions={false}
                            className="w-full p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search people..." />
                              <CommandList>
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup className="max-h-70 overflow-y-auto">
                                  <CommandItem
                                    value={currentUserId}
                                    onSelect={() => {
                                      const newValue = field.value.includes(
                                        currentUserId
                                      )
                                        ? field.value.filter(
                                            (v) => v !== currentUserId
                                          )
                                        : [...field.value, currentUserId];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Checkbox
                                      checked={field.value.includes(
                                        currentUserId
                                      )}
                                      className="mr-2 h-4 w-4"
                                    />
                                    You
                                  </CommandItem>
                                  {friends.map((friend) => (
                                    <CommandItem
                                      key={friend.id}
                                      value={friend.name}
                                      onSelect={() => {
                                        const newValue = field.value.includes(
                                          friend.id
                                        )
                                          ? field.value.filter(
                                              (v) => v !== friend.id
                                            )
                                          : [...field.value, friend.id];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Checkbox
                                        checked={field.value.includes(
                                          friend.id
                                        )}
                                        className="mr-2 h-4 w-4"
                                      />
                                      {friend.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((userId) => (
                            <Badge
                              key={userId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {getFriendNameById(userId)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 text-muted-foreground/50 hover:text-foreground"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((v) => v !== userId)
                                  );
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
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
                        placeholder="Add notes about this recurring payment..."
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
      </div>
    </div>
  );
};

export default AddRecurringPage;
