import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoveDownLeft, MoveUpRight } from "lucide-react";
const DashboardPage = () => {
    return (_jsxs("div", { className: "min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4", children: [_jsxs("div", { className: "w-full max-w-sm pt-10 pb-24", children: [_jsx("div", { className: "mb-4", children: _jsx("h1", { className: "text-2xl font-bold", children: "Hello, Shuen Wei! \uD83D\uDC4B" }) }), _jsx("div", { className: "mb-2 flex justify-between items-center", children: _jsx("h2", { className: "text-lg font-medium text-muted-foreground", children: "Overview" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsx(Card, { className: "bg-green-50 border-green-200 px-4 py-3 shadow-xs", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col gap-0", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Friends owe" }), _jsx("p", { className: "text-green-600 font-bold text-lg", children: "$206.25" })] }), _jsx("div", { className: "bg-green-200 text-green-700 rounded-full p-3", children: _jsx(MoveDownLeft, { className: "w-5 h-5" }) })] }) }), _jsx(Card, { className: "bg-red-50 border-red-100 px-4 py-3 shadow-xs", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col gap-0", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "You owe" }), _jsx("p", { className: "text-red-600 font-bold text-lg", children: "$75.20" })] }), _jsx("div", { className: "bg-red-200 text-red-700 rounded-full p-3", children: _jsx(MoveUpRight, { className: "w-5 h-5" }) })] }) })] }), _jsx("div", { className: "mb-2 flex justify-between items-center", children: _jsx("h2", { className: "text-lg font-medium text-muted-foreground", children: "Balances" }) }), [
                        { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
                        { name: "Mei Lin", tag: "@meilin", amount: -45.2 },
                        { name: "Raj Patel", tag: "@rajp", amount: 120.75 },
                        { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
                        { name: "Mei Lin", tag: "@meilin", amount: 0.0 },
                        { name: "Raj Patel", tag: "@rajp", amount: 120.75 },
                        { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
                        { name: "Mei Lin", tag: "@meilin", amount: -45.2 },
                        { name: "Raj Patel", tag: "@rajp", amount: 0.0 },
                    ].map(({ name, tag, amount }, idx) => (_jsx(Card, { className: "mb-3 py-4 shadow-xs", children: _jsxs(CardContent, { className: "px-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: "", alt: name }), _jsx(AvatarFallback, { children: name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase() })] }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: name }), _jsx("div", { className: "text-muted-foreground text-xs", children: tag })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: `text-xs font-medium mb-0.5 ${amount < 0
                                                ? "text-red-500"
                                                : amount > 0
                                                    ? "text-green-600"
                                                    : "text-muted-foreground"}`, children: amount < 0
                                                ? "You owe"
                                                : amount > 0
                                                    ? "Owes you"
                                                    : "Settled up" }), _jsx("p", { className: `font-semibold ${amount < 0
                                                ? "text-red-600"
                                                : amount > 0
                                                    ? "text-green-700"
                                                    : "text-muted-foreground"}`, children: amount === 0 ? "$0.00" : `$${Math.abs(amount).toFixed(2)}` })] })] }) }, idx)))] }), _jsx(Navbar, {})] }));
};
export default DashboardPage;
