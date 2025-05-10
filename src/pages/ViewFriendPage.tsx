import { useNavigate } from "react-router-dom";
import { Card, CardFooter, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import TransactionCard, { Transaction } from "@/components/TransactionCard";

// Dummy data for demonstration
const friend = {
  name: "Alex Wong",
  tag: "@alexwong",
  amount: 85.5,
};

const transactions = [
  {
    transactionName: "Settle Up",
    date: "7 May 2023",
    amount: 45.5,
    paidBy: "Alex Wong",
    icon: "💸",
    people: ["You", "Alex Wong"],
    type: "settle",
    receivedBy: "You",
  },
  {
    transactionName: "Lunch at Hawker Centre",
    date: "8 May 2023",
    amount: 68.5,
    paidBy: "You",
    icon: "🍽️",
    people: ["You", "Alex Wong"],
    type: "expense",
  },
  {
    transactionName: "Taxi ride home",
    date: "6 May 2023",
    amount: 24.5,
    paidBy: "Alex Wong",
    icon: "🚕",
    people: ["You", "Alex Wong"],
    type: "expense",
  },
];

const ViewFriendPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base font-medium">Back</span>
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon">
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 />
            </Button>
          </div>
        </div>

        {/* Friend Info Card */}
        <Card className="mb-6 py-4 shadow-xs gap-4">
          <CardContent className="px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={friend.name} />
                <AvatarFallback>
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{friend.name}</div>
                <div className="text-muted-foreground text-xs">
                  {friend.tag}
                </div>
              </div>
            </div>
            <div className="text-right w-28">
              <p
                className={`text-xs font-medium mb-0.5 ${
                  friend.amount < 0
                    ? "text-red-500"
                    : friend.amount > 0
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {friend.amount < 0
                  ? "You owe"
                  : friend.amount > 0
                  ? "Owes you"
                  : "Settled up"}
              </p>
              <p
                className={`font-semibold ${
                  friend.amount < 0
                    ? "text-red-600"
                    : friend.amount > 0
                    ? "text-green-700"
                    : "text-muted-foreground"
                }`}
              >
                {friend.amount === 0
                  ? "$0.00"
                  : `$${Math.abs(friend.amount).toFixed(2)}`}
              </p>
            </div>
          </CardContent>
          <CardFooter className="px-4">
            <Button className="w-full rounded-xl">Settle Up</Button>
          </CardFooter>
        </Card>

        {/* Past Transactions */}
        <div className="mb-2 font-semibold text-lg">History</div>
        {transactions.map((item, idx) => (
          <TransactionCard key={idx} transaction={item as Transaction} />
        ))}
      </div>
    </div>
  );
};

export default ViewFriendPage;
