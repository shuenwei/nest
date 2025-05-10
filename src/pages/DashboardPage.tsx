import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoveDownLeft, MoveUpRight, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hello, Shuen Wei! 👋</h1>
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

        {[
          { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
          { name: "Mei Lin", tag: "@meilin", amount: -45.2 },
          { name: "Raj Patel", tag: "@rajp", amount: 120.75 },
          { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
          { name: "Mei Lin", tag: "@meilin", amount: 0.0 },
          { name: "Raj Patel", tag: "@rajp", amount: 120.75 },
          { name: "Alex Wong", tag: "@alexwong", amount: 85.5 },
          { name: "Mei Lin", tag: "@meilin", amount: -45.2 },
          { name: "Raj Patel", tag: "@rajp", amount: 0.0 },
        ].map(({ name, tag, amount }, idx) => (
          <Card key={idx} className="mb-3 py-4 shadow-xs">
            <CardContent className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={name} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-muted-foreground text-xs">{tag}</div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs font-medium mb-0.5 ${
                    amount < 0
                      ? "text-red-500"
                      : amount > 0
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {amount < 0
                    ? "You owe"
                    : amount > 0
                    ? "Owes you"
                    : "Settled up"}
                </p>
                <p
                  className={`font-semibold ${
                    amount < 0
                      ? "text-red-600"
                      : amount > 0
                      ? "text-green-700"
                      : "text-muted-foreground"
                  }`}
                >
                  {amount === 0 ? "$0.00" : `$${Math.abs(amount).toFixed(2)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Navbar />
    </div>
  );
};

export default DashboardPage;
