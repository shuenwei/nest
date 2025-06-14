"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { RecurringTemplate } from "@/lib/recurring";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ViewRecurringPage = () => {
  const navigate = useNavigate();
  const { recurringId } = useParams<{ recurringId: string }>();
  const { user, recurringTemplates, fetchRecurringTemplates } = useUser();
  const [template, setTemplate] = useState<RecurringTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const friends = user?.friends || [];

  const getFriendNameById = (userId: string) => {
    if (userId === user?.id) return "You";
    return friends.find((f) => f.id === userId)?.displayName ?? "Unknown";
  };

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

  const handleDelete = async () => {
    if (!recurringId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/transaction/recurring/${recurringId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchRecurringTemplates();
      navigate("/recurring");
      toast.success("Recurring transaction deleted successfully");
      return;
    } catch (error) {
      console.error("Error deleting recurring template:", error);
      toast.error("Failed to delete recurring transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!template) return;

    navigate(`/recurring/edit/${recurringId}`);
  };

  useEffect(() => {
    const load = async () => {
      if (!recurringTemplates && user?.id) {
        await fetchRecurringTemplates();
      }
    };

    load();
  }, [user?.id, recurringTemplates, fetchRecurringTemplates]);

  useEffect(() => {
    if (!recurringId || !recurringTemplates) {
      return;
    }

    const foundTemplate = recurringTemplates.find((t) => t._id === recurringId);

    if (foundTemplate) {
      setTemplate(foundTemplate);
    } else {
      toast.error("Failed to load recurring transaction");
      navigate("/recurring");
    }
  }, [recurringId, recurringTemplates, navigate]);

  if (!template || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
            <span className="text-base font-medium">Back</span>
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil />
            </Button>

            {/* Delete Confirmation Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recurring Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this recurring transaction?
                    This action cannot be undone and will stop all future
                    associated transactions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Recurring Template Header */}

        <Card className="mb-3 py-5 shadow-xs">
          <CardContent className="px-0">
            <div className="px-4 flex justify-between items-start">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="text-3xl">🔁</div>
                  <div>
                    <h1 className="text-sm font-semibold">
                      {template.transactionName}
                    </h1>
                    <p className="text-muted-foreground text-xs">
                      Next Payment: {formatNextDueDate(template.nextDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold">
                  ${template.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground ml-2">
                  {formatFrequency(template.frequency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Template Details */}

        <Card className="mb-3 py-0 shadow-xs">
          <CardContent className="p-6 space-y-6">
            {/* Paid By Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Paid By</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {getFriendNameById(template.paidBy)}
                </Badge>
              </div>
            </div>

            {/* Splits Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Split Details</h3>
              <div className="bg-secondary/70 rounded-lg p-3 space-y-2">
                {template.splitsInSgd.map((split, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {getFriendNameById(split.user)}
                    </span>
                    <span className="font-medium">
                      ${split.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section (if available) */}
            {template.notes && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground bg-secondary/70 p-3 rounded-lg">
                  {template.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewRecurringPage;
