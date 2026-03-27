// Dynamic meta tags server for ALL pages — serves to bots/crawlers
// Extends the /api/og/[id].js pattern to every public route

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SITE_URL = 'https://www.trataimobiliaria.pt';

export const config = {
  runtime: 'edge'
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SEO metadata per route
const PAGE_META = {
  '/': {
    title: 'TRATA Imobiliária - Compra, Venda e Valorização de Imóveis em Braga',
    description: 'A sua imobiliária de confiança em Braga. Compra, venda e valorização de imóveis. Sem custos iniciais, resposta em 24h. AMI 20736.',
    keywords: 'imobiliária braga, comprar casa braga, vender casa braga, imóveis braga, TRATA imobiliária'
  },
  '/imoveis': {
    title: 'Imóveis à Venda em Braga e Arredores | TRATA Imobiliária',
    description: 'Encontre apartamentos, moradias, terrenos e quintas à venda em Braga. Pesquise por zona, preço e tipologia. Consulte todas as oportunidades.',
    keywords: 'imóveis à venda braga, casas à venda braga, apartamentos braga, moradias braga, terrenos braga'
  },
  '/servicos': {
    title: 'Serviços Imobiliários | TRATA Imobiliária Braga',
    description: 'Conheça os nossos serviços: compra e venda de imóveis, avaliações gratuitas, consultoria imobiliária e acompanhamento completo em Braga.',
    keywords: 'serviços imobiliários, avaliação imóveis braga, consultoria imobiliária, mediação imobiliária'
  },
  '/contactos': {
    title: 'Contactos | TRATA Imobiliária Braga',
    description: 'Entre em contacto connosco. Estamos no Centro Comercial Galecia R7C, Loja 45, Maximinos, Braga. Tel: +351 934 101 523.',
    keywords: 'contacto imobiliária braga, TRATA imobiliária contacto, imobiliária maximinos braga'
  },
  '/sobre': {
    title: 'Sobre Nós | TRATA Imobiliária - A Nossa História',
    description: 'Conheça a TRATA Imobiliária. Uma equipa dedicada ao mercado imobiliário em Braga, focada na eficácia, modernidade e satisfação do cliente.',
    keywords: 'sobre TRATA imobiliária, quem somos, imobiliária braga equipa'
  },
  '/carreiras': {
    title: 'Carreiras | Trabalhe na TRATA Imobiliária',
    description: 'Junte-se à equipa TRATA Imobiliária. Consulte as vagas disponíveis e candidate-se. Oportunidades em Braga.',
    keywords: 'emprego imobiliária braga, vagas TRATA imobiliária, trabalhar imobiliária'
  },
  '/guias': {
    title: 'Guias Imobiliários | Dicas para Comprar e Vender Casa em Portugal',
    description: 'Artigos e guias sobre o mercado imobiliário português. Como comprar casa, melhores zonas para viver, custos e impostos.',
    keywords: 'comprar casa portugal, guia imobiliário, custos comprar casa, melhores zonas portugal'
  },
  '/guias/como-comprar-casa-em-portugal': {
    title: 'Como Comprar Casa em Portugal Passo a Passo | TRATA Imobiliária',
    description: 'Guia completo com todos os passos para comprar casa em Portugal: orçamento, crédito habitação, CPCV, escritura e mais.',
    keywords: 'como comprar casa portugal, passos comprar casa, crédito habitação, CPCV, escritura comprar casa'
  },
  '/guias/melhores-zonas-para-viver-em-portugal': {
    title: 'Melhores Zonas para Viver em Portugal 2026 | TRATA Imobiliária',
    description: 'Descubra as melhores cidades e regiões de Portugal para viver: Braga, Lisboa, Porto, Algarve, Coimbra e mais.',
    keywords: 'melhores zonas viver portugal, melhores cidades portugal, onde viver portugal, qualidade vida portugal'
  },
  '/guias/custos-de-comprar-casa-2026': {
    title: 'Custos de Comprar Casa em Portugal 2026 | TRATA Imobiliária',
    description: 'Todos os custos de comprar casa em 2026: IMT, Imposto de Selo, crédito habitação, escritura, registos e mais.',
    keywords: 'custos comprar casa 2026, IMT 2026, imposto selo imóvel, despesas comprar casa portugal'
  },
  '/privacidade': {
    title: 'Política de Privacidade | TRATA Imobiliária',
    description: 'Política de privacidade da TRATA Imobiliária. Como tratamos e protegemos os seus dados pessoais.',
    keywords: ''
  },
  '/termos': {
    title: 'Termos e Condições | TRATA Imobiliária',
    description: 'Termos e condições de utilização do site TRATA Imobiliária.',
    keywords: ''
  },
  '/cookies': {
    title: 'Política de Cookies | TRATA Imobiliária',
    description: 'Informações sobre a utilização de cookies no site TRATA Imobiliária.',
    keywords: ''
  },
  '/seguranca': {
    title: 'Segurança | TRATA Imobiliária',
    description: 'Medidas de segurança e proteção de dados da TRATA Imobiliária.',
    keywords: ''
  },
  '/imoveis/braga': {
    title: 'Imóveis à Venda em Braga | TRATA Imobiliária',
    description: 'Encontre os melhores imóveis à venda em Braga. Apartamentos, moradias, terrenos e quintas. Mercado imobiliário de Braga em constante valorização.',
    keywords: 'imóveis braga, casas braga, apartamentos braga, moradias braga, comprar casa braga'
  },
  '/imoveis/maximinos': {
    title: 'Imóveis à Venda em Maximinos, Braga | TRATA Imobiliária',
    description: 'Imóveis em Maximinos, Braga. Zona central com excelente acesso a comércio e serviços. Encontre o seu imóvel ideal.',
    keywords: 'imóveis maximinos, casas maximinos braga, apartamentos maximinos'
  },
  '/imoveis/gualtar': {
    title: 'Imóveis à Venda em Gualtar, Braga | TRATA Imobiliária',
    description: 'Imóveis em Gualtar, junto à Universidade do Minho. Zona com forte procura para habitação e investimento.',
    keywords: 'imóveis gualtar, casas gualtar braga, apartamentos gualtar'
  },
  '/imoveis/sao-vicente': {
    title: 'Imóveis à Venda em São Vicente, Braga | TRATA Imobiliária',
    description: 'Imóveis no centro de Braga, em São Vicente. Zona premium com comércio, serviços e vida urbana.',
    keywords: 'imóveis são vicente braga, casas centro braga, apartamentos são vicente'
  },
  '/imoveis/nogueira': {
    title: 'Imóveis à Venda em Nogueira, Braga | TRATA Imobiliária',
    description: 'Moradias e terrenos em Nogueira, Braga. Tranquilidade e proximidade ao centro da cidade.',
    keywords: 'imóveis nogueira braga, moradias nogueira, terrenos nogueira braga'
  }
};

function buildHtml({ title, description, keywords, canonicalUrl, ogImage, jsonLd, redirectUrl }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeKeywords = escapeHtml(keywords);
  const safeCanonical = escapeHtml(canonicalUrl);
  const safeImage = escapeHtml(ogImage || `${SITE_URL}/trata.png`);

  return `<!DOCTYPE html>
<html lang="pt-pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  ${safeKeywords ? `<meta name="keywords" content="${safeKeywords}">` : ''}
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${safeCanonical}">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:locale" content="pt_PT">
  <meta property="og:site_name" content="TRATA Imobiliária">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}

  <script>window.location.replace("${escapeHtml(redirectUrl)}");</script>
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <a href="${safeCanonical}">Ver página</a>
</body>
</html>`;
}

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/seo/, '') || '/';

  // Get page meta
  const meta = PAGE_META[path];

  if (!meta) {
    // Unknown route — redirect to homepage
    return Response.redirect(`${SITE_URL}${path}`, 302);
  }

  // Build JSON-LD for specific pages
  let jsonLd = '';
  
  if (path === '/') {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "TRATA Imobiliária",
      "url": SITE_URL,
      "logo": `${SITE_URL}/trata.png`,
      "image": `${SITE_URL}/trata.png`,
      "description": meta.description,
      "telephone": "+351934101523",
      "email": "geral@trata.pt",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Centro Comercial Galecia R7C, Loja 45",
        "addressLocality": "Braga",
        "addressRegion": "Braga",
        "postalCode": "4700-026",
        "addressCountry": "PT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "41.5518",
        "longitude": "-8.4229"
      },
      "areaServed": {
        "@type": "City",
        "name": "Braga"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "12:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "13:00",
          "closes": "18:00"
        }
      ],
      "priceRange": "€€",
      "sameAs": [
        "https://www.facebook.com/p/Trata-Imobili%C3%A1ria-61555254285406/"
      ]
    });
  }

  if (path.startsWith('/guias/')) {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": meta.title,
      "description": meta.description,
      "author": {
        "@type": "Organization",
        "name": "TRATA Imobiliária"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TRATA Imobiliária",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/trata.png`
        }
      },
      "mainEntityOfPage": `${SITE_URL}${path}`
    });
  }

  const canonicalUrl = `${SITE_URL}${path}`;
  const redirectUrl = `${SITE_URL}${path}`;

  const html = buildHtml({
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    canonicalUrl,
    ogImage: `${SITE_URL}/trata.png`,
    jsonLd,
    redirectUrl
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
