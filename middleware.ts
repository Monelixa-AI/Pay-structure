import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_ROUTES = ['/login', '/register', '/setup-2fa'];
const PASSWORD_ROUTES = ['/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, is_active, two_factor_enabled')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/portal')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isPasswordRoute = PASSWORD_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && user && !isPasswordRoute) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (adminUser) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
