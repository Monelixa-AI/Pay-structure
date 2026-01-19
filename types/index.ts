export type Currency = 'TRY' | 'USD' | 'EUR';
export type ProductType = 'one_time' | 'subscription';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionPaymentMode = 'recurring' | 'upfront'; // recurring = aylık ödeme, upfront = peşin toplu ödeme

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '\u20ba',
  USD: '$',
  EUR: '\u20ac',
};

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
  type: ProductType;
  billing_period: BillingPeriod | null;
  features: string[];
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  metadata?: Record<string, any> | null;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  // Süreli subscription alanları
  subscription_duration: number | null; // null = sınırsız, sayı = ay cinsinden sabit süre
  duration_options: number[] | null; // [3, 6, 12] gibi kullanıcı seçenekleri (null ise seçenek yok)
  allow_payment_mode_choice: boolean; // true ise kullanıcı peşin/aylık seçebilir
  default_payment_mode: SubscriptionPaymentMode; // varsayılan ödeme modu
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  stripe_customer_id: string | null;
  avatar_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type PlanType = 'monthly' | 'yearly';
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'cancelled'
  | 'past_due'
  | 'incomplete'
  | 'trialing'
  | 'paused'
  | 'expired'
  | 'pending';

export interface Subscription {
  id: string;
  customer_id: string;
  product_id: string;
  stripe_subscription_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  payment_gateway: 'stripe' | 'paytr';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  product?: Product;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';
export type PaymentProvider = 'stripe' | 'paytr';

export interface Order {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  subscription_id: string | null;
  product_id: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_provider: PaymentProvider;
  provider_session_id: string | null;
  provider_payment_id: string | null;
  invoice_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  product?: Product;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string | null;
  updated_at: string;
}

export interface SettingsMap {
  [key: string]: string;
}

export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  logo_url?: string | null;
  logo_dark_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  currency?: Currency;
  active_gateway?: string;
  contact_email?: string;
  contact_phone?: string;
  support_email?: string;
  language?: string;
  maintenance_mode?: boolean;
  meta_title?: string;
  meta_description?: string;
  [key: string]: string | boolean | null | undefined;
}

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: AdminUser;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  replied_at: string | null;
  replied_by: string | null;
  reply_message: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  is_active: boolean;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthState {
  user: AdminUser | Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorVerification {
  code: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeSubscriptions: number;
  newCustomers: number;
  revenueChange: number;
  ordersChange: number;
  subscriptionsChange: number;
  customersChange: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}
