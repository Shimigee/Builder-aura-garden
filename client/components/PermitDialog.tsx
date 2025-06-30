import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermitForm } from "./PermitForm";
import { CreatePermitRequest, Permit } from "@shared/api";
import { toast } from "@/hooks/use-toast";

interface PermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permit?: Permit;
  onSuccess?: () => void;
}

export function PermitDialog({
  open,
  onOpenChange,
  permit,
  onSuccess,
}: PermitDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePermitRequest) => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would call your API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (permit) {
        // Update existing permit
        toast({
          title: "Permit Updated",
          description: `Permit ${permit.permitNumber} has been updated successfully.`,
        });
      } else {
        // Create new permit
        const newPermitNumber = `PMT-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}-${new Date().getFullYear()}`;
        toast({
          title: "Permit Created",
          description: `New permit ${newPermitNumber} has been created successfully.`,
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
        />
      </DialogContent>
    </Dialog>
  );
}
