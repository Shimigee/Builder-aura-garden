import { createContext, useContext, useState, ReactNode } from "react";
import { Permit } from "@shared/api";

interface PermitsContextType {
  permits: Permit[];
  addPermit: (permit: Permit) => void;
  updatePermit: (permit: Permit) => void;
  deletePermit: (permitId: string) => void;
  getPermitById: (permitId: string) => Permit | undefined;
}

const PermitsContext = createContext<PermitsContextType | undefined>(undefined);

// Demo permits data
const demoPermits: Permit[] = [
  {
    id: "permit-1",
    permitNumber: "PMT-001-2024",
    lotId: "lot-1",
    holderName: "John Smith",
    unitNumber: "A-101",
    permitType: "resident",
    parkingSpotNumber: "A15",
    isActive: true,
    issueDate: "2024-01-15",
    expirationDate: "2024-12-31",
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: 2022,
      color: "Silver",
      licensePlate: "ABC-1234",
    },
  },
  {
    id: "permit-2",
    permitNumber: "PMT-002-2024",
    lotId: "lot-1",
    holderName: "Sarah Johnson",
    unitNumber: "A-205",
    permitType: "resident",
    parkingSpotNumber: "A22",
    isActive: true,
    issueDate: "2024-02-01",
    expirationDate: "2025-01-31",
    vehicle: {
      make: "Honda",
      model: "Civic",
      year: 2021,
      color: "Blue",
      licensePlate: "XYZ-5678",
    },
  },
  {
    id: "permit-3",
    permitNumber: "PMT-003-2024",
    lotId: "lot-2",
    holderName: "Mike Davis",
    unitNumber: "B-303",
    permitType: "resident",
    parkingSpotNumber: "B08",
    isActive: true,
    issueDate: "2024-01-20",
    expirationDate: "2024-01-15", // Expired
    vehicle: {
      make: "Ford",
      model: "Focus",
      year: 2020,
      color: "Red",
      licensePlate: "LMN-9012",
    },
  },
  {
    id: "permit-4",
    permitNumber: "PMT-004-2024",
    lotId: "lot-3",
    holderName: "Coffee Corner Shop",
    unitNumber: "Unit 5",
    permitType: "retail_tenant",
    parkingSpotNumber: "R12",
    isActive: true,
    issueDate: "2024-03-01",
    expirationDate: "2024-02-10", // Expiring soon
    vehicle: {
      make: "Chevrolet",
      model: "Transit",
      year: 2023,
      color: "White",
      licensePlate: "COM-2024",
    },
  },
  {
    id: "permit-5",
    permitNumber: "PMT-005-2024",
    lotId: "lot-2",
    holderName: "Emma Wilson",
    unitNumber: "B-107",
    permitType: "resident",
    parkingSpotNumber: "B15",
    isActive: false, // Inactive
    issueDate: "2024-01-10",
    expirationDate: "2024-12-31",
    vehicle: {
      make: "BMW",
      model: "X3",
      year: 2022,
      color: "Black",
      licensePlate: "BMW-X123",
    },
  },
  {
    id: "permit-6",
    permitNumber: "PMT-006-2024",
    lotId: "lot-4",
    holderName: "Robert Brown",
    unitNumber: "C-401",
    permitType: "resident",
    parkingSpotNumber: "C25",
    isActive: true,
    issueDate: "2024-02-15",
    expirationDate: "2025-02-14",
    vehicle: {
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      color: "White",
      licensePlate: "TESLA-1",
    },
  },
];

export function PermitsProvider({ children }: { children: ReactNode }) {
  const [permits, setPermits] = useState<Permit[]>(demoPermits);

  const addPermit = (permit: Permit) => {
    setPermits((prevPermits) => [...prevPermits, permit]);
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

  return (
    <PermitsContext.Provider
      value={{
        permits,
        addPermit,
        updatePermit,
        deletePermit,
        getPermitById,
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
