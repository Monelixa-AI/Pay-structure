import { NextResponse } from 'next/server';
import { getCurrentCustomer, getCustomerOrders } from '@/lib/customer';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const orders = await getCustomerOrders(customer.id);
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
