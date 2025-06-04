import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";
import { Transaction } from "@/lib/transaction";
import { RecurringTemplate } from "@/lib/recurring";
import { toast } from "sonner";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
  balance: number;
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
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  recurringTemplates: RecurringTemplate[] | null;
  setRecurringTemplates: React.Dispatch<React.SetStateAction<RecurringTemplate[] | null>>;
  fetchRecurringTemplates: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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
      setUser(userData);
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
      
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message;


      if (message === "Token not provided" || message === "Invalid token")  {
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
      await refreshUser();
    };
    init();
  }, []);

  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[] | null>(null);

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
