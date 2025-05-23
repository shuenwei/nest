import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserRoundX, AlertCircle } from "lucide-react";
import TransactionCard from "@/components/TransactionCard";
import FriendCard from "@/components/FriendCard";
import { Transaction } from "@/lib/transaction";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";
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
import { useEffect, useState } from "react";
import axios from "axios";

const ViewFriendPage = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useUser();
  const [isRemoving, setIsRemoving] = useState(false);
  const { friendId } = useParams<{ friendId: string }>();
  const [isFetching, setIsFetching] = useState(false);
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

  if (loading) return <LoadingScreen />;

  if (!friendId || !user) return null;

  const friend = user.friends.find((f) => f.id === friendId)!;
  const [friendTransactions, setFriendTransactions] = useState<Transaction[]>(
    []
  );

  const friendName = friend.displayName;

  useEffect(() => {
    const fetchFriendTransactions = async () => {
      if (!user?.id || !friendId) return;
      setIsFetching(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/all/${
            user.id
          }/${friendId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFriendTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions between users:", err);
        toast.error("Failed to fetch transactions");
      } finally {
        setIsFetching(false);
      }
    };
    fetchFriendTransactions();
  }, [user?.id, friendId]);

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
          error.response?.data?.error?.includes("outstanding balance")
        ) {
          toast.error(
            `Oops! Failed to remove friend as you have an outstanding balance of $${friend.balance} with ${friendName}. You can only remove friends with no balances.`
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
                <UserRoundX />
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
                      You are only able to remove a friend if you have settled
                      all balances with them.
                    </AlertDescription>
                  </Alert>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/50"
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </AlertDialogAction>
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

        {isFetching && (
          <div className="flex flex-col gap-8 pt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 w-full">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isFetching && friendTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFriendPage;
