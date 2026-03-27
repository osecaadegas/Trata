// Dynamic sitemap that includes all property pages + static pages
// Fetches live property IDs from Supabase

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SITE_URL = 'https://www.trataimobiliaria.pt';

export const config = {
  runtime: 'edge'
};

export default async function handler() {
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/imoveis', changefreq: 'daily', priority: '0.9' },
    { loc: '/servicos', changefreq: 'monthly', priority: '0.8' },
    { loc: '/contactos', changefreq: 'monthly', priority: '0.8' },
    { loc: '/sobre', changefreq: 'monthly', priority: '0.7' },
    { loc: '/carreiras', changefreq: 'weekly', priority: '0.7' },
    { loc: '/guias', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guias/como-comprar-casa-em-portugal', changefreq: 'monthly', priority: '0.8' },
    { loc: '/guias/melhores-zonas-para-viver-em-portugal', changefreq: 'monthly', priority: '0.8' },
    { loc: '/guias/custos-de-comprar-casa-2026', changefreq: 'monthly', priority: '0.8' },
    { loc: '/imoveis/braga', changefreq: 'daily', priority: '0.8' },
    { loc: '/imoveis/maximinos', changefreq: 'daily', priority: '0.7' },
    { loc: '/imoveis/gualtar', changefreq: 'daily', priority: '0.7' },
    { loc: '/imoveis/sao-vicente', changefreq: 'daily', priority: '0.7' },
    { loc: '/imoveis/nogueira', changefreq: 'daily', priority: '0.7' },
    { loc: '/privacidade', changefreq: 'yearly', priority: '0.3' },
    { loc: '/termos', changefreq: 'yearly', priority: '0.3' },
    { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
    { loc: '/seguranca', changefreq: 'yearly', priority: '0.3' },
  ];

  // Fetch active properties
  let propertyPages = [];
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/properties?status=eq.active&select=id,updated_at&order=updated_at.desc&limit=500`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      if (res.ok) {
        const properties = await res.json();
        propertyPages = properties.map(p => ({
          loc: `/imovel/${p.id}`,
          lastmod: p.updated_at ? p.updated_at.split('T')[0] : today,
          changefreq: 'weekly',
          priority: '0.7'
        }));
      }
    }
  } catch (e) {
    // Continue without properties
  }

  const allPages = [...staticPages, ...propertyPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : `<lastmod>${today}</lastmod>`}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
