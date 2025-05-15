import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import TransactionCard, { Transaction } from "@/components/TransactionCard";
import FriendCard from "@/components/FriendCard";

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
  const { state } = useLocation();
  const { name, username, amount } = state || {};

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
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
        <FriendCard
          name={name}
          username={username}
          amount={amount}
          disableClick
          footer={
            <Button
              className="w-full rounded-xl"
              onClick={() =>
                navigate("/settleup", {
                  state: { amount: amount, friendName: name },
                })
              }
            >
              Settle Up
            </Button>
          }
        />

        {/* Past Transactions */}
        <div className="pt-3 mb-2 font-semibold text-lg">History</div>
        {transactions.map((item, idx) => (
          <TransactionCard key={idx} transaction={item as Transaction} />
        ))}
      </div>
    </div>
  );
};

export default ViewFriendPage;
