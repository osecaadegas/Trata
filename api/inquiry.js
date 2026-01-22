// API: Submit property inquiry
// POST /api/inquiry

import {
  supabaseAdmin,
  sendEmailResend,
  logEmail,
  isValidEmail,
  sanitize,
  corsHeaders,
  errorResponse,
  successResponse,
  ADMIN_EMAIL,
  SITE_URL
} from './_utils/email.js';

import {
  inquiryConfirmationTemplate,
  inquiryNotificationTemplate
} from './_templates/inquiry.js';

export const config = {
  runtime: 'edge'
};

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
    
    // Extract and validate fields
    const {
      name,
      email,
      phone,
      message,
      propertyId,
      propertyTitle,
      inquiryType = 'general',
      preferredContact = 'email',
      preferredTime,
      marketingConsent = false,
      source = 'website',
      utmSource,
      utmMedium,
      utmCampaign
    } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return errorResponse('Nome é obrigatório');
    }

    if (!email || !isValidEmail(email)) {
      return errorResponse('Email inválido');
    }

    if (!message || message.trim().length < 10) {
      return errorResponse('Mensagem deve ter pelo menos 10 caracteres');
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Initialize Supabase
    const supabase = await supabaseAdmin();

    // Check rate limit (5 inquiries per hour per IP/email)
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_identifier: email,
      p_action_type: 'inquiry',
      p_max_attempts: 5,
      p_window_minutes: 60
    });

    if (!rateLimitOk) {
      return errorResponse('Demasiadas tentativas. Por favor aguarde uma hora.', 429);
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(name.trim()),
      email: email.toLowerCase().trim(),
      phone: phone ? sanitize(phone.trim()) : null,
      message: sanitize(message.trim()),
      property_id: propertyId || null,
      property_title: propertyTitle ? sanitize(propertyTitle) : null,
      inquiry_type: inquiryType,
      preferred_contact: preferredContact,
      preferred_time: preferredTime || null,
      marketing_consent: Boolean(marketingConsent),
      consent_timestamp: marketingConsent ? new Date().toISOString() : null,
      consent_ip: marketingConsent ? clientIp : null,
      source,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      ip_address: clientIp,
      user_agent: request.headers.get('user-agent')
    };

    // Insert inquiry into database
    const { data: inquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert(sanitizedData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Erro ao submeter pedido. Por favor tente novamente.');
    }

    // Get property details if referenced
    let property = null;
    if (propertyId) {
      const { data: propData } = await supabase
        .from('properties')
        .select('title, location, price, images')
        .eq('id', propertyId)
        .single();
      property = propData;
    }

    // Send confirmation email to user
    try {
      const confirmationHtml = inquiryConfirmationTemplate({
        name: sanitizedData.name,
        propertyTitle: property?.title || sanitizedData.property_title,
        propertyLocation: property?.location,
        message: sanitizedData.message,
        inquiryId: inquiry.id
      });

      const confirmResult = await sendEmailResend({
        to: sanitizedData.email,
        subject: property 
          ? `Confirmação: O seu pedido sobre ${property.title}`
          : 'Confirmação: Recebemos o seu pedido - Trata Imobiliária',
        html: confirmationHtml,
        replyTo: ADMIN_EMAIL
      });

      await logEmail(supabase, {
        recipientEmail: sanitizedData.email,
        recipientName: sanitizedData.name,
        subject: 'Confirmação de pedido',
        templateName: 'inquiry_confirmation',
        emailType: 'inquiry_confirmation',
        status: 'sent',
        provider: confirmResult.provider,
        providerMessageId: confirmResult.messageId,
        inquiryId: inquiry.id,
        propertyId: propertyId || null
      });

    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
      await logEmail(supabase, {
        recipientEmail: sanitizedData.email,
        emailType: 'inquiry_confirmation',
        status: 'failed',
        inquiryId: inquiry.id,
        errorMessage: emailErr.message
      });
    }

    // Send notification email to admin
    try {
      const notificationHtml = inquiryNotificationTemplate({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        inquiryType: sanitizedData.inquiry_type,
        preferredContact: sanitizedData.preferred_contact,
        preferredTime: sanitizedData.preferred_time,
        propertyTitle: property?.title || sanitizedData.property_title,
        propertyLocation: property?.location,
        propertyPrice: property?.price,
        inquiryId: inquiry.id,
        source: sanitizedData.source,
        adminUrl: `${SITE_URL}/admin/inquiries`
      });

      const notifyResult = await sendEmailResend({
        to: ADMIN_EMAIL,
        subject: `🏠 Novo Pedido: ${sanitizedData.name} - ${property?.title || 'Pedido Geral'}`,
        html: notificationHtml,
        replyTo: sanitizedData.email
      });

      await logEmail(supabase, {
        recipientEmail: ADMIN_EMAIL,
        subject: 'Notificação de novo pedido',
        templateName: 'inquiry_notification',
        emailType: 'inquiry_notification',
        status: 'sent',
        provider: notifyResult.provider,
        providerMessageId: notifyResult.messageId,
        inquiryId: inquiry.id,
        propertyId: propertyId || null
      });

    } catch (emailErr) {
      console.error('Notification email failed:', emailErr);
      await logEmail(supabase, {
        recipientEmail: ADMIN_EMAIL,
        emailType: 'inquiry_notification',
        status: 'failed',
        inquiryId: inquiry.id,
        errorMessage: emailErr.message
      });
    }

    return successResponse({
      message: 'Pedido enviado com sucesso! Entraremos em contacto em breve.',
      inquiryId: inquiry.id
    });

  } catch (error) {
    console.error('Inquiry API error:', error);
    return errorResponse('Ocorreu um erro. Por favor tente novamente.', 500);
  }
}
