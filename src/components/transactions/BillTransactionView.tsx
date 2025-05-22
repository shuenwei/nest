import type React from "react";
import type { BillTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";

interface BillTransactionViewProps {
  transaction: BillTransaction;
}

const BillTransactionView: React.FC<BillTransactionViewProps> = ({
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

      {/* Items Section */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Items</h3>
        <div className="space-y-3">
          {transaction.items.map((item, index) => (
            <div key={index} className="bg-secondary/70 p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{item.name}</span>
                <span>
                  {transaction.currency} {item.price.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Shared by:{" "}
                {item.sharedBy
                  .map((userId) => getUserDisplayName(userId))
                  .join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Summary */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Bill Summary</h3>
        <div className="bg-secondary/70 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <div className="text-right">
              <div>
                {transaction.currency} {transaction.subtotal.toFixed(2)}
              </div>
              {transaction.currency !== "SGD" && (
                <div className="text-xs text-muted-foreground">
                  SGD ${transaction.subtotalInSgd.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {transaction.discountType !== "none" && transaction.discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>
                Discount
                {transaction.discountType === "percentage" &&
                  ` (${transaction.discountValue}%)`}
              </span>
              <div className="text-right">
                <div>
                  -{transaction.currency} {transaction.discount.toFixed(2)}
                </div>
                {transaction.currency !== "SGD" && (
                  <div className="text-xs text-muted-foreground">
                    SGD -${transaction.discountInSGD.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {transaction.serviceCharge && (
            <div className="flex justify-between">
              <span>
                Service Charge ({transaction.serviceChargePercentage}%)
              </span>
              <div className="text-right">
                <div>
                  {transaction.currency}{" "}
                  {transaction.serviceChargeAmount.toFixed(2)}
                </div>
                {transaction.currency !== "SGD" && (
                  <div className="text-xs text-muted-foreground">
                    SGD ${transaction.serviceChargeAmountInSgd.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {transaction.gst && (
            <div className="flex justify-between">
              <span>GST ({transaction.gstPercentage}%)</span>
              <div className="text-right">
                <div>
                  {transaction.currency} {transaction.gstAmount.toFixed(2)}
                </div>
                {transaction.currency !== "SGD" && (
                  <div className="text-xs text-muted-foreground">
                    SGD ${transaction.gstAmountInSgd.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <div className="text-right">
              <div>
                {transaction.currency} {transaction.amount.toFixed(2)}
              </div>
              {transaction.currency !== "SGD" && (
                <div className="text-xs font-normal text-muted-foreground">
                  SGD ${transaction.amountInSgd.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default BillTransactionView;
