import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface FriendCardProps {
  name: string;
  username: string;
  amount: number;
  profilePhoto?: string | null;
  footer?: ReactNode;
  disableClick?: boolean;
}

export function FriendCard({
  name,
  username,
  amount,
  profilePhoto,
  footer,
  disableClick = false,
}: FriendCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="mb-3 py-4 shadow-xs"
      onClick={
        disableClick
          ? undefined
          : () =>
              navigate(`/friends/${encodeURIComponent(username)}`, {
                state: { name, username, amount },
              })
      }
    >
      <CardContent className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profilePhoto ? profilePhoto : ""} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-muted-foreground text-xs">@{username}</div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-xs font-medium mb-0.5 ${
              amount < 0
                ? "text-red-500"
                : amount > 0
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {amount < 0 ? "You owe" : amount > 0 ? "Owes you" : "Settled up"}
          </p>
          <p
            className={`font-semibold ${
              amount < 0
                ? "text-red-600"
                : amount > 0
                ? "text-green-700"
                : "text-muted-foreground"
            }`}
          >
            {amount === 0 ? "$0.00" : `$${Math.abs(amount).toFixed(2)}`}
          </p>
        </div>
      </CardContent>
      {footer && <CardFooter className="px-4">{footer}</CardFooter>}
    </Card>
  );
}

export default FriendCard;
