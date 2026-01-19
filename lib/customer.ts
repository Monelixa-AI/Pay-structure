import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Customer, Order, Subscription } from '@/types';

export async function getCurrentCustomer(): Promise<Customer | null> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (customerError || !data) return null;
  return data as Customer;
}

export async function getOrCreateCustomer(
  authUserId: string,
  email: string,
  profile?: { full_name?: string; avatar_url?: string; phone?: string }
): Promise<Customer | null> {
  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (existing) return existing as Customer;

  const fullName = profile?.full_name || email.split('@')[0];

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert({
      auth_user_id: authUserId,
      email,
      full_name: fullName,
      phone: profile?.phone || null,
      avatar_url: profile?.avatar_url || null,
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return data as Customer;
}

export async function updateCustomer(
  customerId: string,
  updates: { full_name?: string; phone?: string; avatar_url?: string }
): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating customer:', error);
    return null;
  }

  return data as Customer;
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, product:products(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }

  return data as Order[];
}

export async function getCustomerSubscriptions(
  customerId: string
): Promise<Subscription[]> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*, product:products(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer subscriptions:', error);
    return [];
  }

  return data as Subscription[];
}
