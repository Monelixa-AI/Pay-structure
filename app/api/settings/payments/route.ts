import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';
import { getPaymentSettings } from '@/lib/payments';

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get payment settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from('settings')
        .upsert(update, { onConflict: 'key' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update payment settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
