"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, Info, Pen } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the currency type
interface Currency {
  code: string;
  exchangeRate: number;
}

// Mock initial currencies
const initialCurrencies: Currency[] = [
  { code: "SGD", exchangeRate: 1.0 },
  { code: "USD", exchangeRate: 0.74 },
  { code: "EUR", exchangeRate: 0.68 },
  { code: "GBP", exchangeRate: 0.58 },
  { code: "JPY", exchangeRate: 113.5 },
  { code: "CNY", exchangeRate: 5.36 },
];

// Form schema for adding a new currency
const addCurrencySchema = z.object({
  code: z
    .string()
    .min(3, "Currency code must be 3 letters")
    .max(3, "Currency code must be 3 letters")
    .toUpperCase()
    .refine((code) => /^[A-Z]{3}$/.test(code), {
      message: "Currency code must be 3 letters",
    }),
  exchangeRate: z.coerce
    .number()
    .positive("Exchange rate must be positive")
    .refine((rate) => !isNaN(rate) && rate > 0, {
      message: "Exchange rate must be a positive number",
    }),
});

// Form schema for editing an exchange rate
const editExchangeRateSchema = z.object({
  exchangeRate: z.coerce
    .number()
    .positive("Exchange rate must be positive")
    .refine((rate) => !isNaN(rate) && rate > 0, {
      message: "Exchange rate must be a positive number",
    }),
});

type AddCurrencyFormValues = z.infer<typeof addCurrencySchema>;
type EditExchangeRateFormValues = z.infer<typeof editExchangeRateSchema>;

const CurrencyPreferencesPage = () => {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

  // Form for adding a new currency
  const addForm = useForm<AddCurrencyFormValues>({
    resolver: zodResolver(addCurrencySchema),
    defaultValues: {
      code: "",
      exchangeRate: 1,
    },
  });

  // Form for editing an exchange rate
  const editForm = useForm<EditExchangeRateFormValues>({
    resolver: zodResolver(editExchangeRateSchema),
    defaultValues: {
      exchangeRate: undefined,
    },
  });

  // Handle adding a new currency
  const onAddCurrency = (data: AddCurrencyFormValues) => {
    // Check if currency already exists
    if (currencies.some((currency) => currency.code === data.code)) {
      addForm.setError("code", {
        type: "manual",
        message: "Currency already exists",
      });
      return;
    }

    // Add the new currency
    setCurrencies([
      ...currencies,
      { code: data.code, exchangeRate: data.exchangeRate },
    ]);
    setIsAddDialogOpen(false);
    addForm.reset();
    toast.success(`${data.code} added successfully`);
  };

  // Handle editing an exchange rate
  const onEditExchangeRate = (data: EditExchangeRateFormValues) => {
    if (!editingCurrency) return;

    // Update the exchange rate
    setCurrencies(
      currencies.map((currency) =>
        currency.code === editingCurrency.code
          ? { ...currency, exchangeRate: data.exchangeRate }
          : currency
      )
    );
    setIsEditDialogOpen(false);
    setEditingCurrency(null);
    editForm.reset();
    toast.success(`Exchange rate updated successfully`);
  };

  // Handle deleting a currency
  const onDeleteCurrency = () => {
    if (!currencyToDelete) return;

    // Remove the currency
    setCurrencies(
      currencies.filter((currency) => currency.code !== currencyToDelete)
    );
    setCurrencyToDelete(null);
    toast.success(`Currency removed successfully`);
  };

  // Open the edit dialog for a currency
  const openEditDialog = (currency: Currency) => {
    setEditingCurrency(currency);
    editForm.reset({
      exchangeRate: currency.exchangeRate,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base font-medium">Back</span>
          </Button>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-bold mb-6">Currency Preferences</h1>

        {/* Currency list */}
        <Card className="mb-6 shadow-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Currencies</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Currency
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Currency</DialogTitle>
                    <DialogDescription>
                      Add a new currency and set its exchange rate relative to
                      SGD (1 SGD = X Foreign Currency).
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form
                      onSubmit={addForm.handleSubmit(onAddCurrency)}
                      className="space-y-4"
                    >
                      <FormField
                        control={addForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Code</FormLabel>
                            <FormControl>
                              <Input placeholder="USD" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter a 3-letter currency code (e.g., USD, EUR).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="exchangeRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exchange Rate</FormLabel>
                            <div className="flex items-center gap-2">
                              <div className="whitespace-nowrap">1 SGD =</div>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  min="0.0001"
                                  placeholder="0.74"
                                  {...field}
                                />
                              </FormControl>
                              <div className="whitespace-nowrap">
                                {addForm.watch("code") || "???"}
                              </div>
                            </div>
                            <FormDescription>
                              Enter the exchange rate relative to SGD (e.g., 1
                              SGD = 0.74 USD).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Add Currency</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="divide-y">
              {currencies.map((currency) => (
                <div
                  key={currency.code}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {currency.code === "SGD"
                        ? "Default Currency"
                        : `1 SGD =${" "}
                      ${currency.exchangeRate.toFixed(
                        currency.exchangeRate >= 1 ? 2 : 4
                      )}${" "}
                      ${currency.code}`}
                    </span>
                    {currency.code !== "SGD" && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(currency)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setCurrencyToDelete(currency.code)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Currency
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {currency.code}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={onDeleteCurrency}
                                className="bg-destructive"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information card */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            About Currency Exchange Rates
          </AlertTitle>
          <AlertDescription>
            These exchange rates will be used as defaults when converting
            between currencies in the app. You can always adjust the rate during
            a specific transaction.
          </AlertDescription>
        </Alert>

        {/* Edit Exchange Rate Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Exchange Rate</DialogTitle>
              <DialogDescription>
                Update the exchange rate for {editingCurrency?.code} relative to
                SGD.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditExchangeRate)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="whitespace-nowrap">1 SGD =</div>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            {...field}
                          />
                        </FormControl>
                        <div className="whitespace-nowrap">
                          {editingCurrency?.code}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Update Rate</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CurrencyPreferencesPage;
