import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createAuditLog } from '@/lib/supabase/admin';
import { verifyAdminTwoFactor } from '@/lib/two-factor';
import { updateLastLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Get admin user
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id, two_factor_secret')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found',
      });
    }

    // Verify 2FA code
    const isValid = await verifyAdminTwoFactor(adminUser.id, code);
    if (!isValid) {
      // Log failed attempt
      await createAuditLog({
        adminId: adminUser.id,
        action: '2FA_VERIFICATION_FAILED',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Update last login
    await updateLastLogin(
      adminUser.id,
      request.headers.get('x-forwarded-for') || undefined
    );

    // Log successful login
    await createAuditLog({
      adminId: adminUser.id,
      action: 'LOGIN_WITH_2FA',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}