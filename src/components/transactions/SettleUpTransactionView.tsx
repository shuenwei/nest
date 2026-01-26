import type React from "react";
import type { SettleUpTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface SettleUpTransactionViewProps {
  transaction: SettleUpTransaction;
}

const SettleUpTransactionView: React.FC<SettleUpTransactionViewProps> = ({
  transaction,
}) => {
  const { user } = useUser();
  const friends = user?.friends || [];

  const getFriendDetails = (userId: string) => {
    if (userId === user?.id) {
      return {
        displayName: `${user?.displayName || "You"} (You)`,
        profilePhoto: user?.profilePhoto || null,
        photoUrl: user?.photoUrl,
        username: user?.username,
      };
    }
    const friend = friends.find((f) => f.id === userId);
    return {
      displayName: friend?.displayName ?? "Unknown",
      profilePhoto: friend?.profilePhoto || null,
      photoUrl: friend?.photoUrl,
      username: friend?.username,
    };
  };

  const payer = getFriendDetails(transaction.payer);
  const payee = getFriendDetails(transaction.payee);

  return (
    <CardContent className="p-0 space-y-6 pb-6">


      {/* Transfer Flow */}
      <div className="px-6 pt-6">
        <p className="text-xs font-medium text-muted-foreground mb-4 font-medium">
          Transfer Details
        </p>

        <div className="flex items-center justify-between gap-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
          {/* Payer */}
          <div className="flex flex-col items-center w-[40%] text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage src={payer.photoUrl || ""} alt={payer.displayName} />
              <AvatarImage src={payer.profilePhoto || ""} alt={payer.displayName} />
              <AvatarFallback className="text-sm">
                {payer.displayName
                  .replace(" (You)", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm leading-tight text-center">{payer.displayName}</span>
            {payer.username && (
              <span className="text-[10px] text-muted-foreground mt-0.5">@{payer.username}</span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ArrowRight className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-1">SENT</span>
          </div>

          {/* Payee */}
          <div className="flex flex-col items-center w-[40%] text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage src={payee.photoUrl || ""} alt={payee.displayName} />
              <AvatarImage src={payee.profilePhoto || ""} alt={payee.displayName} />
              <AvatarFallback className="text-sm">
                {payee.displayName
                  .replace(" (You)", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm leading-tight text-center">{payee.displayName}</span>
            {payee.username && (
              <span className="text-[10px] text-muted-foreground mt-0.5">@{payee.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Amount Breakdown for foreign currency */}
      {transaction.currency !== "SGD" && (
        <div className="px-6">
          <p className="text-xs font-medium text-muted-foreground mb-2 font-medium">
            Amount
          </p>
          <div className="bg-secondary/30 rounded-xl p-4 space-y-2 text-sm border border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Original Amount</span>
              <span className="font-medium">
                {transaction.currency} {transaction.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SGD Equivalent</span>
              <span className="font-medium">
                ${transaction.amountInSgd.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

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

export default SettleUpTransactionView;
