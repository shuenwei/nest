import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: string;
  telegramId?: string;
  username: string;
  displayName: string;
  profilePhoto?: string;
  verifiedAt?: string;
  hasSignedUp: boolean;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedTelegramId = localStorage.getItem("telegramId");
      if (!storedTelegramId) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/telegramid/${storedTelegramId}`
        );
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
