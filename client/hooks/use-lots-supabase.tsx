import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Lot } from "@shared/api";

interface LotsContextType {
  lots: Lot[];
  addLot: (lot: Omit<Lot, "id">) => Promise<void>;
  updateLot: (lot: Lot) => Promise<void>;
  deleteLot: (lotId: string) => Promise<void>;
  getLotById: (lotId: string) => Lot | undefined;
  getLotName: (lotId: string) => string;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const LotsContext = createContext<LotsContextType | undefined>(undefined);

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lots")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching lots:", error);
        return;
      }

      if (data) {
        const formattedLots: Lot[] = data.map((lot) => ({
          id: lot.id,
          name: lot.name,
          description: lot.description || "",
          totalSpots: lot.total_spots,
          availableSpots: lot.available_spots,
        }));
        setLots(formattedLots);
      }
    } catch (error) {
      console.error("Error fetching lots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLot = async (lotData: Omit<Lot, "id">) => {
    try {
      const { data, error } = await supabase
        .from("lots")
        .insert({
          name: lotData.name,
          description: lotData.description,
          total_spots: lotData.totalSpots,
          available_spots: lotData.availableSpots,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const newLot: Lot = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          totalSpots: data.total_spots,
          availableSpots: data.available_spots,
        };
        setLots((prev) => [...prev, newLot]);
      }
    } catch (error) {
      console.error("Error adding lot:", error);
      throw error;
    }
  };

  const updateLot = async (updatedLot: Lot) => {
    try {
      const { error } = await supabase
        .from("lots")
        .update({
          name: updatedLot.name,
          description: updatedLot.description,
          total_spots: updatedLot.totalSpots,
          available_spots: updatedLot.availableSpots,
        })
        .eq("id", updatedLot.id);

      if (error) {
        throw new Error(error.message);
      }

      setLots((prev) =>
        prev.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot)),
      );
    } catch (error) {
      console.error("Error updating lot:", error);
      throw error;
    }
  };

  const deleteLot = async (lotId: string) => {
    try {
      const { error } = await supabase.from("lots").delete().eq("id", lotId);

      if (error) {
        throw new Error(error.message);
      }

      setLots((prev) => prev.filter((lot) => lot.id !== lotId));
    } catch (error) {
      console.error("Error deleting lot:", error);
      throw error;
    }
  };

  const getLotById = (lotId: string) => {
    return lots.find((lot) => lot.id === lotId);
  };

  const getLotName = (lotId: string) => {
    const lot = getLotById(lotId);
    return lot?.name || lotId;
  };

  const refetch = async () => {
    await fetchLots();
  };

  return (
    <LotsContext.Provider
      value={{
        lots,
        addLot,
        updateLot,
        deleteLot,
        getLotById,
        getLotName,
        isLoading,
        refetch,
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
