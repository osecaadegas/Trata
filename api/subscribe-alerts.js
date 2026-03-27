// API: Subscribe to property alerts
// POST /api/subscribe-alerts

import {
  supabaseAdmin,
  sendEmailResend,
  addBrevoContact,
  logEmail,
  isValidEmail,
  sanitize,
  corsHeaders,
  errorResponse,
  successResponse,
  SITE_URL
} from './_utils/email.js';

import { alertSubscriptionConfirmationTemplate } from './_templates/alerts.js';

export const config = {
  runtime: 'edge'
};

// Brevo list ID for property alerts subscribers
const BREVO_ALERTS_LIST_ID = parseInt(process.env.BREVO_ALERTS_LIST_ID || '0');

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    
    const {
      email,
      name,
      phone,
      locations = [],
      propertyTypes = [],
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minArea,
      maxArea,
      conditions = [],
      frequency = 'instant',
      marketingConsent
    } = body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return errorResponse('Email inválido');
    }

    if (!marketingConsent) {
      return errorResponse('Deve aceitar receber comunicações de marketing para subscrever alertas');
    }

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Initialize Supabase
    const supabase = await supabaseAdmin();
    if (!supabase) {
      return errorResponse('Serviço temporariamente indisponível (DB)', 503);
    }

    // Check rate limit (3 subscriptions per hour)
    const { data: rateLimitOk, error: rlError } = await supabase.rpc('check_rate_limit', {
      p_identifier: email,
      p_action_type: 'alert_subscription',
      p_max_attempts: 3,
      p_window_minutes: 60
    });

    if (rlError) {
      console.error('Rate limit check error:', rlError);
      // Don't block subscription if rate limit check fails
    } else if (!rateLimitOk) {
      return errorResponse('Demasiadas tentativas. Por favor aguarde uma hora.', 429);
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('property_alert_preferences')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    let subscription;
    let isUpdate = false;

    if (existing) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('property_alert_preferences')
        .update({
          location: locations.length > 0 ? locations : null,
          property_types: propertyTypes.length > 0 ? propertyTypes : null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          min_bedrooms: minBedrooms || null,
          max_bedrooms: maxBedrooms || null,
          min_area: minArea || null,
          max_area: maxArea || null,
          conditions: conditions.length > 0 ? conditions : null,
          frequency,
          is_active: true,
          marketing_consent: true,
          consent_timestamp: new Date().toISOString(),
          consent_ip: clientIp,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return errorResponse('Erro ao atualizar subscrição');
      }

      subscription = data;
      isUpdate = true;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('property_alert_preferences')
        .insert({
          email: email.toLowerCase().trim(),
          location: locations.length > 0 ? locations : null,
          property_types: propertyTypes.length > 0 ? propertyTypes : null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          min_bedrooms: minBedrooms || null,
          max_bedrooms: maxBedrooms || null,
          min_area: minArea || null,
          max_area: maxArea || null,
          conditions: conditions.length > 0 ? conditions : null,
          frequency,
          marketing_consent: true,
          consent_timestamp: new Date().toISOString(),
          consent_ip: clientIp,
          consent_text_version: '1.0'
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return errorResponse('Erro ao criar subscrição');
      }

      subscription = data;
    }

    // Add to Brevo contact list
    if (BREVO_ALERTS_LIST_ID > 0) {
      try {
        await addBrevoContact({
          email: email.toLowerCase(),
          attributes: {
            NOME: name || '',
            TELEFONE: phone || '',
            LOCALIZACOES: locations.join(', '),
            TIPOS_IMOVEL: propertyTypes.join(', '),
            PRECO_MIN: minPrice || '',
            PRECO_MAX: maxPrice || '',
            DATA_SUBSCRICAO: new Date().toISOString().split('T')[0]
          },
          listIds: [BREVO_ALERTS_LIST_ID]
        });
      } catch (brevoErr) {
        console.error('Brevo contact error:', brevoErr);
        // Don't fail the subscription if Brevo fails
      }
    }

    // Build unsubscribe URL
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${subscription.unsubscribe_token}`;

    // Send confirmation email
    try {
      const confirmationHtml = alertSubscriptionConfirmationTemplate({
        name: name || email.split('@')[0],
        locations,
        propertyTypes,
        minPrice,
        maxPrice,
        frequency,
        unsubscribeUrl,
        isUpdate
      });

      const result = await sendEmailResend({
        to: email.toLowerCase(),
        subject: isUpdate 
          ? 'Alertas de imóveis atualizados - Trata Imobiliária'
          : 'Bem-vindo aos alertas de imóveis - Trata Imobiliária',
        html: confirmationHtml
      });

      await logEmail(supabase, {
        recipientEmail: email.toLowerCase(),
        recipientName: name,
        subject: 'Confirmação de subscrição de alertas',
        templateName: 'alert_subscription_confirmation',
        emailType: 'alert_subscription',
        status: 'sent',
        provider: result.provider,
        providerMessageId: result.messageId,
        alertPreferenceId: subscription.id
      });

    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
      await logEmail(supabase, {
        recipientEmail: email.toLowerCase(),
        emailType: 'alert_subscription',
        status: 'failed',
        alertPreferenceId: subscription.id,
        errorMessage: emailErr.message
      });
    }

    return successResponse({
      message: isUpdate 
        ? 'As suas preferências de alerta foram atualizadas!'
        : 'Subscrição criada com sucesso! Receberá alertas quando houver novos imóveis.',
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Subscribe API error:', error);
    return errorResponse(error.message || 'Ocorreu um erro. Por favor tente novamente.', 500);
  }
}
