import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PropertyCreationModal from './PropertyCreationModal';

const PROPERTIES_PER_PAGE = 12;

const PropertyManagement = () => {
  const { user, isSeller, isAdmin, isConfigurator, userRole } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Available property features/amenities
  const availableFeatures = [
    { id: 'piscina', label: 'Piscina', icon: 'fa-swimming-pool' },
    { id: 'garagem', label: 'Garagem', icon: 'fa-car' },
    { id: 'jardim', label: 'Jardim', icon: 'fa-tree' },
    { id: 'varanda', label: 'Varanda', icon: 'fa-building' },
    { id: 'terraço', label: 'Terraço', icon: 'fa-house-flag' },
    { id: 'elevador', label: 'Elevador', icon: 'fa-elevator' },
    { id: 'ar_condicionado', label: 'Ar Condicionado', icon: 'fa-wind' },
    { id: 'aquecimento', label: 'Aquecimento Central', icon: 'fa-temperature-high' },
    { id: 'lareira', label: 'Lareira', icon: 'fa-fire' },
    { id: 'churrasqueira', label: 'Churrasqueira', icon: 'fa-utensils' },
    { id: 'arrecadacao', label: 'Arrecadação', icon: 'fa-box' },
    { id: 'despensa', label: 'Despensa', icon: 'fa-boxes-stacked' },
    { id: 'suite', label: 'Suite', icon: 'fa-bed' },
    { id: 'closet', label: 'Closet', icon: 'fa-shirt' },
    { id: 'escritorio', label: 'Escritório', icon: 'fa-briefcase' },
    { id: 'ginasio', label: 'Ginásio', icon: 'fa-dumbbell' },
    { id: 'sauna', label: 'Sauna', icon: 'fa-hot-tub-person' },
    { id: 'jacuzzi', label: 'Jacuzzi', icon: 'fa-bath' },
    { id: 'condominio_fechado', label: 'Condomínio Fechado', icon: 'fa-shield-halved' },
    { id: 'portaria_24h', label: 'Portaria 24h', icon: 'fa-user-shield' },
    { id: 'video_vigilancia', label: 'Vídeo Vigilância', icon: 'fa-video' },
    { id: 'alarme', label: 'Sistema de Alarme', icon: 'fa-bell' },
    { id: 'paineis_solares', label: 'Painéis Solares', icon: 'fa-solar-panel' },
    { id: 'vidros_duplos', label: 'Vidros Duplos', icon: 'fa-window-maximize' },
    { id: 'cozinha_equipada', label: 'Cozinha Equipada', icon: 'fa-kitchen-set' },
    { id: 'mobilado', label: 'Mobilado', icon: 'fa-couch' },
    { id: 'vista_mar', label: 'Vista Mar', icon: 'fa-water' },
    { id: 'vista_montanha', label: 'Vista Montanha', icon: 'fa-mountain' },
    { id: 'pet_friendly', label: 'Pet Friendly', icon: 'fa-paw' },
    { id: 'acessibilidade', label: 'Acessibilidade', icon: 'fa-wheelchair' },
  ];

  useEffect(() => {
    if (isSeller || isAdmin || isConfigurator) {
      fetchProperties();
    }
  }, [currentPage, filterStatus, filterType, sortBy]);

  useEffect(() => {
    // Filter properties based on search term
    if (searchTerm.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching properties...');
      
      let query = supabase
        .from('properties')
        .select('*, users(name, email)', { count: 'exact' });

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      }

      // Filter by status if not "all"
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Filter by type if not "all"
      if (filterType !== 'all') {
        query = query.eq('property_type', filterType);
      }

      // If not admin, only show own properties
      if (!isAdmin && !isConfigurator) {
        query = query.eq('created_by', user.id);
      }

      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: A consulta demorou demasiado tempo')), 10000)
      );

      const { data, error, count } = await Promise.race([query, timeoutPromise]);
      
      console.log('Properties query result:', { data, error, count });

      if (error) throw error;

      setProperties(data || []);
      setFilteredProperties(data || []);
      setTotalProperties(count || 0);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Erro ao carregar imóveis. Verifique se a tabela "properties" existe na base de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowAddModal(true);
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Tem certeza que deseja eliminar este imóvel? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Erro ao eliminar imóvel');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProperty(null);
  };

  const handleSuccess = () => {
    fetchProperties();
  };

  const getFeatureLabel = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    return feature ? feature.label : featureId;
  };

  const getFeatureIcon = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    return feature ? feature.icon : 'fa-check';
  };

  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const badges = {
      available: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'Disponível', icon: 'fa-circle-check', dot: 'bg-emerald-500' },
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'Pendente', icon: 'fa-clock', dot: 'bg-amber-500' },
      sold: { color: 'bg-rose-100 text-rose-700 border-rose-200', text: 'Vendido', icon: 'fa-circle-xmark', dot: 'bg-rose-500' },
      rented: { color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Arrendado', icon: 'fa-handshake', dot: 'bg-blue-500' },
    };
    return badges[status] || badges.available;
  };

  const getTypeLabel = (type) => {
    const types = {
      apartment: { label: 'Apartamento', icon: '🏢' },
      house: { label: 'Moradia', icon: '🏠' },
      land: { label: 'Terreno', icon: '🌳' },
      commercial: { label: 'Comercial', icon: '🏪' },
      farm: { label: 'Quinta', icon: '🌾' },
    };
    return types[type] || { label: type, icon: '🏠' };
  };

  const formatPrice = (price, priceType) => {
    const formatted = new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
    return priceType === 'rent' ? `${formatted}/mês` : formatted;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Stats calculations
  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'available').length,
    pending: properties.filter(p => p.status === 'pending').length,
    sold: properties.filter(p => p.status === 'sold').length,
    rented: properties.filter(p => p.status === 'rented').length,
    featured: properties.filter(p => p.featured).length,
    totalValue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
  };

  if (!isSeller && !isAdmin && !isConfigurator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-lock text-3xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
          <p className="text-slate-500 mt-2 max-w-md">
            Você não tem permissão para acessar a gestão de imóveis. 
            Contacte o administrador se precisar de acesso.
          </p>
          <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <i className="fa-solid fa-building text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    Gestão de Imóveis
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {isAdmin || isConfigurator ? 'Todos os imóveis do sistema' : 'Os seus imóveis'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#messages"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                <i className="fa-solid fa-headset text-emerald-500"></i>
                <span className="hidden sm:inline">Mensagens</span>
              </a>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 text-sm"
              >
                <i className="fa-solid fa-plus"></i>
                Novo Imóvel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-building text-blue-600 text-sm"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Imóveis registados</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Disponíveis</span>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vendidos</span>
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-circle-xmark text-rose-600 text-sm"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-600">{stats.sold}</p>
            <p className="text-xs text-slate-400 mt-1">+{stats.rented} arrendados</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Destaques</span>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-star text-amber-600 text-sm"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.featured}</p>
            <p className="text-xs text-slate-400 mt-1">Imóveis em destaque</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Pesquisar por título, localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-xmark text-xs text-slate-500"></i>
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white appearance-none pr-10 cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="all">Todos os Estados</option>
                  <option value="available">🟢 Disponíveis</option>
                  <option value="pending">🟡 Pendentes</option>
                  <option value="sold">🔴 Vendidos</option>
                  <option value="rented">🔵 Arrendados</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white appearance-none pr-10 cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="apartment">🏢 Apartamento</option>
                  <option value="house">🏠 Moradia</option>
                  <option value="land">🌳 Terreno</option>
                  <option value="commercial">🏪 Comercial</option>
                  <option value="farm">🌾 Quinta</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white appearance-none pr-10 cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                  <option value="price_high">Preço: Alto → Baixo</option>
                  <option value="price_low">Preço: Baixo → Alto</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
                  >
                    <i className="fa-solid fa-grid-2 text-sm"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-3 transition-colors ${viewMode === 'table' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
                  >
                    <i className="fa-solid fa-list text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filterStatus !== 'all' || filterType !== 'all' || searchTerm) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-slate-500">Filtros ativos:</span>
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                    {getStatusBadge(filterStatus).text}
                    <button onClick={() => setFilterStatus('all')} className="hover:text-emerald-900">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                )}
                {filterType !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                    {getTypeLabel(filterType).label}
                    <button onClick={() => setFilterType('all')} className="hover:text-blue-900">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-slate-900">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                    setSearchTerm('');
                  }}
                  className="text-xs text-rose-600 font-medium hover:text-rose-700"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">A carregar imóveis...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-exclamation-triangle text-3xl text-amber-500"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Erro ao carregar imóveis</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {error}
            </p>
            <button
              onClick={fetchProperties}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              <i className="fa-solid fa-refresh"></i>
              Tentar novamente
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-building text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Tente ajustar os filtros ou a pesquisa para ver mais resultados.'
                : 'Comece por adicionar o seu primeiro imóvel ao sistema.'}
            </p>
            <button
              onClick={() => {
                setEditingProperty(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              <i className="fa-solid fa-plus"></i>
              Adicionar Imóvel
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProperties.map((property) => {
                const statusBadge = getStatusBadge(property.status);
                const typeInfo = getTypeLabel(property.property_type);
                return (
                  <div 
                    key={property.id} 
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-image text-4xl text-gray-300"></i>
                        </div>
                      )}
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge.color} backdrop-blur-sm`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                          {statusBadge.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {property.featured && (
                            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <i className="fa-solid fa-star"></i>
                            </span>
                          )}
                          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                            {typeInfo.icon}
                          </span>
                        </div>
                      </div>

                      {/* Image count */}
                      {property.images && property.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-medium">
                          <i className="fa-solid fa-images mr-1"></i>
                          {property.images.length}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {property.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-3 flex items-center">
                        <i className="fa-solid fa-location-dot text-emerald-500 mr-2"></i>
                        {property.location}
                      </p>

                      {/* Quick Features */}
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-gray-100">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-bed text-slate-400"></i>
                            {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-bath text-slate-400"></i>
                            {property.bathrooms}
                          </span>
                        )}
                        {property.area_sqm && (
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-ruler-combined text-slate-400"></i>
                            {property.area_sqm}m²
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatPrice(property.price, property.price_type)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-lg ${property.price_type === 'rent' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {property.price_type === 'rent' ? 'Arrendamento' : 'Venda'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(property)}
                          className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-edit"></i>
                          Editar
                        </button>
                        <a
                          href={`#property/${property.id}`}
                          className="px-4 py-2.5 bg-gray-100 text-slate-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </a>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors text-sm flex items-center justify-center"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Imóvel</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localização</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preço</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentProperties.map((property) => {
                    const statusBadge = getStatusBadge(property.status);
                    const typeInfo = getTypeLabel(property.property_type);
                    return (
                      <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {property.images && property.images.length > 0 ? (
                                <img
                                  src={property.images[0]}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="fa-solid fa-image text-gray-300"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900 line-clamp-1">{property.title}</p>
                                {property.featured && (
                                  <i className="fa-solid fa-star text-amber-500 text-xs"></i>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{typeInfo.icon} {typeInfo.label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{property.location}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-emerald-600">{formatPrice(property.price, property.price_type)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500">{formatDate(property.created_at)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(property)}
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                              title="Editar"
                            >
                              <i className="fa-solid fa-edit text-sm"></i>
                            </button>
                            <a
                              href={`#property/${property.id}`}
                              className="w-8 h-8 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              title="Ver"
                            >
                              <i className="fa-solid fa-eye text-sm"></i>
                            </a>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                              title="Eliminar"
                            >
                              <i className="fa-solid fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredProperties.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              A mostrar <span className="font-medium text-slate-700">{startIndex + 1}</span> a{' '}
              <span className="font-medium text-slate-700">{Math.min(endIndex, filteredProperties.length)}</span> de{' '}
              <span className="font-medium text-slate-700">{filteredProperties.length}</span> imóveis
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fa-solid fa-chevron-left mr-2"></i>
                Anterior
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
                <i className="fa-solid fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Creation/Edit Modal */}
      <PropertyCreationModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        editingProperty={editingProperty}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default PropertyManagement;
