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
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const delay = new Promise((resolve) => setTimeout(resolve, 500));

  const refreshUser = async () => {
    const storedTelegramId = localStorage.getItem("telegramId");
    if (!storedTelegramId) {
      await delay;
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/telegramid/${storedTelegramId}`
      );
      const userData = res.data;
      setUser(userData);

      try {
        const balanceRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/balances/${userData.id}`
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

      try {
        const transRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/transaction/all/${userData.id}`
        );
        setTransactions(transRes.data.transactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setTransactions([]);
      }
      await delay;
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      await delay;
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        transactions,
        setTransactions,
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
