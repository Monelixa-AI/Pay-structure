import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
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
    const { to, subject } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Missing email address' },
        { status: 400 }
      );
    }

    const sent = await sendTestEmail(to, subject || 'Test email');
    if (!sent) {
      return NextResponse.json(
        { success: false, error: 'Test email failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
