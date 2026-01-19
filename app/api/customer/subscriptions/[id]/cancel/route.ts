import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', params.id)
      .eq('customer_id', customer.id)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
