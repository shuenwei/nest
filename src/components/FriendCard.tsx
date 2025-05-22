import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

import { useUser } from "@/contexts/UserContext";

interface FriendCardProps {
  userId: string;
  footer?: ReactNode;
  disableClick?: boolean;
}

export function FriendCard({
  userId,
  footer,
  disableClick = false,
}: FriendCardProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const friend = user?.friends.find((f) => f.id === userId);
  if (!friend) return null;
  const { id, displayName, username, profilePhoto, hasSignedUp, balance } =
    friend;

  return (
    <Card
      className="mb-3 py-4 shadow-xs"
      onClick={
        disableClick
          ? undefined
          : () => navigate(`/friends/${encodeURIComponent(id)}`)
      }
    >
      <CardContent className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={profilePhoto ? profilePhoto : ""}
              alt={displayName}
            />
            <AvatarFallback>
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">
              {displayName}
              {hasSignedUp && (
                <Badge className="ml-1" variant="secondary">
                  Nest User
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground text-xs">@{username}</div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-xs font-medium mb-0.5 ${
              balance < 0
                ? "text-red-500"
                : balance > 0
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {balance < 0 ? "You owe" : balance > 0 ? "Owes you" : "Settled up"}
          </p>
          <p
            className={`font-semibold ${
              balance < 0
                ? "text-red-600"
                : balance > 0
                ? "text-green-700"
                : "text-muted-foreground"
            }`}
          >
            {balance === 0 ? "$0.00" : `$${Math.abs(balance)}`}
          </p>
        </div>
      </CardContent>
      {footer && <CardFooter className="px-4">{footer}</CardFooter>}
    </Card>
  );
}

export default FriendCard;
