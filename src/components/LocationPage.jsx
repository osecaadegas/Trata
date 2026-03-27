import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { updateSeoMeta } from '../lib/seo';

const SITE_URL = 'https://www.trataimobiliaria.pt';

// SEO content for each location page
const locationData = {
  'braga': {
    city: 'Braga',
    region: 'Minho',
    h1: 'Imóveis à Venda em Braga',
    intro: 'Braga é uma das cidades com maior crescimento em Portugal, oferecendo qualidade de vida excecional, rica história e um mercado imobiliário em constante valorização. Descubra as melhores oportunidades de imóveis à venda em Braga com a TRATA Imobiliária.',
    content: [
      {
        heading: 'Porquê Comprar Casa em Braga?',
        text: 'Braga combina tradição e modernidade como poucas cidades em Portugal. Com uma universidade de referência (Universidade do Minho), um centro histórico classificado e uma economia em expansão, é o destino ideal para quem procura qualidade de vida a preços competitivos face a Lisboa ou Porto. A cidade oferece excelentes acessibilidades, com ligação rápida ao Porto pela A3 e uma rede de transportes urbanos em desenvolvimento.'
      },
      {
        heading: 'Melhores Zonas para Comprar Imóvel em Braga',
        text: 'Maximinos é uma zona central com excelente acesso a comércio e serviços. São Vicente e Gualtar destacam-se pela proximidade à universidade. O Bom Jesus oferece um ambiente mais residencial e tranquilo. Fraião e Real são zonas em crescimento com boas moradias familiares. Nogueira combina ruralidade com proximidade ao centro.'
      },
      {
        heading: 'Mercado Imobiliário em Braga 2026',
        text: 'O mercado imobiliário em Braga tem apresentado uma valorização consistente nos últimos anos. Os preços por metro quadrado continuam mais acessíveis do que nas grandes metrópoles, tornando Braga uma excelente opção tanto para habitação própria como para investimento. A TRATA Imobiliária acompanha de perto as tendências do mercado local para oferecer as melhores oportunidades aos seus clientes.'
      }
    ],
    filterLocation: 'Braga'
  },
  'maximinos': {
    city: 'Maximinos, Braga',
    region: 'Minho',
    h1: 'Imóveis à Venda em Maximinos, Braga',
    intro: 'Maximinos é uma das freguesias mais centrais e dinâmicas de Braga, com excelente acesso a comércio, serviços e transportes. Encontre o seu imóvel ideal em Maximinos.',
    content: [
      {
        heading: 'Viver em Maximinos',
        text: 'Maximinos oferece uma localização privilegiada em Braga, com fácil acesso ao centro da cidade, supermercados, escolas e serviços de saúde. É uma zona diversificada com opções desde apartamentos modernos a moradias tradicionais, adequada tanto para jovens casais como para famílias.'
      },
      {
        heading: 'Imóveis Disponíveis em Maximinos',
        text: 'A TRATA Imobiliária, com escritório em Maximinos no Centro Comercial Galecia, conhece bem a freguesia e pode ajudá-lo a encontrar o imóvel perfeito nesta zona. Consulte abaixo os imóveis atualmente disponíveis.'
      }
    ],
    filterLocation: 'Maximinos'
  },
  'gualtar': {
    city: 'Gualtar, Braga',
    region: 'Minho',
    h1: 'Imóveis à Venda em Gualtar, Braga',
    intro: 'Gualtar é a zona universitária de Braga, próxima da Universidade do Minho, com forte procura tanto para habitação como para investimento. Descubra imóveis em Gualtar.',
    content: [
      {
        heading: 'Investir em Gualtar',
        text: 'A proximidade à Universidade do Minho torna Gualtar uma zona com procura constante de arrendamento, ideal para investidores. A freguesia oferece também excelentes opções de habitação própria, com áreas residenciais tranquilas e bons acessos ao centro de Braga.'
      }
    ],
    filterLocation: 'Gualtar'
  },
  'sao-vicente': {
    city: 'São Vicente, Braga',
    region: 'Minho',
    h1: 'Imóveis à Venda em São Vicente, Braga',
    intro: 'São Vicente é uma das zonas mais centrais e procuradas de Braga, combinando comércio, serviços e vida urbana. Encontre apartamentos e moradias em São Vicente.',
    content: [
      {
        heading: 'São Vicente — Centro de Braga',
        text: 'São Vicente é o coração de Braga, onde se encontram as principais lojas, restaurantes e serviços. Os imóveis nesta zona têm alta procura e potencial de valorização. Ideal para quem valoriza viver no centro da cidade com tudo à porta.'
      }
    ],
    filterLocation: 'São Vicente'
  },
  'nogueira': {
    city: 'Nogueira, Braga',
    region: 'Minho',
    h1: 'Imóveis à Venda em Nogueira, Braga',
    intro: 'Nogueira oferece o equilíbrio perfeito entre tranquilidade rural e proximidade a Braga. Encontre moradias e terrenos em Nogueira.',
    content: [
      {
        heading: 'Viver em Nogueira',
        text: 'Nogueira é ideal para quem procura mais espaço e tranquilidade sem abdicar da proximidade a Braga. A freguesia oferece sobretudo moradias com jardim e terrenos para construção, a preços mais acessíveis do que o centro da cidade.'
      }
    ],
    filterLocation: 'Nogueira'
  }
};

