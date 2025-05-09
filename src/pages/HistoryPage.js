import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/NavBar";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const HistoryPage = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const expenses = [
        {
            title: "Lunch at Hawker Centre",
            date: "8 May 2023",
            amount: 68.5,
            paidBy: "You",
            icon: "🍽️",
            people: ["You", "Alex Wong", "Mei Lin", "Raj Patel"],
        },
        {
            title: "Spotify Family",
            date: "1 May 2023",
            amount: 14.9,
            paidBy: "You",
            icon: "📍",
            people: ["You", "Alex Wong", "Mei Lin", "Sarah Chen"],
        },
        {
            title: "Taxi ride home",
            date: "6 May 2023",
            amount: 24.5,
            paidBy: "Alex Wong",
            icon: "💵",
            people: ["You", "Alex Wong"],
        },
        {
            title: "Groceries",
            date: "4 May 2023",
            amount: 84.6,
            paidBy: "You",
            icon: "💵",
            people: ["You", "Mei Lin", "Raj Patel"],
        },
    ];
    const filtered = expenses.filter((e) => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" ||
            (filter === "you" && e.paidBy === "You") ||
            (filter === "friend" && e.paidBy !== "You") ||
            (filter === "settle" && e.title.toLowerCase().includes("settle"));
        return matchesSearch && matchesFilter;
    });
    return (_jsxs("div", { className: "min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4", children: [_jsxs("div", { className: "w-full max-w-sm pt-10 pb-24", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "History" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "View expense history" })] }), _jsxs("div", { className: "relative w-full mb-4", children: [_jsx(Search, { className: "absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" }), _jsx(Input, { type: "text", placeholder: "Search transactions", className: "pl-9 rounded-xl", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsx("div", { className: "mb-4", children: _jsxs(Select, { value: filter, onValueChange: setFilter, children: [_jsx(SelectTrigger, { className: "w-full rounded-xl", children: _jsx(SelectValue, { placeholder: "Filter" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "you", children: "You paid" }), _jsx(SelectItem, { value: "friend", children: "Friends paid" }), _jsx(SelectItem, { value: "settle", children: "Settle up" })] })] }) }), filtered.map((item, idx) => (_jsx(Card, { className: "mb-3 py-3 shadow-xs", children: _jsxs(CardContent, { className: "px-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: "text-lg", children: item.icon }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-sm", children: item.title }), _jsx("div", { className: "text-muted-foreground text-xs", children: item.date })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-sm", children: ["SGD ", item.amount.toFixed(2)] }), _jsxs("p", { className: "text-muted-foreground text-xs", children: ["Paid by ", item.paidBy] })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground mb-2", children: ["Split with ", item.people.length, " people"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: item.people.map((p) => (_jsx(Badge, { variant: "secondary", children: p }, p))) })] }) }, idx)))] }), _jsx(Navbar, {})] }));
};
export default HistoryPage;
