import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, getSettings, createAuditLog } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
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
    const oldSettings = await getSettings();

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

    await createAuditLog({
      adminId: adminUser.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'settings',
      oldValues: oldSettings,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