const LocationPage = ({ locationSlug }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const data = locationData[locationSlug];

  useEffect(() => {
    if (!data) return;

    updateSeoMeta({
      title: `${data.h1} | TRATA Imobiliária`,
      description: data.intro.substring(0, 160),
      keywords: `imóveis ${data.city.toLowerCase()}, casas ${data.city.toLowerCase()}, apartamentos ${data.city.toLowerCase()}, comprar casa ${data.city.toLowerCase()}`,
      canonical: `${SITE_URL}/imoveis/${locationSlug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": data.h1,
        "description": data.intro,
        "url": `${SITE_URL}/imoveis/${locationSlug}`,
        "about": {
          "@type": "City",
          "name": data.city
        },
        "publisher": {
          "@type": "Organization",
          "name": "TRATA Imobiliária"
        }
      }
    });
  }, [locationSlug]);

  useEffect(() => {
    if (!data) return;

    const fetchProperties = async () => {
      setIsLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/properties?status=eq.active&location=ilike.*${encodeURIComponent(data.filterLocation)}*&select=*&order=created_at.desc&limit=20`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Accept': 'application/json'
            }
          }
        );

        if (res.ok) {
          const items = await res.json();
          setProperties(items.map(p => ({
            id: p.id,
            title: p.title,
            location: p.location,
            price: parseFloat(p.price),
            type: p.property_type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            area: p.area_sqm,
            images: p.images || [],
            featured: p.featured
          })));
        }
      } catch (e) {
        console.error('Error fetching location properties:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [locationSlug]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-map-location-dot text-5xl text-slate-300 mb-4"></i>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Localização não encontrada</h1>
          <p className="text-slate-500 mb-6">A zona que procura não está disponível.</p>
          <a href="/imoveis" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            <i className="fa-solid fa-search"></i>
            Ver Todos os Imóveis
          </a>
        </div>
      </div>
    );
  }

  const propertyTypeMap = {
    'apartment': 'Apartamento', 'house': 'Moradia', 'land': 'Terreno', 'farm': 'Quinta', 'commercial': 'Comercial'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgt MnYtMnptLTQgOHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <nav className="text-sm text-slate-400 mb-6">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <span className="mx-2">›</span>
            <a href="/imoveis" className="hover:text-white transition-colors">Imóveis</a>
            <span className="mx-2">›</span>
            <span className="text-emerald-400">{data.city}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{data.h1}</h1>
          <p className="text-lg text-slate-300 max-w-3xl">{data.intro}</p>
        </div>
      </section>

      {/* Properties */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : properties.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              {properties.length} {properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'} em {data.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <a key={property.id} href={`/imovel/${property.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700 rounded-full">
                        {propertyTypeMap[property.type] || property.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                      <i className="fa-solid fa-location-dot text-emerald-500 text-xs"></i>
                      {property.location}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      {property.bedrooms && <span><i className="fa-solid fa-bed mr-1"></i>{property.bedrooms}</span>}
                      {property.bathrooms && <span><i className="fa-solid fa-bath mr-1"></i>{property.bathrooms}</span>}
                      {property.area && <span><i className="fa-solid fa-ruler-combined mr-1"></i>{property.area}m²</span>}
                    </div>
                    <p className="text-lg font-bold text-emerald-600">
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <i className="fa-solid fa-building text-4xl text-slate-300 mb-4"></i>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ainda não há imóveis nesta zona</h2>
            <p className="text-slate-500 mb-6">Estamos constantemente a adicionar novos imóveis. Ative os alertas para ser notificado.</p>
            <a href="/imoveis" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
              Ver Todos os Imóveis
            </a>
          </div>
        )}
      </section>

      {/* SEO Content */}
      <section className="max-w-7xl mx-auto px-4 pb-16 lg:pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 lg:p-12">
          {data.content.map((section, i) => (
            <div key={i} className={i > 0 ? 'mt-8' : ''}>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{section.heading}</h2>
              <p className="text-slate-600 leading-relaxed">{section.text}</p>
            </div>
          ))}

          {/* Internal links */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-slate-900 mb-4">Explorar Outras Zonas em Braga</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(locationData)
                .filter(([slug]) => slug !== locationSlug)
                .map(([slug, loc]) => (
                  <a
                    key={slug}
                    href={`/imoveis/${slug}`}
                    className="px-4 py-2 bg-gray-50 text-sm font-medium text-slate-600 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-200"
                  >
                    Imóveis em {loc.city}
                  </a>
                ))
              }
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-10 border border-emerald-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Não encontrou o que procurava em {data.city}?</h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Contacte-nos e a nossa equipa ajuda-o a encontrar o imóvel ideal.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/contactos" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
              <i className="fa-solid fa-envelope"></i>
              Contactar
            </a>
            <a href="tel:+351934101523" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
              <i className="fa-solid fa-phone"></i>
              +351 934 101 523
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Export location slugs for routing
export const LOCATION_SLUGS = Object.keys(locationData);

export default LocationPage;
