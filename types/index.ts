export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  organization?: string | null;
  role?: string | null;
  notes?: string | null;
  ticket_type?: string | null;
  checked_in?: boolean | null;
  payment_id?: string | null;
  order_id?: string | null;
  payment_status?: string | null;
  amount_paid?: string | null;
  currency?: string | null;
  created_at: string;
}

export interface RegistrationStats {
  total: number;
  organizations: number;
  avgAge: number;
  checkedInCount?: number;
  passStatus?: {
    label: string;
    status: string;
    details: string;
  };
}

export interface AdminSession {
  isAuthenticated: boolean;
  token?: string;
  role?: 'admin';
  expiresAt?: string;
}

export interface LookupRegistrationResult {
  success: boolean;
  user?: Registration;
  message?: string;
}

// Multi-Event Types
export interface FormFieldConfig {
  enabled: boolean;
  required: boolean;
  label?: string;
}

export interface CustomFieldItem {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormFields {
  name: FormFieldConfig;
  email: FormFieldConfig;
  phone: FormFieldConfig;
  age: FormFieldConfig;
  organization: FormFieldConfig;
  role: FormFieldConfig;
  dietary: FormFieldConfig;
  tshirt_size: FormFieldConfig;
  notes: FormFieldConfig;
  custom_items?: CustomFieldItem[];
}

export interface SessionTrack {
  id: string;
  title: string;
  speaker: string;
  time: string;
  track: string;
  capacity?: number;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  media_url?: string | null;
  media_type?: 'video' | 'image';
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  max_capacity: number;
  status: 'draft' | 'published' | 'archived';
  form_fields: FormFields;
  sessions: SessionTrack[];
  created_at: string;
  registration_count?: number;
  recent_attendees?: Array<{ name: string; organization?: string | null }>;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  attendee_id: string;
  name: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  organization?: string | null;
  role?: string | null;
  notes?: string | null;
  dietary?: string | null;
  tshirt_size?: string | null;
  interest_tags: string[];
  session_wishlist: string[];
  custom_fields?: Record<string, string>;
  checked_in: boolean;
  is_early_bird: boolean;
  created_at: string;
  event_title?: string;
  event_slug?: string;
  event_start_date?: string;
  event_end_date?: string;
}
