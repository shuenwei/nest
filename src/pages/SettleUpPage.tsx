"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, RefreshCw, ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { SettleUpTransaction } from "@/lib/transaction";
import axios from "axios";

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
          <Button type="submit" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Form schema
const formSchema = z.object({
  payer: z.string().min(1, "Payer is required"),
  payee: z.string().min(1, "Payee is required"),
  amount: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val)),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SettleUpPage = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId?: string }>();
  const isEditMode = !!transactionId;
  const [showExchangeRateDialog, setShowExchangeRateDialog] = useState(false);

  const { user, refreshUser, transactions } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");

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
      : friends.find((f) => f.id === id)?.name ?? "???";

  // State for exchange rates
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [sgdEquivalent, setSgdEquivalent] = useState<number | null>(null);

  const location = useLocation();
  const rawAmount = location.state?.amount ?? null;
  const passedAmount =
    rawAmount !== null ? Math.abs(rawAmount).toFixed(2) : null;
  const friendId = location.state?.friendId ?? null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payer: "",
      payee: "",
      amount: passedAmount ? String(passedAmount) : "",
      currency: "SGD",
      notes: "",
    },
  });

  // Populate form when editing an existing transaction
  useEffect(() => {
    if (!isEditMode || !transactionId) {
      return;
    }

    const existing = transactions.find((t) => t._id === transactionId);
    if (!existing || existing.type !== "settleup") {
      toast.error("Error loading transaction to edit.");
      navigate(-1);
      return;
    }

    const data = existing as SettleUpTransaction;

    form.reset({
      payer: data.payer,
      payee: data.payee,
      amount: data.amount.toFixed(2),
      currency: data.currency,
      notes: data.notes ?? "",
    });

    setCurrentExchangeRate(data.exchangeRate);
  }, [isEditMode, transactionId, transactions, friends, form]);

  // Watch for changes to update UI
  const amount = form.watch("amount");
  const currency = form.watch("currency");
  const payer = form.watch("payer");
  const payee = form.watch("payee");
  const notes = form.watch("notes");

  // Handle currency change
  useEffect(() => {
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

  // Custom validation handler for amount field
  const validateAmount = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return false;
    }
    return true;
  };

  // Calculate SGD amount for preview
  const getSgdAmount = () => {
    if (!amount || isNaN(Number.parseFloat(amount))) return "0.00";

    const numericAmount = Number.parseFloat(amount);
    const sgdAmount =
      currency === "SGD" ? numericAmount : numericAmount / currentExchangeRate;
    return sgdAmount.toFixed(2);
  };

  async function onSubmit(values: FormValues) {
    // Validate that payer and payee are not the same
    if (values.payer === values.payee) {
      toast.error("Error", {
        description: "Payer and payee cannot be the same person",
      });
      return;
    }

    // Convert amount to SGD for saving
    const originalAmount = Number.parseFloat(values.amount);
    const sgdAmount =
      values.currency === "SGD"
        ? originalAmount
        : originalAmount / currentExchangeRate;

    const payload = {
      currency: values.currency,
      exchangeRate: currentExchangeRate,
      amount: originalAmount,
      amountInSgd: sgdAmount.toFixed(2),
      notes: values.notes || "",
      payer: values.payer,
      payee: values.payee,
    };

    setIsSubmitting(true);

    try {
      if (!isEditMode) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/transaction/settleup/create`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();

        toast.success("Success!", {
          description: "Transfer recorded!",
        });
        console.log(response);
        navigate("/history");
      } else {
        const response = await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/transaction/settleup/update/${transactionId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();

        toast.success("Success!", {
          description: "Transfer updated!",
        });
        console.log(response);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting settle up:", error);
      toast.error("Failed to submit", {
        description: "Something went wrong. Please try again.",
      });
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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Transfer" : "Settle Up"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode ? "" : "Record transfers among friends"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Transaction Details Card */}
            <Card className="p-6 mb-4">
              <CardContent className="p-0 space-y-6">
                {/* From (Payer) */}
                <FormField
                  control={form.control}
                  name="payer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Who is paying?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={currentUserId}>You</SelectItem>
                            {friendId ? (
                              <SelectItem value={friendId}>
                                {getFriendNameById(friendId)}
                              </SelectItem>
                            ) : (
                              friends.map((friend) => (
                                <SelectItem key={friend.id} value={friend.id}>
                                  {friend.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* To (Payee) */}
                <FormField
                  control={form.control}
                  name="payee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Who is receiving?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={currentUserId}>You</SelectItem>
                            {friendId ? (
                              <SelectItem value={friendId}>
                                {getFriendNameById(friendId)}
                              </SelectItem>
                            ) : (
                              friends.map((friend) => (
                                <SelectItem key={friend.id} value={friend.id}>
                                  {friend.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount and Currency */}
                <div className="grid grid-cols-6 gap-x-4 gap-y-2 w-full">
                  {/* Amount */}
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

                  {/* Currency */}
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

                  {/* Exchange rate info */}
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
                          <RefreshCw className="h-3 w-3 mr-1" />
                          <span className="text-xs">Update Rate</span>
                        </Button>
                      </div>
                    )}
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this payment..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment Preview Card */}
            {(payer || payee) && (
              <Card className="px-6 mb-4">
                <CardTitle>Preview</CardTitle>
                <CardContent className="p-0 space-y-4">
                  {/* Visual representation of the payment */}
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="w-1/3 text-center">
                      <div className="font-medium">
                        {getFriendNameById(payer)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paying
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground" />
                    <div className="w-1/3 text-center">
                      <div className="font-medium">
                        {getFriendNameById(payee) || "???"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Receiving
                      </div>
                    </div>
                  </div>

                  {/* Amount details */}
                  {amount && !isNaN(Number.parseFloat(amount)) && (
                    <div className="bg-secondary rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Amount</span>
                        <span className="font-medium">
                          {Number.parseFloat(amount).toFixed(2)} {currency}
                        </span>
                      </div>

                      {currency !== "SGD" && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">SGD Equivalent</span>
                          <span className="font-medium">${getSgdAmount()}</span>
                        </div>
                      )}

                      {notes && (
                        <div className="pt-1 mt-1 border-t border-border">
                          <span className="text-sm font-medium">Notes</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Transfer"}
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

export default SettleUpPage;
