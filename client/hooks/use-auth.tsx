import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token");
    if (token) {
      // In a real app, validate token with server
      // For now, we'll simulate a logged-in user
      setUser({
        id: "1",
        email: "admin@parkingsystem.com",
        name: "Admin User",
        role: "admin",
        assignedLots: ["lot-1", "lot-2", "lot-3", "lot-4"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, make API call to authenticate
      // For demo purposes, we'll simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@parkingsystem.com" && password === "admin") {
        const user: User = {
          id: "1",
          email: "admin@parkingsystem.com",
          name: "Admin User",
          role: "admin",
          assignedLots: ["lot-1", "lot-2", "lot-3", "lot-4"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(user);
        localStorage.setItem("auth_token", "demo_token");
      } else if (
        email === "editor@parkingsystem.com" &&
        password === "editor"
      ) {
        const user: User = {
          id: "2",
          email: "editor@parkingsystem.com",
          name: "Editor User",
          role: "editor",
          assignedLots: ["lot-a"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(user);
        localStorage.setItem("auth_token", "demo_token");
      } else if (
        email === "viewer@parkingsystem.com" &&
        password === "viewer"
      ) {
        const user: User = {
          id: "3",
          email: "viewer@parkingsystem.com",
          name: "Viewer User",
          role: "viewer",
          assignedLots: ["retail-1"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(user);
        localStorage.setItem("auth_token", "demo_token");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
