import { Outlet } from "react-router-dom";

const StandardLayout = () => {
    return (
        <div className="pt-[env(safe-area-inset-top)] [.telegram-webapp_&]:pt-[calc(var(--tg-safe-area-inset-top,env(safe-area-inset-top))+var(--tg-content-safe-area-inset-top,0px)-20px)] min-h-screen bg-[#F8F8F8]">
            <Outlet />
        </div>
    );
};

export default StandardLayout;
