import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import { TimePicker } from "@/components/ui/time-picker";
import { ArrowLeft, Check } from "lucide-react";

interface DateTimeDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date | undefined;
    onDateChange: (date: Date) => void;
}

export function DateTimeDrawer({
    open,
    onOpenChange,
    date,
    onDateChange,
}: DateTimeDrawerProps) {
    const [step, setStep] = React.useState<"date" | "time">("date");
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);

    // Reset step when drawer opens
    React.useEffect(() => {
        if (open) {
            setStep("date");
            setInternalDate(date || new Date());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            // If user clicks the same date again (deselection), we treat it as confirmation
            if (internalDate) {
                setStep("time");
            }
            return;
        }
        
        // Preserve time from internalDate if it exists, otherwise use current time or 12:00
        const newDateWithTime = new Date(newDate);
        if (internalDate) {
            newDateWithTime.setHours(internalDate.getHours());
            newDateWithTime.setMinutes(internalDate.getMinutes());
        } else {
            const now = new Date();
            newDateWithTime.setHours(now.getHours());
            newDateWithTime.setMinutes(now.getMinutes());
        }
        
        setInternalDate(newDateWithTime);
        onDateChange(newDateWithTime);
        setStep("time");
    };

    const handleTimeChange = (newDate: Date | undefined) => {
        if (!newDate) return;

        // Validation: If newDate is in the future, clamp it to now
        const now = new Date();
        if (newDate > now) {
            setInternalDate(now);
            onDateChange(now);
            return;
        }

        setInternalDate(newDate);
        onDateChange(newDate);
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="text-left relative">
                    {step === "time" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-4 h-8 w-8 -ml-2"
                            onClick={() => setStep("date")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <DrawerTitle className={step === "time" ? "pl-8" : ""}>
                        {step === "date" ? "Select Date" : "Select Time"}
                    </DrawerTitle>
                    <DrawerDescription className={step === "time" ? "pl-8" : ""}>
                        {step === "date"
                            ? "Pick a date for this transaction."
                            : "Set the time for this transaction."}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-20 flex-1 flex flex-col items-center w-full min-h-0">
                    {step === "date" ? (
                        <div className="w-full flex justify-center items-center h-full pb-30">
                            <Calendar
                                mode="single"
                                selected={internalDate}
                                onSelect={handleDateSelect}
                                disabled={{ after: new Date() }}
                                defaultMonth={internalDate}
                                initialFocus
                                classNames={{
                                    root: "w-full p-3"
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full pt-4 pb-4">
                            <TimePicker date={internalDate} setDate={handleTimeChange} />
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
