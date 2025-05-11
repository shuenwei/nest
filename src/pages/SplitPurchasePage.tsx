import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Camera,
  Upload,
  User,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
} from "@/components/ui/form";

const currencies = ["SGD", "USD", "EUR", "GBP", "JPY", "CNY"];

const friends = [
  { id: "1", name: "Alex Wong" },
  { id: "2", name: "Mei Lin" },
  { id: "3", name: "Raj Patel" },
  { id: "4", name: "Sarah Johnson" },
  { id: "5", name: "David Chen" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: "Amount must be a number with up to 2 decimal places",
  }),
  currency: z.string(),
  date: z.date(),
  paidBy: z.string(),
  splitEqually: z.boolean(),
  selectedPeople: z.array(z.string()),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SplitPurchasePage = () => {
  const [openPeopleSelect, setOpenPeopleSelect] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      currency: "SGD",
      date: new Date(),
      paidBy: "You",
      splitEqually: true,
      selectedPeople: [],
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    // handle submit
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
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
                <div className="grid grid-cols-6 gap-4 w-full">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="col-span-4 w-full">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            pattern="^\\d+(\\.\\d{1,2})?$"
                            placeholder="0.00"
                            className="w-full"
                            {...field}
                            onChange={(e) => {
                              // Only allow numbers with up to 2 decimal places
                              const value = e.target.value;
                              if (/^\d*(\.\d{0,2})?$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  name="splitEqually"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="split-equally"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="split-equally"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Split equally
                      </FormLabel>
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
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search people..."
                                autoFocus={false}
                              />
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
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                        className="min-h-[100px]"
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
    </div>
  );
};

export default SplitPurchasePage;
