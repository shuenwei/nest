import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HistoryPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const expenses = [
    {
      title: "Lunch at Hawker Centre",
      date: "8 May 2023",
      amount: 68.5,
      paidBy: "You",
      icon: "🍽️",
      people: ["You", "Alex Wong", "Mei Lin", "Raj Patel"],
    },
    {
      title: "Spotify Family",
      date: "1 May 2023",
      amount: 14.9,
      paidBy: "You",
      icon: "📍",
      people: ["You", "Alex Wong", "Mei Lin", "Sarah Chen"],
    },
    {
      title: "Taxi ride home",
      date: "6 May 2023",
      amount: 24.5,
      paidBy: "Alex Wong",
      icon: "💵",
      people: ["You", "Alex Wong"],
    },
    {
      title: "Groceries",
      date: "4 May 2023",
      amount: 84.6,
      paidBy: "You",
      icon: "💵",
      people: ["You", "Mei Lin", "Raj Patel"],
    },
  ];

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "you" && e.paidBy === "You") ||
      (filter === "friend" && e.paidBy !== "You") ||
      (filter === "settle" && e.title.toLowerCase().includes("settle"));

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
          <Card key={idx} className="mb-3 py-3 shadow-xs">
            <CardContent className="px-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    SGD {item.amount.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Paid by {item.paidBy}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Split with {item.people.length} people
              </div>
              <div className="flex flex-wrap gap-2">
                {item.people.map((p) => (
                  <Badge key={p} variant="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Navbar />
    </div>
  );
};

export default HistoryPage;
