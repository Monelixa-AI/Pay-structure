import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth';
import { verifyTwoFactorToken, enableTwoFactor } from '@/lib/two-factor';
import { createAuditLog } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const { secret, code } = await request.json();

    // Verify the code
    const isValid = verifyTwoFactorToken(code, secret);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Enable 2FA
    const enabled = await enableTwoFactor(adminUser.id, secret);
    if (!enabled) {
      return NextResponse.json({
        success: false,
        error: 'Failed to enable 2FA',
      });
    }

    // Audit log
    await createAuditLog({
      adminId: adminUser.id,
      action: '2FA_ENABLED',
      entityType: 'admin_users',
      entityId: adminUser.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}