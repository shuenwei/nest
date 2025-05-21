import { useEffect, useState } from "react";
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
import TransactionCard from "@/components/TransactionCard";
import { Transaction } from "@/lib/transaction";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { transactions: expenses } = useUser();

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.transactionName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "you" &&
        (e.type === "purchase" || e.type === "bill") &&
        e.paidBy === user?.id) ||
      (filter === "friend" &&
        (e.type === "purchase" || e.type === "bill") &&
        e.paidBy !== user?.id) ||
      (filter === "settle" && e.type === "settleup");

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

        {filtered.map((item) => (
          <TransactionCard
            key={item._id}
            transactionId={item._id}
            onClick={() => navigate(`/history/${item._id}`)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found.
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default HistoryPage;
