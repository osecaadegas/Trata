// API: Send property alerts for new listings
// This endpoint is triggered by Supabase webhook or cron job
// POST /api/send-property-alerts

import {
  supabaseAdmin,
  sendEmailBrevo,
  logEmail,
  corsHeaders,
  errorResponse,
  successResponse,
  SITE_URL
} from './_utils/email.js';

import { propertyAlertTemplate } from './_templates/alerts.js';

export const config = {
  runtime: 'edge'
};

// Webhook secret for validation
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Validate webhook secret
    const authHeader = request.headers.get('authorization');
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { propertyId, processPending = false } = body;

    // Initialize Supabase
    const supabase = await supabaseAdmin();

    let properties = [];

    if (propertyId) {
      // Send alerts for specific property
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('status', 'available')
        .single();

      if (error || !data) {
        return errorResponse('Property not found', 404);
      }
      properties = [data];
    } else if (processPending) {
      // Process pending alerts from email_logs
      const { data: pendingLogs } = await supabase
        .from('email_logs')
        .select('property_id, metadata')
        .eq('email_type', 'property_alert_pending')
        .eq('status', 'pending')
        .limit(50);

      if (pendingLogs?.length > 0) {
        const propertyIds = [...new Set(pendingLogs.map(l => l.property_id))];
        const { data: propsData } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds)
          .eq('status', 'available');
        
        properties = propsData || [];
      }
    }

    if (properties.length === 0) {
      return successResponse({ message: 'No properties to process', sent: 0 });
    }

    let totalSent = 0;
    let totalErrors = 0;

    for (const property of properties) {
      // Find matching subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .rpc('find_matching_alert_subscriptions', { p_property_id: property.id });

      if (subError) {
        console.error('Error finding subscriptions:', subError);
        continue;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No matching subscriptions for property ${property.id}`);
        // Mark as processed
        await supabase
          .from('email_logs')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('property_id', property.id)
          .eq('email_type', 'property_alert_pending');
        continue;
      }

      console.log(`Sending alerts to ${subscriptions.length} subscribers for property ${property.id}`);

      // Send alerts in batches
      for (const sub of subscriptions) {
        try {
          const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${sub.unsubscribe_token}`;
          
          const emailHtml = propertyAlertTemplate({
            property: {
              id: property.id,
              title: property.title,
              location: property.location,
              price: property.price,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              area: property.area_sqm,
              image: property.images?.[0],
              propertyType: property.property_type
            },
            unsubscribeUrl,
            viewPropertyUrl: `${SITE_URL}/property/${property.id}`
          });

          await sendEmailBrevo({
            to: sub.email,
            subject: `🏠 Novo Imóvel: ${property.title} - ${formatPrice(property.price)}`,
            html: emailHtml,
            tags: ['property-alert', `property-${property.id}`]
          });

          await logEmail(supabase, {
            recipientEmail: sub.email,
            subject: `Novo Imóvel: ${property.title}`,
            templateName: 'property_alert',
            emailType: 'property_alert',
            status: 'sent',
            provider: 'brevo',
            propertyId: property.id,
            alertPreferenceId: sub.alert_id
          });

          // Update last_alert_sent
          await supabase
            .from('property_alert_preferences')
            .update({ last_alert_sent: new Date().toISOString() })
            .eq('id', sub.alert_id);

          totalSent++;

        } catch (emailErr) {
          console.error(`Failed to send alert to ${sub.email}:`, emailErr);
          
          await logEmail(supabase, {
            recipientEmail: sub.email,
            emailType: 'property_alert',
            status: 'failed',
            propertyId: property.id,
            alertPreferenceId: sub.alert_id,
            errorMessage: emailErr.message
          });

          totalErrors++;
        }
      }

      // Mark pending log as processed
      await supabase
        .from('email_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('property_id', property.id)
        .eq('email_type', 'property_alert_pending');
    }

    return successResponse({
      message: `Property alerts processed`,
      sent: totalSent,
      errors: totalErrors,
      properties: properties.length
    });

  } catch (error) {
    console.error('Send alerts API error:', error);
    return errorResponse('Ocorreu um erro ao processar alertas', 500);
  }
}

function formatPrice(price) {
  if (!price) return 'Preço sob consulta';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
}
