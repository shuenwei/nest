import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, GaugeCircle, UserRoundX, ChevronRight, Mail, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/lib/toast";
import { useEffect, useState } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { format } from "date-fns";

const menuItems = [
  { label: "Account Settings", icon: Settings, path: "/settings/account" },
  { label: "Usage Limits", icon: GaugeCircle, path: "/settings/limits" },
  { label: "Email Forwarding", icon: Mail, path: "/settings/emailforwarding" },
  { label: "Export Transactions", icon: Download, path: "/settings/export" },
  //{ label: "Block Users", icon: UserRoundX, path: "/settings/block" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser, transactions, loading, updating } = useUser();
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const { isAccessGranted, canOpenSettings, openSettings } = useLocation();

  const isLoading = loading || updating;

  useEffect(() => {
    setIsTelegramApp(
      Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user ?? false)
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("telegramId");
    localStorage.removeItem("token");
    refreshUser();
    toast.success("You are now logged out!");
    navigate("/"); // redirect to homepage or login
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Profile and Settings</p>
        </div>

        <Card className="mb-6 p-4 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user?.profilePhoto ? user?.profilePhoto : ""}
                alt={user?.displayName}
              />
              <AvatarFallback>
                {user?.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">
                {user?.displayName || "User Not Logged In"}
              </div>
              <div className="text-muted-foreground text-xs">
                @{user?.username || "unknown"}
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 py-0 shadow-xs">
          <CardContent className="px-0 divide-y">
            {menuItems.map(({ label, icon: Icon, path }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
                onClick={() => navigate(path)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-normal">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {canOpenSettings && !isAccessGranted && (
          <Card className="mb-6 py-4 shadow-xs border-amber-200 bg-amber-50">
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-amber-900">
                  Location Access Disabled :(
                </div>
                <div className="text-xs text-amber-700">
                  Enable location access to automatically detect the currency of your location.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100 ml-4"
                onClick={openSettings}
              >
                Enable
              </Button>
            </CardContent>
          </Card>
        )}

        {!isTelegramApp && (
          <Button variant="link" className="w-full" onClick={handleLogout}>
            Log Out
          </Button>
        )}

        <p className="text-center pt-10 text-muted-foreground">
          Made by @shuenwei
        </p>
      </div>

      <Navbar />
    </div>
  );
};

export default SettingsPage;
