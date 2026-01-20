import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, createAuditLog } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('active');

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminUser = await getAdminUser(user.id);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Not an admin' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      type,
      billing_period,
      features,
      image_url,
      is_active,
      is_featured,
      sort_order,
      metadata,
      // Sureli subscription alanlari
      subscription_duration,
      duration_options,
      allow_payment_mode_choice,
      default_payment_mode,
    } = body;

    if (!name || !price || !currency || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price,
        currency,
        type,
        billing_period: type === 'subscription' ? billing_period : null,
        features: features || [],
        image_url,
        is_active: is_active ?? true,
        is_featured: is_featured ?? false,
        sort_order: sort_order ?? 0,
        metadata: metadata || {},
        // Sureli subscription alanlari
        subscription_duration: type === 'subscription' ? subscription_duration : null,
        duration_options: type === 'subscription' ? duration_options : null,
        allow_payment_mode_choice: type === 'subscription' ? (allow_payment_mode_choice ?? false) : false,
        default_payment_mode: type === 'subscription' ? (default_payment_mode || 'recurring') : 'recurring',
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      adminId: adminUser.id,
      action: 'PRODUCT_CREATED',
      entityType: 'products',
      entityId: data.id,
      newValues: data,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
