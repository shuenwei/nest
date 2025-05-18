import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
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
  loading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedTelegramId = localStorage.getItem("telegramId");
      if (!storedTelegramId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/telegramid/${storedTelegramId}`
        );
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
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
