import type React from "react";
import type { RecurringTransaction } from "@/lib/transaction";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecurringTransactionViewProps {
  transaction: RecurringTransaction;
}

const RecurringTransactionView: React.FC<RecurringTransactionViewProps> = ({
  transaction,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const friends = user?.friends || [];
  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) return "You";
    return friends.find((f) => f.id === userId)?.displayName ?? "???";
  };

  return (
    <CardContent className="p-6 space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is an automatically generated recurring transaction.
          <Button
            variant="outline"
            size="sm"
            className="w-fit mt-1"
            onClick={() => navigate(`/recurring/${transaction.templateId}`)}
          >
            View Associated Transaction
          </Button>
        </AlertDescription>
      </Alert>

      {/* Paid By Section */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Paid By</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {getUserDisplayName(transaction.paidBy)}
          </Badge>
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

export default RecurringTransactionView;
