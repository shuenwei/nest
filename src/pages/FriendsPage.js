import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/NavBar";
import { UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const FriendsPage = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const friends = [
        { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
        { name: "Mei Lin", tag: "@meilin", amount: -45.2 },
        { name: "Raj Patel", tag: "@rajp", amount: 120.75 },
        { name: "Sarah Chen", tag: "@sarahc", amount: -30.0 },
        { name: "John Tan", tag: "@johntan", amount: 0.0 },
        { name: "Lisa Kim", tag: "@lisakim", amount: 15.3 },
    ];
    const filteredFriends = friends.filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(search.toLowerCase()) ||
            friend.tag.toLowerCase().includes(search.toLowerCase());
        if (filter === "owes")
            return matchesSearch && friend.amount < 0;
        if (filter === "owed")
            return matchesSearch && friend.amount > 0;
        if (filter === "settled")
            return matchesSearch && friend.amount === 0;
        return matchesSearch;
    });
    return (_jsxs("div", { className: "min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4", children: [_jsxs("div", { className: "w-full max-w-sm pt-10 pb-24", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Friends" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Manage friends and settle balances" })] }), _jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsxs("div", { className: "relative w-full", children: [_jsx(Search, { className: "absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" }), _jsx(Input, { type: "text", placeholder: "Search friends", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 rounded-xl" })] }), _jsxs(Button, { className: "rounded-xl h-11 has-[>svg]:pl-5", children: [_jsx(UserPlus, { className: "size-4" }), "Add"] })] }), _jsx("div", { className: "mb-4", children: _jsxs(Select, { value: filter, onValueChange: setFilter, children: [_jsx(SelectTrigger, { className: "w-full rounded-xl", children: _jsx(SelectValue, { placeholder: "Filter" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "owed", children: "Owes you" }), _jsx(SelectItem, { value: "owes", children: "You Owe" }), _jsx(SelectItem, { value: "settled", children: "Settled up" })] })] }) }), filteredFriends.map(({ name, tag, amount }, idx) => (_jsx(Card, { className: "mb-3 py-4 shadow-xs", children: _jsxs(CardContent, { className: "px-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: "", alt: name }), _jsx(AvatarFallback, { children: name
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
export default FriendsPage;
