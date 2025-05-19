import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";

export interface Transaction {
  transactionName: string;
  date: string;
  amount: number;
  paidBy: string;
  icon: string;
  people: string[];
  type: "expense" | "settle";
  receivedBy?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  className = "",
}) => {
  return (
    <Card className={`mb-3 py-3 shadow-xs ${className}`}>
      <CardContent className="px-0 divide-y">
        <div className="px-4 pb-3 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="text-3xl pr-1">{transaction.icon}</span>
            <div>
              <div className="font-semibold text-sm">
                {transaction.transactionName}
              </div>
              <div className="text-muted-foreground text-xs">
                {transaction.date}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">
              ${transaction.amount.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs">
              {transaction.type === "settle"
                ? `Transferred`
                : `Paid by ${transaction.paidBy}`}
            </p>
          </div>
        </div>
        <div className="px-4">
          <div className="text-xs text-muted-foreground mb-1  mt-3">
            {transaction.type === "settle"
              ? ""
              : `Split with ${transaction.people.length} people`}
          </div>
          <div className="flex flex-wrap gap-2">
            {transaction.type === "settle" ? (
              <>
                <Badge variant="secondary">{transaction.paidBy}</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">{transaction.receivedBy}</Badge>
              </>
            ) : (
              transaction.people.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
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
