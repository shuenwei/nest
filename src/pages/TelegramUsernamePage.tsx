import { type FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface TelegramUsernamePageProps {
  username: string;
  setUsername: (v: string) => void;
  onBack: () => void;
  onNext: (username: string) => void;
}

// Validation schema
const formSchema = z.object({
  telegram: z.string().min(1, "Hey! We need a username >:("),
});

const TelegramUsernamePage: FC<TelegramUsernamePageProps> = ({
  username,
  setUsername,
  onBack,
  onNext,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegram: username.replace(/^@/, ""),
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const trimmed = data.telegram.trim().replace(/^@/, "");
    setUsername(trimmed);
    onNext(trimmed);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4">
      <Card className="w-full max-w-sm">
        <div className="px-6 pb-1">
          <Progress value={25} />
        </div>

        <CardHeader className="px-6 pb-2">
          <CardTitle>Firstly, what’s your Telegram username?</CardTitle>
          <CardDescription>
            Your Telegram username will be used to let friends find you on
            Splity
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="sr-only">Telegram Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-outfit">
                          @
                        </span>
                        <Input
                          {...field}
                          placeholder="username"
                          className="pl-7 font-outfit"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="font-outfit text-sm" />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between px-6 pt-5">
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
      </Card>
    </div>
  );
};

export default TelegramUsernamePage;
