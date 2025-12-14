import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,

    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { triggerHapticImpact } from "@/lib/haptics";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CurrencyDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCurrency: string;
    onSelect: (currency: string) => void;
    detectedCurrency?: string | null;
    detectedCity?: string | null;
}

export const CurrencyDrawer = ({
    open,
    onOpenChange,
    selectedCurrency,
    onSelect,
    detectedCurrency,
    detectedCity,
}: CurrencyDrawerProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const sortedCurrencies = useMemo(() => {
        const filtered = SUPPORTED_CURRENCIES.filter(
            (c) =>
                c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            // 1. Detected currency first
            if (detectedCurrency) {
                if (a.code === detectedCurrency) return -1;
                if (b.code === detectedCurrency) return 1;
            }

            // 2. SGD second (if not detected)
            if (a.code === "SGD") return -1;
            if (b.code === "SGD") return 1;

            // 3. Then alphabetical
            return a.code.localeCompare(b.code);
        });
    }, [searchQuery, detectedCurrency]);

    const handleSelect = (code: string) => {
        onSelect(code);
        triggerHapticImpact("medium");
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
            <DrawerContent className="max-h-[95vh]">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Select Currency</DrawerTitle>
                    <DrawerDescription>
                        The exchange rate will automatically be updated to match the current Mastercard rate of the selected currency.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search Currency"
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-4 pb-12 space-y-2 overflow-y-auto max-h-[90vh]">
                    {sortedCurrencies.length === 0 ? (
                        <p className="text-sm text-center py-4 text-muted-foreground">
                            No currency found.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {sortedCurrencies.map((currency) => {
                                const isSelected = selectedCurrency === currency.code;
                                const isDetected = detectedCurrency === currency.code;

                                return (
                                    <button
                                        type="button"
                                        key={currency.code}
                                        className={cn(
                                            "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                                            "flex items-center justify-between gap-4",
                                            isSelected
                                                ? "border-primary/60 bg-primary/5"
                                                : "border-border hover:bg-secondary/50"
                                        )}
                                        onClick={() => handleSelect(currency.code)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{currency.flag}</span>
                                            <div>
                                                <p className="text-sm font-medium leading-none flex items-center gap-2">
                                                    {currency.code}
                                                    {isDetected && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] h-5 px-1.5 gap-1"
                                                        >
                                                            Detected
                                                            {detectedCity && (
                                                                <span className="text-muted-foreground font-normal">
                                                                    • {detectedCity}
                                                                </span>
                                                            )}
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {currency.name}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

