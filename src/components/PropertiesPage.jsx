import React, { useState, useEffect } from 'react';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    bedrooms: '',
    condition: '',
    priceMin: 0,
    priceMax: 1000000
  });

  const propertiesPerPage = 12;

  // Fallback mock data when Supabase isn't configured
  const fallbackProperties = [
    { id: 1, title: 'Apartamento T3 com Vista Mar', type: 'Apartamento', location: 'Braga, Centro', price: 285000, area: 120, bedrooms: 3, bathrooms: 2, condition: 'Novo', featured: true, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop' },
    { id: 2, title: 'Moradia T4 com Jardim', type: 'Moradia', location: 'Braga, Gualtar', price: 425000, area: 200, bedrooms: 4, bathrooms: 3, condition: 'Renovado', featured: true, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop' },
    { id: 3, title: 'Apartamento T2 Renovado', type: 'Apartamento', location: 'Braga, São Vicente', price: 175000, area: 85, bedrooms: 2, bathrooms: 1, condition: 'Renovado', featured: false, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
    { id: 4, title: 'Terreno Urbanizável', type: 'Terreno', location: 'Braga, Palmeira', price: 95000, area: 500, bedrooms: 0, bathrooms: 0, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop' },
    { id: 5, title: 'Moradia T5 de Luxo', type: 'Moradia', location: 'Braga, Bom Jesus', price: 750000, area: 350, bedrooms: 5, bathrooms: 4, condition: 'Novo', featured: true, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop' },
    { id: 6, title: 'Apartamento T1 para Investimento', type: 'Apartamento', location: 'Braga, Universidade', price: 125000, area: 45, bedrooms: 1, bathrooms: 1, condition: 'Para Renovar', featured: false, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' },
    { id: 7, title: 'Moradia T3 com Piscina', type: 'Moradia', location: 'Braga, Fraião', price: 385000, area: 180, bedrooms: 3, bathrooms: 2, condition: 'Renovado', featured: true, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop' },
    { id: 8, title: 'Apartamento T4 Duplex', type: 'Apartamento', location: 'Braga, Maximinos', price: 320000, area: 150, bedrooms: 4, bathrooms: 2, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop' },
    { id: 9, title: 'Quinta com 2 Hectares', type: 'Quinta', location: 'Braga, Priscos', price: 550000, area: 20000, bedrooms: 6, bathrooms: 3, condition: 'Para Renovar', featured: false, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop' },
    { id: 10, title: 'Apartamento T2 com Varanda', type: 'Apartamento', location: 'Braga, Real', price: 195000, area: 90, bedrooms: 2, bathrooms: 1, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop' },
    { id: 11, title: 'Moradia Geminada T3', type: 'Moradia', location: 'Braga, Nogueira', price: 295000, area: 140, bedrooms: 3, bathrooms: 2, condition: 'Renovado', featured: false, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop' },
    { id: 12, title: 'Loja Comercial', type: 'Comercial', location: 'Braga, Centro', price: 180000, area: 75, bedrooms: 0, bathrooms: 1, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=600&fit=crop' },
    { id: 13, title: 'Apartamento T3 com Terraço', type: 'Apartamento', location: 'Braga, São José', price: 265000, area: 110, bedrooms: 3, bathrooms: 2, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop' },
    { id: 14, title: 'Moradia T4 Moderna', type: 'Moradia', location: 'Braga, Lamaçães', price: 480000, area: 220, bedrooms: 4, bathrooms: 3, condition: 'Novo', featured: true, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop' },
    { id: 15, title: 'Apartamento T1 Centro Histórico', type: 'Apartamento', location: 'Braga, Sé', price: 145000, area: 55, bedrooms: 1, bathrooms: 1, condition: 'Renovado', featured: false, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop' },
    { id: 16, title: 'Terreno Industrial', type: 'Terreno', location: 'Braga, Celeirós', price: 250000, area: 2000, bedrooms: 0, bathrooms: 0, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&h=600&fit=crop' },
    { id: 17, title: 'Moradia T3 para Renovar', type: 'Moradia', location: 'Braga, Ferreiros', price: 165000, area: 130, bedrooms: 3, bathrooms: 1, condition: 'Para Renovar', featured: false, image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop' },
    { id: 18, title: 'Apartamento T2 com Garagem', type: 'Apartamento', location: 'Braga, Carandá', price: 210000, area: 95, bedrooms: 2, bathrooms: 1, condition: 'Novo', featured: false, image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop' }
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

  const propertyTypes = ['Apartamento', 'Moradia', 'Terreno', 'Quinta', 'Comercial'];
  const locations = ['Braga, Centro', 'Braga, Gualtar', 'Braga, São Vicente', 'Braga, Bom Jesus', 'Braga, Fraião', 'Braga, Maximinos', 'Braga, Real', 'Braga, Nogueira'];
  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const conditionOptions = ['Novo', 'Renovado', 'Para Renovar'];

  // Fetch properties from Supabase or use fallback
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
        // Use fallback data if Supabase isn't configured
        console.log('Supabase not configured, using fallback data');
        setProperties(fallbackProperties);
        setFilteredProperties(fallbackProperties);
        setIsLoading(false);
        return;
      }
      
      try {
        // Use direct fetch like PropertyListings does
        const response = await fetch(
          `${supabaseUrl}/rest/v1/properties?status=eq.available&order=featured.desc,created_at.desc`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // If no data from DB, use fallback
        if (!data || data.length === 0) {
          console.log('No data in database, using fallback data');
          setProperties(fallbackProperties);
          setFilteredProperties(fallbackProperties);
          setIsLoading(false);
          return;
        }

        // Transform data to match component expectations
        const transformedData = data.map(property => ({
          id: property.id,
          title: property.title,
          description: property.description,
          type: propertyTypeMap[property.property_type] || property.property_type,
          location: property.location,
          neighborhood: property.neighborhood,
          price: parseFloat(property.price),
          area: property.area_sqm,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          condition: conditionMap[property.condition] || property.condition,
          features: property.features || [],
          image: property.images && property.images.length > 0 
            ? property.images[0] 
            : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
          images: property.images || [],
          featured: property.featured
        }));

        setProperties(transformedData);
        setFilteredProperties(transformedData);
      } catch (err) {
        console.error('Error fetching properties:', err);
        // Use fallback data on error
        console.log('Error occurred, using fallback data');
        setProperties(fallbackProperties);
        setFilteredProperties(fallbackProperties);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...properties];

    if (filters.type) {
      result = result.filter(p => p.type === filters.type);
    }
    if (filters.location) {
      result = result.filter(p => p.location === filters.location);
    }
    if (filters.bedrooms) {
      if (filters.bedrooms === '5+') {
        result = result.filter(p => p.bedrooms >= 5);
      } else {
        result = result.filter(p => p.bedrooms === parseInt(filters.bedrooms));
      }
    }
    if (filters.condition) {
      result = result.filter(p => p.condition === filters.condition);
    }
    if (filters.priceMin > 0) {
      result = result.filter(p => p.price >= filters.priceMin);
    }
    if (filters.priceMax < 1000000) {
      result = result.filter(p => p.price <= filters.priceMax);
    }

    setFilteredProperties(result);
    setCurrentPage(1);
  }, [filters, properties]);

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      bedrooms: '',
      condition: '',
      priceMin: 0,
      priceMax: 1000000
    });
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

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 0 && v !== 1000000).length;

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex gap-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  // Property Card Component
  const PropertyCard = ({ property }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badges Container */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {/* Condition Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            property.condition === 'Novo' ? 'bg-emerald-500 text-white' :
            property.condition === 'Renovado' ? 'bg-blue-500 text-white' :
            'bg-amber-500 text-white'
          }`}>
            {property.condition}
          </div>
          {/* Featured Badge */}
          {property.featured && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
              <i className="fa-solid fa-star mr-1"></i>
              Destaque
            </div>
          )}
        </div>
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(property.id);
          }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            favorites.includes(property.id) 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <i className={`${favorites.includes(property.id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
          <span className="text-lg font-bold text-slate-900">{formatPrice(property.price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type */}
        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
          {property.type}
        </span>
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {property.title}
        </h3>
        {/* Location */}
        <p className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <i className="fa-solid fa-location-dot text-emerald-500"></i>
          {property.location}
        </p>
        {/* Details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-ruler-combined text-slate-400"></i>
            {formatArea(property.area)}
          </span>
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-bed text-slate-400"></i>
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-bath text-slate-400"></i>
              {property.bathrooms}
            </span>
          )}
        </div>
        {/* Button */}
        <a 
          href={`#imovel/${property.id}`}
          className="w-full py-3 bg-gray-100 text-slate-700 font-medium rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          Ver Detalhes
          <i className="fa-solid fa-arrow-right text-xs group-hover/btn:translate-x-1 transition-transform"></i>
        </a>
      </div>
    </div>
  );

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-exclamation-circle text-4xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Erro ao Carregar</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-slate-900"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-[150px] opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Imóveis
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Encontre o imóvel ideal para si. Explore a nossa seleção de propriedades em Braga e arredores.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl font-medium text-slate-700 hover:bg-gray-200 transition-colors"
            >
              <i className="fa-solid fa-sliders"></i>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <p className="text-sm text-slate-500">
              {filteredProperties.length} imóveis encontrados
            </p>
          </div>

          {/* Filters Grid */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Property Type */}
              <div className="relative">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">Tipo de Imóvel</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>

              {/* Location */}
              <div className="relative">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">Localização</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>

              {/* Bedrooms */}
              <div className="relative">
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">Quartos</option>
                  {bedroomOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} {opt === '5+' ? 'ou mais' : opt === '1' ? 'quarto' : 'quartos'}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>

              {/* Estado/Condition */}
              <div className="relative">
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({...filters, condition: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">Estado</option>
                  {conditionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>

              {/* Price Range */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min €"
                    value={filters.priceMin || ''}
                    onChange={(e) => setFilters({...filters, priceMin: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max €"
                    value={filters.priceMax === 1000000 ? '' : filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value) || 1000000})}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-xmark"></i>
                  Limpar
                </button>
              )}
            </div>

            {/* Results count - Desktop */}
            <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{filteredProperties.length}</span> imóveis encontrados
              </p>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-emerald-600">
                  <i className="fa-solid fa-filter mr-1"></i>
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            // Skeleton Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : currentProperties.length > 0 ? (
            // Properties Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-house-circle-xmark text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Não encontrámos imóveis que correspondam aos seus critérios de pesquisa. 
                Tente ajustar os filtros.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl font-medium text-slate-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-11 h-11 rounded-xl font-medium transition-all ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 text-slate-400">...</span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl font-medium text-slate-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Seguinte
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-gray-300 mb-8">
            Contacte-nos e ajudamo-lo a encontrar o imóvel perfeito para si.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contactos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
            >
              <i className="fa-solid fa-envelope"></i>
              Contactar
            </a>
            <a 
              href="tel:+351934101523"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <i className="fa-solid fa-phone"></i>
              +351 934 101 523
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertiesPage;
