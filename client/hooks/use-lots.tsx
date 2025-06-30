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
    location: "123 Main Street",
    capacity: 50,
    description: "Primary parking area for Building A residents",
  },
  {
    id: "lot-2",
    name: "Building B - North Lot",
    location: "456 Oak Avenue",
    capacity: 30,
    description: "North side parking for Building B",
  },
  {
    id: "lot-3",
    name: "Retail Plaza",
    location: "789 Commerce Way",
    capacity: 75,
    description: "Shopping center parking area",
  },
  {
    id: "lot-4",
    name: "Building C - South Lot",
    location: "321 Pine Street",
    capacity: 40,
    description: "South parking area for Building C residents",
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
