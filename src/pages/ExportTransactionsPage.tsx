import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { startOfDay, endOfDay, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

const ExportTransactionsPage = () => {
    const navigate = useNavigate();
    const { user, transactions, loading, updating } = useUser();
    const isLoading = loading || updating;
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const getDateRangeText = () => {
        if (!date?.from && !date?.to) {
            return "All time";
        }
        if (date?.from && !date?.to) {
            return `${format(date.from, "dd MMM yyyy")} - ...`;
        }
        if (date?.from && date?.to && date.from.toDateString() === date.to.toDateString()) {
            return `${format(date.from, "dd MMM yyyy")}`;
        }
        if (date?.from && date?.to) {
            return `${format(date.from, "dd MMM yyyy")} - ${format(date.to, "dd MMM yyyy")}`;
        }
        return "Select date";
    };

    const handleExport = async () => {
        const header = ["Date", "Note", "Amount", "Category"];
        const rows = transactions
            .filter((t) => {
                if (t.type === "settleup" || t.type === "groupSmartSettle")
                    return false;
                if (!date?.from) return true;
                const txDate = new Date(t.date);
                if (date.to) {
                    return txDate >= date.from && txDate <= endOfDay(date.to);
                }
                return txDate >= date.from;
            })
            .map((t) => {
                let splitInSgd = 0;
                if ("splitsInSgd" in t) {
                    // purchase, bill, recurring
                    const split = t.splitsInSgd.find((s) => s.user === user?.id);
                    splitInSgd = split ? split.amount : 0;
                }

                const dateStr = format(new Date(t.date), "yyyy-MM-dd HH:mm:ss XX");

                let categoryName = "Uncategorised";
                if (user && t.userCategories) {
                    const userCatEntry = t.userCategories.find((uc) => uc.userId === user.id);
                    if (userCatEntry && userCatEntry.categoryIds.length > 0) {
                        const firstCategoryId = userCatEntry.categoryIds[0];
                        const foundCategory = user.categories.find(c => c.id === firstCategoryId);
                        if (foundCategory) {
                            categoryName = foundCategory.name;
                        }
                    }
                }

                return [
                    dateStr,
                    t.transactionName
                        .replace(/(\r\n|\n|\r)/gm, " ")
                        .replace(/"/g, "")
                        .replace(/,/g, " "),
                    splitInSgd.toFixed(2),
                    categoryName,
                ].join(",");
            });

        const csvContent = [header.join(","), ...rows].join("\n");
        const file = new File([csvContent], "transactions.csv", {
            type: "text/csv",
        });

        // 1. Try Native Share (Only for Telegram Mini App)
        const isTelegram = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

        if (isTelegram && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                });
                toast.success("Transactions exported successfully!");
                return;
            } catch (error) {
                console.warn("Share API failed or cancelled", error);
                if ((error as Error).name === "AbortError") return;
            }
        }

        // 2. Fallback: Download via Link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Transactions exported successfully!");
    };

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
                    <h1 className="text-2xl font-bold">Export Transactions</h1>
                    <p className="text-muted-foreground text-sm text-justify">
                        Select the date range which you would like to export your transaction history as a CSV file for simpler expense tracking. You will only be exporting your expenses, which are your splits in SGD. Transfers and settle ups are excluded from the downloaded file.
                    </p>
                    <p className="text-muted-foreground text-sm text-justify pt-5">
                        The downloaded CSV file can be imported into <a href="https://apps.apple.com/us/app/dime-budget-expense-tracker/id1635280255" target="_blank" rel="noreferrer" className="underline">Dime</a>, an iOS expense tracker app that I recommend you try out. Otherwise, you can also import the CSV file into Excel.
                    </p>
                </div>

                <div className="mb-4 space-y-2">
                    <Card className="shadow-xs bg-white overflow-hidden gap-0 p-0">
                        <div className="flex justify-center p-3">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={1}
                            />
                        </div>
                        <div className="border-t px-4 py-3 space-y-2 bg-muted/5">
                            <div className="flex gap-2">
                                {[
                                    {
                                        label: "Today",
                                        from: new Date(new Date().setHours(0, 0, 0, 0)),
                                        to: new Date(new Date().setHours(23, 59, 59, 999)),
                                    },
                                    {
                                        label: "This Week",
                                        from: (() => {
                                            const now = new Date();
                                            const day = now.getDay();
                                            const mondayOffset = day === 0 ? -6 : 1 - day;
                                            const monday = new Date(now);
                                            monday.setDate(now.getDate() + mondayOffset);
                                            monday.setHours(0, 0, 0, 0);
                                            return monday;
                                        })(),
                                        to: (() => {
                                            const now = new Date();
                                            const day = now.getDay();
                                            const sundayOffset = day === 0 ? 0 : 7 - day;
                                            const sunday = new Date(now);
                                            sunday.setDate(now.getDate() + sundayOffset);
                                            sunday.setHours(23, 59, 59, 999);
                                            return sunday;
                                        })(),
                                    },
                                ].map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-background"
                                        onClick={() => {
                                            setDate({ from: preset.from, to: preset.to });
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    {
                                        label: "This Month",
                                        from: new Date(
                                            new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)
                                        ),
                                        to: new Date(
                                            new Date(
                                                new Date().getFullYear(),
                                                new Date().getMonth() + 1,
                                                0,
                                                23,
                                                59,
                                                59,
                                                999
                                            )
                                        ),
                                    },
                                    {
                                        label: "This Year",
                                        from: new Date(
                                            new Date().getFullYear(),
                                            0,
                                            1,
                                            0,
                                            0,
                                            0,
                                            0
                                        ),
                                        to: new Date(
                                            new Date().getFullYear(),
                                            11,
                                            31,
                                            23,
                                            59,
                                            59,
                                            999
                                        ),
                                    },
                                ].map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-background"
                                        onClick={() => {
                                            setDate({ from: preset.from, to: preset.to });
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    {
                                        label: "All Time",
                                        from: undefined,
                                        to: undefined,
                                    },
                                ].map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setDate({ from: preset.from, to: preset.to });
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="mb-4 shadow-xs py-2">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Selected Range</div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {getDateRangeText()}
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleExport} disabled={isLoading}>
                            {isLoading ? (
                                "Loading Transactions..."
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ExportTransactionsPage;
