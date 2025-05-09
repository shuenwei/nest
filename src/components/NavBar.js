import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Home, UsersRound, SquarePlus, History, Settings } from "lucide-react";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
const NavBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = [
        { icon: Home, path: "/dashboard", action: () => navigate("/dashboard") },
        { icon: UsersRound, path: "/friends", action: () => navigate("/friends") },
        { icon: SquarePlus, isTrigger: true },
        { icon: History, path: "/history", action: () => navigate("/history") },
        { icon: Settings, path: "/settings", action: () => navigate("/settings") },
    ];
    return (_jsx(Card, { className: "fixed bottom-7 left-1/2 -translate-x-1/2 \r\n             w-[90%] max-w-sm \r\n             rounded-full\r\n             bg-neutral-300/20 backdrop-blur-sm \r\n             border border-white/0 \r\n             px-6 py-4 \r\n             grid grid-cols-5 \r\n             text-muted-foreground \r\n             shadow-xl", children: navItems.map(({ icon: Icon, isTrigger, action, path }, index) => {
            const isActive = path && location.pathname === path;
            return (_jsx("div", { className: "flex items-center justify-center", children: isTrigger ? (_jsxs(Drawer, { open: drawerOpen, onOpenChange: setDrawerOpen, children: [_jsx(DrawerTrigger, { asChild: true, children: _jsx("button", { children: _jsx(Icon, { className: "w-7 h-7" }) }) }), _jsx(DrawerContent, { className: "pb-10 px-0", children: _jsxs("div", { className: "px-4 pt-4", children: [_jsx("div", { className: "text-xl font-bold mb-4 ml-3", children: "Select Transaction Type:" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Button, { variant: "ghost", className: "justify-start text-lg font-medium h-10 px-3", children: "Regular" }), _jsx(Button, { variant: "ghost", className: "justify-start text-lg font-medium h-10 px-3", children: "Restaurant Bill" }), _jsx(Button, { variant: "ghost", className: "justify-start text-lg font-medium h-10 px-3", children: "Recurring Subscription" }), _jsx(Button, { variant: "ghost", className: "justify-start text-lg font-medium h-10 px-3", children: "Settle Up" })] })] }) })] })) : (_jsx("button", { onClick: action, children: _jsx(Icon, { className: `w-7 h-7 ${isActive ? "text-foreground" : "text-muted-foreground"}` }) })) }, index));
        }) }));
};
export default NavBar;
