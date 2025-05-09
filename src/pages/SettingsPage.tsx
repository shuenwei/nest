import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Bell,
  Users,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { label: "Account Settings", icon: Settings },
  { label: "Notifications", icon: Bell },
  { label: "Currency Preferences", icon: Globe },
];

const SettingsPage = () => {
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
              <AvatarImage src="" alt="Your Username" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">Your Username</div>
              <div className="text-muted-foreground text-xs">
                @your_username
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 py-0 shadow-xs">
          <CardContent className="px-0 divide-y">
            {menuItems.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
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

        <Button variant="link" className="w-full">
          Log Out
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default SettingsPage;
