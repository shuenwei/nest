import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/NavBar";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionCard, { Transaction } from "@/components/TransactionCard";

const HistoryPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const expenses = [
    {
      transactionName: "Settle Up",
      date: "7 May 2023",
      amount: 45.5,
      paidBy: "Alex Wong",
      icon: "💸",
      people: ["You", "Alex Wong"],
      type: "settle",
      receivedBy: "You",
    },
    {
      transactionName: "Lunch at Hawker Centre",
      date: "8 May 2023",
      amount: 68.5,
      paidBy: "You",
      icon: "🍽️",
      people: ["You", "Alex Wong", "Mei Lin", "Raj Patel"],
      type: "expense",
    },
    {
      transactionName: "Spotify Family",
      date: "1 May 2023",
      amount: 14.9,
      paidBy: "You",
      icon: "📍",
      people: ["You", "Alex Wong", "Mei Lin", "Sarah Chen"],
      type: "expense",
    },
    {
      transactionName: "Taxi ride home",
      date: "6 May 2023",
      amount: 24.5,
      paidBy: "Alex Wong",
      icon: "💵",
      people: ["You", "Alex Wong"],
      type: "expense",
    },
    {
      transactionName: "Groceries",
      date: "4 May 2023",
      amount: 84.6,
      paidBy: "You",
      icon: "💵",
      people: ["You", "Mei Lin", "Raj Patel"],
      type: "expense",
    },
  ];

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.transactionName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "you" && e.paidBy === "You") ||
      (filter === "friend" && e.paidBy !== "You") ||
      (filter === "settle" &&
        e.transactionName.toLowerCase().includes("settle"));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground text-sm">View expense history</p>
        </div>

        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions"
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="you">You paid</SelectItem>
              <SelectItem value="friend">Friends paid</SelectItem>
              <SelectItem value="settle">Settle up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.map((item, idx) => (
          <TransactionCard key={idx} transaction={item as Transaction} />
        ))}
      </div>
      <Navbar />
    </div>
  );
};

export default HistoryPage;
