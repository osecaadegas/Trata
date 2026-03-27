// Shared email configuration and utilities for Vercel Edge Functions

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const SITE_URL = process.env.SITE_URL || 'https://trata-lovat.vercel.app';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@trata.pt';
export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@trata.pt';
export const FROM_NAME = process.env.FROM_NAME || 'Trata Imobiliária';

// Supabase client for server-side operations
export async function supabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars - SUPABASE_URL:', !!SUPABASE_URL, 'SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
    throw new Error('Database not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.');
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Send email via Resend (for transactional emails)
export async function sendEmailResend({ to, subject, html, text, replyTo }) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Resend error:', data);
    throw new Error(data.message || 'Failed to send email');
  }

  return { provider: 'resend', messageId: data.id };
}

// Send email via Brevo (for marketing/bulk emails)
export async function sendEmailBrevo({ to, subject, html, params, templateId, tags }) {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
    subject,
    tags: tags || ['property-alerts']
  };

  if (templateId) {
    payload.templateId = templateId;
    payload.params = params;
  } else {
    payload.htmlContent = html;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Brevo error:', data);
    throw new Error(data.message || 'Failed to send email');
  }

  return { provider: 'brevo', messageId: data.messageId };
}

// Add/update contact in Brevo
export async function addBrevoContact({ email, attributes, listIds }) {
  if (!BREVO_API_KEY) return null;

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      attributes: attributes || {},
      listIds: listIds || [],
      updateEnabled: true
    })
  });

  if (!response.ok && response.status !== 201) {
    const data = await response.json();
    console.error('Brevo contact error:', data);
  }

  return response.ok || response.status === 201;
}

// Remove contact from Brevo list
export async function removeBrevoContact(email) {
  if (!BREVO_API_KEY) return null;

  const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: {
      'api-key': BREVO_API_KEY
    }
  });

  return response.ok || response.status === 404;
}

// Log email to database
export async function logEmail(supabase, {
  recipientEmail,
  recipientName,
  subject,
  templateName,
  emailType,
  status,
  provider,
  providerMessageId,
  inquiryId,
  propertyId,
  userId,
  alertPreferenceId,
  errorMessage,
  metadata
}) {
  try {
    const { error } = await supabase.from('email_logs').insert({
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      template_name: templateName,
      email_type: emailType,
      status,
      provider,
      provider_message_id: providerMessageId,
      inquiry_id: inquiryId,
      property_id: propertyId,
      user_id: userId,
      alert_preference_id: alertPreferenceId,
      error_message: errorMessage,
      metadata,
      sent_at: status === 'sent' ? new Date().toISOString() : null
    });

    if (error) console.error('Failed to log email:', error);
  } catch (err) {
    console.error('Email log error:', err);
  }
}

// Validate email format
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Sanitize input
export function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Error response helper
export function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Success response helper
export function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
