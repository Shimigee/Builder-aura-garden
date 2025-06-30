import { createClient } from "@supabase/supabase-js";

// These will be environment variables in production
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "viewer" | "editor" | "admin";
          assigned_lots: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "viewer" | "editor" | "admin";
          assigned_lots?: string[];
        };
        Update: {
          full_name?: string;
          role?: "viewer" | "editor" | "admin";
          assigned_lots?: string[];
        };
      };
      lots: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          total_spots: number;
          available_spots: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          total_spots: number;
          available_spots: number;
        };
        Update: {
          name?: string;
          description?: string;
          total_spots?: number;
          available_spots?: number;
        };
      };
      permits: {
        Row: {
          id: string;
          permit_number: string;
          holder_name: string;
          permit_type: "resident" | "retail_tenant" | "other";
          lot_id: string;
          unit_number: string;
          occupant_status:
            | "leaseholder"
            | "additional_occupant"
            | "business_owner"
            | "employee";
          vehicle_make: string;
          vehicle_model: string;
          vehicle_license_plate: string;
          vehicle_image_url: string | null;
          parking_spot_number: string;
          expiration_date: string;
          notes: string | null;
          qr_code_url: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          permit_number: string;
          holder_name: string;
          permit_type: "resident" | "retail_tenant" | "other";
          lot_id: string;
          unit_number: string;
          occupant_status:
            | "leaseholder"
            | "additional_occupant"
            | "business_owner"
            | "employee";
          vehicle_make: string;
          vehicle_model: string;
          vehicle_license_plate: string;
          vehicle_image_url?: string;
          parking_spot_number: string;
          expiration_date: string;
          notes?: string;
          qr_code_url?: string;
          is_active?: boolean;
          created_by?: string;
        };
        Update: {
          holder_name?: string;
          permit_type?: "resident" | "retail_tenant" | "other";
          unit_number?: string;
          occupant_status?:
            | "leaseholder"
            | "additional_occupant"
            | "business_owner"
            | "employee";
          vehicle_make?: string;
          vehicle_model?: string;
          vehicle_license_plate?: string;
          vehicle_image_url?: string;
          parking_spot_number?: string;
          expiration_date?: string;
          notes?: string;
          is_active?: boolean;
        };
      };
    };
  };
};
