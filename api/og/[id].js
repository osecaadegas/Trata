// Dynamic Open Graph meta tags for property pages
// Serves HTML with property-specific OG tags for social media crawlers
// Real users get redirected to the SPA hash route

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SITE_URL = 'https://www.trataimobiliaria.pt';

export const config = {
  runtime: 'edge'
};

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPrice(price) {
  if (!price) return '';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export default async function handler(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id || id.length < 10) {
    return Response.redirect(`${SITE_URL}/`, 302);
  }

  try {
    // Fetch property from Supabase REST API
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?id=eq.${encodeURIComponent(id)}&select=id,title,description,location,price,property_type,bedrooms,bathrooms,area_sqm,images,status`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!res.ok) {
      return Response.redirect(`${SITE_URL}/`, 302);
    }

    const data = await res.json();
    const property = data?.[0];

    if (!property) {
      return Response.redirect(`${SITE_URL}/`, 302);
    }

    // Build OG meta values
    const title = escapeHtml(property.title || 'Imóvel');
    const location = escapeHtml(property.location || '');
    const price = formatPrice(property.price);
    const ogTitle = `${title}${location ? ` - ${location}` : ''}${price ? ` | ${price}` : ''}`;

    const details = [];
    if (property.bedrooms) details.push(`${property.bedrooms} quartos`);
    if (property.bathrooms) details.push(`${property.bathrooms} WC`);
    if (property.area_sqm) details.push(`${property.area_sqm}m²`);

    let ogDescription = escapeHtml(property.description || '');
    if (details.length > 0) {
      ogDescription = `${details.join(' | ')}. ${ogDescription}`;
    }
    // Truncate description for OG
    if (ogDescription.length > 200) {
      ogDescription = ogDescription.substring(0, 197) + '...';
    }

    // Get first image or fallback
    let ogImage = `${SITE_URL}/trata.png`;
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      if (firstImage.startsWith('http')) {
        ogImage = escapeHtml(firstImage);
      }
    }

    const canonicalUrl = `${SITE_URL}/imovel/${encodeURIComponent(id)}`;
    const spaUrl = `${SITE_URL}/imovel/${encodeURIComponent(id)}`;

    const html = `<!DOCTYPE html>
<html lang="pt-pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle} - TRATA Imobiliária</title>
  <meta name="description" content="${ogDescription}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="pt_PT">
  <meta property="og:site_name" content="TRATA Imobiliária">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDescription}">
  <meta name="twitter:image" content="${ogImage}">

  <link rel="icon" type="image/jpeg" href="/trata.jpg">
  <script>window.location.replace("${spaUrl}");</script>
</head>
<body>
  <p>A redirecionar para <a href="${spaUrl}">${ogTitle}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      }
    });
  } catch (e) {
    return Response.redirect(`${SITE_URL}/`, 302);
  }
}
