import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Lot } from "@shared/api";

interface LotsContextType {
  lots: Lot[];
  addLot: (lot: Lot) => void;
  updateLot: (lot: Lot) => void;
  deleteLot: (lotId: string) => void;
  getLotById: (lotId: string) => Lot | undefined;
  getLotName: (lotId: string) => string;
}

const LotsContext = createContext<LotsContextType | undefined>(undefined);

// Helper function to safely access localStorage
const getStoredLots = (): Lot[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("parkmaster_lots");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLotsToStorage = (lots: Lot[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("parkmaster_lots", JSON.stringify(lots));
    }
  } catch (error) {
    console.warn("Failed to save lots to localStorage:", error);
  }
};

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);

  // Load from localStorage after component mounts
  useEffect(() => {
    setLots(getStoredLots());
  }, []);

  const addLot = (lot: Lot) => {
    setLots((prevLots) => {
      const newLots = [...prevLots, lot];
      saveLotsToStorage(newLots);
      return newLots;
    });
  };

  const updateLot = (updatedLot: Lot) => {
    setLots((prevLots) => {
      const newLots = prevLots.map((lot) =>
        lot.id === updatedLot.id ? updatedLot : lot,
      );
      saveLotsToStorage(newLots);
      return newLots;
    });
  };

  const deleteLot = (lotId: string) => {
    setLots((prevLots) => {
      const newLots = prevLots.filter((lot) => lot.id !== lotId);
      saveLotsToStorage(newLots);
      return newLots;
    });
  };

  const getLotById = (lotId: string) => {
    return lots.find((lot) => lot.id === lotId);
  };

  const getLotName = (lotId: string) => {
    const lot = getLotById(lotId);
    return lot?.name || lotId;
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
