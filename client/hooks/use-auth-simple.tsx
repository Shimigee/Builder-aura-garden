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
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createOrGetUserProfile = async (
    userId: string,
    email: string | undefined,
  ) => {
    try {
      console.log("👤 Getting/creating user profile for:", email);

      // First try to get existing profile
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (existingUser) {
        console.log("✅ Found existing user profile:", existingUser);
        setUser({
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          assignedLots: existingUser.assigned_lots || [],
          createdAt: existingUser.created_at,
          updatedAt: existingUser.updated_at,
        });
        return;
      }

      // If user doesn't exist, create new profile
      console.log("🆕 Creating new user profile...");
      const newUserData = {
        id: userId,
        email: email || "unknown@example.com",
        name: email?.split("@")[0] || "User",
        role: "admin", // First user becomes admin
        assigned_lots: [],
      };

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating user profile:", createError);
        // Fallback to in-memory user
        setUser({
          id: userId,
          email: email || "demo@example.com",
          name: email?.split("@")[0] || "Demo User",
          role: "admin",
          assignedLots: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      console.log("✅ Created new user profile:", newUser);
      setUser({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        assignedLots: newUser.assigned_lots || [],
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      });
    } catch (error) {
      console.error("💥 Error in createOrGetUserProfile:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await createOrGetUserProfile(session.user.id, session.user.email);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Session error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        await createOrGetUserProfile(session.user.id, session.user.email);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        throw new Error(error.message);
      }

      // User will be set in the auth state change handler
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
