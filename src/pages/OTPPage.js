import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
const FormSchema = z.object({
    code: z.string().min(6, {
        message: "Please enter the 6-digit code sent to your Telegram.",
    }),
});
const OTPPage = ({ username, otp, setOtp, onBack, onNext, }) => {
    const [showInput, setShowInput] = useState(false);
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: { code: otp },
    });
    const handleSubmit = (data) => {
        setOtp(data.code);
        onNext();
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4", children: _jsxs(Card, { className: "w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm", children: [_jsx("div", { className: "px-6 pb-1", children: _jsx(Progress, { value: 50 }) }), _jsxs(CardHeader, { className: "px-6 pb-2", children: [_jsx(CardTitle, { children: "Enter the 6-digit code sent to your Telegram" }), _jsxs(CardDescription, { children: ["To receive your OTP, message ", _jsx("strong", { children: "@SplityApp_bot" }), "."] })] }), !showInput ? (_jsx(CardContent, { className: "space-y-4 px-6", children: _jsx("a", { href: `https://t.me/SplityApp_bot?start=verify_${username}`, target: "_blank", rel: "noopener noreferrer", children: _jsx(Button, { className: "w-full", onClick: () => setShowInput(true), children: "Click here to message @SplityApp_bot" }) }) })) : (_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), children: [_jsx(CardContent, { className: "space-y-4 px-6", children: _jsx(FormField, { control: form.control, name: "code", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormControl, { children: _jsx(InputOTP, { maxLength: 6, pattern: REGEXP_ONLY_DIGITS_AND_CHARS, ...field, children: _jsx(InputOTPGroup, { className: "grid grid-cols-6 gap-2 w-full", children: Array.from({ length: 6 }, (_, idx) => (_jsx(InputOTPSlot, { index: idx, className: "w-full h-12 text-lg rounded-md border border-input bg-background text-center font-medium" }, idx))) }) }) }), _jsx(FormMessage, { className: "font-outfit text-sm" })] })) }) }), _jsxs(CardFooter, { className: "flex justify-between px-6 pt-8", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onBack, children: "Back" }), _jsxs(Button, { type: "submit", children: ["Next", _jsx(ChevronRight, {})] })] })] }) }))] }) }));
};
export default OTPPage;
