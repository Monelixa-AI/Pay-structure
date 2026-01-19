import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/two-factor';

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

    // Generate secret and QR code
    const secret = generateTwoFactorSecret();
    const qrCode = await generateQRCode(adminUser.email, secret);

    return NextResponse.json({
      success: true,
      secret,
      qrCode,
    });
  } catch (error) {
    console.error('Generate 2FA error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}