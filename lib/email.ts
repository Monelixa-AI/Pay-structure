import 'server-only';
import React from 'react';
import { render } from '@react-email/render';
import { supabaseAdmin, getSettings } from '@/lib/supabase/admin';
import { sendResendEmail } from '@/lib/resend';
import {
  WelcomeEmail,
  PaymentSuccessEmail,
  PaymentFailedEmail,
  SubscriptionCreatedEmail,
  SubscriptionCancelledEmail,
  SubscriptionRenewalEmail,
  PasswordResetEmail,
  ContactFormEmail,
  ContactReplyEmail,
} from '@/emails';

type EmailStatus = 'sent' | 'failed';

type EmailLogParams = {
  type: string;
  to: string;
  subject: string;
  status: EmailStatus;
  messageId?: string;
  error?: string;
  metadata?: Record<string, any>;
  sentAt?: string;
};

export async function getEmailSettings() {
  const settings = await getSettings();
  return {
    enabled: settings.email_enabled !== 'false',
    fromName: settings.email_from_name || 'Monelixa',
    fromAddress:
      settings.email_from_address ||
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      '',
    replyTo: settings.email_reply_to || process.env.EMAIL_REPLY_TO || '',
    welcomeEnabled: settings.email_welcome_enabled !== 'false',
    paymentEnabled: settings.email_payment_enabled !== 'false',
    subscriptionEnabled: settings.email_subscription_enabled !== 'false',
  };
}

function renderTemplate(
  Component: React.ComponentType<any>,
  props: Record<string, any>
) {
  return render(React.createElement(Component, props));
}

async function logEmail(params: EmailLogParams) {
  try {
    await supabaseAdmin.from('email_logs').insert({
      type: params.type,
      to_email: params.to,
      subject: params.subject,
      status: params.status,
      message_id: params.messageId || null,
      error: params.error || null,
      metadata: params.metadata || {},
      sent_at: params.sentAt || (params.status === 'sent' ? new Date().toISOString() : null),
    });
  } catch (error) {
    console.error('Email log error:', error);
  }
}

async function sendEmail(params: {
  type: string;
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  const settings = await getEmailSettings();

  if (!settings.enabled) {
    await logEmail({
      type: params.type,
      to: params.to,
      subject: params.subject,
      status: 'failed',
      error: 'Email disabled',
      metadata: params.metadata,
    });
    return false;
  }

  if (!settings.fromAddress) {
    await logEmail({
      type: params.type,
      to: params.to,
      subject: params.subject,
      status: 'failed',
      error: 'Missing email from address',
      metadata: params.metadata,
    });
    return false;
  }

  const from = settings.fromName
    ? `${settings.fromName} <${settings.fromAddress}>`
    : settings.fromAddress;

  const result = await sendResendEmail({
    to: params.to,
    subject: params.subject,
    html: params.html,
    from,
    replyTo: settings.replyTo || undefined,
  });

  if (result.error) {
    await logEmail({
      type: params.type,
      to: params.to,
      subject: params.subject,
      status: 'failed',
      error: result.error,
      metadata: params.metadata,
    });
    return false;
  }

  await logEmail({
    type: params.type,
    to: params.to,
    subject: params.subject,
    status: 'sent',
    messageId: result.id,
    metadata: params.metadata,
  });

  return true;
}

export async function sendCustomEmail(params: {
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}) {
  return sendEmail({
    type: 'custom',
    to: params.to,
    subject: params.subject,
    html: params.html,
    metadata: params.metadata,
  });
}

export async function sendTestEmail(to: string, subject: string = 'Test email') {
  const html = '<p>This is a test email from Monelixa.</p>';
  return sendEmail({
    type: 'test',
    to,
    subject,
    html,
    metadata: { test: true },
  });
}

export async function sendWelcomeEmail(
  to: string,
  data: { name?: string; loginUrl?: string }
) {
  const settings = await getEmailSettings();
  if (!settings.welcomeEnabled) return false;
  const subject = 'Welcome to Monelixa';
  const html = renderTemplate(WelcomeEmail, data);
  return sendEmail({ type: 'welcome', to, subject, html, metadata: data });
}

export async function sendPaymentSuccessEmail(
  to: string,
  data: { orderId?: string; productName: string; amount: number; currency: string; customerName?: string }
) {
  const settings = await getEmailSettings();
  if (!settings.paymentEnabled) return false;
  const subject = `Payment received - ${data.productName}`;
  const html = renderTemplate(PaymentSuccessEmail, data);
  return sendEmail({ type: 'payment_success', to, subject, html, metadata: data });
}

export async function sendPaymentFailedEmail(
  to: string,
  data: { orderId?: string; productName: string; reason?: string; customerName?: string }
) {
  const settings = await getEmailSettings();
  if (!settings.paymentEnabled) return false;
  const subject = `Payment failed - ${data.productName}`;
  const html = renderTemplate(PaymentFailedEmail, data);
  return sendEmail({ type: 'payment_failed', to, subject, html, metadata: data });
}

export async function sendSubscriptionEmail(
  to: string,
  status: 'created' | 'cancelled' | 'renewal',
  data: Record<string, any>
) {
  const settings = await getEmailSettings();
  if (!settings.subscriptionEnabled) return false;
  const subjectMap: Record<string, string> = {
    created: 'Subscription active',
    cancelled: 'Subscription cancelled',
    renewal: 'Subscription renewed',
  };

  const templateMap: Record<string, React.ComponentType<any>> = {
    created: SubscriptionCreatedEmail,
    cancelled: SubscriptionCancelledEmail,
    renewal: SubscriptionRenewalEmail,
  };

  const subject = subjectMap[status] || 'Subscription update';
  const html = renderTemplate(templateMap[status] || SubscriptionCreatedEmail, data);

  return sendEmail({
    type: `subscription_${status}`,
    to,
    subject,
    html,
    metadata: data,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  data: { name?: string; resetUrl: string }
) {
  const subject = 'Reset your password';
  const html = renderTemplate(PasswordResetEmail, data);
  return sendEmail({ type: 'password_reset', to, subject, html, metadata: data });
}

export async function sendContactFormEmail(
  to: string,
  data: { name: string; email: string; subject?: string; message: string }
) {
  const subject = `New contact message${data.subject ? ` - ${data.subject}` : ''}`;
  const html = renderTemplate(ContactFormEmail, data);
  return sendEmail({ type: 'contact_form', to, subject, html, metadata: data });
}

export async function sendContactReplyEmail(
  to: string,
  data: {
    name?: string;
    originalSubject?: string;
    originalMessage?: string;
    replyMessage: string;
    repliedBy?: string;
  }
) {
  const subject = `Reply${data.originalSubject ? `: ${data.originalSubject}` : ''}`;
  const html = renderTemplate(ContactReplyEmail, data);
  return sendEmail({ type: 'contact_reply', to, subject, html, metadata: data });
}
