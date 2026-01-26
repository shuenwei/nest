import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import type { GroupSmartSettleTransaction } from "@/lib/transaction";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface Props {
  transaction: GroupSmartSettleTransaction;
}

const GroupSmartSettleTransactionView = ({ transaction }: Props) => {
  const { user } = useUser();
  const friends = user?.friends ?? [];

  const adjustments = useMemo(
    () => transaction.transfers.filter((t) => t.category === "adjustment"),
    [transaction.transfers]
  );

  const smartSettles = useMemo(
    () => transaction.transfers.filter((t) => t.category !== "adjustment"),
    [transaction.transfers]
  );

  const totalTransfers = useMemo(() => {
    const adjustmentTotal = adjustments.reduce((sum, t) => sum + t.amount, 0);
    const smartSettleTotal = smartSettles.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    return adjustmentTotal + smartSettleTotal;
  }, [adjustments, smartSettles]);

  const participantDetails = useMemo(
    () =>
      transaction.participants.map((participantId) => {
        if (participantId === user?.id) {
          return {
            id: participantId,
            name: user.displayName ?? "You",
            username: user.username,
            profilePhoto: user.profilePhoto,
            photoUrl: user.photoUrl,
            isYou: true,
          };
        }

        const friend = friends.find((f) => f.id === participantId);
        return {
          id: participantId,
          name: friend?.displayName ?? "Unknown user",
          username: friend?.username,
          profilePhoto: friend?.profilePhoto,
          photoUrl: friend?.photoUrl,
          isYou: false,
        };
      }),
    [friends, transaction.participants, user]
  );

  const balancesByParticipant = useMemo(() => {
    const running = new Map<string, number>();
    transaction.participants.forEach((id) => running.set(id, 0));

    adjustments.forEach(({ payer, payee, amount }) => {
      const flowAmount = Math.abs(amount);

      running.set(payer, (running.get(payer) ?? 0) - flowAmount);
      running.set(payee, (running.get(payee) ?? 0) + flowAmount);
    });

    return participantDetails.map((participant) => ({
      ...participant,
      balance: running.get(participant.id) ?? 0,
    }));
  }, [adjustments, participantDetails, transaction.participants]);

  const getUserDisplayName = (userId: string) => {
    const participant = participantDetails.find((p) => p.id === userId);
    if (participant?.isYou) return "You";
    return participant?.name ?? "???";
  };

  return (
    <div className="p-5 space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold">Participants</p>
          <Badge variant="secondary" className="gap-1"><Users className="h-4 w-4" /> {participantDetails.length}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {participantDetails.map((participant) => (
            <div
              key={participant.id}
              className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={participant.photoUrl || ""} />
                <AvatarImage src={participant.profilePhoto ?? undefined} />
                <AvatarFallback>
                  {participant.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm leading-tight">
                <p className="font-semibold">
                  {participant.isYou ? `${participant.name} (You)` : participant.name}
                </p>
                {participant.username ? (
                  <p className="text-xs text-muted-foreground">
                    @{participant.username}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold">Transfers</p>
        <p className="text-xs text-muted-foreground">
          Adjustments move balances between group members before the smart
          settle runs. Smart settle transfers show the final amounts to pay.
        </p>
      </div>

      {[{ title: "Adjustment Transfers", items: adjustments },
        { title: "Smart Settle Transfers", items: smartSettles }].map(
        (section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-3">
              {section.items.map((transfer, index) => (
                <div
                  key={`${transfer.payer}-${transfer.payee}-${transfer.amount}-${index}`}
                  className="rounded-xl border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-semibold">
                        {getUserDisplayName(transfer.payer)}
                      </Badge>
                      <span className="text-muted-foreground text-xs">→</span>
                      <Badge variant="secondary" className="font-semibold">
                        {getUserDisplayName(transfer.payee)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${Math.abs(transfer.amount).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {transfer.category === "adjustment"
                          ? "Adjustment"
                          : "Smart settle"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold">Group Balances</p>
        <div className="space-y-2">
          {balancesByParticipant
            .filter((participant) => Math.abs(participant.balance) > 0.009)
            .map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-lg border border-muted/40 bg-muted/30 px-3 py-2 text-sm"
              >
                <span>
                  {participant.isYou
                    ? `${participant.name} (You)`
                    : participant.name}
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    participant.balance >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {participant.balance >= 0 ? "+" : "-"}${
                    Math.abs(participant.balance).toFixed(2)
                  }
                </span>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default GroupSmartSettleTransactionView;