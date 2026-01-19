import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', params.id)
      .eq('customer_id', customer.id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['site_name', 'company_name', 'company_address', 'company_tax_id']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const invoiceHtml = generateInvoiceHtml(order, customer, settingsMap);

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="fatura-${order.id
          .slice(0, 8)
          .toUpperCase()}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Invoice download error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateInvoiceHtml(
  order: any,
  customer: any,
  settings: Record<string, string>
): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const siteName = settings.site_name || 'Monelixa';
  const companyName = settings.company_name || siteName;
  const companyAddress = settings.company_address || '';
  const taxId = settings.company_tax_id || '';

  return `<!DOCTYPE html><html lang="tr"><head>
  <meta charset="UTF-8">
  <title>Fatura #${orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 40px;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    .logo { font-size: 24px; font-weight: bold; color: #e53935; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #333; }
    .invoice-date { color: #666; margin-top: 5px; }
    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .address-block h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 10px;
    }
    .address-block p { color: #333; line-height: 1.6; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 18px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  </style></head><body>
  <div class="invoice">
    <div class="header">
      <div class="logo">${siteName}</div>
      <div class="invoice-info">
        <div class="invoice-number">Fatura #${orderNumber}</div>
        <div class="invoice-date">${formatDate(order.created_at, true)}</div>
      </div>
    </div>
    <div class="addresses">
      <div class="address-block">
        <h3>Satici</h3>
        <p>
          <strong>${companyName}</strong><br>
          ${companyAddress ? companyAddress + '<br>' : ''}
          ${taxId ? 'Vergi No: ' + taxId : ''}
        </p>
      </div>
      <div class="address-block">
        <h3>Alici</h3>
        <p>
          <strong>${customer.full_name || customer.email}</strong><br>
          ${customer.email}
        </p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Aciklama</th>
          <th>Miktar</th>
          <th style="text-align: right">Tutar</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${order.product?.name || 'Urun'}</td>
          <td>1</td>
          <td style="text-align: right">${formatCurrency(order.amount, order.currency)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">Toplam</td>
          <td style="text-align: right">${formatCurrency(order.amount, order.currency)}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <p>Bu fatura ${siteName} tarafindan otomatik olarak olusturulmustur.</p>
    </div>
  </div></body></html>
  `;
}
