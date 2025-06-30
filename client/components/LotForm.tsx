import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lot } from "@shared/api";
import { Save, MapPin, Building } from "lucide-react";

interface CreateLotRequest {
  name: string;
  description?: string;
  totalSpots: number;
}

interface LotFormProps {
  lot?: Lot;
  onSubmit: (data: CreateLotRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LotForm({
  lot,
  onSubmit,
  onCancel,
  isLoading = false,
}: LotFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLotRequest>({
    defaultValues: lot
      ? {
          name: lot.name,
          description: lot.description,
          totalSpots: lot.totalSpots,
        }
      : {
          totalSpots: 50, // Default to 50 spots
        },
  });

  const handleFormSubmit = async (data: CreateLotRequest) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lot");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {lot ? "Edit Parking Lot" : "Create New Parking Lot"}
        </h2>
        <p className="text-muted-foreground">
          {lot
            ? "Update parking lot information and capacity"
            : "Fill in lot details to create a new parking area"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Lot Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Lot Information</span>
            </CardTitle>
            <CardDescription>
              Basic information about the parking lot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Lot Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Lot A, Retail Lot 1"
                {...register("name", {
                  required: "Lot name is required",
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the lot (e.g., Main residential parking area)"
                rows={3}
                {...register("description")}
              />
              <p className="text-xs text-muted-foreground">
                Provide a brief description to help users identify this lot
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Capacity Settings</span>
            </CardTitle>
            <CardDescription>
              Configure the total number of parking spots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalSpots">Total Parking Spots *</Label>
              <Input
                id="totalSpots"
                type="number"
                min="1"
                max="1000"
                placeholder="50"
                {...register("totalSpots", {
                  required: "Total spots is required",
                  min: {
                    value: 1,
                    message: "Must have at least 1 spot",
                  },
                  max: {
                    value: 1000,
                    message: "Cannot exceed 1000 spots",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.totalSpots && (
                <p className="text-sm text-destructive">
                  {errors.totalSpots.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The maximum number of vehicles that can park in this lot
              </p>
            </div>

            {lot && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Current Availability:</span>
                  <span className="text-sm text-muted-foreground">
                    {lot.availableSpots} of {lot.totalSpots} spots available
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        ((lot.totalSpots - lot.availableSpots) /
                          lot.totalSpots) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(
                    ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) *
                      100,
                  )}
                  % occupied
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col-reverse space-y-2 space-y-reverse sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {lot ? "Update Lot" : "Create Lot"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
