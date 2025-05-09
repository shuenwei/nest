import type { FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

interface WelcomePageProps {
  onNext: () => void;
}

const WelcomePage: FC<WelcomePageProps> = ({ onNext }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-3xl">nest</CardTitle>
          <CardDescription>Bill splitting, now made simple.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-[56px] my-6">💵</div>
        </CardContent>

        <CardFooter>
          <Button onClick={onNext} className="w-full">
            Let's get started!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomePage;
