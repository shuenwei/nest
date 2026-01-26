"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoundX, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const BlockedUsersPage = () => {
  const { user, refreshUser, fetchRecurringTemplates } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingBlockUser, setPendingBlockUser] = useState<null | {
    id: string;
    displayName: string;
  }>(null);

  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const addSchema = z.object({
    username: z
      .string()
      .min(1, "Username is required")
      .refine((val) => !val.startsWith("@"), {
        message: "Please enter username without the @ symbol",
      })
      .refine((val) => !/\s/.test(val), {
        message: "Username must not contain spaces",
      }),
  });

  const addForm = useForm<z.infer<typeof addSchema>>({
    resolver: zodResolver(addSchema),
    defaultValues: { username: "" },
  });

  const onAddBlock = async (data: z.infer<typeof addSchema>) => {
    if (!user) return;
    setIsSearchingUser(true);
    try {
      const res = await axios.get(`${apiUrl}/user/username/${data.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blockUser = res.data;
      setPendingBlockUser({
        id: blockUser.id,
        displayName: blockUser.displayName,
      });
      setIsAddDialogOpen(false);
      setIsConfirmDialogOpen(true);
    } catch (err: any) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to block user");
      }
    } finally {
      setIsSearchingUser(false);
      addForm.reset();
    }
  };

  const handleConfirmBlock = async () => {
    if (!user || !pendingBlockUser) return;
    setIsBlocking(true);
    try {
      await axios.post(
        `${apiUrl}/user/block`,
        { userId: user.id, blockId: pendingBlockUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUser();
      await fetchRecurringTemplates();
      toast.success(`You have blocked ${pendingBlockUser.displayName}.`);
      setIsAddDialogOpen(false);
      setIsConfirmDialogOpen(false);
      setPendingBlockUser(null);
    } catch (err: any) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to block user");
      }
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    if (!user) return;
    try {
      const res = await axios.post(
        `${apiUrl}/user/unblock`,
        { userId: user.id, blockId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const unblockedUser = res.data;
      await refreshUser();
      toast.success(
        `You have successfully unblocked ${unblockedUser.displayName}.`
      );
    } catch (err: any) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to unblock user");
      }
      console.log(err);
    }
  };

  const blocked = user?.blockedUsers || [];

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Block Users</h1>
          <p className="text-muted-foreground text-sm text-justify">
            Blocked users will be prevented from adding you as a friend.
          </p>
        </div>

        <Button
          className="w-full mb-4"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <UserRoundX className="size-4 mr-2" />
          Block User
        </Button>

        {blocked.map(
          ({ id, displayName, username, profilePhoto, photoUrl, hasSignedUp }) => (
            <Card key={id} className="mb-3 py-4 shadow-xs">
              <CardContent className="px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={photoUrl || ""}
                      alt={displayName}
                    />
                    <AvatarImage
                      src={profilePhoto ? profilePhoto : ""}
                      alt={displayName}
                    />
                    <AvatarFallback>
                      {displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {displayName}
                      {hasSignedUp && (
                        <Badge className="ml-1" variant="secondary">
                          Nest User
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      @{username}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleUnblock(id)}>
                    Unblock
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {blocked.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            You have not blocked any users.
          </div>
        )}
      </div>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) addForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block user</DialogTitle>
            <DialogDescription>
              Enter the username of the user you would like to block. This will
              remove the user as friend, delete all transactions between the
              both of you, and prevent the user from adding you as a friend.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(onAddBlock)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          @
                        </span>
                        <Input
                          placeholder="username"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Blocking a user will DELETE ALL transactions between the both
                  of you. THIS CANNOT BE UNDONE.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSearchingUser}
                  className="w-full"
                >
                  {isSearchingUser ? "Loading..." : "Block"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to block {pendingBlockUser?.displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Blocking <strong>{pendingBlockUser?.displayName}</strong> will:
              <ul className="mt-2 list-disc ml-5">
                <li>Remove them as a friend</li>
                <li>
                  <strong>Delete all</strong> transactions between the both of
                  you
                </li>
                <li>Prevent them from adding you as a friend</li>
              </ul>
              <div className="mt-2 text-destructive font-medium">
                DELETED TRANSACTIONS CANNOT BE RECOVERED. PROCEED WITH CAUTION.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              className="bg-destructive hover:bg-destructive/50"
              onClick={handleConfirmBlock}
              disabled={isBlocking}
            >
              {isBlocking ? "Blocking..." : "Block"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlockedUsersPage;
