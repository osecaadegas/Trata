// API: Unsubscribe from emails
// GET/POST /api/unsubscribe?token=xxx

import {
  supabaseAdmin,
  removeBrevoContact,
  logEmail,
  corsHeaders,
  errorResponse,
  successResponse,
  SITE_URL
} from './_utils/email.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get token from query params
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      // Return HTML page for invalid tokens
      return new Response(unsubscribeErrorHtml(), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(unsubscribeErrorHtml(), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Initialize Supabase
    const supabase = await supabaseAdmin();

    // Find subscription by token
    const { data: alertPref } = await supabase
      .from('property_alert_preferences')
      .select('id, email, is_active')
      .eq('unsubscribe_token', token)
      .single();

    // Also check users table
    const { data: user } = await supabase
      .from('users')
      .select('id, email, marketing_consent')
      .eq('unsubscribe_token', token)
      .single();

    if (!alertPref && !user) {
      return new Response(unsubscribeErrorHtml('Token inválido ou expirado'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const email = alertPref?.email || user?.email;
    let unsubscribed = false;

    // Unsubscribe from alert preferences
    if (alertPref) {
      const { error } = await supabase
        .from('property_alert_preferences')
        .update({
          is_active: false,
          marketing_consent: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertPref.id);

      if (!error) {
        unsubscribed = true;
        await logEmail(supabase, {
          recipientEmail: email,
          emailType: 'unsubscribe',
          status: 'sent',
          alertPreferenceId: alertPref.id,
          metadata: { action: 'unsubscribed_alerts' }
        });
      }
    }

    // Unsubscribe user from marketing
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({
          marketing_consent: false
        })
        .eq('id', user.id);

      if (!error) {
        unsubscribed = true;
        await logEmail(supabase, {
          recipientEmail: email,
          emailType: 'unsubscribe',
          status: 'sent',
          userId: user.id,
          metadata: { action: 'unsubscribed_marketing' }
        });
      }
    }

    // Remove from Brevo
    if (email) {
      try {
        await removeBrevoContact(email);
      } catch (brevoErr) {
        console.error('Brevo removal error:', brevoErr);
      }
    }

    if (!unsubscribed) {
      return new Response(unsubscribeErrorHtml('Erro ao processar pedido'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Return success HTML page
    return new Response(unsubscribeSuccessHtml(email), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return new Response(unsubscribeErrorHtml('Ocorreu um erro inesperado'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

function unsubscribeSuccessHtml(email) {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscrição cancelada - Trata Imobiliária</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 48px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon {
            width: 80px;
            height: 80px;
            background: #7cfa27;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
        }
        .icon svg { width: 40px; height: 40px; color: white; }
        h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 16px;
        }
        p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .email {
            background: #f3f4f6;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: monospace;
            color: #374151;
            margin-bottom: 24px;
            word-break: break-all;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
        }
        .btn:hover { background: #5a67d8; }
        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1>Subscrição cancelada</h1>
        <p>O seu email foi removido com sucesso da nossa lista de comunicações de marketing.</p>
        ${email ? `<div class="email">${email}</div>` : ''}
        <p>Já não receberá alertas de novos imóveis nem emails promocionais.</p>
        <a href="${SITE_URL}" class="btn">Voltar ao site</a>
        <div class="footer">
            <p>Se isto foi um erro, pode voltar a subscrever a qualquer momento.</p>
        </div>
    </div>
</body>
</html>
`;
}

function unsubscribeErrorHtml(message = 'Link inválido') {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - Trata Imobiliária</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 48px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon {
            width: 80px;
            height: 80px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
        }
        .icon svg { width: 40px; height: 40px; color: white; }
        h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 16px;
        }
        p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
        }
        .btn:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </div>
        <h1>${message}</h1>
        <p>O link de cancelamento de subscrição é inválido ou já foi utilizado.</p>
        <p>Se pretende cancelar a sua subscrição, entre em contacto connosco.</p>
        <a href="${SITE_URL}" class="btn">Voltar ao site</a>
    </div>
</body>
</html>
`;
}
