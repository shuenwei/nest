"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/NavBar";
import FriendCard from "@/components/FriendCard";
import { UserRoundPlus, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const FriendsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const [friends, setFriends] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      profilePhoto?: string | null;
      amount: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user, refreshUser } = useUser();
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Load friends when component mounts
  useEffect(() => {
    if (user?.friends && Array.isArray(user.friends)) {
      const formattedFriends = user.friends.map((friend) => ({
        id: friend.id,
        name: friend.displayName,
        username: friend.username,
        profilePhoto: friend.profilePhoto,
        amount: friend.balance || 0,
      }));

      setFriends(formattedFriends);
    }
  }, [user]);

  // Form schema for adding a friend
  const addFriendSchema = z.object({
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

  // Form schema for creating a new user
  const createUserSchema = z.object({
    displayName: z.string().min(1, "Display name is required"),
  });

  // Form for adding a friend
  const addFriendForm = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      username: "",
    },
  });

  // Form for creating a new user
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      displayName: "",
    },
  });

  // Handle adding a friend
  const onAddFriend = async (data: z.infer<typeof addFriendSchema>) => {
    if (!user?.telegramId) {
      toast.error("You must be logged in to add friends");
      return;
    }

    setIsLoading(true);
    try {
      // Check if user exists
      const response = await axios.get(
        `${apiUrl}/user/username/${data.username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // User exists, add them as a friend using the addfriend endpoint
        const friend = response.data;

        await axios.post(
          `${apiUrl}/user/addfriend`,
          {
            userId: user.id,
            friendId: friend.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await refreshUser();

        toast.success(
          `${response.data.displayName} has been added as a friend!`
        );
        setIsAddDialogOpen(false);
        addFriendForm.reset();
      }
    } catch (error: any) {
      // User doesn't exist
      if (error.response && error.response.status === 404) {
        setPendingUsername(data.username);
        setIsAddDialogOpen(false);
        setIsCreateUserDialogOpen(true);
      } else if (
        error.response.status === 400 &&
        error.response.data?.error === "User is already your friend"
      ) {
        addFriendForm.setError("username", {
          type: "manual",
          message: `@${data.username} is already your friend.`,
        });
        toast.error(`@${data.username} is already your friend.`);
      } else if (
        error.response.status === 400 &&
        error.response.data?.error === "Cannot add yourself as a friend"
      ) {
        addFriendForm.setError("username", {
          type: "manual",
          message: `You cannot add yourself as a friend.`,
        });
        toast.error(`You cannot add yourself as a friend.`);
      } else if (
        error.response.status === 403 &&
        error.response.data?.error === "User is blocked"
      ) {
        addFriendForm.setError("username", {
          type: "manual",
          message: `You have blocked @${data.username}. Unblock @${data.username} in settings to add as friend.`,
        });
        toast.error(
          `You have blocked @${data.username}. Unblock @${data.username} in settings to add as friend.`
        );
      } else if (
        error.response.status === 403 &&
        error.response.data?.error === "Friend has blocked you"
      ) {
        addFriendForm.setError("username", {
          type: "manual",
          message: `You cannot add @${data.username} as a friend, as @${data.username} has blocked you.`,
        });
        toast.error(
          `You cannot add @${data.username} as a friend, as @${data.username} has blocked you.`
        );
      } else {
        toast.error("Failed to add friend");
        console.error("Error adding friend:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new user
  const onCreateUser = async (data: z.infer<typeof createUserSchema>) => {
    if (!user?.telegramId) {
      toast.error("You must be logged in to add friends");
      return;
    }

    setIsLoading(true);
    try {
      // Create a new user using the create endpoint
      const createResponse = await axios.post(
        `${apiUrl}/user/create`,
        {
          username: pendingUsername,
          displayName: data.displayName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (createResponse.data) {
        // Add the newly created user as a friend
        const createdUser = createResponse.data;

        await axios.post(
          `${apiUrl}/user/addfriend`,
          {
            userId: user.id,
            friendId: createdUser.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await refreshUser();

        toast.success(`${data.displayName} has been added as a friend!`);
        setIsCreateUserDialogOpen(false);
        addFriendForm.reset();
        createUserForm.reset();
        setPendingUsername("");
      }
    } catch (error) {
      toast.error("Failed to create user");
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.username.toLowerCase().includes(search.toLowerCase());

    if (filter === "owes") return matchesSearch && friend.amount < 0;
    if (filter === "owed") return matchesSearch && friend.amount > 0;
    if (filter === "settled") return matchesSearch && friend.amount === 0;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-muted-foreground text-sm">
            Manage friends and settle balances
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Button
            size="leftIcon"
            className="rounded-xl h-11"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!user}
          >
            <UserRoundPlus className="size-4" />
            Add
          </Button>
        </div>

        <div className="mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="owed">Owes you</SelectItem>
              <SelectItem value="owes">You Owe</SelectItem>
              <SelectItem value="settled">Settled up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredFriends.map(({ id }) => (
          <FriendCard key={id} userId={id} />
        ))}

        {filteredFriends.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No friends found.
          </div>
        )}
      </div>

      {/* Add Friend Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) addFriendForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add friend</DialogTitle>
            <DialogDescription>
              Enter your friend's Telegram username
            </DialogDescription>
          </DialogHeader>

          <Form {...addFriendForm}>
            <form
              onSubmit={addFriendForm.handleSubmit(onAddFriend)}
              className="space-y-4"
            >
              <FormField
                control={addFriendForm.control}
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

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are able to add your friends even if they aren't a Nest
                  user yet. They will be able to view their transaction history
                  upon account creation.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Friend"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>@{pendingUsername} isn't on Nest yet.</DialogTitle>
            <DialogDescription>
              Enter a display name for @{pendingUsername}. This will be how
              others see them on the app until they create an account.
            </DialogDescription>
          </DialogHeader>

          <Form {...createUserForm}>
            <form
              onSubmit={createUserForm.handleSubmit(onCreateUser)}
              className="space-y-4"
            >
              <FormField
                control={createUserForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shaun" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateUserDialogOpen(false);
                    setIsAddDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Friend"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Navbar />
    </div>
  );
};

export default FriendsPage;
