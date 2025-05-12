"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// Mock default exchange rates that would normally come from the backend
// Rates are expressed as 1 SGD = X Foreign Currency
const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 0.74,
  EUR: 0.68,
  GBP: 0.58,
  JPY: 113.5,
  CNY: 5.36,
  SGD: 1.0,
};

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
      <DialogContent className="sm:max-w-md">
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
                <div className="font-medium">
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
                <div>SGD</div>
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
  manualSplits: { person: string; amount: string }[];
  currency: string;
  exchangeRate: number;
}

const SplitCalculation: React.FC<SplitCalculationProps> = ({
  amount,
  selectedPeople,
  splitMethod,
  manualSplits,
  currency,
  exchangeRate,
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
    const perPersonAmount = totalPeople > 0 ? sgdAmount / totalPeople : 0;

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Split Preview (in SGD)
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          {selectedPeople.map((person, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{person}</span>
              <span className="font-medium">${perPersonAmount.toFixed(2)}</span>
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
              <span className="text-sm">{split.person}</span>
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

const currencies = ["SGD", "USD", "EUR", "GBP", "JPY", "CNY"];

const friends = [
  { id: "1", name: "Alex Wong" },
  { id: "2", name: "Mei Lin" },
  { id: "3", name: "Raj Patel" },
  { id: "4", name: "Sarah Johnson" },
  { id: "5", name: "David Chen" },
];

const formSchema = z.object({
  transactionname: z.string().min(1, "Transaction name is required"),
  amount: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val)),
  currency: z.string(),
  date: z.date(),
  paidBy: z.string(),
  splitMethod: z.enum(["even", "manual"]),
  selectedPeople: z.array(z.string()).nonempty("Select at least one person"),
  manualSplits: z.array(
    z.object({
      person: z.string(),
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

  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    DEFAULT_EXCHANGE_RATES
  );
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [sgdEquivalent, setSgdEquivalent] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionname: "",
      amount: "",
      currency: "SGD",
      date: new Date(),
      paidBy: "You",
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

  // Watch for changes to update UI
  const amount = form.watch("amount");
  const selectedPeople = form.watch("selectedPeople");
  const splitMethod = form.watch("splitMethod");
  const manualSplits = form.watch("manualSplits");
  const currency = form.watch("currency");

  // Handle currency change
  useEffect(() => {
    if (currency === "SGD") {
      setCurrentExchangeRate(1);
      setSgdEquivalent(null);
    } else if (currency && amount && Number.parseFloat(amount) > 0) {
      // If we have a stored exchange rate, use it and prompt for confirmation
      const storedRate = exchangeRates[currency] || 1;
      setCurrentExchangeRate(storedRate);
    } else if (currency) {
      // Just set the rate without showing dialog (no amount yet)
      const storedRate = exchangeRates[currency] || 1;
      setCurrentExchangeRate(storedRate);
    }
  }, [currency, exchangeRates]);

  // Update manual splits when selected people change
  useEffect(() => {
    const currentPeople = new Set(manualSplits.map((split) => split.person));
    const newSplits = [...manualSplits];

    // Add new people
    selectedPeople.forEach((person) => {
      if (!currentPeople.has(person)) {
        newSplits.push({ person, amount: "" });
      }
    });

    // Remove people who are no longer selected
    const filteredSplits = newSplits.filter((split) =>
      selectedPeople.includes(split.person)
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

    // Update the exchange rate in our local state
    if (currency !== "SGD") {
      setExchangeRates((prev) => ({
        ...prev,
        [currency]: rate,
      }));
    }
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

    const newSplits = selectedPeople.map((person) => ({
      person,
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

  function onSubmit(values: FormValues) {
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
        person: split.person,
        amount: splitAmountInSgd.toFixed(2),
      };
    });

    // Create the final data object with all amounts in SGD
    const finalData = {
      ...values,
      amountInSgd: sgdAmount.toFixed(2),
      originalAmount: originalAmount.toFixed(2),
      originalCurrency: values.currency,
      exchangeRate: currentExchangeRate,
      manualSplitsInSgd: sgdManualSplits,
    };

    console.log("Submitting with SGD conversion:", finalData);

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

    // Continue with submission
    toast.success("Expense split and added successfully!");
    navigate("/dashboard");
  }

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
        <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((curr) => (
                                <SelectItem key={curr} value={curr}>
                                  {curr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- Exchange‑rate + button (full‑width row) ------------------- */}
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
                          className="h-5 px-0"
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
                          <SelectItem value="You">You</SelectItem>
                          {friends.map((friend) => (
                            <SelectItem key={friend.id} value={friend.name}>
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
                          defaultValue={field.value}
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
                              className="w-full justify-between text-left font-normal px-4"
                              type="button"
                            >
                              {field.value.length > 0
                                ? `${field.value.length} people selected`
                                : "Select people"}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search people..."
                                autoFocus={false}
                              />
                              <CommandList>
                                <CommandEmpty>No person found.</CommandEmpty>
                                <CommandGroup>
                                  {friends.map((friend) => (
                                    <CommandItem
                                      key={friend.id}
                                      value={friend.name}
                                      onSelect={() => {
                                        if (field.value.includes(friend.name)) {
                                          field.onChange(
                                            field.value.filter(
                                              (name: string) =>
                                                name !== friend.name
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...field.value,
                                            friend.name,
                                          ]);
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value.includes(friend.name)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
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
                          <span className="text-sm">{field.person}</span>
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

            <Button type="submit" className="w-full">
              Save Expense
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
