import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, createAuditLog } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';
import { sendContactReplyEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .eq('id', params.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    const emailSent = await sendContactReplyEmail(contact.email, {
      name: contact.name,
      originalSubject: contact.subject || undefined,
      originalMessage: contact.message || undefined,
      replyMessage: message,
      repliedBy: adminUser.email,
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from('contact_messages')
      .update({
        replied_at: new Date().toISOString(),
        replied_by: adminUser.id,
        reply_message: message,
      })
      .eq('id', params.id);

    await createAuditLog({
      adminId: adminUser.id,
      action: 'CONTACT_REPLIED',
      entityType: 'contact_messages',
      entityId: params.id,
      newValues: { message },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact reply error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
