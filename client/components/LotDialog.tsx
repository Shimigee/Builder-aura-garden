import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LotForm } from "./LotForm";
import { Lot } from "@shared/api";
import { toast } from "@/hooks/use-toast";

interface CreateLotRequest {
  name: string;
  description?: string;
  totalSpots: number;
}

interface LotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot?: Lot;
  onSuccess?: (savedLot?: Lot) => void;
}

export function LotDialog({
  open,
  onOpenChange,
  lot,
  onSuccess,
}: LotDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateLotRequest) => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would call your API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let savedLot: Lot;

      if (lot) {
        // Update existing lot
        savedLot = {
          ...lot,
          name: data.name,
          description: data.description,
          totalSpots: data.totalSpots,
          // Keep existing availableSpots or adjust proportionally
          availableSpots: Math.min(lot.availableSpots, data.totalSpots),
        };

        toast({
          title: "Lot Updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new lot
        savedLot = {
          id: `lot-${Date.now()}`, // Simple ID generation
          name: data.name,
          description: data.description,
          totalSpots: data.totalSpots,
          availableSpots: data.totalSpots, // Start with all spots available
        };

        toast({
          title: "Lot Created",
          description: `${data.name} has been created successfully.`,
        });
      }

      onOpenChange(false);
      onSuccess?.(savedLot);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lot. Please try again.",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lot ? "Edit Parking Lot" : "Create New Parking Lot"}
          </DialogTitle>
        </DialogHeader>
        <LotForm
          lot={lot}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
