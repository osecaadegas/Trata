// Email templates for property alerts

const BRAND_COLOR = '#667eea';
const SITE_URL = process.env.SITE_URL || 'https://trata-lovat.vercel.app';

export function alertSubscriptionConfirmationTemplate({
  name,
  locations,
  propertyTypes,
  minPrice,
  maxPrice,
  frequency,
  unsubscribeUrl,
  isUpdate
}) {
  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const frequencyText = {
    'instant': 'Imediatamente',
    'daily': 'Diariamente',
    'weekly': 'Semanalmente'
  };

  const typeLabels = {
    'apartment': 'Apartamento',
    'house': 'Moradia',
    'land': 'Terreno',
    'commercial': 'Comercial',
    'office': 'Escritório'
  };

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alertas de Imóveis</title>
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
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">
                                ${isUpdate ? '🔄 Alertas Atualizados' : '🔔 Alertas Ativados'}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 24px;">
                                ${isUpdate ? 'Preferências atualizadas!' : 'Bem-vindo, ' + name + '!'}
                            </h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                                ${isUpdate 
                                  ? 'As suas preferências de alerta foram atualizadas com sucesso.' 
                                  : 'Agora receberá alertas quando novos imóveis corresponderem às suas preferências.'}
                            </p>
                            
                            <!-- Preferences Summary -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                                <h3 style="color: #374151; margin: 0 0 16px; font-size: 18px;">📋 As suas preferências</h3>
                                
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    ${locations && locations.length > 0 ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top; width: 120px;">📍 Localizações:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${locations.join(', ')}</td>
                                    </tr>
                                    ` : `
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top; width: 120px;">📍 Localizações:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">Todas</td>
                                    </tr>
                                    `}
                                    
                                    ${propertyTypes && propertyTypes.length > 0 ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">🏠 Tipos:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${propertyTypes.map(t => typeLabels[t] || t).join(', ')}</td>
                                    </tr>
                                    ` : `
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">🏠 Tipos:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">Todos</td>
                                    </tr>
                                    `}
                                    
                                    ${(minPrice || maxPrice) ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">💰 Preço:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                                            ${minPrice && maxPrice 
                                              ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                                              : minPrice 
                                                ? `A partir de ${formatPrice(minPrice)}`
                                                : `Até ${formatPrice(maxPrice)}`
                                            }
                                        </td>
                                    </tr>
                                    ` : ''}
                                    
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">⏰ Frequência:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${frequencyText[frequency] || frequency}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="${SITE_URL}/properties" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                    Ver imóveis disponíveis
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                                Trata Imobiliária · Braga, Portugal<br>
                                <a href="${SITE_URL}" style="color: ${BRAND_COLOR};">www.trataimobiliaria.pt</a>
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; line-height: 1.6; margin: 16px 0 0; text-align: center;">
                                Para cancelar a subscrição, <a href="${unsubscribeUrl}" style="color: #6b7280;">clique aqui</a>.
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

export function propertyAlertTemplate({ property, unsubscribeUrl, viewPropertyUrl }) {
  const formatPrice = (price) => {
    if (!price) return 'Preço sob consulta';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const typeLabels = {
    'apartment': 'Apartamento',
    'house': 'Moradia',
    'land': 'Terreno',
    'commercial': 'Comercial',
    'office': 'Escritório'
  };

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Imóvel Disponível</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #764ba2 100%); padding: 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🏠 Novo Imóvel!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">
                                Encontrámos um imóvel que corresponde às suas preferências
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Property Image -->
                    ${property.image ? `
                    <tr>
                        <td>
                            <img src="${property.image}" alt="${property.title}" style="width: 100%; height: 250px; object-fit: cover;" />
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <!-- Property Type Badge -->
                            <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
                                ${typeLabels[property.propertyType] || property.propertyType}
                            </span>
                            
                            <h2 style="color: #1f2937; margin: 12px 0; font-size: 24px; line-height: 1.3;">
                                ${property.title}
                            </h2>
                            
                            <p style="color: #6b7280; font-size: 16px; margin: 0 0 16px;">
                                📍 ${property.location}
                            </p>
                            
                            <!-- Price -->
                            <p style="color: #6de01f; font-size: 28px; font-weight: 700; margin: 0 0 24px;">
                                ${formatPrice(property.price)}
                            </p>
                            
                            <!-- Features -->
                            <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        ${property.bedrooms ? `
                                        <td style="text-align: center; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
                                            <p style="color: #6b7280; font-size: 12px; margin: 0;">Quartos</p>
                                            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 4px 0 0;">🛏️ ${property.bedrooms}</p>
                                        </td>
                                        ` : ''}
                                        ${property.bathrooms ? `
                                        <td style="text-align: center; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
                                            <p style="color: #6b7280; font-size: 12px; margin: 0;">Casas de banho</p>
                                            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 4px 0 0;">🚿 ${property.bathrooms}</p>
                                        </td>
                                        ` : ''}
                                        ${property.area ? `
                                        <td style="text-align: center; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
                                            <p style="color: #6b7280; font-size: 12px; margin: 0;">Área</p>
                                            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 4px 0 0;">📐 ${property.area}m²</p>
                                        </td>
                                        ` : ''}
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- CTA -->
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="${viewPropertyUrl}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px;">
                                    Ver Imóvel
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                                Recebeu este email porque subscreveu alertas de novos imóveis.<br>
                                <a href="${unsubscribeUrl}" style="color: #6b7280;">Cancelar subscrição</a>
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; line-height: 1.6; margin: 16px 0 0; text-align: center;">
                                Trata Imobiliária · Braga, Portugal
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
