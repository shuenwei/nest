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

  if (!user) return null;

  const friendsOwe = user.friends
    .reduce((sum, f) => sum + (f.balance && f.balance > 0 ? f.balance : 0), 0)
    .toFixed(2);

  const youOwe = Math.abs(
    user.friends.reduce(
      (sum, f) => sum + (f.balance && f.balance < 0 ? f.balance : 0),
      0
    )
  ).toFixed(2);

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
                <p className="text-green-600 font-bold text-lg">
                  ${friendsOwe}
                </p>
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
                <p className="text-red-600 font-bold text-lg">${youOwe}</p>
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

        {user.friends
          .filter((f) => (f.balance ?? 0) !== 0)
          .map((f) => (
            <FriendCard key={f.id} userId={f.id} />
          ))}
      </div>
      <Navbar />
    </div>
  );
};

export default DashboardPage;
