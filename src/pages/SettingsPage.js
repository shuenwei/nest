import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, Globe, ChevronRight } from "lucide-react";
const menuItems = [
    { label: "Account Settings", icon: Settings },
    { label: "Notifications", icon: Bell },
    { label: "Currency Preferences", icon: Globe },
];
const SettingsPage = () => {
    return (_jsxs("div", { className: "min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4", children: [_jsxs("div", { className: "w-full max-w-sm pt-10 pb-24", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Settings" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Profile and Settings" })] }), _jsx(Card, { className: "mb-6 p-4 shadow-xs", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: "", alt: "Your Username" }), _jsx(AvatarFallback, { children: "U" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-sm", children: "Your Username" }), _jsx("div", { className: "text-muted-foreground text-xs", children: "@your_username" })] })] }) }), _jsx(Card, { className: "mb-6 py-0 shadow-xs", children: _jsx(CardContent, { className: "px-0 divide-y", children: menuItems.map(({ label, icon: Icon }) => (_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { className: "text-sm font-medium", children: label })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" })] }, label))) }) }), _jsx(Button, { variant: "link", className: "w-full", children: "Log Out" })] }), _jsx(Navbar, {})] }));
};
export default SettingsPage;
