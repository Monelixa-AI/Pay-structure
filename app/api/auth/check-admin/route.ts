import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active, two_factor_enabled')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({
      isAdmin: true,
      twoFactorEnabled: adminUser.two_factor_enabled,
      adminId: adminUser.id,
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false });
  }
}