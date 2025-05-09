import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
const AllSetPage = ({ displayName, username, onFinish, }) => {
    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
    }, []);
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4", children: _jsxs(Card, { className: "w-full max-w-sm rounded-2xl border border-gray-200 text-center", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["You're all set, ", displayName, "!"] }), _jsx(CardDescription, { children: "Start splitting bills and tracking expenses with your friends." })] }), _jsx(CardContent, { className: "text-5xl pb-0", children: "\uD83C\uDF89" }), _jsxs(CardContent, { className: "pt-1 text-sm", children: ["Your username is ", _jsxs("strong", { children: ["@", username] }), "."] }), _jsx(CardFooter, { className: "px-6", children: _jsx(Button, { className: "w-full", onClick: onFinish, children: "Go to Dashboard!" }) })] }) }));
};
export default AllSetPage;
