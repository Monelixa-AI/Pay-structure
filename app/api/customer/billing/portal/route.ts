import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!customer.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/billing`,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
