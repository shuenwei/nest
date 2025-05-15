import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/NavBar";
import FriendCard from "@/components/FriendCard";
import { UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FriendsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const friends = [
    { name: "Alex Wong", username: "alexwong", amount: 85.5 },
    { name: "Mei Lin", username: "meilin", amount: -45.2 },
    { name: "Raj Patel", username: "rajp", amount: 120.75 },
    { name: "Sarah Chen", username: "sarahc", amount: -30.0 },
    { name: "John Tan", username: "johntan", amount: 0.0 },
    { name: "Lisa Kim", username: "lisakim", amount: 15.3 },
  ];

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
          <Button size="leftIcon" className="rounded-xl h-11">
            <UserPlus className="size-4" />
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

        {filteredFriends.map(({ name, username, amount }, idx) => (
          <FriendCard
            name={name}
            username={username}
            amount={amount}
            idx={idx}
          />
        ))}
      </div>
      <Navbar />
    </div>
  );
};

export default FriendsPage;
