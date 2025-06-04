import type React from "react";
import type { PurchaseTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";

interface PurchaseTransactionViewProps {
  transaction: PurchaseTransaction;
}

const PurchaseTransactionView: React.FC<PurchaseTransactionViewProps> = ({
  transaction,
}) => {
  const { user } = useUser();
  const friends = user?.friends || [];
  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) return "You";
    return friends.find((f) => f.id === userId)?.displayName ?? "???";
  };

  return (
    <CardContent className="p-6 space-y-6">
      {/* Paid By Section */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Paid By</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {getUserDisplayName(transaction.paidBy)}
          </Badge>
        </div>
      </div>

      {/* Split Method */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Split Method</h3>
        <p className="text-sm">
          {transaction.splitMethod === "even"
            ? "Split Equally"
            : "Split Manually"}
        </p>
      </div>
      
      {/* Exchange Rate */}
      {transaction.currency !== "SGD" && (
      <div>
        <h3 className="text-sm font-semibold mb-2">Exchange Rate</h3>
        <p className="text-sm">
          1 SGD = {transaction.exchangeRate.toFixed(5)} {transaction.currency} 
        </p>
      </div>
      )}

      {/* Splits Section */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Split Details</h3>
        <div className="bg-secondary/70 rounded-lg p-3 space-y-2">
          {transaction.splitsInSgd.map((split, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{getUserDisplayName(split.user)}</span>
              <span className="font-medium">${split.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section (if available) */}
      {transaction.notes && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground bg-secondary/70 p-3 rounded-lg">
            {transaction.notes}
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default PurchaseTransactionView;
