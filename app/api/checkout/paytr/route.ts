import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createCheckoutSession, getPaymentSettings } from '@/lib/payments';
import type { Product, SubscriptionPaymentMode } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      customerEmail,
      customerName,
      customerPhone,
      customerId,
      subscriptionDuration,
      paymentMode,
    } = body;

    if (!productId || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const settings = await getPaymentSettings();
    if (!settings.paytrEnabled) {
      return NextResponse.json(
        { success: false, error: 'PayTR is not enabled' },
        { status: 400 }
      );
    }

    const userIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      product: product as Product,
      customer: {
        id: customerId,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      },
      provider: 'paytr',
      userIp,
      successUrl: `${baseUrl}/success`,
      cancelUrl: `${baseUrl}/cancel`,
      // Süreli subscription parametreleri
      subscriptionDuration: subscriptionDuration as number | undefined,
      paymentMode: paymentMode as SubscriptionPaymentMode | undefined,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Failed to create PayTR session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: session.id,
      iframeUrl: session.url,
    });
  } catch (error: any) {
    console.error('PayTR checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
