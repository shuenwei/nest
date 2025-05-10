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

interface DisplayNamePageProps {
  onBack: () => void;
  onNext: () => void;
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
  setDisplayName,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    setDisplayName(data.displayName.trim());
    onNext();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8F8F8] px-4">
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
