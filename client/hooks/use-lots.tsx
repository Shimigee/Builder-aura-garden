import { createContext, useContext, useState, ReactNode } from "react";
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

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);

  const addLot = (lot: Lot) => {
    setLots((prevLots) => [...prevLots, lot]);
  };

  const updateLot = (updatedLot: Lot) => {
    setLots((prevLots) =>
      prevLots.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot)),
    );
  };

  const deleteLot = (lotId: string) => {
    setLots((prevLots) => prevLots.filter((lot) => lot.id !== lotId));
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
