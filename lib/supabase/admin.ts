import { createClient } from '@supabase/supabase-js';
import type { SettingsMap } from '@/types';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function getSettings(): Promise<SettingsMap> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.key] = item.value || '';
    return acc;
  }, {} as SettingsMap);
}

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) return null;
  return data?.value || null;
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('settings')
    .update({ value })
    .eq('key', key);

  return !error;
}

export async function createAuditLog(params: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  const oldValue = params.oldValue ?? params.oldValues;
  const newValue = params.newValue ?? params.newValues;
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    admin_id: params.adminId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_value: oldValue,
    new_value: newValue,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });

  if (error) {
    console.error('Error creating audit log:', error);
  }
}
