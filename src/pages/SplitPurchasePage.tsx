"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Minus,
  Plus,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { usePreserveScroll } from "@/hooks/use-preserve-scroll";
import { useUser } from "@/contexts/UserContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { PurchaseTransaction } from "@/lib/transaction";
import axios from "axios";

interface ExchangeRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onRateConfirm: (rate: number, sgdAmount: number | null) => void;
  defaultRate: number;
  amount: string;
}

const ExchangeRateDialog: React.FC<ExchangeRateDialogProps> = ({
  open,
  onOpenChange,
  currency,
  onRateConfirm,
  defaultRate,
  amount,
}) => {
  const [activeTab, setActiveTab] = useState<"rate" | "sgd">("rate");
  const [rate, setRate] = useState(defaultRate.toString());
  const [sgdAmount, setSgdAmount] = useState("");

  useEffect(() => {
    // Initialize with default rate
    setRate(defaultRate.toString());

    // Calculate SGD amount based on default rate if amount is available
    if (amount && !isNaN(Number.parseFloat(amount))) {
      const foreignAmount = Number.parseFloat(amount);
      const calculatedSgd = (foreignAmount / defaultRate).toFixed(2);
      setSgdAmount(calculatedSgd);
    } else {
      setSgdAmount("");
    }
  }, [defaultRate, amount, open]);

  const handleRateChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setRate(value);

      // Update SGD amount when rate changes
      if (
        amount &&
        value &&
        !isNaN(Number.parseFloat(amount)) &&
        !isNaN(Number.parseFloat(value)) &&
        Number.parseFloat(value) > 0
      ) {
        const foreignAmount = Number.parseFloat(amount);
        const newRate = Number.parseFloat(value);
        const calculatedSgd = (foreignAmount / newRate).toFixed(2);
        setSgdAmount(calculatedSgd);
      }
    }
  };

  const handleSgdAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setSgdAmount(value);

      // Update rate when SGD amount changes
      if (
        amount &&
        value &&
        !isNaN(Number.parseFloat(amount)) &&
        !isNaN(Number.parseFloat(value)) &&
        Number.parseFloat(value) > 0
      ) {
        const foreignAmount = Number.parseFloat(amount);
        const newSgdAmount = Number.parseFloat(value);
        const calculatedRate = (foreignAmount / newSgdAmount).toFixed(4);
        setRate(calculatedRate);
      }
    }
  };

  const handleConfirm = () => {
    const rateValue = Number.parseFloat(rate);
    if (!isNaN(rateValue) && rateValue > 0) {
      onRateConfirm(
        rateValue,
        activeTab === "sgd" && sgdAmount ? Number.parseFloat(sgdAmount) : null
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Currency Conversion</DialogTitle>
          <DialogDescription>
            {activeTab === "rate"
              ? `Enter the exchange rate for ${currency} to SGD (1 SGD = ? ${currency})`
              : `Enter the equivalent amount in SGD`}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "rate" | "sgd")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rate">Set Exchange Rate</TabsTrigger>
            <TabsTrigger value="sgd">Set SGD Amount</TabsTrigger>
          </TabsList>

          <TabsContent value="rate" className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 font-medium">1 SGD =</div>
              <Input
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="flex-1"
              />
              <div className="w-12">{currency}</div>
            </div>

            {amount &&
              rate &&
              !isNaN(Number.parseFloat(amount)) &&
              !isNaN(Number.parseFloat(rate)) &&
              Number.parseFloat(rate) > 0 && (
                <div className="text-sm text-muted-foreground">
                  {Number.parseFloat(amount).toFixed(2)} {currency} ≈ $
                  {Number.parseFloat(sgdAmount).toFixed(2)} SGD
                </div>
              )}
          </TabsContent>

          <TabsContent value="sgd" className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="whitespace-nowrap font-medium">
                  {amount} {currency} =
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div>$</div>
                <Input
                  value={sgdAmount}
                  onChange={(e) => handleSgdAmountChange(e.target.value)}
                  className="flex-1"
                />
                <div className="pl-3">SGD</div>
              </div>
            </div>

            {amount &&
              sgdAmount &&
              !isNaN(Number.parseFloat(amount)) &&
              !isNaN(Number.parseFloat(sgdAmount)) &&
              Number.parseFloat(sgdAmount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Exchange rate: 1 SGD = {Number.parseFloat(rate).toFixed(4)}{" "}
                  {currency}
                </div>
              )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Split calculation component
interface SplitCalculationProps {
  amount: string;
  selectedPeople: string[];
  splitMethod: "even" | "manual";
  manualSplits: { user: string; amount: string }[];
  currency: string;
  exchangeRate: number;
  getFriendNameById: (id: string) => string;
}

const SplitCalculation: React.FC<SplitCalculationProps> = ({
  amount,
  selectedPeople,
  splitMethod,
  manualSplits,
  currency,
  exchangeRate,
  getFriendNameById,
}) => {
  // Don't show anything if no people are selected or amount is invalid
  if (!selectedPeople.length || !amount || isNaN(Number.parseFloat(amount))) {
    return null;
  }

  const numericAmount = Number.parseFloat(amount);
  const sgdAmount =
    currency === "SGD" ? numericAmount : numericAmount / exchangeRate;

  if (splitMethod === "even") {
    // Even split calculation
    const totalPeople = selectedPeople.length; // Only split among selected people
    const peruserAmount = totalPeople > 0 ? sgdAmount / totalPeople : 0;

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Split Preview (in SGD)
        </div>
        <div className="bg-secondary rounded-lg p-3 space-y-2">
          {selectedPeople.map((user, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{getFriendNameById(user)}</span>
              <span className="font-medium">${peruserAmount.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-border flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="font-medium">${sgdAmount.toFixed(2)}</span>
          </div>

          {currency !== "SGD" && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              Original: {numericAmount.toFixed(2)} {currency} (Rate: 1 SGD ={" "}
              {exchangeRate.toFixed(4)} {currency})
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // Manual split calculation - convert all manual splits to SGD
    const manualSplitsInSgd = manualSplits.map((split) => {
      const splitAmount = Number.parseFloat(split.amount) || 0;
      // If currency is not SGD, convert to SGD
      const splitAmountInSgd =
        currency === "SGD" ? splitAmount : splitAmount / exchangeRate;
      return {
        ...split,
        amountInSgd: splitAmountInSgd,
      };
    });

    const totalManualAmount = manualSplitsInSgd.reduce(
      (sum, item) => sum + item.amountInSgd,
      0
    );
    const remainingAmount = sgdAmount - totalManualAmount;
    const isExactMatch = Math.abs(remainingAmount) < 0.01; // Allow for small floating point errors

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Split Preview (in SGD)
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
            <span className="font-medium">${sgdAmount.toFixed(2)}</span>
          </div>

          {currency !== "SGD" && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              Original: {numericAmount.toFixed(2)} {currency} (Rate: 1 SGD ={" "}
              {exchangeRate.toFixed(4)} {currency})
            </div>
          )}
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
  transactionname: z.string().min(1, "Transaction name is required"),
  amount: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val)),
  currency: z.string(),
  date: z.date(),
  paidBy: z.string(),
  splitMethod: z.enum(["even", "manual"]),
  selectedPeople: z.array(z.string()).nonempty("Select at least one user"),
  manualSplits: z.array(
    z.object({
      user: z.string(),
      amount: z
        .string()
        .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
          message: "Amount must be a number with up to 2 decimal places",
        }),
    })
  ),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SplitPurchasePage = () => {
  const [openPeopleSelect, setOpenPeopleSelect] = useState(false);
  const [showExchangeRateDialog, setShowExchangeRateDialog] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const { transactionId } = useParams<{ transactionId?: string }>();
  const isEditMode = !!transactionId;
  const [initializing, setInitializing] = useState(true);

  usePreserveScroll();

  const { user, refreshUser, transactions } = useUser();

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

  // State for exchange rates
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [sgdEquivalent, setSgdEquivalent] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionname: "",
      amount: "",
      currency: "SGD",
      date: new Date(),
      paidBy: currentUserId,
      splitMethod: "even",
      selectedPeople: [],
      manualSplits: [],
      notes: "",
    },
  });

  // Populate form when editing an existing transaction
  useEffect(() => {
    if (!isEditMode || !transactionId) {
      setInitializing(false);
      return;
    }

    const existing = transactions.find((t) => t._id === transactionId);
    if (!existing || existing.type !== "purchase") {
      toast.error("Error loading transaction to edit.");
      navigate(-1);
      setInitializing(false);
      return;
    }

    const data = existing as PurchaseTransaction;

    const manualSplitsData = data.manualSplits.map((s) => ({
      user: s.user,
      amount: s.amount.toFixed(2),
    }));

    form.reset({
      transactionname: data.transactionName,
      amount: data.amount.toFixed(2),
      currency: data.currency,
      date: new Date(data.date),
      paidBy: data.paidBy,
      splitMethod: data.splitMethod,
      selectedPeople: data.splitsInSgd.map((split) => split.user),
      manualSplits: data.manualSplits.map((s) => ({
        user: s.user,
        amount: s.amount.toFixed(2),
      })),
      notes: data.notes ?? "",
    });

    setCurrentExchangeRate(data.exchangeRate);
    replaceManualSplits(manualSplitsData);
    setInitializing(false);
  }, [isEditMode, transactionId, transactions, form]);

  const { fields: manualSplitFields, replace: replaceManualSplits } =
    useFieldArray({
      control: form.control,
      name: "manualSplits",
    });

  // Watch for changes to update UI
  const amount = form.watch("amount");
  const selectedPeople = form.watch("selectedPeople");
  const splitMethod = form.watch("splitMethod");
  const manualSplits = form.watch("manualSplits");
  const currency = form.watch("currency");

  // Handle currency change
  useEffect(() => {
    if (isEditMode) return;

    const fetchRate = async () => {
      if (currency === "SGD") {
        setCurrentExchangeRate(1);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/exchange/${currency}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.data;

        if (data) {
          setCurrentExchangeRate(data.rate);
        } else {
          console.warn("Invalid rate received from API.");
          setCurrentExchangeRate(1);
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate from API:", err);
        setCurrentExchangeRate(1);
      }
    };

    if (currency && currency !== "SGD") {
      fetchRate();
    } else {
      setCurrentExchangeRate(1);
    }
  }, [currency]);

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

  // Handle exchange rate confirmation
  const handleExchangeRateConfirm = (
    rate: number,
    sgdAmount: number | null
  ) => {
    setCurrentExchangeRate(rate);
    setSgdEquivalent(sgdAmount);
  };

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
    // Convert all amounts to SGD for saving
    const originalAmount = Number.parseFloat(values.amount);
    const sgdAmount =
      values.currency === "SGD"
        ? originalAmount
        : originalAmount / currentExchangeRate;

    // Convert manual splits to SGD if needed
    const sgdManualSplits = values.manualSplits.map((split) => {
      const splitAmount = Number.parseFloat(split.amount) || 0;
      const splitAmountInSgd =
        values.currency === "SGD"
          ? splitAmount
          : splitAmount / currentExchangeRate;
      return {
        user: split.user,
        amount: splitAmountInSgd.toFixed(2),
      };
    });

    // Validate that manual splits add up to the total if using manual split
    if (values.splitMethod === "manual") {
      const totalSgdAmount = sgdManualSplits.reduce((sum, item) => {
        return sum + (Number.parseFloat(item.amount) || 0);
      }, 0);

      const difference = Math.abs(sgdAmount - totalSgdAmount);
      if (difference > 0.01) {
        // Allow for small floating point errors
        toast.error("Error", {
          description: "The allocated amounts don't match the total expense",
        });
        return;
      }
    }

    const participants = Array.from(
      new Set([...values.selectedPeople, values.paidBy])
    );

    const payload = {
      transactionName: values.transactionname,
      type: "purchase",
      participants: participants,
      currency: values.currency,
      exchangeRate: currentExchangeRate,
      amount: originalAmount,
      amountInSgd: parseFloat(sgdAmount.toFixed(2)),
      notes: values.notes ?? "",
      date: values.date,
      paidBy: values.paidBy,
      splitMethod: values.splitMethod,
      manualSplits: manualSplits,
      splitsInSgd: sgdManualSplits,
    };
    setIsSubmitting(true);
    try {
      if (!isEditMode) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/transaction/purchase/create`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();
        console.log(response);
        toast.success("Success!", {
          description: "Expense split added successfully!",
        });
        navigate("/history");
      } else {
        const response = await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/transaction/purchase/update/${transactionId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();
        console.log(response);
        toast.success("Success!", {
          description: "Expense split updated successfully!",
        });
        navigate(-1);
      }
    } catch (err) {
      console.error("Error updating purchase:", err);
      toast.error("Failed to update expense.");
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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Purchase" : "Split Purchase"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode ? "" : "Add a new purchase split"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="p-6 mb-4">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="transactionname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dinner, Movie tickets, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-6 gap-x-4 gap-y-2 w-full">
                  {/* --- Amount ---------------------------------------------------- */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="col-span-4 w-full">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="w-full"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (validateAmount(value)) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* --- Currency -------------------------------------------------- */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="col-span-2 w-full">
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between text-left font-normal px-3 h-11"
                              >
                                {field.value
                                  ? SUPPORTED_CURRENCIES.find(
                                      (c) => c.code === field.value
                                    )?.code
                                  : "Select currency"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="bottom"
                              align="center"
                              avoidCollisions={false}
                              className="w-30 p-0"
                            >
                              <Command>
                                <CommandInput placeholder="Search" />
                                <CommandEmpty>No currency found.</CommandEmpty>
                                <CommandGroup className="max-h-70 overflow-y-auto">
                                  {SUPPORTED_CURRENCIES.map((curr) => (
                                    <CommandItem
                                      key={curr.code}
                                      value={`${curr.code} ${curr.name}`}
                                      onSelect={() => field.onChange(curr.code)}
                                    >
                                      {curr.code}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- Exchange‑rate + button ------------------- */}
                  {currency !== "SGD" &&
                    amount &&
                    !isNaN(Number.parseFloat(amount)) && (
                      <div className="col-span-6 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          ≈ $
                          {(
                            Number.parseFloat(amount) / currentExchangeRate
                          ).toFixed(2)}{" "}
                          SGD
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="leftIcon"
                          className="h-5 has-[>svg]:px-1"
                          onClick={() => setShowExchangeRateDialog(true)}
                        >
                          <RefreshCw />
                          <span className="text-xs">Update Rate</span>
                        </Button>
                      </div>
                    )}
                </div>
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
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full px-4">
                          <SelectValue placeholder="Select who paid" />
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
                                    {currency}
                                  </span>
                                  <Input
                                    {...amountField}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    className="pl-12"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (validateAmount(value)) {
                                        amountField.onChange(value);
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              {currency !== "SGD" &&
                                amountField.value &&
                                !isNaN(
                                  Number.parseFloat(amountField.value)
                                ) && (
                                  <FormDescription className="text-xs">
                                    ≈ $
                                    {(
                                      Number.parseFloat(amountField.value) /
                                      currentExchangeRate
                                    ).toFixed(2)}{" "}
                                    SGD
                                  </FormDescription>
                                )}
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
                  currency={currency}
                  exchangeRate={currentExchangeRate}
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
                        placeholder="Add notes about this expense..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </Form>
      </div>

      <ExchangeRateDialog
        open={showExchangeRateDialog}
        onOpenChange={setShowExchangeRateDialog}
        currency={currency}
        onRateConfirm={handleExchangeRateConfirm}
        defaultRate={currentExchangeRate}
        amount={amount}
      />
    </div>
  );
};

export default SplitPurchasePage;
