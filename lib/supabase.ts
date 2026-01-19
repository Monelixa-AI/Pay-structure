import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (service role ile)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

// Helper: Tüm settings'i map olarak al
export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Settings fetch error:', error);
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.key] = item.value || '';
    return acc;
  }, {} as Record<string, string>);
}

// Helper: Tek bir setting'i al
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Setting fetch error for ${key}:`, error);
    return null;
  }

  return data?.value || null;
}

// Helper: Setting güncelle
export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('settings')
    .update({ value })
    .eq('key', key);

  if (error) {
    console.error(`Setting update error for ${key}:`, error);
    return false;
  }

  return true;
}
