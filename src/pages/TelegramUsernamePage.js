import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Validation schema
const formSchema = z.object({
    telegram: z.string().min(1, "Hey! We need a username >:("),
});
const TelegramUsernamePage = ({ username, setUsername, onBack, onNext, }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            telegram: username.replace(/^@/, ""),
        },
    });
    const onSubmit = (data) => {
        const trimmed = data.telegram.trim().replace(/^@/, "");
        setUsername(trimmed);
        onNext(trimmed);
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4", children: _jsxs(Card, { className: "w-full max-w-sm", children: [_jsx("div", { className: "px-6 pb-1", children: _jsx(Progress, { value: 25 }) }), _jsxs(CardHeader, { className: "px-6 pb-2", children: [_jsx(CardTitle, { children: "Firstly, what\u2019s your Telegram username?" }), _jsx(CardDescription, { children: "Your Telegram username will be used to let friends find you on Splity" })] }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), children: [_jsx(CardContent, { className: "space-y-4 px-6", children: _jsx(FormField, { control: form.control, name: "telegram", render: ({ field }) => (_jsxs(FormItem, { className: "mb-4", children: [_jsx(FormLabel, { className: "sr-only", children: "Telegram Username" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-outfit", children: "@" }), _jsx(Input, { ...field, placeholder: "username", className: "pl-7 font-outfit" })] }) }), _jsx(FormMessage, { className: "font-outfit text-sm" })] })) }) }), _jsxs(CardFooter, { className: "flex justify-between px-6 pt-5", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onBack, children: "Back" }), _jsxs(Button, { type: "submit", children: ["Next", _jsx(ChevronRight, {})] })] })] }) })] }) }));
};
export default TelegramUsernamePage;
