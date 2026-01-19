// Payment Types
export type PaymentProvider = 'stripe' | 'paytr';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';
export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'expired';

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerId: string;
  productId: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  provider: PaymentProvider;
  productId: string;
  customerId?: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  enabled: boolean;
}

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  enabled: boolean;
  testMode: boolean;
}

export interface PaymentSettings {
  defaultProvider: PaymentProvider;
  stripe: StripeConfig;
  paytr: PayTRConfig;
  allowProviderSwitch: boolean;
}

// Webhook Events
export interface WebhookEvent {
  id: string;
  provider: PaymentProvider;
  type: string;
  data: Record<string, any>;
  processedAt?: string;
  error?: string;
}
