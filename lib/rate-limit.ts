import { supabaseAdmin } from '@/lib/supabase/admin';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  try {
    await supabaseAdmin
      .from('rate_limits')
      .delete()
      .lt('created_at', windowStart.toISOString());

    const { count, error: countError } = await supabaseAdmin
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString());

    if (countError) throw countError;

    const currentCount = count || 0;
    if (currentCount >= limit) {
      return {
        success: false,
        remaining: 0,
        reset:
          windowSeconds -
          Math.floor((now.getTime() - windowStart.getTime()) / 1000),
      };
    }

    await supabaseAdmin.from('rate_limits').insert({
      key,
      identifier,
      action,
    });

    return {
      success: true,
      remaining: limit - currentCount - 1,
      reset: windowSeconds,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true, remaining: limit, reset: windowSeconds };
  }
}
