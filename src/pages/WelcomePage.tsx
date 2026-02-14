import { useEffect, type FC } from "react";
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


  const handleNext = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTelegramApp = Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user);

    if (isMobile && !isTelegramApp) {
      window.location.href = "https://t.me/nestExpenseApp_bot?startapp";
    } else {
      onNext();
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-3xl">nest</CardTitle>
          <CardDescription>Bill splitting, now made simple.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-[56px] my-6">💵</div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleNext} className="w-full">
            Let's get started!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomePage;
