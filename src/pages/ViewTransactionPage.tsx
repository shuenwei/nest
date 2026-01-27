"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Transaction } from "@/lib/transaction";
import LoadingScreen from "@/components/LoadingScreen";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { toast } from "@/lib/toast";
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

import PurchaseTransactionView from "@/components/transactions/PurchaseTransactionView";
import BillTransactionView from "@/components/transactions/BillTransactionView";
import SettleUpTransactionView from "@/components/transactions/SettleUpTransactionView";
import RecurringTransactionView from "@/components/transactions/RecurringTransactionView";
import TransactionHeader from "@/components/transactions/TransactionHeader";
import GroupSmartSettleTransactionView from "@/components/transactions/GroupSmartSettleTransactionView";

const ViewTransactionPage = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const { user, transactions, refreshUser, loading } = useUser();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      navigate("/history");
      return;
    }

    const foundTransaction = transactions.find((t) => t._id === transactionId);

    if (foundTransaction) {
      setTransaction(foundTransaction);
      setIsLoading(false);
    }

    if (!loading && !foundTransaction) {
      toast.error("Failed to load transaction details");
      navigate("/history");
      setIsLoading(false);
    }
  }, [loading, transactionId, transactions, navigate]);

  const handleDelete = async () => {
    if (!transactionId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/transaction/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/history");
      refreshUser();
      toast.success("Success!", {
                description: "Transaction deleted successfully!",
              });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Error!", {
                description: "Failed to delete transaction!",
              });      
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!transaction) return;

    // Navigate to the appropriate edit page based on transaction type
    switch (transaction.type) {
      case "purchase":
        navigate(`/splitpurchase/edit/${transactionId}`);
        break;
      case "bill":
        navigate(`/splitbill/edit/${transactionId}`);
        break;
      case "settleup":
        navigate(`/settleup/edit/${transactionId}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!transaction || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => {
              if (window.history.length <= 2) {
                navigate("/history", { replace: true });
              } else {
                navigate(-1);
              }
            }}
          >
            <ArrowLeft className="size-5" />
            <span className="text-base font-medium">Back</span>
          </Button>

          <div className="flex gap-3">
            {["purchase", "bill", "settleup"].includes(transaction.type) && (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Pencil />
              </Button>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this transaction? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Transaction Header */}
        <TransactionHeader transaction={transaction} />

        {/* Transaction Details */}
        <Card className="mb-3 py-0 shadow-none">
          {transaction.type === "purchase" && (
            <PurchaseTransactionView transaction={transaction} />
          )}
          {transaction.type === "bill" && (
            <BillTransactionView transaction={transaction} />
          )}
          {transaction.type === "settleup" && (
            <SettleUpTransactionView transaction={transaction} />
          )}
          {transaction.type === "groupSmartSettle" && (
            <GroupSmartSettleTransactionView transaction={transaction} />
          )}
          {transaction.type === "recurring" && (
            <RecurringTransactionView transaction={transaction} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViewTransactionPage;
