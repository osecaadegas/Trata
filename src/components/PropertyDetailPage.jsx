import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PropertyDetailPage = ({ propertyId }) => {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fallback properties data (same as PropertiesPage)
  const fallbackProperties = [
    { id: 1, title: 'Apartamento T3 com Vista Mar', type: 'Apartamento', location: 'Braga, Centro', price: 285000, area: 120, bedrooms: 3, bathrooms: 2, condition: 'Novo', featured: true, description: 'Magnífico apartamento T3 com vista mar, acabamentos de luxo, cozinha totalmente equipada e varanda ampla. Localizado em zona premium com fácil acesso a transportes e serviços.', features: ['Varanda', 'Cozinha Equipada', 'Estacionamento', 'Elevador'], images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'] },
    { id: 2, title: 'Moradia T4 com Jardim', type: 'Moradia', location: 'Braga, Gualtar', price: 425000, area: 200, bedrooms: 4, bathrooms: 3, condition: 'Renovado', featured: true, description: 'Espaçosa moradia T4 com amplo jardim, garagem para 2 carros e acabamentos de qualidade. Zona residencial tranquila com excelente exposição solar.', features: ['Jardim', 'Garagem', 'Lareira', 'Churrasqueira'], images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'] },
    { id: 3, title: 'Apartamento T2 Renovado', type: 'Apartamento', location: 'Braga, São Vicente', price: 175000, area: 85, bedrooms: 2, bathrooms: 1, condition: 'Renovado', featured: false, description: 'Apartamento T2 totalmente renovado, com cozinha moderna e casa de banho nova. Excelente localização perto de escolas e comércio.', features: ['Cozinha Equipada', 'Vidros Duplos', 'Aquecimento Central'], images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'] },
    { id: 4, title: 'Terreno Urbanizável', type: 'Terreno', location: 'Braga, Palmeira', price: 95000, area: 500, bedrooms: 0, bathrooms: 0, condition: 'Novo', featured: false, description: 'Terreno urbanizável com 500m², excelente para construção de moradia. Infraestruturas disponíveis e boa exposição solar.', features: ['Água', 'Luz', 'Saneamento'], images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'] },
    { id: 5, title: 'Moradia T5 de Luxo', type: 'Moradia', location: 'Braga, Bom Jesus', price: 750000, area: 350, bedrooms: 5, bathrooms: 4, condition: 'Novo', featured: true, description: 'Moradia de luxo T5 com piscina, jardim paisagístico e acabamentos premium. Vista panorâmica e privacidade total.', features: ['Piscina', 'Jardim', 'Garagem', 'Domótica', 'Painéis Solares'], images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'] },
    { id: 6, title: 'Apartamento T1 para Investimento', type: 'Apartamento', location: 'Braga, Universidade', price: 125000, area: 45, bedrooms: 1, bathrooms: 1, condition: 'Para Renovar', featured: false, description: 'Apartamento T1 com grande potencial de rentabilidade, ideal para investimento ou primeira casa. Necessita de algumas obras de modernização.', features: ['Perto da Universidade', 'Transportes'], images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'] },
    { id: 7, title: 'Moradia T3 com Piscina', type: 'Moradia', location: 'Braga, Fraião', price: 385000, area: 180, bedrooms: 3, bathrooms: 2, condition: 'Renovado', featured: true, description: 'Moradia T3 com piscina aquecida, zona de barbecue e garagem. Excelente para família, em zona muito sossegada.', features: ['Piscina Aquecida', 'Churrasqueira', 'Garagem', 'Alarme'], images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'] },
    { id: 8, title: 'Apartamento T4 Duplex', type: 'Apartamento', location: 'Braga, Maximinos', price: 320000, area: 150, bedrooms: 4, bathrooms: 2, condition: 'Novo', featured: false, description: 'Fantástico apartamento duplex T4 com terraço privativo. Acabamentos modernos e muita luz natural.', features: ['Terraço', 'Duplex', 'Garagem', 'Arrecadação'], images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'] },
    { id: 9, title: 'Quinta com 2 Hectares', type: 'Quinta', location: 'Braga, Priscos', price: 550000, area: 20000, bedrooms: 6, bathrooms: 3, condition: 'Para Renovar', featured: false, description: 'Quinta rústica com 2 hectares, casa principal para renovar e várias dependências. Grande potencial turístico ou agrícola.', features: ['Terreno Agrícola', 'Poço', 'Anexos', 'Vinha'], images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'] },
    { id: 10, title: 'Apartamento T2 com Varanda', type: 'Apartamento', location: 'Braga, Real', price: 195000, area: 90, bedrooms: 2, bathrooms: 1, condition: 'Novo', featured: false, description: 'Apartamento T2 com varanda generosa, orientação sul e excelente luminosidade. Prédio com elevador e garagem.', features: ['Varanda', 'Elevador', 'Garagem', 'Orientação Sul'], images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'] },
    { id: 11, title: 'Moradia Geminada T3', type: 'Moradia', location: 'Braga, Nogueira', price: 295000, area: 140, bedrooms: 3, bathrooms: 2, condition: 'Renovado', featured: false, description: 'Moradia geminada T3 com quintal e garagem. Zona residencial familiar com boa vizinhança e acessos.', features: ['Quintal', 'Garagem', 'Lareira'], images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'] },
    { id: 12, title: 'Loja Comercial', type: 'Comercial', location: 'Braga, Centro', price: 180000, area: 75, bedrooms: 0, bathrooms: 1, condition: 'Novo', featured: false, description: 'Espaço comercial em zona de grande movimento, com montra ampla e boas condições. Ideal para comércio ou serviços.', features: ['Montra', 'WC', 'Zona de Grande Movimento'], images: ['https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=600&fit=crop'] },
    { id: 13, title: 'Apartamento T3 com Terraço', type: 'Apartamento', location: 'Braga, São José', price: 265000, area: 110, bedrooms: 3, bathrooms: 2, condition: 'Novo', featured: false, description: 'Último piso com terraço privativo de 30m². Vista desafogada e muita privacidade. Acabamentos de qualidade.', features: ['Terraço', 'Último Piso', 'Vista Desafogada', 'Garagem'], images: ['https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop'] },
    { id: 14, title: 'Moradia T4 Moderna', type: 'Moradia', location: 'Braga, Lamaçães', price: 480000, area: 220, bedrooms: 4, bathrooms: 3, condition: 'Novo', featured: true, description: 'Moradia contemporânea T4 com linhas modernas, piscina e jardim. Domótica e eficiência energética A+.', features: ['Piscina', 'Domótica', 'Eficiência A+', 'Painéis Solares'], images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'] },
    { id: 15, title: 'Apartamento T1 Centro Histórico', type: 'Apartamento', location: 'Braga, Sé', price: 145000, area: 55, bedrooms: 1, bathrooms: 1, condition: 'Renovado', featured: false, description: 'Charmoso T1 no centro histórico, totalmente renovado mantendo características originais. Ideal para turismo ou habitação.', features: ['Centro Histórico', 'Renovado', 'Características Originais'], images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop'] },
    { id: 16, title: 'Terreno Industrial', type: 'Terreno', location: 'Braga, Celeirós', price: 250000, area: 2000, bedrooms: 0, bathrooms: 0, condition: 'Novo', featured: false, description: 'Terreno industrial com 2000m², junto a zona industrial consolidada. Todas as infraestruturas disponíveis.', features: ['Zona Industrial', 'Infraestruturas', 'Bons Acessos'], images: ['https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&h=600&fit=crop'] },
    { id: 17, title: 'Moradia T3 para Renovar', type: 'Moradia', location: 'Braga, Ferreiros', price: 165000, area: 130, bedrooms: 3, bathrooms: 1, condition: 'Para Renovar', featured: false, description: 'Moradia T3 com bom potencial, necessita de obras de modernização. Terreno com 300m² e boa localização.', features: ['Terreno 300m²', 'Potencial de Valorização'], images: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop'] },
    { id: 18, title: 'Apartamento T2 com Garagem', type: 'Apartamento', location: 'Braga, Carandá', price: 210000, area: 95, bedrooms: 2, bathrooms: 1, condition: 'Novo', featured: false, description: 'Excelente T2 com garagem box e arrecadação. Cozinha equipada, roupeiros embutidos e excelentes acabamentos.', features: ['Garagem Box', 'Arrecadação', 'Cozinha Equipada', 'Roupeiros'], images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop'] }
  ];

  // Mapping from DB values to display values (Portuguese)
  const propertyTypeMap = {
    'apartment': 'Apartamento',
    'house': 'Moradia',
    'land': 'Terreno',
    'farm': 'Quinta',
    'commercial': 'Comercial'
  };

  const conditionMap = {
    'new': 'Novo',
    'renovated': 'Renovado',
    'to_renovate': 'Para Renovar'
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Check if we have a numeric ID (fallback data) or UUID (database)
      const isNumericId = !isNaN(parseInt(propertyId)) && parseInt(propertyId) <= 18;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url' || isNumericId) {
        // Use fallback data
        const foundProperty = fallbackProperties.find(p => p.id.toString() === propertyId.toString());
        if (foundProperty) {
          setProperty({
            ...foundProperty,
            image: foundProperty.images?.[0] || foundProperty.image,
            images: foundProperty.images || [foundProperty.image]
          });
        }
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const prop = data[0];
          setProperty({
            id: prop.id,
            title: prop.title,
            description: prop.description,
            type: propertyTypeMap[prop.property_type] || prop.property_type,
            location: prop.location,
            price: parseFloat(prop.price),
            area: prop.area_sqm,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            condition: conditionMap[prop.condition] || prop.condition,
            features: prop.features || [],
            images: prop.images || ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
            featured: prop.featured
          });
        } else {
          // Try fallback
          const foundProperty = fallbackProperties.find(p => p.id.toString() === propertyId.toString());
          if (foundProperty) {
            setProperty({
              ...foundProperty,
              images: foundProperty.images || [foundProperty.image]
            });
          }
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        // Try fallback
        const foundProperty = fallbackProperties.find(p => p.id.toString() === propertyId.toString());
        if (foundProperty) {
          setProperty({
            ...foundProperty,
            images: foundProperty.images || [foundProperty.image]
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // Check if property is in user's favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !propertyId) {
        setIsFavorite(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
        return;
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${propertyId}`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.length > 0);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [user, propertyId]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Faça login para guardar favoritos');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Optimistic update
    setIsFavorite(prev => !prev);

    // Skip database call if Supabase not configured
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await fetch(
          `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${propertyId}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Add to favorites
        await fetch(
          `${supabaseUrl}/rest/v1/user_favorites`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: user.id,
              property_id: propertyId
            })
          }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setIsFavorite(prev => !prev);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatArea = (area) => {
    return area >= 1000 ? `${(area / 1000).toFixed(1)} ha` : `${area} m²`;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/messages`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              name: contactFormData.name,
              email: contactFormData.email,
              phone: contactFormData.phone || null,
              subject: 'interesse',
              message: contactFormData.message,
              property_id: property.id,
              property_title: property.title,
              status: 'unread'
            })
          }
        );

        if (!response.ok) {
          console.error('Failed to save message to database');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowContactForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-house-circle-xmark text-4xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Imóvel não encontrado</h2>
          <p className="text-slate-600 mb-6">O imóvel que procura não existe ou foi removido.</p>
          <a
            href="#imoveis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Ver todos os imóveis
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="#imoveis"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Voltar aos imóveis</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Main Image */}
              <div className="relative h-[400px] lg:h-[500px]">
                <img
                  src={property.images[activeImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    property.condition === 'Novo' ? 'bg-emerald-500 text-white' :
                    property.condition === 'Renovado' ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {property.condition}
                  </span>
                  {property.featured && (
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500 text-white">
                      <i className="fa-solid fa-star mr-1"></i>
                      Destaque
                    </span>
                  )}
                </div>
                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:text-red-500'
                  } ${favoriteLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-xl`}></i>
                </button>
                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={() => setActiveImage(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === index ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-emerald-500"></i>
                Detalhes do Imóvel
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <i className="fa-solid fa-ruler-combined text-2xl text-emerald-500 mb-2"></i>
                  <p className="text-sm text-slate-500">Área</p>
                  <p className="text-lg font-bold text-slate-900">{formatArea(property.area)}</p>
                </div>
                {property.bedrooms > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <i className="fa-solid fa-bed text-2xl text-emerald-500 mb-2"></i>
                    <p className="text-sm text-slate-500">Quartos</p>
                    <p className="text-lg font-bold text-slate-900">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <i className="fa-solid fa-bath text-2xl text-emerald-500 mb-2"></i>
                    <p className="text-sm text-slate-500">WC</p>
                    <p className="text-lg font-bold text-slate-900">{property.bathrooms}</p>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <i className="fa-solid fa-building text-2xl text-emerald-500 mb-2"></i>
                  <p className="text-sm text-slate-500">Tipo</p>
                  <p className="text-lg font-bold text-slate-900">{property.type}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-emerald-500"></i>
                Descrição
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {property.description || 'Sem descrição disponível para este imóvel.'}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-emerald-500"></i>
                  Características
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <i className="fa-solid fa-check text-emerald-500"></i>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-emerald-500"></i>
                Localização
              </h2>
              <p className="text-slate-600 mb-4">{property.location}</p>
              <div className="h-64 bg-gray-100 rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização do imóvel"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                  {property.type}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-2">
                  {property.title}
                </h1>
                <p className="flex items-center gap-2 text-slate-500 mb-4">
                  <i className="fa-solid fa-location-dot text-emerald-500"></i>
                  {property.location}
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-slate-500 mb-1">Preço</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Interessado neste imóvel?
                </h3>
                
                {!showContactForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-envelope"></i>
                      Pedir mais informações
                    </button>
                    <a
                      href="tel:+351934101523"
                      className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-phone"></i>
                      +351 934 101 523
                    </a>
                    <a
                      href="https://wa.me/351934101523"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-brands fa-whatsapp text-xl"></i>
                      WhatsApp
                    </a>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleContactSubmit}>
                    {submitSuccess ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fa-solid fa-check text-green-500 text-2xl"></i>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">Mensagem Enviada!</h4>
                        <p className="text-sm text-slate-500">Entraremos em contacto brevemente.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <input
                            type="text"
                            placeholder="Nome *"
                            required
                            value={contactFormData.name}
                            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Email *"
                            required
                            value={contactFormData.email}
                            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Telefone"
                            value={contactFormData.phone}
                            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <textarea
                            rows="4"
                            placeholder="Mensagem *"
                            required
                            value={contactFormData.message || `Olá, estou interessado no imóvel "${property.title}" (Ref: ${property.id}). Gostaria de obter mais informações.`}
                            onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              A enviar...
                            </>
                          ) : (
                            'Enviar Mensagem'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Partilhar</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex-1 py-2 bg-gray-100 text-slate-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-link"></i>
                    Copiar link
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Veja este imóvel: ${property.title} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
