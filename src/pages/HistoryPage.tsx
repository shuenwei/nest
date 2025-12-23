import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/NavBar";
import { Search, Folder } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CategorySelectDrawer } from "@/components/CategorySelectDrawer";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user, transactions: expenses, loading, updating } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const isLoading = loading || updating;

  const filtered = expenses.filter((e) => {
    // 1. Text Search
    const matchesSearch = e.transactionName
      .toLowerCase()
      .includes(search.toLowerCase());

    // 2. Type/Payer Filter
    const matchesFilter =
      filter === "all" ||
      (filter === "you" &&
        (e.type === "purchase" || e.type === "bill") &&
        e.paidBy === user?.id) ||
      (filter === "friend" &&
        (e.type === "purchase" || e.type === "bill") &&
        e.paidBy !== user?.id) ||
      (filter === "settle" && e.type === "settleup") ||
      (filter === "smartSettle" && e.type === "groupSmartSettle");

    // 3. Category Filter
    let matchesCategory = true;
    if (selectedCategoryIds.length > 0 && user) {
      if (!Array.isArray(e.userCategories)) {
        matchesCategory = false;
      } else {
        const userCatEntry = e.userCategories.find(
          (uc) => uc.userId === user.id
        );
        if (
          !userCatEntry ||
          !userCatEntry.categoryIds ||
          userCatEntry.categoryIds.length === 0
        ) {
          matchesCategory = false;
        } else {
          // Check if ANY of the transaction's categories are in the selected list
          const hasCommonCategory = userCatEntry.categoryIds.some((cid) =>
            selectedCategoryIds.includes(cid)
          );
          matchesCategory = hasCommonCategory;
        }
      }
    }

    return matchesSearch && matchesFilter && matchesCategory;
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

        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full rounded-xl bg-background">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="you">You paid</SelectItem>
                <SelectItem value="friend">Friends paid</SelectItem>
                <SelectItem value="settle">Settle up</SelectItem>
                <SelectItem value="smartSettle">Smart Settle Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[44px]"
          >
            {selectedCategoryIds.length === 0 ? (
              <Folder size={16} className="text-muted-foreground" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">
                {selectedCategoryIds.length}
              </div>
            )}
          </button>
        </div>

        {/* Category Drawer */}
        <CategorySelectDrawer
          open={isCategoryDrawerOpen}
          onOpenChange={setIsCategoryDrawerOpen}
          selectedCategoryIds={selectedCategoryIds}
          onSelect={setSelectedCategoryIds}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="mb-3 py-3 shadow-xs">
                <CardContent className="px-0 divide-y">
                  <div className="px-4 pb-3 flex justify-between items-start">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="px-4 pt-3 pb-1">
                    <Skeleton className="h-3 w-32 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((_, badgeIndex) => (
                        <Skeleton
                          key={badgeIndex}
                          className="h-6 w-20 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filtered.map((item) => (
              <TransactionCard key={item._id} transactionId={item._id} />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found.
              </div>
            )}
          </>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default HistoryPage;
