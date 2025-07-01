"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { RecurringTemplate } from "@/lib/recurring";

const ManageRecurringPage = () => {
  const navigate = useNavigate();
  const { user, recurringTemplates, fetchRecurringTemplates } = useUser();
  const [loading, setLoading] = useState(true);

  const friends = user?.friends || [];

  const getFriendNameById = (userId: string) => {
    if (userId === user?.id) return "You";
    return friends.find((f) => f.id === userId)?.displayName ?? "???";
  };

  useEffect(() => {
    const load = async () => {
      if (!recurringTemplates && user?.id) {
        setLoading(true);
        await fetchRecurringTemplates();
      }
      setLoading(false);
    };

    load();
  }, [user?.id]);

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const formatNextDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4 overscroll-none">
      <div className="w-full max-w-sm pt-5 pb-30">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your recurring transactions
          </p>
        </div>

        <Button
          className="w-full mb-6"
          onClick={() => navigate("/recurring/add")}
        >
          <Plus className="size-4 mr-2" />
          Add New
        </Button>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : recurringTemplates?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-4">
            {recurringTemplates?.map((template) => (
              <Card
                key={template._id}
                className="gap-y-2"
                onClick={() => navigate(`/recurring/${template._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {template.transactionName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge>{formatFrequency(template.frequency)}</Badge>
                        <Badge variant="outline">
                          Next Due: {formatNextDueDate(template.nextDate)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ${template.amount.toFixed(2)}
                      </p>
                      <Badge variant="secondary">
                        Paid by {getFriendNameById(template.paidBy)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Split with {template.splitsInSgd.length} people
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.splitsInSgd.map((p) => (
                      <Badge key={p.user} variant="secondary">
                        <span className="font-semibold">
                          {getFriendNameById(p.user)}
                        </span>{" "}
                        <span className="font-normal">
                          ${p.amount.toFixed(2)}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRecurringPage;
