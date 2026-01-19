import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';

const EMAIL_KEYS = [
  'email_enabled',
  'email_from_name',
  'email_from_address',
  'email_reply_to',
  'email_welcome_enabled',
  'email_payment_enabled',
  'email_subscription_enabled',
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', EMAIL_KEYS);

    if (error) throw error;

    const settings = (data || []).reduce((acc, item) => {
      acc[item.key] = item.value || '';
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Get email settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await getAdminUser(user.id);
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Not an admin' }, { status: 403 });
    }

    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      await supabaseAdmin.from('settings').upsert(update, { onConflict: 'key' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update email settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update email settings' },
      { status: 500 }
    );
  }
}
