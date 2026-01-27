"use client";

import type React from "react";

import type { Transaction } from "@/lib/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";

interface TransactionHeaderProps {
  transaction: Transaction;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  transaction,
}) => {
  const { user } = useUser();
  const iconMap: Record<Transaction["type"], string> = {
    settleup: "💸",
    purchase: "🛒",
    bill: "🍔",
    recurring: "🔁",
    groupSmartSettle: "🤝",
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="mb-6 shadow-none border-none bg-transparent">
      <CardContent className="px-0 pb-4 flex flex-col items-center justify-center text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-none text-3xl border mb-4">
          {iconMap[transaction.type]}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {transaction.type === "groupSmartSettle"
              ? "Smart Settle"
              : ""}
          </p>
          {transaction.type !== "groupSmartSettle" && (
            <h1 className="text-4xl font-bold tracking-tight">
              ${transaction.amountInSgd.toFixed(2)}
            </h1>
          )}
          {transaction.currency !== "SGD" && transaction.type !== "groupSmartSettle" && (
            <p className="text-sm text-muted-foreground">
              {transaction.currency} {transaction.amount.toFixed(2)}
            </p>
          )}
        </div>

        <div className="space-y-1 pt-2">
          <h2 className="font-semibold text-xl">{transaction.transactionName}</h2>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(transaction.date)}
          </p>

          <div className="flex flex-wrap gap-2 text-xs justify-center pt-2">
            {transaction.type === "purchase" && (
              <Badge
                variant="outline"
                className="font-normal text-muted-foreground"
              >
                {transaction.splitMethod === "even"
                  ? "Split Equally"
                  : "Split Manually"}
              </Badge>
            )}
            {transaction.currency !== "SGD" &&
              transaction.type !== "groupSmartSettle" && (
                <Badge
                  variant="outline"
                  className="font-normal text-muted-foreground"
                >
                  1 SGD = {transaction.exchangeRate.toFixed(5)}{" "}
                  {transaction.currency}
                </Badge>
              )}

            {(() => {
              if (!user) return null;
              const categories = Array.isArray(transaction.userCategories)
                ? transaction.userCategories
                : [];
              const userCats =
                categories.find((uc) => uc.userId === user.id)?.categoryIds ||
                [];

              return userCats.map((catId) => {
                const category = user.categories.find((c) => c.id === catId);
                if (!category) return null;
                return (
                  <Badge
                    key={category.id}
                    variant="default"
                    className="font-normal"
                  >
                    {category.name}
                  </Badge>
                );
              });
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHeader;
