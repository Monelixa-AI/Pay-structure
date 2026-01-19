import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!customer.stripe_customer_id) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.stripe_customer_id,
      type: 'card',
    });

    const stripeCustomer = (await stripe.customers.retrieve(
      customer.stripe_customer_id
    )) as Stripe.Customer;
    const defaultPaymentMethodId =
      stripeCustomer.invoice_settings?.default_payment_method;

    const methods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || 'unknown',
      last4: pm.card?.last4 || '****',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      is_default: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      success: true,
      data: methods,
    });
  } catch (error: any) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
