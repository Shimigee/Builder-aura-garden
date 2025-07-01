import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermitForm } from "./PermitForm";
import { CreatePermitRequest, Permit } from "@shared/api";
import { usePermits } from "@/hooks/use-permits-supabase";
import { toast } from "@/hooks/use-toast";

interface PermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permit?: Permit;
  onSuccess?: () => void;
  preselectedLotId?: string;
}

export function PermitDialog({
  open,
  onOpenChange,
  permit,
  onSuccess,
  preselectedLotId,
}: PermitDialogProps) {
  const { addPermit, updatePermit } = usePermits();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePermitRequest) => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would call your API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (permit) {
        // Update existing permit
        const updatedPermit: Permit = {
          ...permit,
          holderName: data.holderName,
          permitType: data.permitType,
          lotId: data.lotId || permit.lotId,
          unitNumber: data.unitNumber,
          occupantStatus: data.occupantStatus,
          vehicle: data.vehicle,
          parkingSpotNumber: data.parkingSpotNumber,
          expirationDate: data.expirationDate,
          notes: data.notes,
          updatedAt: new Date().toISOString(),
        };

        updatePermit(updatedPermit);

        toast({
          title: "Permit Updated",
          description: `Permit ${permit.permitNumber} has been updated successfully.`,
        });
      } else {
        // Create new permit
        const newPermit: Permit = {
          id: `permit-${Date.now()}`, // Simple ID generation
          permitNumber:
            data.permitNumber ||
            `PMT-${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0")}-${new Date().getFullYear()}`,
          holderName: data.holderName,
          permitType: data.permitType,
          lotId: data.lotId || preselectedLotId || "",
          unitNumber: data.unitNumber,
          occupantStatus: data.occupantStatus,
          vehicle: data.vehicle,
          parkingSpotNumber: data.parkingSpotNumber,
          expirationDate: data.expirationDate,
          notes: data.notes,
          qrCodeUrl: `${window.location.origin}/permit/permit-${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user", // In real app, get from auth context
        };

        console.log("Adding new permit to context:", newPermit);
        addPermit(newPermit);

        toast({
          title: "Permit Created",
          description: `Permit ${newPermit.permitNumber} has been created successfully.`,
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save permit. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {permit ? "Edit Parking Permit" : "Create New Parking Permit"}
          </DialogTitle>
        </DialogHeader>
        <PermitForm
          permit={permit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          preselectedLotId={preselectedLotId}
        />
      </DialogContent>
    </Dialog>
  );
}
