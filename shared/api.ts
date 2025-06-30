/**
 * Shared types for Parking Permit Management System
 */

export type UserRole = "viewer" | "editor" | "admin";

export type PermitType = "resident" | "retail_tenant" | "other";

export type OccupantStatus =
  | "leaseholder"
  | "additional_occupant"
  | "business_owner"
  | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLots: string[]; // Array of lot IDs user has access to
  createdAt: string;
  updatedAt: string;
}

export interface Lot {
  id: string;
  name: string; // e.g., "Lot A", "Retail Lot 1"
  description?: string;
  totalSpots: number;
  availableSpots: number;
}

export interface Permit {
  id: string;
  permitNumber: string; // Unique permit identifier
  holderName: string;
  permitType: PermitType;
  lotId: string;
  unitNumber: string;
  occupantStatus: OccupantStatus;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
  };
  parkingSpotNumber: string;
  expirationDate: string;
  notes?: string;
  qrCodeUrl: string; // URL for QR code access
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID who created the permit
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePermitRequest {
  holderName: string;
  permitType: PermitType;
  lotId: string;
  unitNumber: string;
  occupantStatus: OccupantStatus;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
  };
  parkingSpotNumber: string;
  expirationDate: string;
  notes?: string;
}

export interface UpdatePermitRequest extends Partial<CreatePermitRequest> {
  isActive?: boolean;
}

export interface PermitsResponse {
  permits: Permit[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  assignedLots: string[];
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  assignedLots?: string[];
}

export interface LotsResponse {
  lots: Lot[];
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}
