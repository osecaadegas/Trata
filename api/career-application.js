// API: Career application notification
// POST /api/career-application

import {
  sendEmailResend,
  corsHeaders,
  errorResponse,
  successResponse,
  ADMIN_EMAIL,
  SITE_URL,
  FROM_NAME
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
    const { name, email, phone, jobTitle, jobId } = await request.json();

    if (!name || !email || !jobTitle) {
      return errorResponse('Missing required fields');
    }

    // Notify admin
    await sendEmailResend({
      to: ADMIN_EMAIL,
      subject: `Nova Candidatura: ${jobTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nova Candidatura Recebida</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px;"><strong>Vaga:</strong> ${jobTitle}</p>
            <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
            ${phone ? `<p style="margin: 0 0 8px;"><strong>Telefone:</strong> ${phone}</p>` : ''}
            <p style="margin: 16px 0 0;">
              <a href="${SITE_URL}/job-management" style="display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Ver Candidaturas
              </a>
            </p>
          </div>
        </div>
      `,
      replyTo: email
    });

    // Confirm to applicant
    await sendEmailResend({
      to: email,
      subject: `Candidatura recebida - ${FROM_NAME}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">${FROM_NAME}</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Recebemos a sua candidatura para a posição de <strong>${jobTitle}</strong>.</p>
            <p>A nossa equipa irá analisar o seu perfil e entraremos em contacto em breve.</p>
            <p>Obrigado pelo seu interesse na ${FROM_NAME}!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 12px;">Este é um email automático. Não responda directamente.</p>
          </div>
        </div>
      `
    });

    return successResponse({ sent: true });
  } catch (error) {
    console.error('Career notification error:', error);
    return successResponse({ sent: false });
  }
}
