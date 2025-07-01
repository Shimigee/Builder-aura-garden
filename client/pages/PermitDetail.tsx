import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { PermitDialog } from "@/components/PermitDialog";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { useAuth } from "@/hooks/use-auth-ultra-simple";
import { useLots } from "@/hooks/use-lots-supabase";
import { usePermits } from "@/hooks/use-permits-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Car,
  LogOut,
  Edit,
  QrCode,
  Calendar,
  MapPin,
  User,
  Building,
  Settings,
  Download,
  Share,
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Permit, PermitType } from "@shared/api";

function getPermitTypeLabel(type: PermitType) {
  const labels = {
    resident: "Resident",
    retail_tenant: "Retail Tenant",
    other: "Other",
  };
  return labels[type];
}

function getPermitTypeColor(type: PermitType) {
  const colors = {
    resident: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    retail_tenant:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return colors[type];
}

function getOccupantStatusLabel(status: string) {
  const labels = {
    leaseholder: "Leaseholder",
    additional_occupant: "Additional Occupant",
    business_owner: "Business Owner",
    employee: "Employee",
  };
  return labels[status as keyof typeof labels] || status;
}

function isExpiringSoon(expirationDate: string) {
  const expiry = new Date(expirationDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return daysUntilExpiry <= 30;
}

function isExpired(expirationDate: string) {
  const expiry = new Date(expirationDate);
  const today = new Date();
  return expiry < today;
}

function getStatusIcon(permit: Permit) {
  if (!permit.isActive) {
    return <XCircle className="h-5 w-5 text-gray-500" />;
  } else if (isExpired(permit.expirationDate)) {
    return <XCircle className="h-5 w-5 text-red-500" />;
  } else if (isExpiringSoon(permit.expirationDate)) {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  } else {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
}

export default function PermitDetail() {
  const { permitId } = useParams<{ permitId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPermitById } = usePermits();
  const { getLotName } = useLots();
  const [permitDialogOpen, setPermitDialogOpen] = useState(false);

  // Find permit by ID
  const permit = permitId ? getPermitById(permitId) : undefined;

  if (!permit) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Permit Not Found</h1>
            <p className="text-muted-foreground">
              The requested permit could not be found.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Check if user has access to this permit's lot
  const hasAccess =
    user?.role === "admin" || user?.assignedLots.includes(permit.lotId);
  if (!hasAccess) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to view this permit.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const canEdit = user?.role === "editor" || user?.role === "admin";
  const canManageUsers = user?.role === "admin";

  const handleEdit = () => {
    setPermitDialogOpen(true);
  };

  const handlePermitSuccess = () => {
    console.log("Permit updated successfully");
  };

  const handleDownloadQR = () => {
    // In a real app, this would generate and download a QR code
    console.log("Download QR code for permit:", permit.permitNumber);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Parking Permit ${permit.permitNumber}`,
        text: `View parking permit for ${permit.holderName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  ParkMaster
                </h1>
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canManageUsers && (
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="h-8 px-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Dashboard
            </Button>
            <span>/</span>
            <span className="font-medium text-foreground">Permit Details</span>
          </div>

          {/* Permit Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {permit.permitNumber}
                </h1>
                {getStatusIcon(permit)}
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getPermitTypeColor(permit.permitType)}>
                  {getPermitTypeLabel(permit.permitType)}
                </Badge>
                <Badge variant="outline">{getLotName(permit.lotId)}</Badge>
                <Badge variant="outline">{permit.parkingSpotNumber}</Badge>
              </div>
              <p className="text-muted-foreground">
                Created on {new Date(permit.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownloadQR}>
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Button>
              {canEdit && (
                <Button onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Permit
                </Button>
              )}
            </div>
          </div>

          {/* Permit Details Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Permit Holder Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Permit Holder</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{permit.holderName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Number</p>
                  <p className="font-medium">{permit.unitNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {getOccupantStatusLabel(permit.occupantStatus)}
                  </p>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-medium">
                    {permit.vehicle.make} {permit.vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium font-mono">
                    {permit.vehicle.licensePlate}
                  </p>
                </div>
                {permit.vehicle.imageUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vehicle Photo
                    </p>
                    <img
                      src={permit.vehicle.imageUrl}
                      alt={`${permit.vehicle.make} ${permit.vehicle.model}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parking Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Parking Assignment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lot</p>
                  <p className="font-medium">{getLotName(permit.lotId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spot Number</p>
                  <p className="font-medium">{permit.parkingSpotNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center space-x-2">
                    {!permit.isActive ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : isExpired(permit.expirationDate) ? (
                      <Badge className="bg-permit-expired text-white">
                        Expired
                      </Badge>
                    ) : isExpiringSoon(permit.expirationDate) ? (
                      <Badge className="bg-permit-warning text-white">
                        Expiring Soon
                      </Badge>
                    ) : (
                      <Badge className="bg-permit-active text-white">
                        Active
                      </Badge>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expiration Date
                  </p>
                  <p className="font-medium">
                    {new Date(permit.expirationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(permit.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(permit.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <QRCodeGenerator
                    value={permit.id}
                    size={180}
                    className="border-2 border-muted"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Scan this code to quickly access permit information
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDownloadQR}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {permit.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{permit.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Edit Permit Dialog */}
        <PermitDialog
          open={permitDialogOpen}
          onOpenChange={setPermitDialogOpen}
          permit={permit}
          onSuccess={handlePermitSuccess}
        />
      </div>
    </AuthGuard>
  );
}
