import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { UserDialog } from "@/components/UserDialog";
import { useAuth } from "@/hooks/use-auth-real";
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
  Users,
  Shield,
  MapPin,
} from "lucide-react";
import { User, UserRole } from "@shared/api";

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@parkingsystem.com",
    name: "Admin User",
    role: "admin",
    assignedLots: ["lot-a", "lot-b", "retail-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "editor@parkingsystem.com",
    name: "Editor User",
    role: "editor",
    assignedLots: ["lot-a"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    email: "viewer@parkingsystem.com",
    name: "Viewer User",
    role: "viewer",
    assignedLots: ["retail-1"],
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "4",
    email: "security@parkingsystem.com",
    name: "Security Team",
    role: "viewer",
    assignedLots: ["lot-a", "lot-b"],
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "5",
    email: "manager@parkingsystem.com",
    name: "Property Manager",
    role: "editor",
    assignedLots: ["lot-b", "retail-1"],
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
];

// Start with empty lot names - in real app, this would come from API
const lotNames: Record<string, string> = {};

function getRoleColor(role: UserRole) {
  const colors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    editor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    viewer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  return colors[role];
}

function getRoleLabel(role: UserRole) {
  const labels = {
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  };
  return labels[role];
}

export default function UserManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return mockUsers;

    const search = searchTerm.toLowerCase();
    return mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        getRoleLabel(user.role).toLowerCase().includes(search),
    );
  }, [searchTerm]);

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, you'd make an API call to delete the user
    console.log("Delete user:", userId);
  };

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
                <DropdownMenuItem onClick={() => navigate("/lot-management")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Lot Management</span>
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
            <span className="font-medium text-foreground">User Management</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage system users, roles, and lot assignments
              </p>
            </div>
            <Button size="lg" onClick={handleCreateUser}>
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  System-wide users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter((u) => u.role === "admin").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Full access users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Editors</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter((u) => u.role === "editor").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Can edit permits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viewers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter((u) => u.role === "viewer").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Read-only access
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>System Users</CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
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
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Lots</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.assignedLots.map((lotId) => (
                              <Badge
                                key={lotId}
                                variant="outline"
                                className="text-xs"
                              >
                                {lotNames[lotId as keyof typeof lotNames]}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.id !== "1" && ( // Don't allow deleting the main admin
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* User Dialog */}
        <UserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          user={editingUser}
          onSuccess={() => {
            // In a real app, you'd refetch the users data here
            console.log("User saved successfully");
          }}
        />
      </div>
    </AuthGuard>
  );
}
