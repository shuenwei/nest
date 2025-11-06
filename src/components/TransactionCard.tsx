import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Transaction } from "@/lib/transaction";
import { useNavigate } from "react-router-dom";
import { triggerHapticImpact } from "@/lib/haptics";

interface TransactionCardProps {
  transactionId: string;
  className?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transactionId,
  className = "",
}) => {
  const { user, transactions } = useUser();
  const navigate = useNavigate();

  const friends = user?.friends || [];
  const transaction = transactions.find((t) => t._id === transactionId);

  if (!transaction) return null;

  const iconMap: Record<Transaction["type"], string> = {
    settleup: "💸",
    purchase: "🛒",
    bill: "🍔",
    recurring: "🔁",
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formattedTime = date
      .toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace(":", ".")
      .replace(/\s?(am|pm)/, (_, suffix) => suffix);
    return `${formattedDate} ${formattedTime}`;
  };

  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) return "You";
    return friends.find((f) => f.id === userId)?.displayName ?? "???";
  };

  const icon = iconMap[transaction.type];
  return (
    <Card
      className={`mb-3 py-3 shadow-xs ${className}`}
      onClick={() => {
        triggerHapticImpact("light");
        navigate(`/history/${transaction._id}`);
      }}
    >
      <CardContent className="px-0 divide-y">
        <div className="px-4 pb-3 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="text-3xl pr-1">{icon}</span>
            <div>
              <div className="font-semibold text-sm">
                {transaction.transactionName}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatDateTime(transaction.date)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">
              ${transaction.amountInSgd.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs">
              {transaction.type === "settleup"
                ? `Transferred`
                : `Paid by ${getUserDisplayName(transaction.paidBy)}`}
            </p>
          </div>
        </div>
        <div className="px-4">
          <div className="text-xs text-muted-foreground mb-1  mt-3">
            {transaction.type === "settleup"
              ? ""
              : `Split with ${transaction.splitsInSgd.length} people`}
          </div>

          <div className="flex flex-wrap gap-2">
            {transaction.type === "settleup" ? (
              <>
                <Badge variant="secondary" className="font-semibold">
                  {getUserDisplayName(transaction.payer)}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary" className="font-semibold">
                  {getUserDisplayName(transaction.payee)}
                </Badge>
              </>
            ) : (
              transaction.splitsInSgd.map((p) => (
                <Badge key={p.user} variant="secondary">
                  <span className="font-semibold">
                    {getUserDisplayName(p.user)}
                  </span>{" "}
                  <span className="font-normal">${p.amount.toFixed(2)}</span>
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
