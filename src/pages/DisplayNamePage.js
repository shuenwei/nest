import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
const formSchema = z.object({
    displayName: z.string().min(1, "Hey! We need a display name >:("),
});
const DisplayNamePage = ({ onBack, onNext, displayName, setDisplayName, }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName,
        },
    });
    const handleSubmit = (data) => {
        setDisplayName(data.displayName.trim());
        onNext();
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4", children: _jsxs(Card, { className: "w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm", children: [_jsx("div", { className: "px-6 pb-1", children: _jsx(Progress, { value: 75 }) }), _jsxs(CardHeader, { className: "px-6 pb-2", children: [_jsx(CardTitle, { children: "Next, what's your display name?" }), _jsx(CardDescription, { children: "This is how your name will appear to your friends in Splity." })] }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), children: [_jsx(CardContent, { className: "space-y-4 px-6", children: _jsx(FormField, { control: form.control, name: "displayName", render: ({ field }) => (_jsxs(FormItem, { className: "mb-4", children: [_jsx(FormLabel, { className: "sr-only", children: "Display Name" }), _jsx(FormControl, { children: _jsx("div", { className: "relative", children: _jsx(Input, { ...field, placeholder: "John Doe" }) }) }), _jsx(FormMessage, { className: "font-outfit text-sm" })] })) }) }), _jsxs(CardFooter, { className: "flex justify-between px-6 pt-5", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onBack, children: "Back" }), _jsxs(Button, { type: "submit", children: ["Next", _jsx(ChevronRight, {})] })] })] }) })] }) }));
};
export default DisplayNamePage;
