"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Minus,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock default exchange rates
const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 0.74,
  EUR: 0.68,
  GBP: 0.58,
  JPY: 113.5,
  CNY: 5.36,
  SGD: 1.0,
};

// Mock friends
const friends = [
  { id: "1", name: "Alex Wong", username: "alexwong" },
  { id: "2", name: "Mei Lin", username: "meilin" },
  { id: "3", name: "Raj Patel", username: "rajp" },
  { id: "4", name: "Sarah Johnson", username: "sarahj" },
  { id: "5", name: "David Chen", username: "davidc" },
];

// Exchange Rate Dialog Component
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

// Form schema
const formSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  date: z.date(),
  paidBy: z.string().min(1, "Payer is required"),
  currency: z.string().min(1, "Currency is required"),
  participants: z.array(z.string()).min(1, "Select at least one participant"),
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name is required"),
      price: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Price must be a number with up to 2 decimal places",
      }),
      sharedBy: z.array(z.string()).min(1, "Select at least one person"),
    })
  ),
  discountType: z.enum(["none", "amount", "percentage"]),
  discountValue: z.string().optional(),
  serviceCharge: z.boolean(),
  serviceChargePercentage: z.string(),
  gst: z.boolean(),
  gstPercentage: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SplitBillPage = () => {
  const navigate = useNavigate();
  const [openParticipantsSelect, setOpenParticipantsSelect] = useState(false);
  const [showExchangeRateDialog, setShowExchangeRateDialog] = useState(false);

  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    DEFAULT_EXCHANGE_RATES
  );
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [sgdEquivalent, setSgdEquivalent] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      date: new Date(),
      paidBy: "You",
      currency: "SGD",
      participants: [],
      items: [{ name: "", price: "", sharedBy: [] }],
      discountType: "none",
      discountValue: "",
      serviceCharge: false,
      serviceChargePercentage: "10",
      gst: false,
      gstPercentage: "9",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch for changes to update UI
  const participants = form.watch("participants");
  const items = form.watch("items");
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");
  const serviceCharge = form.watch("serviceCharge");
  const serviceChargePercentage = form.watch("serviceChargePercentage");
  const gst = form.watch("gst");
  const gstPercentage = form.watch("gstPercentage");
  const currency = form.watch("currency");

  // Calculate total bill amount for currency conversion
  const calculateTotalBillAmount = () => {
    return items
      .reduce((sum, item) => {
        const price = Number.parseFloat(item.price) || 0;
        return sum + price;
      }, 0)
      .toFixed(2);
  };

  // Handle currency change
  useEffect(() => {
    if (currency === "SGD") {
      setCurrentExchangeRate(1);
      setSgdEquivalent(null);
    } else if (currency) {
      // Just set the rate without showing dialog (no amount yet)
      const storedRate = exchangeRates[currency] || 1;
      setCurrentExchangeRate(storedRate);
    }
  }, [currency, exchangeRates]);

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

  // Custom validation handler for price field
  const validatePrice = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return false;
    }
    return true;
  };

  // Custom validation handler for percentage field
  const validatePercentage = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return false;
    }
    const numValue = Number.parseFloat(value);
    if (numValue < 0 || numValue > 100) {
      return false;
    }
    return true;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = Number.parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
  };

  // Calculate subtotal in SGD
  const calculateSubtotalInSGD = () => {
    const subtotal = calculateSubtotal();
    return currency === "SGD" ? subtotal : subtotal / currentExchangeRate;
  };

  // Calculate discount
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "none" || !discountValue) return 0;

    if (discountType === "amount") {
      return Number.parseFloat(discountValue) || 0;
    } else {
      // Percentage discount
      const percentage = Number.parseFloat(discountValue) || 0;
      return (subtotal * percentage) / 100;
    }
  };

  // Calculate discount in SGD
  const calculateDiscountInSGD = () => {
    const discount = calculateDiscount();
    return currency === "SGD" ? discount : discount / currentExchangeRate;
  };

  // Calculate service charge
  const calculateServiceCharge = () => {
    if (!serviceCharge) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const percentage = Number.parseFloat(serviceChargePercentage) || 0;
    return ((subtotal - discount) * percentage) / 100;
  };

  // Calculate service charge in SGD
  const calculateServiceChargeInSGD = () => {
    const serviceChargeAmount = calculateServiceCharge();
    return currency === "SGD"
      ? serviceChargeAmount
      : serviceChargeAmount / currentExchangeRate;
  };

  // Calculate GST
  const calculateGST = () => {
    if (!gst) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const serviceChargeAmount = calculateServiceCharge();
    const percentage = Number.parseFloat(gstPercentage) || 0;
    return ((subtotal - discount + serviceChargeAmount) * percentage) / 100;
  };

  // Calculate GST in SGD
  const calculateGSTInSGD = () => {
    const gstAmount = calculateGST();
    return currency === "SGD" ? gstAmount : gstAmount / currentExchangeRate;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const serviceChargeAmount = calculateServiceCharge();
    const gstAmount = calculateGST();
    return subtotal - discount + serviceChargeAmount + gstAmount;
  };

  // Calculate total in SGD
  const calculateTotalInSGD = () => {
    const total = calculateTotal();
    return currency === "SGD" ? total : total / currentExchangeRate;
  };

  // Calculate per-person breakdown
  const calculatePersonBreakdown = () => {
    const breakdown: Record<
      string,
      { items: string[]; amount: number; amountInSGD: number }
    > = {};

    // Initialize breakdown for each participant
    participants.forEach((participant) => {
      breakdown[participant] = { items: [], amount: 0, amountInSGD: 0 };
    });

    // Calculate item costs per person
    items.forEach((item) => {
      const price = Number.parseFloat(item.price) || 0;
      if (price === 0 || item.sharedBy.length === 0) return;

      const pricePerPerson = price / item.sharedBy.length;
      const pricePerPersonInSGD =
        currency === "SGD"
          ? pricePerPerson
          : pricePerPerson / currentExchangeRate;

      item.sharedBy.forEach((person) => {
        if (breakdown[person]) {
          breakdown[person].items.push(item.name);
          breakdown[person].amount += pricePerPerson;
          breakdown[person].amountInSGD += pricePerPersonInSGD;
        }
      });
    });

    // Add proportional share of discount, service charge, and GST
    const discount = calculateDiscount();
    const discountInSGD = calculateDiscountInSGD();
    const serviceChargeAmount = calculateServiceCharge();
    const serviceChargeAmountInSGD = calculateServiceChargeInSGD();
    const gstAmount = calculateGST();
    const gstAmountInSGD = calculateGSTInSGD();
    const subtotal = calculateSubtotal();
    const subtotalInSGD = calculateSubtotalInSGD();

    if (subtotal > 0) {
      participants.forEach((participant) => {
        const proportion = breakdown[participant].amount / subtotal;

        // Subtract discount proportionally
        breakdown[participant].amount -= discount * proportion;
        breakdown[participant].amountInSGD -= discountInSGD * proportion;

        // Add service charge proportionally
        breakdown[participant].amount += serviceChargeAmount * proportion;
        breakdown[participant].amountInSGD +=
          serviceChargeAmountInSGD * proportion;

        // Add GST proportionally
        breakdown[participant].amount += gstAmount * proportion;
        breakdown[participant].amountInSGD += gstAmountInSGD * proportion;
      });
    }

    return breakdown;
  };

  // Get participant name from username
  const getParticipantName = (username: string) => {
    if (username === "You") return "You";
    const friend = friends.find((f) => f.username === username);
    return friend ? friend.name : username;
  };

  function onSubmit(values: FormValues) {
    // Validate that at least one item is added
    if (values.items.length === 0) {
      toast.error("Error", {
        description: "Add at least one item to the bill",
      });
      return;
    }

    // Convert participant names to usernames for backend
    const participantUsernames = values.participants.map((participant) => {
      if (participant === "You") return "currentUser"; // Replace with actual current user ID in a real app
      return participant;
    });

    // Calculate final breakdown
    const breakdown = calculatePersonBreakdown();

    // Create the final data object
    const finalData = {
      ...values,
      participants: participantUsernames,
      subtotal: calculateSubtotal(),
      subtotalInSGD: calculateSubtotalInSGD(),
      discount: calculateDiscount(),
      discountInSGD: calculateDiscountInSGD(),
      serviceChargeAmount: calculateServiceCharge(),
      serviceChargeAmountInSGD: calculateServiceChargeInSGD(),
      gstAmount: calculateGST(),
      gstAmountInSGD: calculateGSTInSGD(),
      total: calculateTotal(),
      totalInSGD: calculateTotalInSGD(),
      exchangeRate: currentExchangeRate,
      breakdown,
    };

    console.log("Submitting bill split:", finalData);

    toast.success("Success!", {
      description: "Bill split saved successfully!",
    });
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

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Split Restaurant Bill</h1>
          <p className="text-muted-foreground text-sm">
            Split a restaurant bill among friends
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Restaurant Details Card */}
            <Card className="p-6">
              <CardContent className="p-0 space-y-6">
                {/* Restaurant Name */}
                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Restaurant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Paid By */}
                <FormField
                  control={form.control}
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid by</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="You">You</SelectItem>
                            {friends.map((friend) => (
                              <SelectItem
                                key={friend.id}
                                value={friend.username}
                              >
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

                {/* Currency and Amount */}
                <div className="grid grid-cols-6 gap-x-4 gap-y-2 w-full">
                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="col-span-6 w-full">
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
                              {Object.keys(DEFAULT_EXCHANGE_RATES).map(
                                (curr) => (
                                  <SelectItem key={curr} value={curr}>
                                    {curr}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Exchange rate info */}
                  {currency !== "SGD" && (
                    <div className="col-span-6 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        ≈ $
                        {(calculateSubtotal() / currentExchangeRate).toFixed(2)}{" "}
                        SGD
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="leftIcon"
                        className="h-5 has-[>svg]:px-1"
                        onClick={() => setShowExchangeRateDialog(true)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        <span className="text-xs">Update Rate</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Participants */}
                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants</FormLabel>
                      <FormControl>
                        <Popover
                          open={openParticipantsSelect}
                          onOpenChange={setOpenParticipantsSelect}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openParticipantsSelect}
                              className="w-full justify-between text-left font-normal px-3"
                            >
                              {field.value.length > 0
                                ? `${field.value.length} people selected`
                                : "Select participants"}
                              <Plus className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search people..." />
                              <CommandList>
                                <CommandEmpty>No person found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="You"
                                    onSelect={() => {
                                      const newValue = field.value.includes(
                                        "You"
                                      )
                                        ? field.value.filter((v) => v !== "You")
                                        : [...field.value, "You"];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Checkbox
                                      checked={field.value.includes("You")}
                                      className="mr-2 h-4 w-4"
                                    />
                                    You
                                  </CommandItem>
                                  {friends.map((friend) => (
                                    <CommandItem
                                      key={friend.id}
                                      value={friend.username}
                                      onSelect={() => {
                                        const newValue = field.value.includes(
                                          friend.username
                                        )
                                          ? field.value.filter(
                                              (v) => v !== friend.username
                                            )
                                          : [...field.value, friend.username];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Checkbox
                                        checked={field.value.includes(
                                          friend.username
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
                          {field.value.map((participant) => (
                            <Badge
                              key={participant}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {getParticipantName(participant)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 text-muted-foreground/50 hover:text-foreground"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((v) => v !== participant)
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
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card className="p-6">
              <CardContent className="p-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Items</h2>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      append({ name: "", price: "", sharedBy: [] })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm text-muted-foreground font-semibold">
                        Item {index + 1}
                      </h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Item Name */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Pasta, Pizza"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Price */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              {currency && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {currency === "SGD" ? "$" : currency}
                                </span>
                              )}
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="pl-12"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (validatePrice(value)) {
                                    field.onChange(value);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          {currency !== "SGD" &&
                            field.value &&
                            !isNaN(Number.parseFloat(field.value)) && (
                              <FormDescription className="text-xs">
                                ≈ $
                                {(
                                  Number.parseFloat(field.value) /
                                  currentExchangeRate
                                ).toFixed(2)}{" "}
                                SGD
                              </FormDescription>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shared By */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.sharedBy`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shared By</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between text-left font-normal px-3"
                                >
                                  {field.value.length > 0
                                    ? `${field.value.length} people selected`
                                    : "Select people"}
                                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search people..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No person found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {participants.map((participant) => (
                                        <CommandItem
                                          key={participant}
                                          value={participant}
                                          onSelect={() => {
                                            const newValue =
                                              field.value.includes(participant)
                                                ? field.value.filter(
                                                    (v) => v !== participant
                                                  )
                                                : [...field.value, participant];
                                            field.onChange(newValue);
                                          }}
                                        >
                                          <Checkbox
                                            checked={field.value.includes(
                                              participant
                                            )}
                                            className="mr-2 h-4 w-4"
                                          />
                                          {getParticipantName(participant)}
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
                              {field.value.map((person) => (
                                <Badge
                                  key={person}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {getParticipantName(person)}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      field.onChange(
                                        field.value.filter((v) => v !== person)
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
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Charges Card */}
            <Card className="p-6">
              <CardContent className="p-0 space-y-6">
                <h2 className="text-lg font-semibold">Additional Charges</h2>

                {/* Discount */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Discount</SelectItem>
                              <SelectItem value="amount">
                                Fixed Amount
                              </SelectItem>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {discountType !== "none" && (
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {discountType === "amount"
                              ? "Discount Amount"
                              : "Discount Percentage"}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              {discountType === "amount" && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {currency === "SGD" ? "$" : currency}
                                </span>
                              )}
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder={
                                  discountType === "amount" ? "0.00" : "0"
                                }
                                className={
                                  discountType === "amount" ? "pl-12" : ""
                                }
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (discountType === "amount") {
                                    if (validatePrice(value)) {
                                      field.onChange(value);
                                    }
                                  } else {
                                    if (validatePercentage(value)) {
                                      field.onChange(value);
                                    }
                                  }
                                }}
                              />
                              {discountType === "percentage" && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  %
                                </span>
                              )}
                            </div>
                          </FormControl>
                          {discountType === "amount" &&
                            currency !== "SGD" &&
                            field.value &&
                            !isNaN(Number.parseFloat(field.value)) && (
                              <FormDescription className="text-xs">
                                ≈ $
                                {(
                                  Number.parseFloat(field.value) /
                                  currentExchangeRate
                                ).toFixed(2)}{" "}
                                SGD
                              </FormDescription>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Service Charge */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Service Charge</FormLabel>
                    <FormDescription>
                      Add service charge to the bill
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="serviceCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {serviceCharge && (
                  <FormField
                    control={form.control}
                    name="serviceChargePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Charge Percentage</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="10"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (validatePercentage(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              %
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* GST */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>GST</FormLabel>
                    <FormDescription>Add GST to the bill</FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="gst"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {gst && (
                  <FormField
                    control={form.control}
                    name="gstPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Percentage</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="9"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (validatePercentage(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              %
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this bill..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Bill Summary */}
            {participants.length > 0 &&
              items.some((item) => item.name && item.price) && (
                <Card className="p-6">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Bill Summary</h2>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <div className="text-right">
                          <div>
                            {currency} {calculateSubtotal().toFixed(2)}
                          </div>
                          {currency !== "SGD" && (
                            <div className="text-xs text-muted-foreground">
                              SGD ${calculateSubtotalInSGD().toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {discountType !== "none" && discountValue && (
                        <div className="flex justify-between text-red-500">
                          <span>
                            Discount
                            {discountType === "percentage" &&
                              ` (${discountValue}%)`}
                          </span>
                          <div className="text-right">
                            <div>
                              -{currency} {calculateDiscount().toFixed(2)}
                            </div>
                            {currency !== "SGD" && (
                              <div className="text-xs text-muted-foreground">
                                SGD -${calculateDiscountInSGD().toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {serviceCharge && (
                        <div className="flex justify-between">
                          <span>
                            Service Charge ({serviceChargePercentage}%)
                          </span>
                          <div className="text-right">
                            <div>
                              {currency} {calculateServiceCharge().toFixed(2)}
                            </div>
                            {currency !== "SGD" && (
                              <div className="text-xs text-muted-foreground">
                                SGD ${calculateServiceChargeInSGD().toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {gst && (
                        <div className="flex justify-between">
                          <span>GST ({gstPercentage}%)</span>
                          <div className="text-right">
                            <div>
                              {currency} {calculateGST().toFixed(2)}
                            </div>
                            {currency !== "SGD" && (
                              <div className="text-xs text-muted-foreground">
                                SGD ${calculateGSTInSGD().toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <div className="text-right">
                          <div>
                            {currency} {calculateTotal().toFixed(2)}
                          </div>
                          {currency !== "SGD" && (
                            <div className="text-sm">
                              SGD ${calculateTotalInSGD().toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Per Person Breakdown */}
                    <div className="pt-4">
                      <h3 className="text-sm font-semibold mb-2">
                        Per Person Breakdown
                      </h3>
                      <div className="space-y-3 bg-secondary/50 rounded-lg p-3">
                        {Object.entries(calculatePersonBreakdown()).map(
                          ([person, data]) => (
                            <div key={person} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {getParticipantName(person)}
                                </span>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {currency} {data.amount.toFixed(2)}
                                  </div>
                                  {currency !== "SGD" && (
                                    <div className="text-xs text-muted-foreground">
                                      SGD ${data.amountInSGD.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {data.items.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Items: {data.items.join(", ")}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            <Button type="submit" className="w-full">
              Save Bill Split
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
        amount={calculateTotalBillAmount()}
      />
    </div>
  );
};

export default SplitBillPage;
