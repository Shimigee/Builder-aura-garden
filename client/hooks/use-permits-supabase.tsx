import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Permit } from "@shared/api";

interface PermitsContextType {
  permits: Permit[];
  addPermit: (
    permit: Omit<Permit, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updatePermit: (permit: Permit) => Promise<void>;
  deletePermit: (permitId: string) => Promise<void>;
  getPermitById: (permitId: string) => Permit | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PermitsContext = createContext<PermitsContextType | undefined>(undefined);

export function PermitsProvider({ children }: { children: ReactNode }) {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      setIsLoading(true);

      // Fetch permits with their vehicles
      const { data: permitsData, error: permitsError } = await supabase
        .from("permits")
        .select(
          `
          *,
          vehicles (*)
        `,
        )
        .order("created_at", { ascending: false });

      if (permitsError) {
        console.error(
          "Error fetching permits:",
          permitsError.message,
          permitsError,
        );
        return;
      }

      if (permitsData) {
        const formattedPermits: Permit[] = permitsData.map((permit) => ({
          id: permit.id,
          permitNumber: permit.permit_number,
          lotId: permit.lot_id,
          holderName: permit.holder_name,
          unitNumber: permit.unit_number,
          permitType: permit.permit_type,
          occupantStatus: permit.occupant_status || "leaseholder",
          parkingSpotNumber: permit.parking_spot_number,
          isActive: permit.is_active,
          issueDate: permit.issue_date,
          expirationDate: permit.expiration_date,
          notes: permit.notes || "",
          createdAt: permit.created_at,
          updatedAt: permit.updated_at,
          vehicle: permit.vehicles?.[0]
            ? {
                make: permit.vehicles[0].make,
                model: permit.vehicles[0].model,
                year: permit.vehicles[0].year,
                color: permit.vehicles[0].color,
                licensePlate: permit.vehicles[0].license_plate,
                imageUrl: permit.vehicles[0].image_url,
              }
            : {
                make: "",
                model: "",
                year: 2024,
                color: "",
                licensePlate: "",
              },
        }));
        setPermits(formattedPermits);
      }
    } catch (error) {
      console.error("Error fetching permits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPermit = async (
    permitData: Omit<Permit, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      // Get current user for created_by field
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("📝 Permit data being inserted:", permitData);
      console.log("📝 User creating permit:", user.id, user.email);

      // Insert permit with proper date handling
      const { data: permitResult, error: permitError } = await supabase
        .from("permits")
        .insert({
          permit_number: permitData.permitNumber,
          lot_id: permitData.lotId,
          holder_name: permitData.holderName,
          unit_number: permitData.unitNumber,
          permit_type: permitData.permitType,
          occupant_status: permitData.occupantStatus || "leaseholder",
          parking_spot_number: permitData.parkingSpotNumber,
          is_active: permitData.isActive,
          issue_date:
            permitData.issueDate || new Date().toISOString().split("T")[0], // Default to today
          expiration_date:
            permitData.expirationDate ||
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Default to 1 year from now
          notes: permitData.notes || "",
          created_by: user.id,
        })
        .select()
        .single();

      if (permitError) {
        throw new Error(permitError.message);
      }

      // Insert vehicle
      if (permitResult) {
        const { error: vehicleError } = await supabase.from("vehicles").insert({
          permit_id: permitResult.id,
          make: permitData.vehicle.make,
          model: permitData.vehicle.model,
          year: permitData.vehicle.year,
          color: permitData.vehicle.color,
          license_plate: permitData.vehicle.licensePlate,
          image_url: permitData.vehicle.imageUrl,
        });

        if (vehicleError) {
          throw new Error(vehicleError.message);
        }

        // Refresh permits to get the new one with vehicle data
        await fetchPermits();
      }
    } catch (error) {
      console.error("Error adding permit:", error);
      throw error;
    }
  };

  const updatePermit = async (updatedPermit: Permit) => {
    try {
      // Update permit
      const { error: permitError } = await supabase
        .from("permits")
        .update({
          permit_number: updatedPermit.permitNumber,
          lot_id: updatedPermit.lotId,
          holder_name: updatedPermit.holderName,
          unit_number: updatedPermit.unitNumber,
          permit_type: updatedPermit.permitType,
          occupant_status: updatedPermit.occupantStatus,
          parking_spot_number: updatedPermit.parkingSpotNumber,
          is_active: updatedPermit.isActive,
          issue_date: updatedPermit.issueDate,
          expiration_date: updatedPermit.expirationDate,
          notes: updatedPermit.notes,
        })
        .eq("id", updatedPermit.id);

      if (permitError) {
        throw new Error(permitError.message);
      }

      // Update vehicle
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({
          make: updatedPermit.vehicle.make,
          model: updatedPermit.vehicle.model,
          year: updatedPermit.vehicle.year,
          color: updatedPermit.vehicle.color,
          license_plate: updatedPermit.vehicle.licensePlate,
          image_url: updatedPermit.vehicle.imageUrl,
        })
        .eq("permit_id", updatedPermit.id);

      if (vehicleError) {
        throw new Error(vehicleError.message);
      }

      // Update local state
      setPermits((prev) =>
        prev.map((permit) =>
          permit.id === updatedPermit.id ? updatedPermit : permit,
        ),
      );
    } catch (error) {
      console.error("Error updating permit:", error);
      throw error;
    }
  };

  const deletePermit = async (permitId: string) => {
    try {
      // Delete permit (vehicles will be deleted via CASCADE)
      const { error } = await supabase
        .from("permits")
        .delete()
        .eq("id", permitId);

      if (error) {
        throw new Error(error.message);
      }

      setPermits((prev) => prev.filter((permit) => permit.id !== permitId));
    } catch (error) {
      console.error("Error deleting permit:", error);
      throw error;
    }
  };

  const getPermitById = (permitId: string) => {
    return permits.find((permit) => permit.id === permitId);
  };

  const refetch = async () => {
    await fetchPermits();
  };

  return (
    <PermitsContext.Provider
      value={{
        permits,
        addPermit,
        updatePermit,
        deletePermit,
        getPermitById,
        isLoading,
        refetch,
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
