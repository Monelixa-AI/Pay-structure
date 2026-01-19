import { NextResponse } from 'next/server';
import { getCurrentCustomer, getCustomerSubscriptions } from '@/lib/customer';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const subscriptions = await getCustomerSubscriptions(customer.id);
    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
