import type React from "react";
import type { PurchaseTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { Separator } from "@/components/ui/separator";

interface PurchaseTransactionViewProps {
  transaction: PurchaseTransaction;
}

const PurchaseTransactionView: React.FC<PurchaseTransactionViewProps> = ({
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
    <CardContent className="p-0 space-y-6 py-6">


      {/* Paid By Section */}
      <div className="px-6">
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

      {/* Splits Section */}
      <div className="px-6">
        <p className="text-xs font-medium text-muted-foreground mb-4 font-medium">
          Split Among
        </p>
        <div className="space-y-4">
          {transaction.splitsInSgd.map((split, index) => {
            const splitUser = getFriendDetails(split.user);
            return (
              <div key={index} className="flex items-center justify-between group">
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

export default PurchaseTransactionView;
