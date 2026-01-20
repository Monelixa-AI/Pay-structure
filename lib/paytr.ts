import crypto from 'crypto';
import { supabaseAdmin } from './supabase/admin';
import type { Product, SubscriptionPaymentMode } from '@/types';

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === 'true';
const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';

interface PayTRBasketItem {
  name: string;
  price: string;
  quantity: number;
}

interface PayTRTokenResponse {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
}

function generatePayTRToken(params: {
  merchantOid: string;
  email: string;
  paymentAmount: number;
  userBasket: string;
  noInstallment: number;
  maxInstallment: number;
  currency: string;
  testMode: number;
}): string {
  const hashStr =
    PAYTR_MERCHANT_ID +
    params.email +
    params.paymentAmount +
    params.merchantOid +
    params.noInstallment +
    params.maxInstallment +
    params.currency +
    params.testMode +
    PAYTR_MERCHANT_SALT;

  return crypto
    .createHmac('sha256', PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest('base64');
}

export async function createPayTRCheckoutSession(params: {
  product: Product;
  customer: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
  };
  orderId: string;
  userIp: string;
  successUrl: string;
  failUrl: string;
  // Sureli subscription icin
  subscriptionDuration?: number;
  paymentMode?: SubscriptionPaymentMode;
}): Promise<{ token: string; iframeUrl: string } | null> {
  const { product, customer, orderId, userIp, successUrl, failUrl, subscriptionDuration, paymentMode } = params;

  // PayTR subscription desteklemiyor, bu yuzden toplam tutar hesaplanmis olarak geliyor
  const paymentAmount = Math.round(product.price * 100);

  // Urun adini sure bilgisiyle guncelle
  let productName = product.name;
  if (subscriptionDuration && subscriptionDuration > 0) {
    const period = product.billing_period === 'monthly' ? 'ay' : 'yil';
    const modeText = paymentMode === 'upfront' ? 'pesin' : 'abonelik';
    productName = `${product.name} (${subscriptionDuration} ${period} ${modeText})`;
  }

  const basketItem: PayTRBasketItem = {
    name: productName,
    price: (product.price * 100).toFixed(0),
    quantity: 1,
  };

  const userBasket = Buffer.from(
    JSON.stringify([[basketItem.name, basketItem.price, basketItem.quantity]])
  ).toString('base64');

  const currencyMap: Record<string, string> = {
    TRY: 'TL',
    USD: 'USD',
    EUR: 'EUR',
  };
  const currency = currencyMap[product.currency] || 'TL';
  const testMode = PAYTR_TEST_MODE ? 1 : 0;

  const paytrToken = generatePayTRToken({
    merchantOid: orderId,
    email: customer.email,
    paymentAmount,
    userBasket,
    noInstallment: 1,
    maxInstallment: 0,
    currency,
    testMode,
  });

  const formData = new URLSearchParams({
    merchant_id: PAYTR_MERCHANT_ID,
    user_ip: userIp,
    merchant_oid: orderId,
    email: customer.email,
    payment_amount: paymentAmount.toString(),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: '1',
    no_installment: '1',
    max_installment: '0',
    user_name: customer.name,
    user_address: customer.address || 'Turkiye',
    user_phone: customer.phone || '05000000000',
    merchant_ok_url: successUrl,
    merchant_fail_url: failUrl,
    timeout_limit: '30',
    currency,
    test_mode: testMode.toString(),
  });

  try {
    const response = await fetch(PAYTR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result: PayTRTokenResponse = await response.json();

    if (result.status === 'success' && result.token) {
      return {
        token: result.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
      };
    }

    console.error('PayTR token error:', result.reason);
    return null;
  } catch (error) {
    console.error('PayTR API error:', error);
    return null;
  }
}

export function verifyPayTRCallback(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const { merchantOid, status, totalAmount, hash } = params;

  const hashStr = merchantOid + PAYTR_MERCHANT_SALT + status + totalAmount;
  const expectedHash = crypto
    .createHmac('sha256', PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest('base64');

  return hash === expectedHash;
}

export async function processPayTRCallback(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
  failedReasonCode?: string;
  failedReasonMsg?: string;
}): Promise<{ success: boolean; orderId: string }> {
  const {
    merchantOid,
    status,
    totalAmount,
    hash,
    failedReasonCode,
    failedReasonMsg,
  } = params;

  if (!verifyPayTRCallback({ merchantOid, status, totalAmount, hash })) {
    throw new Error('Invalid PayTR hash');
  }

  const isSuccess = status === 'success';

  const updateData: Record<string, any> = {
    status: isSuccess ? 'completed' : 'failed',
    updated_at: new Date().toISOString(),
  };

  if (!isSuccess) {
    updateData.metadata = {
      paytr_error_code: failedReasonCode,
      paytr_error_message: failedReasonMsg,
    };
  }

  await supabaseAdmin.from('orders').update(updateData).eq('id', merchantOid);

  return { success: isSuccess, orderId: merchantOid };
}
