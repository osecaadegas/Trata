// Email templates for inquiries

const BRAND_COLOR = '#667eea';
const SITE_URL = process.env.SITE_URL || 'https://trata-lovat.vercel.app';

export function inquiryConfirmationTemplate({ name, propertyTitle, propertyLocation, message, inquiryId }) {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Pedido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #764ba2 100%); padding: 32px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Trata Imobiliária</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 24px;">Olá ${name}!</h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                                Recebemos o seu pedido com sucesso. A nossa equipa irá analisá-lo e entrar em contacto consigo em breve.
                            </p>
                            
                            ${propertyTitle ? `
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${BRAND_COLOR};">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Imóvel de interesse:</p>
                                <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0;">${propertyTitle}</p>
                                ${propertyLocation ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">📍 ${propertyLocation}</p>` : ''}
                            </div>
                            ` : ''}
                            
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">A sua mensagem:</p>
                                <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${message}"</p>
                            </div>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                                Normalmente respondemos dentro de <strong>24 horas úteis</strong>.
                            </p>
                            
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="${SITE_URL}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                    Ver mais imóveis
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                                Referência: ${inquiryId ? inquiryId.slice(0, 8).toUpperCase() : 'N/A'}
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 16px 0 0; text-align: center;">
                                Trata Imobiliária · Braga, Portugal<br>
                                <a href="${SITE_URL}" style="color: ${BRAND_COLOR};">www.trata.pt</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

export function inquiryNotificationTemplate({
  name,
  email,
  phone,
  message,
  inquiryType,
  preferredContact,
  preferredTime,
  propertyTitle,
  propertyLocation,
  propertyPrice,
  inquiryId,
  source,
  adminUrl
}) {
  const inquiryTypes = {
    'visit': '🏠 Visita',
    'info': 'ℹ️ Informação',
    'price': '💰 Preço',
    'general': '📝 Geral'
  };

  const contactMethods = {
    'email': '📧 Email',
    'phone': '📞 Telefone',
    'whatsapp': '💬 WhatsApp'
  };

  const times = {
    'morning': '🌅 Manhã',
    'afternoon': '☀️ Tarde',
    'evening': '🌆 Noite'
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Pedido de Contacto</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🔔 Novo Pedido de Contacto</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <!-- Client Info -->
                            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                                <h3 style="color: #065f46; margin: 0 0 12px; font-size: 16px;">Dados do Cliente</h3>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Nome:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Email:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><a href="mailto:${email}" style="color: ${BRAND_COLOR};">${email}</a></td>
                                    </tr>
                                    ${phone ? `
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Telefone:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><a href="tel:${phone}" style="color: ${BRAND_COLOR};">${phone}</a></td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Tipo:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;">${inquiryTypes[inquiryType] || inquiryType}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Contacto preferido:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;">${contactMethods[preferredContact] || preferredContact}</td>
                                    </tr>
                                    ${preferredTime ? `
                                    <tr>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;"><strong>Horário:</strong></td>
                                        <td style="padding: 4px 0; color: #374151; font-size: 14px;">${times[preferredTime] || preferredTime}</td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            ${propertyTitle ? `
                            <!-- Property Info -->
                            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #0284c7;">
                                <h3 style="color: #075985; margin: 0 0 12px; font-size: 16px;">🏠 Imóvel</h3>
                                <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px;">${propertyTitle}</p>
                                ${propertyLocation ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 4px;">📍 ${propertyLocation}</p>` : ''}
                                ${propertyPrice ? `<p style="color: #059669; font-size: 16px; font-weight: 600; margin: 8px 0 0;">💰 ${formatPrice(propertyPrice)}</p>` : ''}
                            </div>
                            ` : ''}
                            
                            <!-- Message -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                <h3 style="color: #374151; margin: 0 0 12px; font-size: 16px;">💬 Mensagem</h3>
                                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                            </div>
                            
                            <!-- Actions -->
                            <div style="text-align: center;">
                                <a href="${adminUrl}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">
                                    Ver no Admin
                                </a>
                                <a href="mailto:${email}?subject=Re: Pedido de informação - Trata Imobiliária" style="display: inline-block; background: white; color: ${BRAND_COLOR}; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid ${BRAND_COLOR};">
                                    Responder
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                                Ref: ${inquiryId ? inquiryId.slice(0, 8).toUpperCase() : 'N/A'} · Origem: ${source || 'Website'} · ${new Date().toLocaleString('pt-PT')}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}
