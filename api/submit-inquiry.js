// Minimal API endpoint to insert inquiries via Supabase REST API
// Uses service role key to bypass RLS, with anon key fallback

import {
  PROPERTY_INQUIRY_EMAIL,
  SITE_URL,
  sendEmailResend
} from './_utils/email.js';
import { inquiryNotificationTemplate } from './_templates/inquiry.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

export const config = {
  runtime: 'edge'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function sanitize(str) {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    const { name, email, phone, message, propertyId, propertyTitle,
            inquiryType, preferredContact, preferredTime,
            marketingConsent, utmSource, utmMedium, utmCampaign } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!message || message.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Mensagem deve ter pelo menos 10 caracteres' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const inquiryData = {
      name: sanitize(name.trim()),
      email: email.toLowerCase().trim(),
      phone: phone ? sanitize(phone.trim()) : null,
      message: sanitize(message.trim()),
      property_id: propertyId || null,
      property_title: propertyTitle ? sanitize(propertyTitle) : null,
      inquiry_type: inquiryType || 'general',
      preferred_contact: preferredContact || 'email',
      preferred_time: preferredTime || null,
      marketing_consent: Boolean(marketingConsent),
      consent_timestamp: marketingConsent ? new Date().toISOString() : null,
      source: 'website',
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      status: 'new'
    };

    // Insert via Supabase REST API (no SDK needed)
    console.log('Using key type:', SUPABASE_SERVICE_KEY ? 'service_role' : 'anon');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(inquiryData)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Supabase insert error:', res.status, errText);
      return new Response(JSON.stringify({ error: 'Erro ao submeter pedido. Por favor tente novamente.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Notify the agency without risking loss of the inquiry if the email provider is unavailable.
    try {
      const notificationHtml = inquiryNotificationTemplate({
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        message: inquiryData.message,
        inquiryType: inquiryData.inquiry_type,
        preferredContact: inquiryData.preferred_contact,
        preferredTime: inquiryData.preferred_time,
        propertyTitle: inquiryData.property_title,
        propertyLocation: null,
        propertyPrice: null,
        inquiryId: null,
        source: inquiryData.source,
        adminUrl: `${SITE_URL}/messages`
      });

      await sendEmailResend({
        to: PROPERTY_INQUIRY_EMAIL,
        subject: `🏠 Novo Pedido: ${inquiryData.name} - ${inquiryData.property_title || 'Pedido Geral'}`,
        html: notificationHtml,
        replyTo: inquiryData.email
      });
    } catch (emailError) {
      console.error('Property inquiry notification failed:', emailError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Pedido enviado com sucesso! Entraremos em contacto em breve.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Submit inquiry error:', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro. Por favor tente novamente.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
