import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InquiryForm from './InquiryForm';

const PropertyDetailPage = ({ propertyId }) => {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [show3DTour, setShow3DTour] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const getSupabaseHeaders = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Get auth token from Supabase's default storage
    let accessToken = supabaseKey;
    const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
    const storageKey = `sb-${projectId}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.access_token) {
          accessToken = parsed.access_token;
        }
      } catch (e) {}
    }
    
    return {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
        console.error('Supabase not configured');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}`,
          { headers: getSupabaseHeaders() }
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
            neighborhood: prop.neighborhood,
            price: parseFloat(prop.price),
            priceType: prop.price_type,
            area: prop.area_sqm,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            condition: conditionMap[prop.condition] || prop.condition,
            features: prop.features || [],
            images: prop.images || ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
            featured: prop.featured,
            virtualTourUrl: prop.virtual_tour_url,
            videoUrl: prop.video_url,
            yearBuilt: prop.year_built,
            energyRating: prop.energy_rating
          });
        }
      } catch (err) {
        console.error('Error fetching property:', err);
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
      if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${propertyId}`,
          { headers: getSupabaseHeaders() }
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
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setIsFavorite(prev => !prev);
      return;
    }

    setFavoriteLoading(true);
    const wasFavorite = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      if (wasFavorite) {
        await fetch(
          `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${propertyId}`,
          { method: 'DELETE', headers: getSupabaseHeaders() }
        );
      } else {
        await fetch(
          `${supabaseUrl}/rest/v1/user_favorites`,
          {
            method: 'POST',
            headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
            body: JSON.stringify({ user_id: user.id, property_id: propertyId })
          }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(wasFavorite);
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
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        await fetch(`${supabaseUrl}/rest/v1/messages`, {
          method: 'POST',
          headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
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
        });
      }
      
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
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3 h-[500px] bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-80 bg-gray-200 rounded-xl"></div>
                <div className="h-40 bg-gray-200 rounded-xl"></div>
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
      {/* Header with Title & Price */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <a
                href="#imoveis"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm mb-3"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar aos imóveis
              </a>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{property.title}</h1>
              <p className="flex items-center gap-2 text-slate-500 mt-1">
                <i className="fa-solid fa-location-dot text-emerald-500"></i>
                {property.location}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-emerald-600">{formatPrice(property.price)}</p>
              <p className="text-sm text-slate-500">
                {property.priceType === 'rent' ? 'por mês' : 'Venda'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Image Gallery Section - Main + Vertical Thumbnails */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-3 relative">
            <div className="relative h-[350px] lg:h-[480px] rounded-2xl overflow-hidden bg-gray-100">
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
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white text-slate-600 hover:text-red-500'
                } ${favoriteLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-xl`}></i>
              </button>
              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </>
              )}
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {activeImage + 1} / {property.images.length}
              </div>
            </div>
          </div>

          {/* Right Column: Vertical Gallery + Virtual Tour */}
          <div className="lg:col-span-1 space-y-4">
            {/* Gallery Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-images text-emerald-500"></i>
                Galeria
              </h3>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {property.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-full h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Tour Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-cube text-emerald-500"></i>
                Tour Virtual
              </h3>
              <button
                onClick={() => setShow3DTour(true)}
                className="w-full h-28 rounded-lg overflow-hidden relative group"
              >
                <img 
                  src={property.images[0]} 
                  alt="Tour Virtual" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-play text-emerald-600 text-lg ml-1"></i>
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  <i className="fa-solid fa-vr-cardboard mr-1"></i>
                  Tour 360°
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Tour Modal */}
        {show3DTour && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <i className="fa-solid fa-cube text-emerald-500"></i>
                  Tour Virtual - {property.title}
                </h3>
                <button
                  onClick={() => setShow3DTour(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                {property.virtualTourUrl ? (
                  <iframe
                    src={property.virtualTourUrl}
                    width="100%"
                    height="100%"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="text-center text-white p-8">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-cube text-4xl opacity-70"></i>
                    </div>
                    <p className="text-xl font-semibold mb-2">Tour virtual em breve disponível</p>
                    <p className="text-sm text-gray-400">Contacte-nos para agendar uma visita presencial</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms > 0 && (
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <i className="fa-solid fa-bed text-2xl text-emerald-500 mb-2"></i>
                    <p className="text-2xl font-bold text-slate-900">{property.bedrooms}</p>
                    <p className="text-sm text-slate-500">Quartos</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <i className="fa-solid fa-bath text-2xl text-emerald-500 mb-2"></i>
                    <p className="text-2xl font-bold text-slate-900">{property.bathrooms}</p>
                    <p className="text-sm text-slate-500">Casas de Banho</p>
                  </div>
                )}
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <i className="fa-solid fa-ruler-combined text-2xl text-emerald-500 mb-2"></i>
                  <p className="text-2xl font-bold text-slate-900">{formatArea(property.area)}</p>
                  <p className="text-sm text-slate-500">Área</p>
                </div>
                {property.yearBuilt && (
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <i className="fa-solid fa-calendar text-2xl text-emerald-500 mb-2"></i>
                    <p className="text-2xl font-bold text-slate-900">{property.yearBuilt}</p>
                    <p className="text-sm text-slate-500">Ano</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-emerald-500"></i>
                Descrição do Imóvel
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description || 'Sem descrição disponível para este imóvel.'}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-emerald-500"></i>
                  Características
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                      <i className="fa-solid fa-check-circle text-emerald-500"></i>
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-emerald-500"></i>
                Detalhes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-slate-500">Tipo</span>
                  <span className="font-medium text-slate-900">{property.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-slate-500">Estado</span>
                  <span className="font-medium text-slate-900">{property.condition}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-slate-500">Área</span>
                  <span className="font-medium text-slate-900">{formatArea(property.area)}</span>
                </div>
                {property.bedrooms > 0 && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-slate-500">Quartos</span>
                    <span className="font-medium text-slate-900">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-slate-500">Casas de Banho</span>
                    <span className="font-medium text-slate-900">{property.bathrooms}</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-slate-500">Ano de Construção</span>
                    <span className="font-medium text-slate-900">{property.yearBuilt}</span>
                  </div>
                )}
                {property.energyRating && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-slate-500">Certificação Energética</span>
                    <span className={`font-medium px-2 py-0.5 rounded ${
                      property.energyRating.startsWith('A') ? 'bg-green-100 text-green-700' :
                      property.energyRating.startsWith('B') ? 'bg-lime-100 text-lime-700' :
                      property.energyRating.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{property.energyRating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
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

          {/* Right Column - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Interessado neste imóvel?
                </h3>
                
                {!showContactForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowInquiryModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
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
                      href={`https://wa.me/351934101523?text=${encodeURIComponent(`Olá! Estou interessado no imóvel: ${property.title} - ${window.location.href}`)}`}
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
                        <input
                          type="text"
                          placeholder="Nome *"
                          required
                          value={contactFormData.name}
                          onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          required
                          value={contactFormData.email}
                          onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="tel"
                          placeholder="Telefone"
                          value={contactFormData.phone}
                          onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <textarea
                          rows="4"
                          placeholder="Mensagem *"
                          required
                          value={contactFormData.message || `Olá, estou interessado no imóvel "${property.title}". Gostaria de obter mais informações.`}
                          onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        ></textarea>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 flex items-center justify-center gap-2"
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
                          className="w-full py-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
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
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copiado!');
                    }}
                    className="flex-1 py-2 bg-gray-100 text-slate-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
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

              {/* Reference */}
              <div className="text-center text-sm text-slate-400">
                Ref: {property.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal with Email Integration */}
      <InquiryForm
        property={property}
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
      />
    </div>
  );
};

export default PropertyDetailPage;
