import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { PermitDialog } from "@/components/PermitDialog";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Car,
  LogOut,
  Edit,
  QrCode,
  Calendar,
  MapPin,
  User,
  Building,
  Settings,
} from "lucide-react";
import { Permit, PermitType } from "@shared/api";

// Mock data for demonstration
const mockPermits: Permit[] = [
  {
    id: "1",
    permitNumber: "PMT-001-2024",
    holderName: "John Smith",
    permitType: "resident",
    lotId: "lot-a",
    unitNumber: "12A",
    occupantStatus: "leaseholder",
    vehicle: {
      make: "Toyota",
      model: "Camry",
      licensePlate: "ABC-123",
      imageUrl:
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
    },
    parkingSpotNumber: "A-15",
    expirationDate: "2024-12-31",
    notes: "Primary resident vehicle",
    qrCodeUrl: "https://example.com/permit/1",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    permitNumber: "PMT-002-2024",
    holderName: "Sarah Johnson",
    permitType: "retail_tenant",
    lotId: "retail-1",
    unitNumber: "Suite 205",
    occupantStatus: "business_owner",
    vehicle: {
      make: "Honda",
      model: "CR-V",
      licensePlate: "XYZ-789",
      imageUrl:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop",
    },
    parkingSpotNumber: "R-08",
    expirationDate: "2024-11-30",
    qrCodeUrl: "https://example.com/permit/2",
    isActive: true,
    createdAt: "2024-02-01T14:30:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    createdBy: "1",
  },
  {
    id: "3",
    permitNumber: "PMT-003-2024",
    holderName: "Mike Chen",
    permitType: "other",
    lotId: "lot-b",
    unitNumber: "Visitor",
    occupantStatus: "additional_occupant",
    vehicle: {
      make: "BMW",
      model: "X3",
      licensePlate: "VIS-456",
      imageUrl:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop",
    },
    parkingSpotNumber: "B-22",
    expirationDate: "2024-06-15",
    notes: "Temporary visitor permit - 3 months",
    qrCodeUrl: "https://example.com/permit/3",
    isActive: false,
    createdAt: "2024-03-10T09:15:00Z",
    updatedAt: "2024-03-10T09:15:00Z",
    createdBy: "2",
  },
];

const lotNames = {
  "lot-a": "Lot A",
  "lot-b": "Lot B",
  "retail-1": "Retail Lot 1",
};

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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [permitDialogOpen, setPermitDialogOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | undefined>(
    undefined,
  );

  // Filter permits based on user's assigned lots
  const accessiblePermits = useMemo(() => {
    return mockPermits.filter((permit) =>
      user?.assignedLots.includes(permit.lotId),
    );
  }, [user?.assignedLots]);

  // Filter permits based on search term
  const filteredPermits = useMemo(() => {
    if (!searchTerm) return accessiblePermits;

    const search = searchTerm.toLowerCase();
    return accessiblePermits.filter(
      (permit) =>
        permit.permitNumber.toLowerCase().includes(search) ||
        permit.holderName.toLowerCase().includes(search) ||
        permit.vehicle.licensePlate.toLowerCase().includes(search) ||
        lotNames[permit.lotId as keyof typeof lotNames]
          .toLowerCase()
          .includes(search),
    );
  }, [accessiblePermits, searchTerm]);

  const canEdit = user?.role === "editor" || user?.role === "admin";
  const canManageUsers = user?.role === "admin";

  const handleCreatePermit = () => {
    setEditingPermit(undefined);
    setPermitDialogOpen(true);
  };

  const handleEditPermit = (permit: Permit) => {
    setEditingPermit(permit);
    setPermitDialogOpen(true);
  };

  const handlePermitDialogClose = () => {
    setPermitDialogOpen(false);
    setEditingPermit(undefined);
  };

  const handlePermitSuccess = () => {
    // In a real app, you'd refetch the permits data here
    // For now, we'll just close the dialog
    console.log("Permit saved successfully");
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
                      {user?.name.charAt(0).toUpperCase()}
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
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate("/user-management")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>User Management</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/lot-management")}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Lot Management</span>
                    </DropdownMenuItem>
                  </>
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
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Parking Permits
              </h1>
              <p className="text-muted-foreground">
                Manage and view parking permits for your assigned lots
              </p>
            </div>
            {canEdit && (
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={handleCreatePermit}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Permit
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Permits
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accessiblePermits.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In your assigned lots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Permits
                </CardTitle>
                <Badge className="h-4 w-4 rounded-full bg-permit-active"></Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accessiblePermits.filter((p) => p.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    accessiblePermits.filter(
                      (p) =>
                        isExpiringSoon(p.expirationDate) &&
                        !isExpired(p.expirationDate),
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Within 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assigned Lots
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.assignedLots.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lot access granted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <CardTitle>Permits Management</CardTitle>
                </div>
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search permits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permit #</TableHead>
                      <TableHead>Holder</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Spot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermits.map((permit) => (
                      <TableRow key={permit.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-primary hover:underline"
                            onClick={() => navigate(`/permit/${permit.id}`)}
                          >
                            {permit.permitNumber}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {permit.holderName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {permit.unitNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPermitTypeColor(permit.permitType)}
                          >
                            {getPermitTypeLabel(permit.permitType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {lotNames[permit.lotId as keyof typeof lotNames]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {permit.vehicle.make} {permit.vehicle.model}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {permit.vehicle.licensePlate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {permit.parkingSpotNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(
                              permit.expirationDate,
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <QrCode className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPermit(permit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Permit Dialog */}
        <PermitDialog
          open={permitDialogOpen}
          onOpenChange={setPermitDialogOpen}
          permit={editingPermit}
          onSuccess={handlePermitSuccess}
        />
      </div>
    </AuthGuard>
  );
}
