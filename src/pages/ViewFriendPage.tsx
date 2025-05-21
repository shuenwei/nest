import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import TransactionCard from "@/components/TransactionCard";
import FriendCard from "@/components/FriendCard";
import { Transaction } from "@/lib/transaction";
import LoadingScreen from "@/components/LoadingScreen";

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";

const ViewFriendPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const { friendId } = useParams<{ friendId: string }>();

  useEffect(() => {
    if (loading) return;

    if (!friendId || !user) {
      navigate("/friends");
      return;
    }

    const friendExists = user.friends.some((f) => f.id === friendId);
    if (!friendExists) navigate("/friends");
  }, [loading, friendId, user, navigate]);

  if (loading) return <LoadingScreen />;

  if (!friendId || !user) return null;

  const friend = user?.friends.find((f) => f.id === friendId)!;
  const [friendTransactions, setFriendTransactions] = useState<Transaction[]>(
    []
  );
  useEffect(() => {
    const fetchFriendTransactions = async () => {
      if (!user?.id || !friendId) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/all/${
            user.id
          }/${friendId}`
        );
        setFriendTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions between users:", err);
      }
    };
    fetchFriendTransactions();
  }, [user?.id, friendId]);

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
          userId={friendId}
          disableClick
          footer={
            <Button
              className="w-full rounded-xl"
              onClick={() =>
                navigate("/settleup", {
                  state: { amount: friend.balance, friendId: friendId },
                })
              }
            >
              Settle Up
            </Button>
          }
        />

        {/* Past Transactions */}
        <div className="pt-3 mb-2 font-semibold text-lg">History</div>
        {friendTransactions.map((txn) => (
          <TransactionCard key={txn._id} transactionId={txn._id} />
        ))}

        {friendTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFriendPage;
