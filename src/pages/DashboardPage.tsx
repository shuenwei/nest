import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/NavBar";
import FriendCard from "@/components/FriendCard";
import { MoveDownLeft, MoveUpRight, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const friends = [
    { name: "Alex Wong", username: "alexwong", amount: 85.5 },
    { name: "Mei Lin", username: "meilin", amount: -45.2 },
    { name: "Raj Patel", username: "rajp", amount: 120.75 },
    { name: "Sarah Chen", username: "sarahc", amount: -30.0 },
    { name: "John Tan", username: "johntan", amount: 0.0 },
    { name: "Lisa Kim", username: "lisakim", amount: 15.3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Hello, {user?.displayName || "there"}! 👋
          </h1>
          <Button
            onClick={() => navigate("/notifications")}
            variant="ghost"
            size="icon"
          >
            <Bell className="size-6" />
          </Button>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-50 border-green-200 px-4 py-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0">
                <p className="text-sm text-muted-foreground">Friends owe</p>
                <p className="text-green-600 font-bold text-lg">$206.25</p>
              </div>
              <div className="bg-green-200 text-green-700 rounded-full p-3">
                <MoveDownLeft className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-red-50 border-red-100 px-4 py-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0">
                <p className="text-sm text-muted-foreground">You owe</p>
                <p className="text-red-600 font-bold text-lg">$75.20</p>
              </div>
              <div className="bg-red-200 text-red-700 rounded-full p-3">
                <MoveUpRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Balances
          </h2>
        </div>

        {friends
          .filter(({ amount }) => amount !== 0)
          .map(({ name, username, amount }, idx) => (
            <FriendCard name={name} username={username} amount={amount} />
          ))}
      </div>
      <Navbar />
    </div>
  );
};

export default DashboardPage;
