import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const apiUrl = import.meta.env.VITE_API_URL;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    const tg = window.Telegram?.WebApp;

    if (!tg) {
      setError("This experience is available only inside Telegram.");
      setIsLoading(false);
      return;
    }

    const initData = tg.initData;
    const telegramUser = tg.initDataUnsafe?.user;

    if (!initData || !telegramUser) {
      setError(
        "We couldn't read your Telegram details. Please reopen the mini app from Telegram."
      );
      setIsLoading(false);
      return;
    }

    if (!telegramUser.username) {
      setError(
        "You'll need a Telegram username to use nest. Set one in Telegram settings and try again."
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/auth/telegram`, { initData });
      const { token, telegramId } = res.data as {
        token: string;
        telegramId: string;
      };

      localStorage.setItem("token", token);
      localStorage.setItem("telegramId", telegramId);

      toast.success("You are now logged in!");

      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Telegram login failed:", err);

      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error as string | undefined;
        setError(message ?? "We couldn't sign you in. Please try again in a moment.");
      } else {
        setError("We couldn't sign you in. Please try again in a moment.");
      }

      setIsLoading(false);
    }
  }, [navigate, refreshUser]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Connecting to Telegram…</CardTitle>
            <CardDescription>
              Please hold on while we confirm your account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl my-6 animate-bounce">🤖</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">We couldn't log you in</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl my-6">😔</div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={authenticate}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
