import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CreateUserRequest, User, UserRole } from "@shared/api";
import { Save, User as UserIcon, Shield, MapPin } from "lucide-react";

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "viewer",
    label: "Viewer",
    description: "Can view permits for assigned lots only",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Can view and edit permits for assigned lots",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full system access including user management",
  },
];

// Start with empty lots - in real app, this would come from API
const lotOptions: { id: string; name: string }[] = [];

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<string[]>(
    user?.assignedLots || [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    defaultValues: user
      ? {
          email: user.email,
          name: user.name,
          role: user.role,
          assignedLots: user.assignedLots,
          password: "", // Don't pre-fill password for existing users
        }
      : {
          role: "viewer",
          assignedLots: [],
        },
  });

  const watchedRole = watch("role");

  const handleFormSubmit = async (data: CreateUserRequest) => {
    try {
      setError(null);

      // Validate that at least one lot is assigned
      if (selectedLots.length === 0) {
        throw new Error("Please assign at least one lot to the user");
      }

      const formData = {
        ...data,
        assignedLots: selectedLots,
      };

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    }
  };

  const handleLotToggle = (lotId: string, checked: boolean) => {
    if (checked) {
      setSelectedLots([...selectedLots, lotId]);
    } else {
      setSelectedLots(selectedLots.filter((id) => id !== lotId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {user ? "Edit User" : "Create New User"}
        </h2>
        <p className="text-muted-foreground">
          {user
            ? "Update user information and permissions"
            : "Fill in user details to create a new account"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>Basic information about the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {user ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  user
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                {...register("password", {
                  required: user ? false : "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role and Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Role and Permissions</span>
            </CardTitle>
            <CardDescription>
              Set the user's role and system permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Role *</Label>
              <Select
                value={watchedRole}
                onValueChange={(value: UserRole) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            {watchedRole && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2">
                  {roleOptions.find((r) => r.value === watchedRole)?.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {
                    roleOptions.find((r) => r.value === watchedRole)
                      ?.description
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lot Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Lot Assignment</span>
            </CardTitle>
            <CardDescription>
              Select which parking lots this user can access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {lotOptions.map((lot) => (
                <div key={lot.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={lot.id}
                    checked={selectedLots.includes(lot.id)}
                    onCheckedChange={(checked) =>
                      handleLotToggle(lot.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={lot.id} className="text-sm font-medium">
                    {lot.name}
                  </Label>
                </div>
              ))}
            </div>

            {selectedLots.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Lots:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLots.map((lotId) => {
                    const lot = lotOptions.find((l) => l.id === lotId);
                    return (
                      <Badge key={lotId} variant="secondary">
                        {lot?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedLots.length === 0 && (
              <p className="text-sm text-destructive">
                Please select at least one lot for this user
              </p>
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
                {user ? "Update User" : "Create User"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
