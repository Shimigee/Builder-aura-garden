import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth-supabase";

interface Lot {
  id: string;
  name: string;
  description?: string;
  total_spots: number;
  available_spots: number;
  created_at: string;
  updated_at: string;
}

interface LotsContextType {
  lots: Lot[];
  isLoading: boolean;
  addLot: (lot: Omit<Lot, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateLot: (id: string, updates: Partial<Lot>) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  getLotById: (id: string) => Lot | undefined;
  getLotName: (id: string) => string;
  refreshLots: () => Promise<void>;
}

const LotsContext = createContext<LotsContextType | undefined>(undefined);

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  // Fetch lots when user changes
  useEffect(() => {
    if (user && profile) {
      fetchLots();
      subscribeToLots();
    } else {
      setLots([]);
      setIsLoading(false);
    }
  }, [user, profile]);

  const fetchLots = async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      let query = supabase.from("lots").select("*");

      // Non-admins only see their assigned lots
      if (profile.role !== "admin") {
        query = query.in("id", profile.assigned_lots);
      }

      const { data, error } = await query.order("name");

      if (error) {
        console.error("Error fetching lots:", error);
        return;
      }

      setLots(data || []);
    } catch (error) {
      console.error("Error fetching lots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToLots = () => {
    const subscription = supabase
      .channel("lots_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lots",
        },
        (payload) => {
          console.log("Lots change received:", payload);
          fetchLots(); // Refresh lots on any change
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addLot = async (
    lotData: Omit<Lot, "id" | "created_at" | "updated_at">,
  ) => {
    const { error } = await supabase.from("lots").insert([lotData]);

    if (error) {
      console.error("Error adding lot:", error);
      throw error;
    }

    // fetchLots will be called via subscription
  };

  const updateLot = async (id: string, updates: Partial<Lot>) => {
    const { error } = await supabase.from("lots").update(updates).eq("id", id);

    if (error) {
      console.error("Error updating lot:", error);
      throw error;
    }

    // fetchLots will be called via subscription
  };

  const deleteLot = async (id: string) => {
    const { error } = await supabase.from("lots").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lot:", error);
      throw error;
    }

    // fetchLots will be called via subscription
  };

  const getLotById = (id: string) => {
    return lots.find((lot) => lot.id === id);
  };

  const getLotName = (id: string) => {
    const lot = getLotById(id);
    return lot?.name || id;
  };

  const refreshLots = async () => {
    await fetchLots();
  };

  return (
    <LotsContext.Provider
      value={{
        lots,
        isLoading,
        addLot,
        updateLot,
        deleteLot,
        getLotById,
        getLotName,
        refreshLots,
      }}
    >
      {children}
    </LotsContext.Provider>
  );
}

export function useLots() {
  const context = useContext(LotsContext);
  if (context === undefined) {
    throw new Error("useLots must be used within a LotsProvider");
  }
  return context;
}
