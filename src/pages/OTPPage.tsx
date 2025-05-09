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
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

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

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: otp },
  });

  const handleSubmit = (data: OTPFormValues) => {
    setOtp(data.code);
    onNext();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4">
      <Card className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 pb-1">
          <Progress value={50} />
        </div>

        <CardHeader className="px-6 pb-2">
          <CardTitle>Enter the 6-digit code sent to your Telegram</CardTitle>
          <CardDescription>
            To receive your OTP, message <strong>@SplityApp_bot</strong>.
          </CardDescription>
        </CardHeader>

        {!showInput ? (
          <CardContent className="space-y-4 px-6">
            <a
              href={`https://t.me/SplityApp_bot?start=verify_${username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full" onClick={() => setShowInput(true)}>
                Click here to message @SplityApp_bot
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
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
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
                <Button type="submit">
                  Next
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
