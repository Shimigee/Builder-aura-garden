import { createContext, useContext, useState, ReactNode } from "react";
import { Permit } from "@shared/api";

interface PermitsContextType {
  permits: Permit[];
  addPermit: (permit: Permit) => void;
  updatePermit: (permit: Permit) => void;
  deletePermit: (permitId: string) => void;
  getPermitById: (permitId: string) => Permit | undefined;
  getPermitsByLot: (lotId: string) => Permit[];
}

const PermitsContext = createContext<PermitsContextType | undefined>(undefined);

export function PermitsProvider({ children }: { children: ReactNode }) {
  const [permits, setPermits] = useState<Permit[]>([]);

  const addPermit = (permit: Permit) => {
    console.log("PermitsContext: Adding permit", permit);
    setPermits((prevPermits) => {
      const newPermits = [...prevPermits, permit];
      console.log("PermitsContext: New permits array", newPermits);
      return newPermits;
    });
  };

  const updatePermit = (updatedPermit: Permit) => {
    setPermits((prevPermits) =>
      prevPermits.map((permit) =>
        permit.id === updatedPermit.id ? updatedPermit : permit,
      ),
    );
  };

  const deletePermit = (permitId: string) => {
    setPermits((prevPermits) =>
      prevPermits.filter((permit) => permit.id !== permitId),
    );
  };

  const getPermitById = (permitId: string) => {
    return permits.find((permit) => permit.id === permitId);
  };

  const getPermitsByLot = (lotId: string) => {
    return permits.filter((permit) => permit.lotId === lotId);
  };

  return (
    <PermitsContext.Provider
      value={{
        permits,
        addPermit,
        updatePermit,
        deletePermit,
        getPermitById,
        getPermitsByLot,
      }}
    >
      {children}
    </PermitsContext.Provider>
  );
}

export function usePermits() {
  const context = useContext(PermitsContext);
  if (context === undefined) {
    throw new Error("usePermits must be used within a PermitsProvider");
  }
  return context;
}
