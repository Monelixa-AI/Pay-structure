import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (user.app_metadata?.provider === 'google') {
      return NextResponse.json(
        { success: false, error: 'Google hesaplari icin sifre degistirilemez' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Sifre en az 8 karakter olmalidir' },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
