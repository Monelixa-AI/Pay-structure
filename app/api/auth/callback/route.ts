import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, createInitialAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/admin';

  if (code) {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Admin kontrolü
      let adminUser = await getAdminUser(user.id);

      // İlk admin oluşturma (development için)
      if (!adminUser && process.env.NODE_ENV === 'development') {
        adminUser = await createInitialAdmin(
          user.id,
          user.email || '',
          user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Admin'
        );
      }

      if (adminUser) {
        // 2FA kontrolü gerekiyorsa
        if (adminUser.two_factor_enabled) {
          return NextResponse.redirect(`${origin}/login?verify2fa=true`);
        }
        return NextResponse.redirect(`${origin}${redirect}`);
      } else {
        // Müşteri olarak giriş yap (portal'a yönlendir)
        return NextResponse.redirect(`${origin}/portal`);
      }
    }
  }

  // Auth hata durumunda
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}