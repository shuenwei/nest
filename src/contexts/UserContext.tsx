import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";
import { Transaction } from "@/lib/transaction";
import { RecurringTemplate } from "@/lib/recurring";
import { toast } from "sonner";
import { formatISO } from "date-fns";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
  balance: number;
  hasSignedUp: boolean;
}

interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
  hasSignedUp: boolean;
}

interface User {
  id: string;
  telegramId?: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
  verifiedAt?: string;
  hasSignedUp: boolean;
  friends: Friend[];
  blockedUsers: BlockedUser[];
  monthlyUsage?: {
    month: string;
    scans: number;
    translations: number;
  };
  limits?: {
    scans: number;
    translations: number;
  };
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  recurringTemplates: RecurringTemplate[] | null;
  setRecurringTemplates: React.Dispatch<
    React.SetStateAction<RecurringTemplate[] | null>
  >;
  fetchRecurringTemplates: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  fetchSpending: () => Promise<void>;
  isLoadingSpending: boolean;
  spending: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("transactions");
    return stored ? (JSON.parse(stored) as Transaction[]) : [];
  });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("startDate");
    return saved ? new Date(saved) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("endDate");
    return saved ? new Date(saved) : undefined;
  });
  const [spending, setSpending] = useState<number>(() => {
    const stored = localStorage.getItem("spending");
    return stored ? Number(stored) : 0;
  });
  const [isLoadingSpending, setIsLoadingSpending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSpending();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (startDate) {
      localStorage.setItem("startDate", startDate.toISOString());
    } else {
      localStorage.removeItem("startDate");
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      localStorage.setItem("endDate", endDate.toISOString());
    } else {
      localStorage.removeItem("endDate");
    }
  }, [endDate]);

  useEffect(() => {
    localStorage.setItem("spending", spending.toString());
  }, [spending]);

  const fetchSpending = async (userId?: string) => {
    setIsLoadingSpending(true);
    if (!user && !userId) {
      return;
    } else if (user && !userId) {
      userId = user.id;
    }

    try {
      const params = new URLSearchParams();
      if (startDate)
        params.append(
          "startDate",
          formatISO(startDate, { representation: "complete" })
        );
      if (endDate)
        params.append(
          "endDate",
          formatISO(endDate, { representation: "complete" })
        );

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/transaction/spending/${userId}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSpending(res.data.totalSpent);
      setIsLoadingSpending(false);
    } catch (err) {
      console.error("Failed to fetch spending:", err);
    }
  };

  const refreshUser = async () => {
    const storedTelegramId = localStorage.getItem("telegramId");
    const token = localStorage.getItem("token");
    if (!storedTelegramId || !token) {
      setLoading(false);
      return;
    }
    try {
      setProgress(10);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/telegramid/${storedTelegramId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = res.data;
      setProgress(40);

      try {
        const balanceRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/balances/${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const balanceMap = new Map(
          balanceRes.data.balances.map(
            (b: { friendId: string; amount: number }) => [b.friendId, b.amount]
          )
        );

        userData.friends = userData.friends.map((friend: Friend) => ({
          ...friend,
          balance: balanceMap.get(friend.id) ?? 0,
        }));
      } catch (err) {
        console.error("Failed to fetch balances:", err);
      }

      setUser(userData);
      setProgress(70);

      try {
        const transRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/all/${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(transRes.data.transactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setTransactions([]);
      }

      setProgress(100);
      fetchSpending(userData.id);
      localStorage.setItem("displayname", userData.displayName);

      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        if (message === "Token not provided" || message === "Invalid token") {
          console.error("Failed to fetch user:", err);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("telegramId");
          toast.error("Please re-login.");
        } else {
          toast.error("Something went wrong. Please refresh your app.");
        }
      }
      setLoading(false);
      setIsLoadingSpending(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshUser();
    };
    init();
  }, []);

  const [recurringTemplates, setRecurringTemplates] = useState<
    RecurringTemplate[] | null
  >(() => {
    const stored = localStorage.getItem("recurringTemplates");
    return stored ? (JSON.parse(stored) as RecurringTemplate[]) : null;
  });

  useEffect(() => {
    if (recurringTemplates) {
      localStorage.setItem(
        "recurringTemplates",
        JSON.stringify(recurringTemplates)
      );
    } else {
      localStorage.removeItem("recurringTemplates");
    }
  }, [recurringTemplates]);

  const fetchRecurringTemplates = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/transaction/recurring/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecurringTemplates(response.data.recurringTemplates || []);
    } catch (err) {
      console.error("Failed to fetch recurring templates:", err);
      toast.error("Failed to load recurring transactions");
    }
  };

  const lastHiddenRef = useRef<number>(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenRef.current = Date.now();
      } else if (
        document.visibilityState === "visible" &&
        Date.now() - lastHiddenRef.current > 5 * 60 * 1000
      ) {
        refreshUser();
        fetchRecurringTemplates();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading) return <LoadingScreen progress={progress} />;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        transactions,
        setTransactions,
        recurringTemplates,
        setRecurringTemplates,
        fetchRecurringTemplates,
        fetchSpending,
        spending,
        isLoadingSpending,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook to access context
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
