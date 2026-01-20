import Stripe from 'stripe';
import { supabaseAdmin } from './supabase/admin';
import type { Product, SubscriptionPaymentMode } from '@/types';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  customerId: string,
  email: string,
  name?: string
): Promise<string> {
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', customerId)
    .single();

  if (customer?.stripe_customer_id) {
    return customer.stripe_customer_id;
  }

  const stripeCustomer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabase_customer_id: customerId,
    },
  });

  await supabaseAdmin
    .from('customers')
    .update({ stripe_customer_id: stripeCustomer.id })
    .eq('id', customerId);

  return stripeCustomer.id;
}

export async function createStripeCheckoutSession(params: {
  product: Product;
  customerEmail: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  // Sureli subscription parametreleri
  subscriptionDuration?: number;
  paymentMode?: SubscriptionPaymentMode;
}): Promise<{ sessionId: string; url: string }> {
  const {
    product,
    customerEmail,
    customerId,
    successUrl,
    cancelUrl,
    metadata,
    subscriptionDuration,
    paymentMode = 'recurring',
  } = params;

  let stripeCustomerId: string | undefined;
  if (customerId) {
    stripeCustomerId = await getOrCreateStripeCustomer(
      customerId,
      customerEmail
    );
  }

  // Sureli subscription ve odeme modu belirleme
  const hasDuration = subscriptionDuration && subscriptionDuration > 0;
  const isUpfrontPayment = paymentMode === 'upfront' && hasDuration;

  // Pesin odeme durumunda subscription yerine tek seferlik odeme yapilir
  // Recurring durumunda subscription olusturulur ve cancel_at ile bitis tarihi belirlenir
  const isSubscriptionMode = product.type === 'subscription' && !isUpfrontPayment;

  // Fiyat hesaplama
  let unitAmount = Math.round(product.price * 100);
  let quantity = 1;

  // Pesin odeme: toplam tutari hesapla
  if (isUpfrontPayment && subscriptionDuration) {
    unitAmount = Math.round(product.price * subscriptionDuration * 100);
  }

  // Abonelik bitis tarihi hesaplama
  let cancelAt: number | undefined;
  if (isSubscriptionMode && hasDuration) {
    const now = new Date();
    if (product.billing_period === 'yearly') {
      now.setFullYear(now.getFullYear() + subscriptionDuration!);
    } else {
      now.setMonth(now.getMonth() + subscriptionDuration!);
    }
    cancelAt = Math.floor(now.getTime() / 1000);
  }

  const session = await stripe.checkout.sessions.create({
    mode: isSubscriptionMode ? 'subscription' : 'payment',
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.name,
            description: isUpfrontPayment && subscriptionDuration
              ? `${product.description || ''} (${subscriptionDuration} ${product.billing_period === 'monthly' ? 'ay' : 'yil'} pesin)`.trim()
              : product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: unitAmount,
          recurring: isSubscriptionMode
            ? {
                interval: product.billing_period === 'yearly' ? 'year' : 'month',
              }
            : undefined,
        },
        quantity,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      product_id: product.id,
      customer_id: customerId || '',
      subscription_duration: subscriptionDuration?.toString() || '',
      payment_mode: paymentMode,
      ...metadata,
    },
    payment_intent_data: !isSubscriptionMode
      ? {
          metadata: {
            product_id: product.id,
            customer_id: customerId || '',
            subscription_duration: subscriptionDuration?.toString() || '',
            payment_mode: paymentMode,
          },
        }
      : undefined,
    subscription_data: isSubscriptionMode
      ? {
          metadata: {
            product_id: product.id,
            customer_id: customerId || '',
            subscription_duration: subscriptionDuration?.toString() || '',
            payment_mode: paymentMode,
          },
          // Sureli subscription icin bitis tarihi
          ...(cancelAt ? { cancel_at: cancelAt } : {}),
        }
      : undefined,
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function cancelStripeSubscription(
  stripeSubscriptionId: string,
  immediate: boolean = false
): Promise<Stripe.Subscription> {
  if (immediate) {
    return await stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  return await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(stripeSubscriptionId);
}

export async function refundStripePayment(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}

export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
