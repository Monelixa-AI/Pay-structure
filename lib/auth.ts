import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { AdminUser, Customer } from '@/types';

// ─────────────────────────────────────────────────────────────────
// Get Current User
// ─────────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

// ─────────────────────────────────────────────────────────────────
// Get Admin User
// ─────────────────────────────────────────────────────────────────
export async function getAdminUser(
  authUserId: string
): Promise<AdminUser | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

// ─────────────────────────────────────────────────────────────────
// Get Customer
// ─────────────────────────────────────────────────────────────────
export async function getCustomer(
  authUserId: string
): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !data) return null;
  return data as Customer;
}

// ─────────────────────────────────────────────────────────────────
// Check if user is admin
// ─────────────────────────────────────────────────────────────────
export async function isAdmin(authUserId: string): Promise<boolean> {
  const admin = await getAdminUser(authUserId);
  return !!admin;
}

// ─────────────────────────────────────────────────────────────────
// Update Last Login
// ─────────────────────────────────────────────────────────────────
export async function updateLastLogin(adminId: string, ip?: string) {
  await supabaseAdmin
    .from('admin_users')
    .update({
      last_login_at: new Date().toISOString(),
      last_login_ip: ip || null,
    })
    .eq('id', adminId);
}

// ─────────────────────────────────────────────────────────────────
// Create Initial Admin (ilk kurulum icin)
// ─────────────────────────────────────────────────────────────────
export async function createInitialAdmin(
  authUserId: string,
  email: string,
  fullName: string
): Promise<AdminUser | null> {
  // Zaten admin var mi kontrol et
  const existingAdmin = await getAdminUser(authUserId);
  if (existingAdmin) return existingAdmin;

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      auth_user_id: authUserId,
      email,
      full_name: fullName,
      role: 'super_admin',
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating admin:', error);
    return null;
  }

  return data as AdminUser;
}