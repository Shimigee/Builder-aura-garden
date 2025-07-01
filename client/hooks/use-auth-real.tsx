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

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSession(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (authUser: any) => {
    try {
      // Try to get user profile from database
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        // User profile exists
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          assignedLots: profile.assigned_lots || [],
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        });
      } else {
        // Create new user profile
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split("@")[0] || "User",
          role: "admin", // First user is admin
          assigned_lots: [],
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("users")
          .insert(newProfile)
          .select()
          .single();

        if (createdProfile) {
          setUser({
            id: createdProfile.id,
            email: createdProfile.email,
            name: createdProfile.name,
            role: createdProfile.role,
            assignedLots: createdProfile.assigned_lots || [],
            createdAt: createdProfile.created_at,
            updatedAt: createdProfile.updated_at,
          });
        } else {
          console.error("Failed to create profile:", createError);
          // Fallback to basic user
          setUser({
            id: authUser.id,
            email: authUser.email,
            name: authUser.email?.split("@")[0] || "User",
            role: "admin",
            assignedLots: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Profile error:", error);
      // Always provide a fallback user
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.email?.split("@")[0] || "User",
        role: "admin",
        assignedLots: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      // handleUserSession will be called by auth state change
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
