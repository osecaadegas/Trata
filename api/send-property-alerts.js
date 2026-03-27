// API: Send property alerts for new listings via Resend
// POST /api/send-property-alerts
// Called from the frontend after a new property is created

import {
  supabaseAdmin,
  sendEmailResend,
  corsHeaders,
  errorResponse,
  successResponse,
  SITE_URL
} from './_utils/email.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return errorResponse('propertyId is required');
    }

    const supabase = await supabaseAdmin();

    // Fetch property with seller info
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*, seller:users!properties_seller_id_fkey(name, phone, email, avatar_url)')
      .eq('id', propertyId)
      .eq('status', 'available')
      .single();

    if (propError || !property) {
      console.error('Property not found:', propError);
      return errorResponse('Imóvel não encontrado', 404);
    }

    // Find matching subscriptions using DB function
    let subsToNotify = [];
    const { data: matchingSubs, error: matchError } = await supabase
      .rpc('find_matching_alert_subscriptions', { p_property_id: propertyId });

    if (matchError) {
      console.error('Match function error, falling back to all active subs:', matchError);
      // Fallback: get all active subscriptions
      const { data: allSubs } = await supabase
        .from('property_alert_preferences')
        .select('id, email, unsubscribe_token')
        .eq('is_active', true)
        .eq('marketing_consent', true);
      subsToNotify = allSubs || [];
    } else {
      subsToNotify = matchingSubs || [];
    }

    if (subsToNotify.length === 0) {
      return successResponse({ message: 'No matching subscriptions', sent: 0 });
    }

    // Build property image URLs
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const images = (property.images || []).slice(0, 3).map(img => {
      if (img.startsWith('http')) return img;
      return `${supabaseUrl}/storage/v1/object/public/property-images/${img}`;
    });

    const siteUrl = SITE_URL || 'https://www.trataimobiliaria.pt';
    let totalSent = 0;
    let totalErrors = 0;

    for (const sub of subsToNotify) {
      try {
        const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${sub.unsubscribe_token}`;
        const viewUrl = `${siteUrl}/imoveis/${propertyId}`;
        const sellerName = property.seller?.name || 'Trata Imobiliária';
        const sellerPhone = property.seller?.phone || '';

        const emailHtml = buildPropertyAlertEmail({
          property,
          images,
          typeLabel: TYPE_LABELS[property.property_type] || property.property_type,
          priceFormatted: formatPrice(property.price),
          sellerName,
          sellerPhone,
          viewUrl,
          unsubscribeUrl,
          siteUrl
        });

        await sendEmailResend({
          to: sub.email,
          subject: `🏠 Novo Imóvel: ${property.title} - ${formatPrice(property.price)}`,
          html: emailHtml
        });

        // Update last_alert_sent
        await supabase
          .from('property_alert_preferences')
          .update({ last_alert_sent: new Date().toISOString() })
          .eq('id', sub.alert_id || sub.id);

        totalSent++;
      } catch (emailErr) {
        console.error(`Failed to send alert to ${sub.email}:`, emailErr);
        totalErrors++;
      }
    }

    return successResponse({
      message: `Alertas enviados`,
      sent: totalSent,
      errors: totalErrors
    });

  } catch (error) {
    console.error('Send alerts error:', error);
    return errorResponse(error.message || 'Erro ao enviar alertas', 500);
  }
}

const TYPE_LABELS = {
  'apartment': 'Apartamento',
  'house': 'Moradia',
  'land': 'Terreno',
  'commercial': 'Comercial',
  'office': 'Escritório'
};

function formatPrice(price) {
  if (!price) return 'Preço sob consulta';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
}

function buildPropertyAlertEmail({ property, images, typeLabel, priceFormatted, sellerName, sellerPhone, viewUrl, unsubscribeUrl, siteUrl }) {
  const imagesHtml = images.length > 0 ? `
    <tr>
      <td style="padding: 0;">
        <img src="${images[0]}" alt="${property.title}" style="width: 100%; height: 280px; object-fit: cover; display: block;" />
        ${images.length > 1 ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${images.slice(1, 3).map(img => `
            <td width="50%" style="padding: 2px;">
              <img src="${img}" alt="" style="width: 100%; height: 140px; object-fit: cover; display: block;" />
            </td>
            `).join('')}
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
  ` : '';

  const features = [
    property.bedrooms ? `<td style="text-align:center;padding:12px;background:#f0fdf4;border-radius:8px;width:33%"><p style="color:#6b7280;font-size:11px;margin:0;text-transform:uppercase">Quartos</p><p style="color:#1f2937;font-size:20px;font-weight:700;margin:4px 0 0">🛏️ ${property.bedrooms}</p></td>` : '',
    property.bathrooms ? `<td style="text-align:center;padding:12px;background:#f0fdf4;border-radius:8px;width:33%"><p style="color:#6b7280;font-size:11px;margin:0;text-transform:uppercase">WC</p><p style="color:#1f2937;font-size:20px;font-weight:700;margin:4px 0 0">🚿 ${property.bathrooms}</p></td>` : '',
    property.area_sqm ? `<td style="text-align:center;padding:12px;background:#f0fdf4;border-radius:8px;width:33%"><p style="color:#6b7280;font-size:11px;margin:0;text-transform:uppercase">Área</p><p style="color:#1f2937;font-size:20px;font-weight:700;margin:4px 0 0">📐 ${property.area_sqm}m²</p></td>` : ''
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f3f4f6">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
        
        <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:24px 32px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:700">Trata Imobiliária</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">🏠 Novo imóvel que pode interessar-lhe!</p>
        </td></tr>

        ${imagesHtml}
        
        <tr><td style="padding:28px 32px">
          <span style="display:inline-block;background:#dcfce7;color:#166534;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:12px">${typeLabel}</span>
          <h2 style="color:#1f2937;margin:12px 0 8px;font-size:22px;line-height:1.3">${property.title}</h2>
          <p style="color:#6b7280;font-size:15px;margin:0 0 16px">📍 ${property.location}</p>
          <p style="color:#059669;font-size:28px;font-weight:800;margin:0 0 20px">${priceFormatted}</p>
          
          ${features ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:24px"><tr>${features}</tr></table>` : ''}

          ${property.description ? `<p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 24px;border-left:3px solid #059669;padding-left:16px">${property.description.substring(0, 250)}${property.description.length > 250 ? '...' : ''}</p>` : ''}

          <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid #e5e7eb">
            <p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;font-weight:600">Consultor responsável</p>
            <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0">👤 ${sellerName}</p>
            ${sellerPhone ? `<p style="color:#059669;font-size:14px;margin:6px 0 0">📞 ${sellerPhone}</p>` : ''}
          </div>
          
          <div style="text-align:center">
            <a href="${viewUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;padding:16px 48px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(5,150,105,0.3)">Ver Imóvel Completo →</a>
          </div>
        </td></tr>
        
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;text-align:center">
            Recebeu este email porque subscreveu alertas de novos imóveis em <a href="${siteUrl}" style="color:#059669;text-decoration:none">Trata Imobiliária</a>
          </p>
          <p style="color:#9ca3af;font-size:11px;margin:12px 0 0;text-align:center">
            <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline">Cancelar subscrição</a> · Trata Imobiliária · Braga, Portugal · AMI 20736
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
