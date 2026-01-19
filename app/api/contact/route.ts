import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendContactFormEmail, sendCustomEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success: rateLimitOk } = await rateLimit(ip, 'contact', 5, 3600);
    if (!rateLimitOk) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cok fazla istek gonderdiniz. Lutfen daha sonra tekrar deneyin.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Tum alanlari doldurun' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Gecerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      ip_address: ip,
      status: 'new',
      updated_at: new Date().toISOString(),
    });
    if (dbError) throw dbError;

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'contact_email')
      .single();
    const adminEmail = settings?.value || process.env.ADMIN_EMAIL;

    if (adminEmail) {
      await sendContactFormEmail(adminEmail, {
        name,
        email,
        subject,
        message,
      });
    }

    await sendCustomEmail({
      to: email,
      subject: 'Mesajiniz Alindi - Monelixa',
      html: `
        <h2>Mesajiniz Alindi</h2>
        <p>Merhaba ${name},</p>
        <p>Iletisim formunuz basariyla alindi. En kisa surede size donus yapacagiz.</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p>Tesekkur ederiz,<br>Monelixa Ekibi</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bir hata olustu. Lutfen daha sonra tekrar deneyin.',
      },
      { status: 500 }
    );
  }
}
