import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, UserRoundX, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const menuItems = [
  { label: "Account Settings", icon: Settings, path: "/settings/account" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

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
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button variant="link" className="w-full" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default SettingsPage;
