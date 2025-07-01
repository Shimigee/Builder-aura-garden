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

// Demo lots data
const demoLots: Lot[] = [
  {
    id: "lot-1",
    name: "Building A - Main Lot",
    description: "Primary parking area for Building A residents",
    totalSpots: 50,
    availableSpots: 38,
  },
  {
    id: "lot-2",
    name: "Building B - North Lot",
    description: "North side parking for Building B",
    totalSpots: 30,
    availableSpots: 27,
  },
  {
    id: "lot-3",
    name: "Retail Plaza",
    description: "Shopping center parking area",
    totalSpots: 75,
    availableSpots: 74,
  },
  {
    id: "lot-4",
    name: "Building C - South Lot",
    description: "South parking area for Building C residents",
    totalSpots: 40,
    availableSpots: 39,
  },
];

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>(demoLots);

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
