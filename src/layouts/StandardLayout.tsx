import { Outlet } from "react-router-dom";

const StandardLayout = () => {
    return (
        <div className="pt-[env(safe-area-inset-top)] [.telegram-webapp_&]:pt-[calc(env(safe-area-inset-top)+20px)] min-h-screen bg-[#F8F8F8]">
            <Outlet />
        </div>
    );
};

export default StandardLayout;
