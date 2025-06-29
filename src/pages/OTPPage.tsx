"use client";

import { useState, type FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import axios from "axios";
import { toast } from "sonner";
const apiUrl = import.meta.env.VITE_API_URL;

interface OTPPageProps {
  username: string;
  otp: string;
  setOtp: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const FormSchema = z.object({
  code: z.string().min(6, {
    message: "Please enter the 6-digit code sent to your Telegram.",
  }),
});

type OTPFormValues = z.infer<typeof FormSchema>;

const OTPPage: FC<OTPPageProps> = ({
  username,
  otp,
  setOtp,
  onBack,
  onNext,
}) => {
  const [showInput, setShowInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: otp },
  });

  const handleSubmit = async (data: OTPFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${apiUrl}/auth/verifycode`, {
        username,
        code: data.code,
      });

      if (response.data.valid) {
        setOtp(data.code);
        localStorage.setItem("token", response.data.token);
        onNext();
      } else {
        toast.error("Invalid OTP. Please try again.");
        form.setError("code", {
          message:
            "Invalid OTP! If you need to send another message to the bot, click 'Back'.",
        });
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 pb-1">
          <Progress value={50} />
        </div>

        <CardHeader className="px-6 pb-2">
          <CardTitle>Enter the 6-digit code sent to your Telegram</CardTitle>
          <CardDescription>
            To receive your OTP, message <strong>@nestExpenseApp_bot</strong> by
            clicking on the button.
          </CardDescription>
        </CardHeader>

        {!showInput ? (
          <CardContent className="space-y-4 px-6">
            <a
              href={`https://t.me/nestExpenseApp_bot?start=verify_${username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full"
                onClick={async () => {
                  setShowInput(true);
                }}
              >
                Click here to message @nestExpenseApp_bot
              </Button>
            </a>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4 px-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                        >
                          <InputOTPGroup className="grid grid-cols-6 gap-2 w-full">
                            {Array.from({ length: 6 }, (_, idx) => (
                              <InputOTPSlot
                                key={idx}
                                index={idx}
                                className="w-full h-12 text-lg rounded-md border border-input bg-background text-center font-medium"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className="font-outfit text-sm" />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex justify-between px-6 pt-8">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button size="rightIcon" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying" : "Next"}
                  <ChevronRight />
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default OTPPage;
