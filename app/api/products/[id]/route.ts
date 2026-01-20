import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, createAuditLog } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: oldData } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!oldData) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency,
        type: body.type,
        billing_period: body.type === 'subscription' ? body.billing_period : null,
        features: body.features,
        image_url: body.image_url,
        is_active: body.is_active,
        is_featured: body.is_featured,
        sort_order: body.sort_order,
        metadata: body.metadata,
        // Sureli subscription alanlari
        subscription_duration: body.type === 'subscription' ? body.subscription_duration : null,
        duration_options: body.type === 'subscription' ? body.duration_options : null,
        allow_payment_mode_choice: body.type === 'subscription' ? (body.allow_payment_mode_choice ?? false) : false,
        default_payment_mode: body.type === 'subscription' ? (body.default_payment_mode || 'recurring') : 'recurring',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      adminId: adminUser.id,
      action: 'PRODUCT_UPDATED',
      entityType: 'products',
      entityId: params.id,
      oldValues: oldData,
      newValues: data,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: oldData } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!oldData) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    await createAuditLog({
      adminId: adminUser.id,
      action: 'PRODUCT_DELETED',
      entityType: 'products',
      entityId: params.id,
      oldValues: oldData,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
