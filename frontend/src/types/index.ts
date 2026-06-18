export interface UserProfile {
  id: string;
  name: string;
  role: "guard" | "host" | "admin";
  property_id: string;
}

export interface HostOption {
  id: string;
  name: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  host_id: string | null;
  host_name: string | null;
  purpose: string | null;
  checked_in_at: string;
  checked_out_at: string | null;
  badge_number: string | null;
  property_id: string;
  logged_by: string;
}

export interface BadgeData {
  id: string;
  name: string;
  host_name: string;
  purpose: string | null;
  badge_number: string | null;
  checked_in_at: string;
  photo_url: string | null;
  property_name: string;
}
