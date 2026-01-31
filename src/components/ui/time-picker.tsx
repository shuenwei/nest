import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);

    const [hours, setHours] = React.useState<string>("12");
    const [minutes, setMinutes] = React.useState<string>("00");
    const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

    // Initialize state from date prop
    React.useEffect(() => {
        if (date) {
            let h = date.getHours();
            const m = date.getMinutes();
            const p = h >= 12 ? "PM" : "AM";
            
            h = h % 12;
            h = h ? h : 12; // the hour '0' should be '12'

            setHours(h.toString().padStart(2, '0'));
            setMinutes(m.toString().padStart(2, '0'));
            setPeriod(p);
        }
    }, [date]);

    // Update parent date object when local state changes
    const updateDate = (newHours: string, newMinutes: string, newPeriod: "AM" | "PM") => {
        if (!date) {
            const now = new Date();
            setDate(now);
            return;
        }
        
        const newDate = new Date(date);
        let h = parseInt(newHours);
        const m = parseInt(newMinutes);

        if (newPeriod === "PM" && h !== 12) h += 12;
        if (newPeriod === "AM" && h === 12) h = 0;

        newDate.setHours(h);
        newDate.setMinutes(m);
        setDate(newDate);
    };

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        // Auto-advance logic (simplified)
        if (value.length === 2) {
             const intVal = parseInt(value);
             if (intVal > 12) value = value.slice(-1); // if typing 13, probably meant 3
             if (intVal === 0) value = "12";
             minuteRef.current?.focus();
        }

        setHours(value);
        if (value.length === 2 && parseInt(value) >= 1 && parseInt(value) <= 12) {
             updateDate(value, minutes, period);
        }
    };
    
    const handleHoursBlur = () => {
         let val = parseInt(hours || "12");
         if (val < 1) val = 1;
         if (val > 12) val = 12;
         const formatted = val.toString().padStart(2, '0');
         setHours(formatted);
         updateDate(formatted, minutes, period);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (!/^\d*$/.test(value)) return;
        
        if (value.length === 2) {
             if (parseInt(value) > 59) value = value.slice(-1);
             periodRef.current?.focus();
        }
        
        setMinutes(value);
        if (value.length === 2 && parseInt(value) >= 0 && parseInt(value) <= 59) {
             updateDate(hours, value, period);
        }
    };
    
    const handleMinutesBlur = () => {
         let val = parseInt(minutes || "00");
         if (val > 59) val = 59;
         const formatted = val.toString().padStart(2, '0');
         setMinutes(formatted);
         updateDate(hours, formatted, period);
    };

    const togglePeriod = () => {
        const newPeriod = period === "AM" ? "PM" : "AM";
        setPeriod(newPeriod);
        updateDate(hours, minutes, newPeriod);
    };

    return (
        <div className="flex items-center gap-2 justify-center p-4">
            <div className="grid gap-1 text-center">
                <Label htmlFor="hours" className="text-xs">
                    Hours
                </Label>
                <Input
                    id="hours"
                    className="w-16 text-center text-2xl h-14 p-0"
                    value={hours}
                    onChange={handleHoursChange}
                    onBlur={handleHoursBlur}
                    ref={hourRef}
                    maxLength={2}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="tel"
                />
            </div>
            <div className="grid gap-1 text-center">
                 <Label className="text-xs opacity-0">:</Label>
                 <div className="flex items-center justify-center text-2xl h-14 pb-1">:</div>
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="minutes" className="text-xs">
                    Minutes
                </Label>
                <Input
                    id="minutes"
                    className="w-16 text-center text-2xl h-14 p-0"
                    value={minutes}
                    onChange={handleMinutesChange}
                    onBlur={handleMinutesBlur}
                    ref={minuteRef}
                    maxLength={2}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="tel"
                />
            </div>
            <div className="grid gap-1 text-center">
                 <Label className="text-xs opacity-0">:</Label>
                 <div className="flex items-center justify-center text-2xl h-14 pb-1">:</div>
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="period" className="text-xs">
                    AM/PM
                </Label>
                <button
                    id="period"
                    ref={periodRef}
                    className={cn(
                        "w-16 h-14 border rounded-md text-xl font-medium bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    )}
                    onClick={togglePeriod}
                >
                    {period}
                </button>
            </div>
        </div>
    );
}
