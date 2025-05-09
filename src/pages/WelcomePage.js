import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "../components/ui/card";
import { Button } from "../components/ui/button";
const WelcomePage = ({ onNext }) => {
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4", children: _jsxs(Card, { className: "w-full max-w-sm text-center", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-3xl", children: "nest" }), _jsx(CardDescription, { children: "Bill splitting, now made simple." })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-[56px] my-6", children: "\uD83D\uDCB5" }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: onNext, className: "w-full", children: "Let's get started!" }) })] }) }));
};
export default WelcomePage;
