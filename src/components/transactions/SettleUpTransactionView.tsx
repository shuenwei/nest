import type React from "react";
import type { SettleUpTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface SettleUpTransactionViewProps {
  transaction: SettleUpTransaction;
}

const SettleUpTransactionView: React.FC<SettleUpTransactionViewProps> = ({
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
      {/* Transfer Details */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Transfer Details</h3>
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="w-1/3 text-center">
            <div className="font-medium">
              {getUserDisplayName(transaction.payer)}
            </div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" />
          <div className="w-1/3 text-center">
            <div className="font-medium">
              {getUserDisplayName(transaction.payee)}
            </div>
            <div className="text-xs text-muted-foreground">Received</div>
          </div>
        </div>
      </div>

      {/* Amount Details */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Amount</h3>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Amount</span>
            <span className="font-medium">
              {transaction.currency} {transaction.amount.toFixed(2)}
            </span>
          </div>

          {transaction.currency !== "SGD" && (
            <div className="flex justify-between items-center">
              <span className="text-sm">SGD Equivalent</span>
              <span className="font-medium">
                ${transaction.amountInSgd.toFixed(2)}
              </span>
            </div>
          )}

          {transaction.currency !== "SGD" && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Exchange Rate</span>
              <span className="font-medium">
                1 SGD = {transaction.exchangeRate.toFixed(5)} {transaction.currency} 
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section (if available) */}
      {transaction.notes && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            {transaction.notes}
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default SettleUpTransactionView;
