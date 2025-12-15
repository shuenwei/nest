import type React from "react";
import type { BillTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const getFriendDetails = (userId: string) => {
    if (userId === user?.id) {
      return {
        displayName: `${user?.displayName || "You"} (You)`,
        profilePhoto: user?.profilePhoto || null,
        username: user?.username,
      };
    }
    const friend = friends.find((f) => f.id === userId);
    return {
      displayName: friend?.displayName ?? "Unknown",
      profilePhoto: friend?.profilePhoto || null,
      username: friend?.username,
    };
  };

  const paidBy = getFriendDetails(transaction.paidBy);

  return (
    <CardContent className="px-0 space-y-6 pb-6">
      {/* Meta Info Row */}
      {transaction.currency !== "SGD" && (
        <div className="flex flex-wrap gap-2 text-xs px-6 pt-6 justify-center">
          <Badge variant="outline" className="font-normal text-muted-foreground">
            1 SGD = {transaction.exchangeRate.toFixed(5)} {transaction.currency}
          </Badge>
        </div>
      )}

      {/* Paid By Section */}
      <div className="px-6 pt-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 font-medium">
          Paid By
        </p>
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={paidBy.profilePhoto || ""} alt={paidBy.displayName} />
            <AvatarFallback className="text-xs">
              {paidBy.displayName
                .replace(" (You)", "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{paidBy.displayName}</span>
            {paidBy.username && (
              <span className="text-[10px] text-muted-foreground">@{paidBy.username}</span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Items Section */}
      <div className="px-6">
        <p className="text-xs font-medium text-muted-foreground mb-4 font-medium">
          Bill Details
        </p>
        <div className="space-y-4">
          {transaction.items.map((item, index) => (
            <div
              key={index}
              className="bg-secondary/20 p-4 rounded-xl border border-border/50 space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{item.name}</span>
                <div className="text-right">
                  <div className="font-semibold text-sm">
                    {transaction.currency} {item.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Shared by:</span>
                <div className="flex -space-x-2">
                  {item.sharedBy.map((userId) => {
                    const friend = getFriendDetails(userId);
                    return (
                      <Avatar
                        key={userId}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarImage
                          src={friend.profilePhoto || ""}
                          alt={friend.displayName}
                        />
                        <AvatarFallback className="text-[10px]">
                          {friend.displayName
                            .replace(" (You)", "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Summary */}
      <div className="px-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 font-medium">
          Bill Summary
        </p>
        <div className="bg-secondary/30 rounded-xl p-4 space-y-2 text-sm border border-border/50">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {transaction.currency} {transaction.subtotal.toFixed(2)}
            </span>
          </div>

          {transaction.discountType !== "none" && transaction.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Discount
                {transaction.discountType === "percentage" &&
                  ` (${transaction.discountValue}%)`}
              </span>
              <span>
                -{transaction.currency} {transaction.discount.toFixed(2)}
              </span>
            </div>
          )}

          {transaction.serviceCharge && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Service Charge ({transaction.serviceChargePercentage}%)
              </span>
              <span className="font-medium">
                {transaction.currency}{" "}
                {transaction.serviceChargeAmount.toFixed(2)}
              </span>
            </div>
          )}

          {transaction.gst && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                GST ({transaction.gstPercentage}%)
              </span>
              <span className="font-medium">
                {transaction.currency} {transaction.gstAmount.toFixed(2)}
              </span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <div className="text-right">
              <div>
                {transaction.currency} {transaction.amount.toFixed(2)}
              </div>
              {transaction.currency !== "SGD" && (
                <div className="text-xs font-normal text-muted-foreground">
                  SGD {transaction.amountInSgd.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Splits Section */}
      <div className="px-6">
        <p className="text-xs font-medium text-muted-foreground mb-4 font-medium">
          Individual Shares
        </p>
        <div className="space-y-3">
          {transaction.splitsInSgd.map((split, index) => {
            const splitUser = getFriendDetails(split.user);
            return (
              <div key={index} className="flex justify-between items-center bg-secondary/10 p-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={splitUser.profilePhoto || ""} alt={splitUser.displayName} />
                    <AvatarFallback className="text-xs">
                      {splitUser.displayName
                        .replace(" (You)", "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{splitUser.displayName}</span>
                    {splitUser.username && (
                      <span className="text-[10px] text-muted-foreground">@{splitUser.username}</span>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-sm">
                  ${split.amount.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes Section (if available) */}
      {transaction.notes && (
        <div className="px-6">
          <p className="text-xs font-medium text-muted-foreground mb-2 font-medium">
            Notes
          </p>
          <div className="p-3 bg-secondary/50 rounded-lg text-sm border border-border/50">
            {transaction.notes}
          </div>
        </div>
      )}
    </CardContent>
  );
};

export default BillTransactionView;
