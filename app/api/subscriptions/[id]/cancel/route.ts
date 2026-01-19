import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';
import { cancelStripeSubscription } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminUser = await getAdminUser(user.id);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Not an admin' },
        { status: 403 }
      );
    }

    const { immediate } = await request.json();

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.stripe_subscription_id) {
      await cancelStripeSubscription(
        subscription.stripe_subscription_id,
        Boolean(immediate)
      );
    }

    const updateData: Record<string, any> = {
      cancel_at_period_end: !immediate,
      status: immediate ? 'cancelled' : subscription.status,
      canceled_at: immediate ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
