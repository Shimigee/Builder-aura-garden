import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

// Helper function to safely access localStorage
const getStoredPermits = (): Permit[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("parkmaster_permits");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePermitsToStorage = (permits: Permit[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("parkmaster_permits", JSON.stringify(permits));
    }
  } catch (error) {
    console.warn("Failed to save permits to localStorage:", error);
  }
};

export function PermitsProvider({ children }: { children: ReactNode }) {
  const [permits, setPermits] = useState<Permit[]>([]);

  // Load from localStorage after component mounts
  useEffect(() => {
    setPermits(getStoredPermits());
  }, []);

  const addPermit = (permit: Permit) => {
    console.log("PermitsContext: Adding permit", permit);
    setPermits((prevPermits) => {
      const newPermits = [...prevPermits, permit];
      savePermitsToStorage(newPermits);
      console.log("PermitsContext: New permits array", newPermits);
      return newPermits;
    });
  };

  const updatePermit = (updatedPermit: Permit) => {
    setPermits((prevPermits) => {
      const newPermits = prevPermits.map((permit) =>
        permit.id === updatedPermit.id ? updatedPermit : permit,
      );
      savePermitsToStorage(newPermits);
      return newPermits;
    });
  };

  const deletePermit = (permitId: string) => {
    setPermits((prevPermits) => {
      const newPermits = prevPermits.filter((permit) => permit.id !== permitId);
      savePermitsToStorage(newPermits);
      return newPermits;
    });
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
