import { NextRequest, NextResponse } from 'next/server';
import { processPayTRCallback } from '@/lib/paytr';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const totalAmount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failedReasonCode = formData.get('failed_reason_code') as string;
    const failedReasonMsg = formData.get('failed_reason_msg') as string;

    if (!merchantOid || !status || !totalAmount || !hash) {
      return new NextResponse('PAYTR ERROR: Missing parameters', { status: 400 });
    }

    const result = await processPayTRCallback({
      merchantOid,
      status,
      totalAmount,
      hash,
      failedReasonCode,
      failedReasonMsg,
    });

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, product:products(*)')
      .eq('id', result.orderId)
      .single();

    if (order) {
      if (result.success) {
        await sendPaymentSuccessEmail(order.customer_email, {
          orderId: order.id,
          productName: order.product?.name || 'Urun',
          amount: order.amount,
          currency: order.currency,
        });
      } else {
        await sendPaymentFailedEmail(order.customer_email, {
          orderId: order.id,
          productName: order.product?.name || 'Urun',
          reason: failedReasonMsg,
        });
      }
    }

    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'paytr',
      event_type: status === 'success' ? 'payment.success' : 'payment.failed',
      event_id: merchantOid,
      payload: {
        merchant_oid: merchantOid,
        status,
        total_amount: totalAmount,
        failed_reason_code: failedReasonCode,
        failed_reason_msg: failedReasonMsg,
      },
      processed_at: new Date().toISOString(),
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('PayTR webhook error:', error);

    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'paytr',
      event_type: 'callback_error',
      event_id: 'unknown',
      payload: {},
      error: error.message,
    });

    return new NextResponse('PAYTR ERROR: ' + error.message, { status: 500 });
  }
}
