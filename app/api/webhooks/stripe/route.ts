import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendSubscriptionEmail,
} from '@/lib/email';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = verifyStripeWebhook(body, signature);
  } catch (error: any) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('*, product:products(name)')
          .eq('provider_session_id', session.id)
          .single();

        if (order) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'completed',
              provider_payment_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);

          const productName =
            order.product?.name || order.metadata?.product_name || 'Product';
          if (order.customer_email) {
            await sendPaymentSuccessEmail(order.customer_email, {
              orderId: order.id,
              productName,
              amount: order.amount,
              currency: order.currency,
            });
          }
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('provider_payment_id', paymentIntent.id)
          .single();

        await supabaseAdmin
          .from('orders')
          .update({
            status: 'failed',
            metadata: {
              error: paymentIntent.last_payment_error?.message,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('provider_payment_id', paymentIntent.id);

        if (order?.customer_email) {
          await sendPaymentFailedEmail(order.customer_email, {
            orderId: order.id,
            productName: order.metadata?.product_name || 'Product',
            reason: paymentIntent.last_payment_error?.message,
          });
        }
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.metadata.customer_id;
        const productId = subscription.metadata.product_id;

        if (customerId && productId) {
          await supabaseAdmin.from('subscriptions').insert({
            customer_id: customerId,
            product_id: productId,
            stripe_subscription_id: subscription.id,
            status: 'active',
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });

          const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('email, full_name')
            .eq('id', customerId)
            .single();

          const { data: product } = await supabaseAdmin
            .from('products')
            .select('name, price, currency')
            .eq('id', productId)
            .single();

          if (customer?.email) {
            await sendSubscriptionEmail(customer.email, 'created', {
              customerName: customer.full_name,
              productName: product?.name,
              amount: product?.price,
              currency: product?.currency,
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const statusMap: Record<string, string> = {
          active: 'active',
          canceled: 'cancelled',
          past_due: 'past_due',
          paused: 'paused',
          trialing: 'trialing',
        };

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: statusMap[subscription.status] || subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .select('customer_id')
          .single();

        if (sub?.customer_id) {
          const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('email')
            .eq('id', sub.customer_id)
            .single();

          if (customer?.email) {
            await sendSubscriptionEmail(customer.email, 'cancelled', {});
          }
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer_email) {
          await sendSubscriptionEmail(invoice.customer_email, 'renewal', {
            amount: invoice.amount_paid ? invoice.amount_paid / 100 : undefined,
            currency: invoice.currency?.toUpperCase(),
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer_email) {
          await sendPaymentFailedEmail(invoice.customer_email, {
            orderId: invoice.id,
            productName: invoice.lines?.data?.[0]?.description || 'Subscription',
            reason: invoice.last_finalization_error?.message,
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'stripe',
      event_type: event.type,
      event_id: event.id,
      payload: event.data.object,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);

    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'stripe',
      event_type: event.type,
      event_id: event.id,
      payload: event.data.object,
      error: error.message,
    });

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
