import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreatePermitRequest,
  Permit,
  PermitType,
  OccupantStatus,
} from "@shared/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Save,
  Car,
  User,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Camera,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface PermitFormProps {
  permit?: Permit;
  onSubmit: (data: CreatePermitRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const lotOptions = [
  { value: "lot-a", label: "Lot A" },
  { value: "lot-b", label: "Lot B" },
  { value: "retail-1", label: "Retail Lot 1" },
];

const permitTypeOptions: { value: PermitType; label: string }[] = [
  { value: "resident", label: "Resident" },
  { value: "retail_tenant", label: "Retail Tenant" },
  { value: "other", label: "Other" },
];

const occupantStatusOptions: { value: OccupantStatus; label: string }[] = [
  { value: "leaseholder", label: "Leaseholder" },
  { value: "additional_occupant", label: "Additional Occupant" },
  { value: "business_owner", label: "Business Owner" },
  { value: "employee", label: "Employee" },
];

export function PermitForm({
  permit,
  onSubmit,
  onCancel,
  isLoading = false,
}: PermitFormProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [selectedPermitType, setSelectedPermitType] =
    useState<PermitType | null>(permit?.permitType || null);
  const [vehicleImage, setVehicleImage] = useState<string | undefined>(
    permit?.vehicle.imageUrl,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePermitRequest>({
    defaultValues: permit
      ? {
          holderName: permit.holderName,
          permitType: permit.permitType,
          lotId: permit.lotId,
          unitNumber: permit.unitNumber,
          occupantStatus: permit.occupantStatus,
          vehicle: permit.vehicle,
          parkingSpotNumber: permit.parkingSpotNumber,
          expirationDate: permit.expirationDate,
          notes: permit.notes,
        }
      : {
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 1 year from now
        },
  });

  const watchedLotId = watch("lotId");
  const watchedPermitType = watch("permitType");

  // Filter lots based on user's access
  const availableLots = lotOptions.filter((lot) =>
    user?.assignedLots.includes(lot.value),
  );

  // Filter occupant status based on permit type
  const getOccupantStatusOptions = (permitType: PermitType) => {
    switch (permitType) {
      case "resident":
        return occupantStatusOptions.filter((opt) =>
          ["leaseholder", "additional_occupant"].includes(opt.value),
        );
      case "retail_tenant":
        return occupantStatusOptions.filter((opt) =>
          ["business_owner", "employee"].includes(opt.value),
        );
      case "other":
        return occupantStatusOptions;
      default:
        return [];
    }
  };

  const handleFormSubmit = async (data: CreatePermitRequest) => {
    try {
      setError(null);
      // Include vehicle image in the form data
      const formDataWithImage = {
        ...data,
        vehicle: {
          ...data.vehicle,
          imageUrl: vehicleImage,
        },
      };
      await onSubmit(formDataWithImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permit");
    }
  };

  const generatePermitNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `PMT-${random}-${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {permit ? "Edit Permit" : "Create New Permit"}
        </h2>
        <p className="text-muted-foreground">
          {permit
            ? "Update parking permit information"
            : "Fill in all required information to create a new parking permit"}
        </p>
        {permit && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {permit.permitNumber}
            </Badge>
            {permit.qrCodeUrl && (
              <Badge variant="secondary">QR Code Generated</Badge>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Permit Holder Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Permit Holder Information</span>
            </CardTitle>
            <CardDescription>
              Basic information about the permit holder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holderName">Holder Name *</Label>
                <Input
                  id="holderName"
                  placeholder="Enter full name"
                  {...register("holderName", {
                    required: "Holder name is required",
                  })}
                />
                {errors.holderName && (
                  <p className="text-sm text-destructive">
                    {errors.holderName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number *</Label>
                <Input
                  id="unitNumber"
                  placeholder="e.g., 12A, Suite 205, Visitor"
                  {...register("unitNumber", {
                    required: "Unit number is required",
                  })}
                />
                {errors.unitNumber && (
                  <p className="text-sm text-destructive">
                    {errors.unitNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permitType">Permit Type *</Label>
                <Select
                  value={watchedPermitType}
                  onValueChange={(value: PermitType) => {
                    setValue("permitType", value);
                    setSelectedPermitType(value);
                    setValue("occupantStatus", "" as OccupantStatus);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {permitTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.permitType && (
                  <p className="text-sm text-destructive">
                    {errors.permitType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupantStatus">Occupant Status *</Label>
                <Select
                  value={watch("occupantStatus")}
                  onValueChange={(value: OccupantStatus) =>
                    setValue("occupantStatus", value)
                  }
                  disabled={!watchedPermitType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedPermitType &&
                      getOccupantStatusOptions(watchedPermitType).map(
                        (option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ),
                      )}
                  </SelectContent>
                </Select>
                {errors.occupantStatus && (
                  <p className="text-sm text-destructive">
                    {errors.occupantStatus.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Vehicle Information</span>
            </CardTitle>
            <CardDescription>
              Details about the vehicle for this permit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">Make *</Label>
                <Input
                  id="vehicleMake"
                  placeholder="e.g., Toyota"
                  {...register("vehicle.make", {
                    required: "Vehicle make is required",
                  })}
                />
                {errors.vehicle?.make && (
                  <p className="text-sm text-destructive">
                    {errors.vehicle.make.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model *</Label>
                <Input
                  id="vehicleModel"
                  placeholder="e.g., Camry"
                  {...register("vehicle.model", {
                    required: "Vehicle model is required",
                  })}
                />
                {errors.vehicle?.model && (
                  <p className="text-sm text-destructive">
                    {errors.vehicle.model.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleLicensePlate">License Plate *</Label>
                <Input
                  id="vehicleLicensePlate"
                  placeholder="e.g., ABC-123"
                  {...register("vehicle.licensePlate", {
                    required: "License plate is required",
                  })}
                />
                {errors.vehicle?.licensePlate && (
                  <p className="text-sm text-destructive">
                    {errors.vehicle.licensePlate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Vehicle Photo</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload a photo of the vehicle for identification purposes
                </p>
              </div>
              <ImageUpload
                value={vehicleImage}
                onChange={setVehicleImage}
                label=""
                description=""
                maxSizeMB={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parking Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Parking Assignment</span>
            </CardTitle>
            <CardDescription>Lot and parking spot assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotId">Parking Lot *</Label>
                <Select
                  value={watchedLotId}
                  onValueChange={(value) => setValue("lotId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parking lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLots.map((lot) => (
                      <SelectItem key={lot.value} value={lot.value}>
                        {lot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lotId && (
                  <p className="text-sm text-destructive">
                    {errors.lotId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingSpotNumber">Parking Spot *</Label>
                <Input
                  id="parkingSpotNumber"
                  placeholder="e.g., A-15, R-08"
                  {...register("parkingSpotNumber", {
                    required: "Parking spot number is required",
                  })}
                />
                {errors.parkingSpotNumber && (
                  <p className="text-sm text-destructive">
                    {errors.parkingSpotNumber.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Permit Details</span>
            </CardTitle>
            <CardDescription>
              Expiration date and additional notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date *</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  {...register("expirationDate", {
                    required: "Expiration date is required",
                  })}
                />
                {errors.expirationDate && (
                  <p className="text-sm text-destructive">
                    {errors.expirationDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this permit..."
                rows={3}
                {...register("notes")}
              />
            </div>
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
                {permit ? "Update Permit" : "Create Permit"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
