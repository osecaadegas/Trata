// Lightweight SEO head manager — updates document.title, meta tags, and JSON-LD
// No external dependencies (replaces react-helmet)

const SITE_URL = 'https://www.trataimobiliaria.pt';

export function updateSeoMeta({ title, description, keywords, canonical, ogImage, jsonLd }) {
  // Title
  document.title = title || 'TRATA Imobiliária - Compra, Venda e Valorização de Imóveis';

  // Helper to set/create a meta tag
  const setMeta = (attr, attrValue, content) => {
    let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content || '');
  };

  // Description
  if (description) {
    setMeta('name', 'description', description);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:description', description);
  }

  // Keywords
  if (keywords) {
    setMeta('name', 'keywords', keywords);
  }

  // Title OG/Twitter
  if (title) {
    setMeta('property', 'og:title', title);
    setMeta('name', 'twitter:title', title);
  }

  // Canonical
  const canonicalUrl = canonical || `${SITE_URL}${window.location.pathname}`;
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);
  setMeta('property', 'og:url', canonicalUrl);

  // OG Image
  if (ogImage) {
    setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:image', ogImage);
  }

  // JSON-LD
  let ldEl = document.querySelector('script[data-seo-ld]');
  if (jsonLd) {
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.setAttribute('type', 'application/ld+json');
      ldEl.setAttribute('data-seo-ld', 'true');
      document.head.appendChild(ldEl);
    }
    ldEl.textContent = JSON.stringify(jsonLd);
  } else if (ldEl) {
    ldEl.remove();
  }
}

// Pre-built SEO configs for static pages
export const PAGE_SEO = {
  home: {
    title: 'TRATA Imobiliária - Compra, Venda e Valorização de Imóveis em Braga',
    description: 'A sua imobiliária de confiança em Braga. Compra, venda e valorização de imóveis. Sem custos iniciais, resposta em 24h. AMI 20736.',
    keywords: 'imobiliária braga, comprar casa braga, vender casa braga, imóveis braga, TRATA imobiliária',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "TRATA Imobiliária",
      "url": SITE_URL,
      "logo": `${SITE_URL}/trata.png`,
      "image": `${SITE_URL}/trata.png`,
      "description": "Imobiliária de confiança em Braga. Compra, venda e valorização de imóveis.",
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
      "areaServed": { "@type": "City", "name": "Braga" },
      "priceRange": "€€",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "12:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "13:00", "closes": "18:00" }
      ]
    }
  },
  imoveis: {
    title: 'Imóveis à Venda em Braga e Arredores | TRATA Imobiliária',
    description: 'Encontre apartamentos, moradias, terrenos e quintas à venda em Braga. Pesquise por zona, preço e tipologia.',
    keywords: 'imóveis à venda braga, casas braga, apartamentos braga, moradias braga, terrenos braga'
  },
  servicos: {
    title: 'Serviços Imobiliários | TRATA Imobiliária Braga',
    description: 'Compra e venda de imóveis, avaliações gratuitas, consultoria imobiliária em Braga.',
    keywords: 'serviços imobiliários braga, avaliação imóveis, consultoria imobiliária'
  },
  contactos: {
    title: 'Contactos | TRATA Imobiliária Braga',
    description: 'Entre em contacto. Centro Comercial Galecia R7C, Loja 45, Maximinos, Braga. Tel: +351 934 101 523.',
    keywords: 'contacto imobiliária braga, TRATA contacto, imobiliária maximinos'
  },
  sobre: {
    title: 'Sobre Nós | TRATA Imobiliária',
    description: 'Conheça a TRATA Imobiliária. Equipa dedicada ao mercado imobiliário em Braga.',
    keywords: 'sobre TRATA imobiliária, equipa, história'
  },
  carreiras: {
    title: 'Carreiras | Trabalhe na TRATA Imobiliária',
    description: 'Junte-se à nossa equipa. Consulte vagas disponíveis em Braga.',
    keywords: 'emprego imobiliária braga, vagas TRATA'
  },
  guias: {
    title: 'Guias Imobiliários | Dicas para Comprar e Vender Casa',
    description: 'Artigos e guias sobre o mercado imobiliário português. Comprar casa, melhores zonas, custos e impostos.',
    keywords: 'guia imobiliário, comprar casa portugal, custos comprar casa, melhores zonas portugal'
  },
  privacidade: {
    title: 'Política de Privacidade | TRATA Imobiliária',
    description: 'Como tratamos e protegemos os seus dados pessoais.'
  },
  termos: {
    title: 'Termos e Condições | TRATA Imobiliária',
    description: 'Termos e condições de utilização do site.'
  },
  cookies: {
    title: 'Política de Cookies | TRATA Imobiliária',
    description: 'Informações sobre a utilização de cookies.'
  },
  seguranca: {
    title: 'Segurança | TRATA Imobiliária',
    description: 'Medidas de segurança e proteção de dados.'
  }
};

// Generate property SEO data
export function getPropertySeo(property) {
  if (!property) return {};

  const typeMap = { apartment: 'Apartamento', house: 'Moradia', land: 'Terreno', farm: 'Quinta', commercial: 'Comercial' };
  const typeName = typeMap[property.property_type] || property.type || 'Imóvel';
  const price = property.price ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price) : '';
  const location = property.location || '';

  const title = `${property.title || typeName} em ${location}${price ? ` | ${price}` : ''} - TRATA Imobiliária`;

  const details = [];
  if (property.bedrooms) details.push(`${property.bedrooms} quartos`);
  if (property.bathrooms) details.push(`${property.bathrooms} WC`);
  if (property.area_sqm) details.push(`${property.area_sqm}m²`);
  const detailStr = details.length ? `${details.join(', ')}. ` : '';

  const descText = property.description || '';
  const description = `${typeName} à venda em ${location}. ${detailStr}${descText}`.substring(0, 160);

  const ogImage = property.images?.[0] || `${SITE_URL}/trata.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title || typeName,
    "description": description,
    "url": `${SITE_URL}/imovel/${property.id}`,
    "image": property.images || [],
    "offers": {
      "@type": "Offer",
      "price": property.price || 0,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.split(',')[0]?.trim() || location,
      "addressRegion": "Braga",
      "addressCountry": "PT"
    },
    "numberOfRooms": property.bedrooms || undefined,
    "floorSize": property.area_sqm ? {
      "@type": "QuantitativeValue",
      "value": property.area_sqm,
      "unitCode": "MTK"
    } : undefined
  };

  return {
    title,
    description,
    keywords: `${typeName.toLowerCase()} ${location.toLowerCase()}, imóvel à venda ${location.toLowerCase()}, comprar ${typeName.toLowerCase()} braga`,
    ogImage,
    canonical: `${SITE_URL}/imovel/${property.id}`,
    jsonLd
  };
}
