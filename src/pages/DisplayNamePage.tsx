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
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
import { useUser } from "@/contexts/UserContext";

interface DisplayNamePageProps {
  onBack: () => void;
  onNext: () => void;
  telegramId: string;
  displayName: string;
  setDisplayName: (value: string) => void;
}

const formSchema = z.object({
  displayName: z.string().min(1, "Hey! We need a display name >:("),
});

const DisplayNamePage: FC<DisplayNamePageProps> = ({
  onBack,
  onNext,
  displayName,
  telegramId,
  setDisplayName,
}) => {
  const { refreshUser } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const name = data.displayName.trim();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${apiUrl}/user/displayname/${telegramId}`,
        {
          displayName: name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      refreshUser();
      onNext();
    } catch (err) {
      console.error("Failed to update display name:", err);
      form.setError("displayName", {
        message: "Failed to update name. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8F8F8] font-outfit flex items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 pb-1">
          <Progress value={75} />
        </div>

        <CardHeader className="px-6 pb-2">
          <CardTitle>Next, what's your display name?</CardTitle>
          <CardDescription>
            This is how your name will appear to your friends in Splity.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="sr-only">Display Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} placeholder="John Doe" />
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
              <Button size="rightIcon" type="submit">
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

export default DisplayNamePage;
