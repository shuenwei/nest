import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const notifications: { id: number; message: string; date: string }[] = [
  {
    id: 1,
    message: "Alex Wong paid you $20 for Lunch",
    date: "Today",
  },
  {
    id: 2,
    message: "You settled up with Mei Lin",
    date: "Yesterday",
  },
  {
    id: 3,
    message: "Raj Patel added you to a group",
    date: "2 days ago",
  },
];

const NotificationPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground mt-16">
            All caught up! :)
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="mb-3 py-4 shadow-none">
              <CardContent className="px-4 flex flex-col gap-1">
                <div className="font-medium">{n.message}</div>
                <div className="text-xs text-muted-foreground">{n.date}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
