"use client";

import type React from "react";

import type { Transaction } from "@/lib/transaction";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionHeaderProps {
  transaction: Transaction;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  transaction,
}) => {
  const iconMap: Record<Transaction["type"], string> = {
    settleup: "💸",
    purchase: "🛒",
    bill: "🍔",
    recurring: "🔁",
    groupSmartSettle: "🤝",
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

  return (
    <Card className="mb-3 py-5 shadow-xs">
      <CardContent className="px-0">
        <div className="px-4 flex justify-between items-start">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <div className="text-3xl">{iconMap[transaction.type]}</div>
              <div>
                <h1 className="text-sm font-semibold">
                  {transaction.transactionName}
                </h1>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(transaction.date)}
                </p>
              </div>
            </div>
          </div>

          {transaction.type !== "groupSmartSettle" && (
            <div className="text-right">
              <p className="text-sm font-semibold">
                ${transaction.amountInSgd.toFixed(2)}
              </p>

              {transaction.currency !== "SGD" && (
                <p className="text-xs text-muted-foreground ml-2">
                  {transaction.currency} {transaction.amount.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHeader;
