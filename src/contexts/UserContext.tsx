import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import axios from "axios";
import { Transaction } from "@/lib/transaction";
import { RecurringTemplate } from "@/lib/recurring";
import { toast } from "@/lib/toast";
import { formatISO } from "date-fns";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  profilePhoto?: string;
  balance: number;
  hasSignedUp: boolean;
}

interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  profilePhoto?: string;
  hasSignedUp: boolean;
}

interface User {
  id: string;
  telegramId?: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  profilePhoto?: string;
  verifiedAt?: string;
  hasSignedUp: boolean;
  isAdmin?: boolean;
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
  categories: {
    id: string;
    name: string;
  }[];
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  hasSeenTutorial: boolean;
  completeTutorial: () => void;
  resetTutorial: () => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  recurringTemplates: RecurringTemplate[] | null;
  setRecurringTemplates: React.Dispatch<
    React.SetStateAction<RecurringTemplate[] | null>
  >;
  fetchRecurringTemplates: () => Promise<void>;
  loading: boolean;
  loadingTelegram: boolean;
  updating: boolean;
  refreshUser: (includePhotos?: boolean) => Promise<void>;
  spending: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  selectedCategoryIds: string[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const isTokenExpired = (token: string) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;

    const { exp } = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return typeof exp === "number" ? exp * 1000 < Date.now() : true;
  } catch (error) {
    console.error("Failed to parse token for expiry", error);
    return true;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem("hasSeenTutorial") === "true";
  });

  const completeTutorial = () => {
    setHasSeenTutorial(true);
    localStorage.setItem("hasSeenTutorial", "true");
  };

  const resetTutorial = () => {
    setHasSeenTutorial(false);
    localStorage.removeItem("hasSeenTutorial");
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("transactions");
    return stored ? (JSON.parse(stored) as Transaction[]) : [];
  });
  const [loading, setLoading] = useState(true);
  const [loadingTelegram, setLoadingTelegram] = useState(() =>
    Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user)
  );
  const [updating, setUpdating] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("startDate");
    return saved ? new Date(saved) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("endDate");
    return saved ? new Date(saved) : undefined;
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedCategoryIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [spending, setSpending] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem(
      "selectedCategoryIds",
      JSON.stringify(selectedCategoryIds)
    );
  }, [selectedCategoryIds]);

  // Cleanup selected categories when user categories change (e.g. deletion)
  useEffect(() => {
    if (!user) return;

    const currentCategoryIds = new Set((user.categories || []).map((c) => c.id));

    // Only update if there are selected IDs that no longer exist
    const needsCleanup = selectedCategoryIds.some(
      (id) => !currentCategoryIds.has(id)
    );

    if (needsCleanup) {
      setSelectedCategoryIds((prev) =>
        prev.filter((id) => currentCategoryIds.has(id))
      );
    }
  }, [user, selectedCategoryIds]);

  useEffect(() => {
    if (!user) {
      setSpending(0);
      return;
    }

    const calculateSpending = () => {
      let total = 0;
      const userId = user.id;

      transactions.forEach((t) => {
        const txDate = new Date(t.date);
        let inRange = true;

        if (startDate && txDate < startDate) inRange = false;
        if (endDate && txDate > endDate) inRange = false;

        // Filter by category
        if (selectedCategoryIds.length > 0) {
          const categories = Array.isArray(t.userCategories)
            ? t.userCategories
            : [];
          const userCats =
            categories.find((uc) => uc.userId === userId)?.categoryIds || [];
          const hasMatch = userCats.some((id) =>
            selectedCategoryIds.includes(id)
          );
          if (!hasMatch) inRange = false;
        }

        if (!inRange) return;

        // Check if transaction has splitsInSgd (Purchase, Bill, Recurring)
        // We use 'splitsInSgd' in t check which works for discriminated unions if we cast or check existence
        if ("splitsInSgd" in t && Array.isArray(t.splitsInSgd)) {
          const userSplit = t.splitsInSgd.find((s) => s.user === userId);
          if (userSplit) {
            total += userSplit.amount;
          }
        }
      });
      setSpending(parseFloat(total.toFixed(2)));
    };

    calculateSpending();
  }, [startDate, endDate, transactions, user, selectedCategoryIds]);

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

  const getLatestUpdatedAt = (records: Transaction[]) => {
    const latestTimestamp = records.reduce<number | undefined>((latest, tx) => {
      const timestamp = tx.updatedAt ?? tx.date;
      const value = new Date(timestamp).getTime();
      if (Number.isNaN(value)) return latest;
      if (latest === undefined || value > latest) return value;
      return latest;
    }, undefined);

    return latestTimestamp ? new Date(latestTimestamp).toISOString() : undefined;
  };

  const mergeTransactions = (
    current: Transaction[],
    updates: Transaction[],
    deletedIds: string[]
  ) => {
    const merged = new Map(current.map((t) => [t._id, t]));
    updates.forEach((tx) => merged.set(tx._id, tx));
    deletedIds.forEach((id) => merged.delete(id));

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const refreshUser = async (includePhotos = false) => {
    const storedTelegramId = localStorage.getItem("telegramId");
    const token = localStorage.getItem("token");
    if (!storedTelegramId || !token) {
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/telegramid/${storedTelegramId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { includePhotos },
        }
      );
      const userData = res.data;

      if (!includePhotos && user) {
        userData.profilePhoto = user.profilePhoto;
        userData.photoUrl = user.photoUrl;
        userData.friends = userData.friends.map((friend: Friend) => {
          const existingFriend = user.friends.find((f) => f.id === friend.id);
          return {
            ...friend,
            profilePhoto: existingFriend?.profilePhoto,
            photoUrl: existingFriend?.photoUrl,
          };
        });
        userData.blockedUsers = userData.blockedUsers.map(
          (blockedUser: BlockedUser) => {
            const existingBlockedUser = user.blockedUsers.find(
              (b) => b.id === blockedUser.id
            );
            return {
              ...blockedUser,
              profilePhoto: existingBlockedUser?.profilePhoto,
              photoUrl: existingBlockedUser?.photoUrl,
            };
          }
        );
      }

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

      try {
        const latestUpdatedAt = getLatestUpdatedAt(transactions);
        const knownTransactionIds = transactions.map((t) => t._id).join(",");

        const transRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/all/${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              lastUpdatedAt: latestUpdatedAt,
              knownTransactionIds,
            },
          }
        );
        setTransactions((prev) =>
          mergeTransactions(
            prev,
            transRes.data.transactions ?? [],
            transRes.data.deletedTransactionIds ?? []
          )
        );
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/recurring/${userData.id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecurringTemplates(response.data.recurringTemplates || []);
      } catch (err) {
        console.error("Failed to fetch recurring templates:", err);
        toast.error("Failed to load recurring transactions");
      }


      localStorage.setItem("displayname", userData.displayName);

      setUpdating(false);
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
    }
  };

  useEffect(() => {
    const init = async () => {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;
      console.log("Telegram User Data:", tgUser);
      const initData = tg?.initData;

      const storedToken = localStorage.getItem("token");
      const hasValidToken = storedToken ? !isTokenExpired(storedToken) : false;

      let telegramLoginTriggered = false;

      const loginWithTelegram = async () => {
        telegramLoginTriggered = true;
        setLoadingTelegram(true);
        if (!tgUser?.username) {
          toast.error("Please set a Telegram username before using the mini app.");
          setLoadingTelegram(false);
          return;
        }

        if (!initData) {
          setLoadingTelegram(false);
          return;
        }

        try {
          const response = await axios.post<{
            token: string;
            telegramId: string;
          }>(`${import.meta.env.VITE_API_URL}/auth/telegram-login`, {
            initData,
          });
          const { token, telegramId } = response.data || {};
          if (token && telegramId) {
            localStorage.setItem("token", token);
            localStorage.setItem("telegramId", telegramId);
            setLoadingTelegram(false);
          }
        } catch (error) {
          console.error("Telegram mini app login failed:", error);
          toast.error("Hmm... Something went wrong. Let me try that again.");
          setTimeout(loginWithTelegram, 3000);
        }
      };

      if (tgUser && initData) {
        if (hasValidToken) {
          loginWithTelegram().catch((error) =>
            console.error("Background Telegram login failed", error)
          );
        } else {
          await loginWithTelegram();
        }
      }
      await refreshUser(true);

      if (!telegramLoginTriggered) {
        setLoadingTelegram(false);
      }
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

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        hasSeenTutorial,
        completeTutorial,
        resetTutorial,
        loading,
        loadingTelegram,
        updating,
        refreshUser,
        transactions,
        setTransactions,
        recurringTemplates,
        setRecurringTemplates,
        fetchRecurringTemplates,
        spending,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        selectedCategoryIds,
        setSelectedCategoryIds,
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
