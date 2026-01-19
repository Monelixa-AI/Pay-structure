import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCustomer } from '@/lib/customer';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/portal';

  if (code) {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      try {
        const customer = await getOrCreateCustomer(user.id, user.email!, {
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        });

        if (customer && new Date(customer.created_at).getTime() > Date.now() - 60000) {
          await sendWelcomeEmail(user.email!, {
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
          });
        }
      } catch (e) {
        console.error('Error creating customer:', e);
      }
    }
  }

  return NextResponse.redirect(new URL(redirect, requestUrl.origin));
}
