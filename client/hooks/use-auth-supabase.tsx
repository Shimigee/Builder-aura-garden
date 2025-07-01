import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@shared/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Force loading to stop after 2 seconds max
        setTimeout(() => {
          if (isMounted) {
            console.log("Auth timeout reached - stopping loading");
            setIsLoading(false);
          }
        }, 2000);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Session error:", error.message);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      try {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);

        // If user doesn't exist, create a default profile
        if (error.code === "PGRST116") {
          await createDefaultUserProfile(userId);
          return;
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          assignedLots: data.assigned_lots || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsLoading(false);
    }
  };

  const createDefaultUserProfile = async (userId: string) => {
    try {
      // Get user email from auth
      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser.user?.email) {
        console.error("No email found for user");
        return;
      }

      const defaultProfile = {
        id: userId,
        email: authUser.user.email,
        name: authUser.user.email.split("@")[0], // Use email prefix as name
        role: "viewer", // Default role
        assigned_lots: ["lot-1"], // Default to first lot
      };

      const { data, error } = await supabase
        .from("users")
        .insert(defaultProfile)
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error.message, error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          assignedLots: data.assigned_lots || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating default user profile:", error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("🔑 Login attempt for:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("🔑 Login response:", { data, error });

      if (error) {
        console.error("❌ Login error:", error.message);
        setIsLoading(false);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log("✅ Login successful! User:", data.user.email);
        console.log("👤 Fetching user profile...");
        await fetchUserProfile(data.user.id);
      } else {
        console.error("❌ No user returned from login");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("💥 Login catch block:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // If signup is successful, the user will need to confirm their email
      // But for development, we can create the profile immediately
      if (data.user && !data.session) {
        // User needs to confirm email, but we can create the profile
        console.log("User needs to confirm email");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, isLoading }}>
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
