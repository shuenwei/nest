"use client";

import type React from "react";

import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ChevronDown,
  ScanText,
  CheckCircle,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { BillTransaction } from "@/lib/transaction";

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
  transactiontype: z.string(),
  date: z.date(),
  paidBy: z.string().min(1, "Payer is required"),
  currency: z.string().min(1, "Currency is required"),
  participants: z.array(z.string()).min(1, "Select at least one participant"),
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name is required"),
      price: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Invalid price",
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
  const { transactionId } = useParams<{ transactionId?: string }>();
  const isEditMode = !!transactionId;
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [openParticipantsSelect, setOpenParticipantsSelect] = useState(false);
  const [showExchangeRateDialog, setShowExchangeRateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem("token");

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

  const getParticipantName = (id: string) =>
    id === currentUserId
      ? "You"
      : friends.find((f) => f.id === id)?.name ?? "Unknown";

  // State for exchange rates
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [sgdEquivalent, setSgdEquivalent] = useState<number | null>(null);

  async function handleTranslate() {
    const texts = [
      form.getValues("restaurantName"),
      ...form.getValues("items").map((i) => i.name),
    ];

    const token = localStorage.getItem("token");

    setIsTranslating(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/translate`,
        {
          texts,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const translations: string[] = response.data.translations ?? [];
      if (translations.length === texts.length) {
        form.setValue("restaurantName", translations[0]);
        const currentItems = form.getValues("items");
        const updated = currentItems.map((item, idx) => ({
          ...item,
          name: translations[idx + 1] ?? item.name,
        }));
        form.setValue("items", updated);
        toast.success("Translated to English");
        setIsTranslated(true);
      }
    } catch (err) {
      toast.error("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactiontype: "bill",
      restaurantName: "",
      date: new Date(),
      paidBy: currentUserId,
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

  // Populate form when editing an existing transaction
  useEffect(() => {
    if (!isEditMode || !transactionId) {
      return;
    }

    const existing = transactions.find((t) => t._id === transactionId);
    if (!existing || existing.type !== "bill") {
      toast.error("Error loading transaction to edit.");
      navigate(-1);
      return;
    }

    const data = existing as BillTransaction;

    form.reset({
      restaurantName: data.transactionName,
      transactiontype: "bill",
      date: new Date(data.date),
      paidBy: data.paidBy,
      currency: data.currency,
      participants: data.splitsInSgd.map((split) => split.user),
      items: data.items.map((i) => ({
        name: i.name,
        price: i.price.toFixed(2),
        sharedBy: i.sharedBy,
      })),
      discountType: data.discountType as "none" | "amount" | "percentage",
      discountValue: data.discountValue.toString(),
      serviceCharge: data.serviceCharge,
      serviceChargePercentage: data.serviceChargePercentage.toString(),
      gst: data.gst,
      gstPercentage: data.gstPercentage.toString(),
      notes: data.notes ?? "",
    });

    setCurrentExchangeRate(data.exchangeRate);
  }, [isEditMode, transactionId, transactions, form]);

  useEffect(() => {
    const restaurantName = searchParams.get("rName") ?? "";
    const itemNames = searchParams.getAll("n");
    const itemPrices = searchParams.getAll("p");

    if (restaurantName) {
      form.setValue("restaurantName", restaurantName);
    }

    if (itemNames.length > 0 || itemPrices.length > 0) {
      if (itemNames.length !== itemPrices.length || itemNames.length === 0) {
        toast.error("Woops! There is an error with the pre-fill!");
        return;
      }

      const items = itemNames.map((name, idx) => ({
        name,
        price: itemPrices[idx] ?? "",
        sharedBy: [],
      }));

      form.setValue("items", items);
      toast.success("Your receipt has been pre-filled!");
      setIsPrefilled(true);
    }
  }, [searchParams]);

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

  // Handle exchange rate confirmation
  const handleExchangeRateConfirm = (
    rate: number,
    sgdAmount: number | null
  ) => {
    setCurrentExchangeRate(rate);
    setSgdEquivalent(sgdAmount);
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

  async function onSubmit(values: FormValues) {
    // Validate that at least one item is added
    if (values.items.length === 0) {
      toast.error("Error", {
        description: "Add at least one item to the bill",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const subtotalInSGD = calculateSubtotalInSGD();
    const discount = calculateDiscount();
    const discountInSGD = calculateDiscountInSGD();
    const serviceChargeAmt = calculateServiceCharge();
    const serviceChargeInSGD = calculateServiceChargeInSGD();
    const gstAmt = calculateGST();
    const gstAmtInSGD = calculateGSTInSGD();
    const total = calculateTotal();
    const totalInSGD = calculateTotalInSGD();

    const participants = Array.from(
      new Set([...values.participants, values.paidBy, currentUserId])
    );

    const items = values.items.map((i) => ({
      name: i.name,
      price: parseFloat(i.price),
      sharedBy: i.sharedBy,
    }));

    const splitObj = calculatePersonBreakdown();
    const splitsInSgd = Object.entries(splitObj).map(([user, d]) => ({
      user,
      amount: parseFloat(d.amountInSGD.toFixed(2)),
    }));

    /* --------  Final payload -------- */
    const payload = {
      transactionName: values.restaurantName,
      type: "bill",
      participants,
      currency: values.currency,
      exchangeRate: currentExchangeRate,
      amount: total,
      amountInSgd: parseFloat(totalInSGD.toFixed(2)),
      notes: values.notes ?? "",
      date: values.date,

      /* bill-specific */
      paidBy: values.paidBy,
      items,
      discount: discount,
      discountInSGD: discountInSGD,
      discountType: values.discountType,
      discountValue: values.discountValue
        ? parseFloat(values.discountValue)
        : 0,
      gst: values.gst,
      gstPercentage: parseFloat(values.gstPercentage || "0"),
      gstAmount: gstAmt,
      gstAmountInSgd: gstAmtInSGD,
      serviceCharge: values.serviceCharge,
      serviceChargePercentage: parseFloat(
        values.serviceChargePercentage || "0"
      ),
      serviceChargeAmount: serviceChargeAmt,
      serviceChargeAmountInSgd: serviceChargeInSGD,
      subtotal: subtotal,
      subtotalInSgd: parseFloat(subtotalInSGD.toFixed(2)),
      splitsInSgd,
    };

    setIsSubmitting(true);

    try {
      if (!isEditMode) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/transaction/bill/create`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await refreshUser();
        console.log(response);
        toast.success("Success!", { description: "Bill saved successfully!" });
        navigate("/history");
      } else {
        const response = await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/transaction/bill/update/${transactionId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await refreshUser();
        console.log(response);
        toast.success("Success!", {
          description: "Bill updated successfully!",
        });
        navigate(-1);
      }
    } catch (err) {
      console.error("Error submitting bill:", err);
      toast.error("Failed to save bill.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/dashboard");
            }
          }}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Bill" : "Split Restaurant Bill"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode ? "" : "Split a restaurant bill among friends"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Restaurant Details Card */}
            <Card className="p-6">
              <CardContent className="p-0 space-y-6">
                {!isEditMode && (
                  <Alert>
                    {isPrefilled ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <ScanText className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {isPrefilled
                        ? "Your receipt has been pre-filled!"
                        : "Scan your receipts!"}
                    </AlertTitle>
                    <AlertDescription>
                      {isPrefilled
                        ? "The resturant name, item names and item prices have been pre-filled. Select the currency, friends for each item, and enter additional charges. Be sure to check for mistakes made by the AI."
                        : `Don't want to enter receipt details manually? You can send a
                    picture of your receipt to the 'nest' telegram bot to be
                    scanned!`}
                    </AlertDescription>
                  </Alert>
                )}
                {isPrefilled && (
                  <Alert>
                    <Languages className="h-4 w-4" />
                    <AlertTitle>Receipt not in English?</AlertTitle>
                    <AlertDescription>
                      <Button
                        className="mt-2"
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleTranslate}
                        disabled={isTranslating || isTranslated}
                      >
                        {isTranslating
                          ? "Translating..."
                          : isTranslated
                          ? "Receipt Translated"
                          : "Translate Receipt"}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
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
                          key={field.value}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
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
                              className="w-full p-0"
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
                          <PopoverContent
                            side="bottom"
                            align="center"
                            avoidCollisions={false}
                            className="w-full p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search people..." />
                              <CommandList>
                                <CommandEmpty>No person found.</CommandEmpty>
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
                <h2 className="text-lg font-semibold">Items</h2>

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
                    <div className="flex justify-between items-start flex gap-4">
                      {/* Item Name */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="basis-3/5">
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
                          <FormItem className="basis-2/5">
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
                    </div>

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
                              <PopoverContent
                                side="bottom"
                                align="center"
                                avoidCollisions={false}
                                className="w-full p-0"
                              >
                                <Command>
                                  <CommandInput placeholder="Search people..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No person found.
                                    </CommandEmpty>
                                    <CommandGroup className="max-h-70 overflow-y-auto">
                                      {participants.map((participant) => (
                                        <CommandItem
                                          key={participant}
                                          value={getParticipantName(
                                            participant
                                          )}
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
              <CardFooter className="p-0 space-y-6">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => append({ name: "", price: "", sharedBy: [] })}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </CardFooter>
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
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Discount</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  No Discount
                                </SelectItem>
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
                        </div>
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
                        <span>Subtotal</span>
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Bill Split"}
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
