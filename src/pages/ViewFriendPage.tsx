import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserRoundMinus, AlertCircle } from "lucide-react";
import TransactionCard from "@/components/TransactionCard";
import FriendCard from "@/components/FriendCard";
import { Transaction } from "@/lib/transaction";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const ViewFriendPage = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser, transactions } = useUser();
  const [isRemoving, setIsRemoving] = useState(false);
  const { friendId } = useParams<{ friendId: string }>();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (loading) return;

    if (!friendId || !user) {
      navigate("/friends");
      return;
    }

    const friendExists = user.friends.some((f) => f.id === friendId);
    if (!friendExists) navigate("/friends");
  }, [loading, friendId, user, navigate]);

  if (!friendId || !user) return null;

  const friend = user.friends.find((f) => f.id === friendId)!;
  const friendName = friend.displayName;

  const friendTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.participants.includes(user.id) && t.participants.includes(friendId)
    );
  }, [transactions, user.id, friendId]);

  const handleDelete = async () => {
    if (!friendId) return;

    setIsRemoving(true);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/user/removefriend`, {
        data: {
          userId: user.id,
          friendId: friendId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`${friendName} has been removed as a friend.`);
      navigate("/friends");
    } catch (error) {
      console.error("Error removing friend:", error);
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status === 403 &&
          error.response?.data?.error?.includes("transactions exists")
        ) {
          toast.error(
            `Oops! Failed to remove friend as you have existing transactions with ${friendName}. Delete all transactions with ${friendName} to remove as friend.`
          );
        } else {
          toast.error(`Failed to remove ${friendName} as friend.`);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsRemoving(false);
      await refreshUser();
    }
  };

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

          {/* Delete Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserRoundMinus />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {friendName} as a friend? This
                  action cannot be undone.
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You are not able to remove a friend if you have existing
                      transaction history or unsettled balances with that
                      friend.
                    </AlertDescription>
                  </Alert>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/50"
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
