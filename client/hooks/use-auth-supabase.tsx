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
  forceStopLoading: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log("Auth check timeout - forcing loading to false");
      setIsLoading(false);
    }, 2000); // 2 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Checking initial session...");
        console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
        console.log(
          "Supabase Key exists:",
          !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          clearTimeout(timeout);
          setIsLoading(false);
          return;
        }

        console.log("Initial session:", session);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Initial session error:", error);
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change:", event, session?.user?.email);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message, error);

        // If user doesn't exist, create a default profile
        if (error.code === "PGRST116") {
          console.log("User profile doesn't exist, creating default...");
          await createDefaultUserProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        console.log("User profile loaded:", data);
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
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
        console.log("Default user profile created:", data);
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
    } catch (error) {
      console.error("Error creating default user profile:", error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Login attempt for:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Login response:", { data, error });

      if (error) {
        console.error("Login error:", error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log("Login successful, fetching profile...");
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.error("Login catch block:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
