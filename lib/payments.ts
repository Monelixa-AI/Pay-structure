import { supabaseAdmin } from './supabase/admin';
import { createStripeCheckoutSession } from './stripe';
import { createPayTRCheckoutSession } from './paytr';
import type { Product, Order, SubscriptionPaymentMode } from '@/types';
import type { PaymentProvider, CheckoutSession } from '@/types/payments';

export async function getPaymentSettings() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', [
      'default_payment_provider',
      'stripe_enabled',
      'paytr_enabled',
      'allow_provider_switch',
    ]);

  const settings: Record<string, any> = {};
  data?.forEach((item) => {
    settings[item.key] = item.value;
  });

  return {
    defaultProvider: (settings.default_payment_provider || 'stripe') as PaymentProvider,
    stripeEnabled: settings.stripe_enabled === 'true',
    paytrEnabled: settings.paytr_enabled === 'true',
    allowProviderSwitch: settings.allow_provider_switch === 'true',
  };
}

export async function createOrder(params: {
  productId: string;
  customerId?: string;
  customerEmail: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
  // Süreli subscription için
  subscriptionDuration?: number;
  paymentMode?: SubscriptionPaymentMode;
}): Promise<Order> {
  const {
    productId,
    customerId,
    customerEmail,
    amount,
    currency,
    provider,
    metadata,
    subscriptionDuration,
    paymentMode,
  } = params;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      product_id: productId,
      customer_id: customerId || null,
      customer_email: customerEmail,
      amount,
      currency,
      status: 'pending',
      payment_provider: provider,
      metadata: metadata || {},
      subscription_duration: subscriptionDuration || null,
      payment_mode: paymentMode || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function createCheckoutSession(params: {
  product: Product;
  customer: {
    id?: string;
    email: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  provider: PaymentProvider;
  userIp?: string;
  successUrl: string;
  cancelUrl: string;
  // Süreli subscription için
  subscriptionDuration?: number;
  paymentMode?: SubscriptionPaymentMode;
}): Promise<CheckoutSession | null> {
  const { product, customer, provider, userIp, successUrl, cancelUrl, subscriptionDuration, paymentMode } = params;

  // Ödeme tutarını hesapla
  let amount = product.price;
  const effectivePaymentMode = paymentMode || product.default_payment_mode || 'recurring';
  const effectiveDuration: number | undefined =
    subscriptionDuration ?? product.subscription_duration ?? undefined;

  // Peşin ödeme modunda toplam tutarı hesapla
  if (product.type === 'subscription' && effectivePaymentMode === 'upfront' && effectiveDuration) {
    amount = product.price * effectiveDuration;
  }

  const order = await createOrder({
    productId: product.id,
    customerId: customer.id,
    customerEmail: customer.email,
    amount,
    currency: product.currency,
    provider,
    metadata: {
      customer_name: customer.name || null,
      customer_phone: customer.phone || null,
    },
    subscriptionDuration: effectiveDuration,
    paymentMode: product.type === 'subscription' ? effectivePaymentMode : undefined,
  });

  try {
    if (provider === 'stripe') {
      const session = await createStripeCheckoutSession({
        product,
        customerEmail: customer.email,
        customerId: customer.id,
        successUrl: `${successUrl}?order_id=${order.id}`,
        cancelUrl: `${cancelUrl}?order_id=${order.id}`,
        metadata: {
          order_id: order.id,
          customer_name: customer.name || '',
        },
        // Süreli subscription parametreleri
        subscriptionDuration: effectiveDuration,
        paymentMode: effectivePaymentMode,
      });

      await supabaseAdmin
        .from('orders')
        .update({
          provider_session_id: session.sessionId,
          status: 'processing',
        })
        .eq('id', order.id);

      return {
        id: session.sessionId,
        url: session.url,
        provider: 'stripe',
        productId: product.id,
        customerId: customer.id,
        customerEmail: customer.email,
        amount: product.price,
        currency: product.currency,
        successUrl,
        cancelUrl,
      };
    }

    if (provider === 'paytr') {
      if (!userIp) throw new Error('User IP required for PayTR');

      // PayTR için modifiye edilmiş product (peşin ödeme için fiyat ayarlanmış)
      const paytrProduct = {
        ...product,
        price: amount, // createOrder'da hesaplanan tutar
      };

      const session = await createPayTRCheckoutSession({
        product: paytrProduct,
        customer: {
          email: customer.email,
          name: customer.name || customer.email.split('@')[0],
          phone: customer.phone,
          address: customer.address,
        },
        orderId: order.id,
        userIp,
        successUrl: `${successUrl}?order_id=${order.id}`,
        failUrl: `${cancelUrl}?order_id=${order.id}`,
        subscriptionDuration: effectiveDuration,
        paymentMode: effectivePaymentMode,
      });

      if (!session) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', order.id);
        return null;
      }

      await supabaseAdmin
        .from('orders')
        .update({
          provider_session_id: session.token,
          status: 'processing',
        })
        .eq('id', order.id);

      return {
        id: session.token,
        url: session.iframeUrl,
        provider: 'paytr',
        productId: product.id,
        customerId: customer.id,
        customerEmail: customer.email,
        amount: product.price,
        currency: product.currency,
        successUrl,
        cancelUrl,
      };
    }

    throw new Error('Invalid payment provider');
  } catch (error) {
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', order.id);

    throw error;
  }
}

export async function getAvailableProviders(): Promise<PaymentProvider[]> {
  const settings = await getPaymentSettings();
  const providers: PaymentProvider[] = [];

  if (settings.stripeEnabled) providers.push('stripe');
  if (settings.paytrEnabled) providers.push('paytr');

  return providers;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  metadata?: Record<string, any>
): Promise<void> {
  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (metadata) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('metadata')
      .eq('id', orderId)
      .single();

    updateData.metadata = { ...order?.metadata, ...metadata };
  }

  await supabaseAdmin.from('orders').update(updateData).eq('id', orderId);
}
