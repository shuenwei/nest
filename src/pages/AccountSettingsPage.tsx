"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircleIcon } from "lucide-react";
import { toast } from "@/lib/toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

// Form schema
const formSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (user?.displayName) {
      form.reset({ displayName: user.displayName });
    }
  }, [user?.displayName, form]);

  useEffect(() => {
    window.onTelegramAuth = async (telegramUser) => {
      try {
        const token = localStorage.getItem("token");

        await axios.patch(
          `${apiUrl}/user/profilephoto/${telegramUser.id.toString()}`,
          {
            photoUrl: telegramUser.photo_url,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        refreshUser();
        toast.success("Your profile photo has been updated!");
      } catch (err) {
        console.error("Error uploading profile photo:", err);
        toast.error("Failed to update profile photo.");
      }
    };
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!user?.telegramId) {
      toast.error("User information not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${apiUrl}/user/displayname/${user.telegramId}`,
        {
          displayName: data.displayName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.user) {
        refreshUser();
        toast.success("Display name updated successfully");
        navigate("/settings");
      }
    } catch (error) {
      console.error("Failed to update display name:", error);
      toast.error("Failed to update display name");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
            <span className="text-base font-medium">Back</span>
          </Button>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo Card */}
            <Card className="shadow-xs">
              <CardTitle className="px-6">Profile Photo</CardTitle>
              <CardContent className="px-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={user?.photoUrl || ""}
                      alt={user?.displayName}
                      className="object-cover"
                    />
                    <AvatarImage
                      src={user?.profilePhoto || ""}
                      alt={user?.displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl">
                      {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Your profile photo is synced with the profile photo found
                      on your Telegram account.
                    </p>
                  </div>
                </div>
                <Alert>
                  <AlertCircleIcon />
                  <AlertTitle>Don't see your profile photo above?</AlertTitle>
                  <AlertDescription>
                    It might be due to your telegram privacy settings. To sync
                    your profile photo, set your telegram display picture visibility to
                    'Everyone'.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card className="shadow-xs">
              <CardTitle className="px-6">User Information</CardTitle>
              <CardContent className="px-6 space-y-4">
                {/* Display Name */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username (disabled) */}
                <div className="space-y-2">
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input
                    id="username"
                    value={`@${user?.username || ""}`}
                    disabled
                  />
                  <FormDescription>
                    Your username is linked to your Telegram account and cannot
                    be changed.
                  </FormDescription>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
