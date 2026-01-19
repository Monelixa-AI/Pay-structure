import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';

export function getResendClient(): Resend | null {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
}): Promise<{ id?: string; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { error: 'Missing RESEND_API_KEY' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      reply_to: params.replyTo,
    });

    if (error) {
      return { error: error.message };
    }

    return { id: data?.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
