import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { LotDialog } from "@/components/LotDialog";
import { useAuth } from "@/hooks/use-auth";
import { useLots } from "@/hooks/use-lots";
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
  ArrowLeft,
  Car,
  LogOut,
  Edit,
  Plus,
  Search,
  Trash2,
  MapPin,
  Users,
  Square,
} from "lucide-react";
import { Lot } from "@shared/api";

function getOccupancyColor(availableSpots: number, totalSpots: number) {
  const occupancyRate = (totalSpots - availableSpots) / totalSpots;
  if (occupancyRate >= 0.9)
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (occupancyRate >= 0.7)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
}

export default function LotManagement() {
  const { user, logout } = useAuth();
  const { lots, addLot, updateLot, deleteLot } = useLots();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lotDialogOpen, setLotDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | undefined>(undefined);

  // Filter lots based on search term
  const filteredLots = useMemo(() => {
    if (!searchTerm) return lots;

    const search = searchTerm.toLowerCase();
    return lots.filter(
      (lot) =>
        lot.name.toLowerCase().includes(search) ||
        (lot.description && lot.description.toLowerCase().includes(search)),
    );
  }, [searchTerm]);

  const handleCreateLot = () => {
    setEditingLot(undefined);
    setLotDialogOpen(true);
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setLotDialogOpen(true);
  };

  const handleDeleteLot = (lotId: string) => {
    deleteLot(lotId);
  };

  const handleLotSaved = (savedLot?: Lot) => {
    // Refresh the lots list after successful save
    if (savedLot) {
      if (editingLot) {
        // Update existing lot
        updateLot(savedLot);
      } else {
        // Add new lot
        addLot(savedLot);
      }
    }
  };

  const totalSpots = lots.reduce((sum, lot) => sum + lot.totalSpots, 0);
  const totalAvailable = lots.reduce((sum, lot) => sum + lot.availableSpots, 0);
  const totalOccupied = totalSpots - totalAvailable;

  return (
    <AuthGuard requiredRole="admin">
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
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Car className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/user-management")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </DropdownMenuItem>
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
            <span className="font-medium text-foreground">Lot Management</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Lot Management
              </h1>
              <p className="text-muted-foreground">
                Manage parking lots, capacity, and availability
              </p>
            </div>
            <Button size="lg" onClick={handleCreateLot}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Lot
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Lots
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lots.length}</div>
                <p className="text-xs text-muted-foreground">Parking areas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spots
                </CardTitle>
                <Square className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSpots}</div>
                <p className="text-xs text-muted-foreground">
                  All parking spots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOccupied}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((totalOccupied / totalSpots) * 100)}% occupancy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <div className="h-4 w-4 bg-green-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAvailable}</div>
                <p className="text-xs text-muted-foreground">Spots available</p>
              </CardContent>
            </Card>
          </div>

          {/* Lots Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>Parking Lots</CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search lots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lot Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLots.map((lot) => {
                      const occupancyRate =
                        (lot.totalSpots - lot.availableSpots) / lot.totalSpots;
                      return (
                        <TableRow key={lot.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{lot.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {lot.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {lot.description || "No description"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{lot.totalSpots}</div>
                            <div className="text-sm text-muted-foreground">
                              total spots
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {lot.availableSpots}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              available
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getOccupancyColor(
                                lot.availableSpots,
                                lot.totalSpots,
                              )}
                            >
                              {Math.round(occupancyRate * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLot(lot)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLot(lot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Lot Dialog */}
        <LotDialog
          open={lotDialogOpen}
          onOpenChange={setLotDialogOpen}
          lot={editingLot}
          onSuccess={handleLotSaved}
        />
      </div>
    </AuthGuard>
  );
}
