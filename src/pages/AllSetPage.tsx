import { useEffect } from "react";
import type { FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface YouAreAllSetPageProps {
  displayName: string;
  username: string;
  onFinish: () => void;
}

const AllSetPage: FC<YouAreAllSetPageProps> = ({
  displayName,
  username,
  onFinish,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-2xl border border-gray-200 text-center">
        <CardHeader>
          <CardTitle>You're all set, {displayName}!</CardTitle>
          <CardDescription>
            Start splitting bills and tracking expenses with your friends.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-5xl pb-0">🎉</CardContent>

        <CardContent className="pt-1 text-sm">
          Your username is <strong>@{username}</strong>.
        </CardContent>

        <CardFooter className="px-6">
          <Button className="w-full" onClick={onFinish}>
            Go to Dashboard!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AllSetPage;
