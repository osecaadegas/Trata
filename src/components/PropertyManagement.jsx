import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PROPERTIES_PER_PAGE = 12;

const PropertyManagement = () => {
  const { user, isSeller, isAdmin, isConfigurator } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    price_type: 'sale',
    property_type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    features: [],
    status: 'available',
    featured: false,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isSeller || isAdmin || isConfigurator) {
      fetchProperties();
    }
  }, [currentPage, filterStatus]);

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
      let query = supabase
        .from('properties')
        .select('*, users(name, email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filter by status if not "all"
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // If not admin, only show own properties
      if (!isAdmin && !isConfigurator) {
        query = query.eq('created_by', user.id);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setProperties(data || []);
      setFilteredProperties(data || []);
      setTotalProperties(count || 0);
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Erro ao carregar imóveis');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploadingImages(true);

      // Upload new images
      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        const newUrls = await handleImageUpload(imageFiles);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        images: imageUrls,
        created_by: user.id,
      };

      if (editingProperty) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);

        if (error) throw error;
        alert('Imóvel atualizado com sucesso!');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) throw error;
        alert('Imóvel criado com sucesso!');
      }

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Erro ao guardar imóvel');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || '',
      location: property.location,
      price: property.price.toString(),
      price_type: property.price_type,
      property_type: property.property_type,
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area_sqm: property.area_sqm?.toString() || '',
      features: property.features || [],
      status: property.status,
      featured: property.featured,
    });
    setExistingImages(property.images || []);
    setShowAddModal(true);
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Tem certeza que deseja eliminar este imóvel?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      alert('Imóvel eliminado com sucesso!');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Erro ao eliminar imóvel');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: '',
      price_type: 'sale',
      property_type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      area_sqm: '',
      features: [],
      status: 'available',
      featured: false,
    });
    setImageFiles([]);
    setExistingImages([]);
    setEditingProperty(null);
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const getFeatureLabel = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    return feature ? feature.label : featureId;
  };

  const getFeatureIcon = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    return feature ? feature.icon : 'fa-check';
  };

  const totalPages = Math.ceil(totalProperties / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const badges = {
      available: { color: 'bg-green-100 text-green-700 border-green-200', text: 'Disponível', icon: 'fa-circle-check' },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Pendente', icon: 'fa-clock' },
      sold: { color: 'bg-red-100 text-red-700 border-red-200', text: 'Vendido', icon: 'fa-circle-xmark' },
      rented: { color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Arrendado', icon: 'fa-handshake' },
    };
    return badges[status] || badges.available;
  };

  if (!isSeller && !isAdmin && !isConfigurator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-700">Acesso Negado</h2>
          <p className="text-gray-500 mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <i className="fa-solid fa-building text-emerald-500"></i>
                Gestão de Imóveis
              </h1>
              <p className="text-slate-500 mt-2">
                Gerir propriedades, fotos e informações
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Adicionar Imóvel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Imóveis</p>
                <p className="text-3xl font-bold text-slate-900">{totalProperties}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-building text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Disponíveis</p>
                <p className="text-3xl font-bold text-slate-900">
                  {properties.filter(p => p.status === 'available').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Vendidos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {properties.filter(p => p.status === 'sold').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-circle-xmark text-red-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center">
              <div>
                <p className="text-sm text-slate-500 mb-1">Em Destaque</p>
                <p className="text-3xl font-bold text-slate-900">
                  {properties.filter(p => p.featured).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-star text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Procurar por título, localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Todos os Estados</option>
              <option value="available">Disponíveis</option>
              <option value="pending">Pendentes</option>
              <option value="sold">Vendidos</option>
              <option value="rented">Arrendados</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-500 mb-4"></i>
              <p className="text-slate-500">A carregar imóveis...</p>
            </div>
          </div>
        ) : currentProperties.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <i className="fa-solid fa-building text-4xl text-gray-300 mb-4"></i>
              <p className="text-slate-500">Nenhum imóvel encontrado</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-emerald-600 font-semibold hover:underline"
              >
                Adicionar o primeiro imóvel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProperties.map((property) => {
                const statusBadge = getStatusBadge(property.status);
                return (
                  <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                    <div className="relative h-48 bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-image text-4xl text-gray-400"></i>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                          <i className={`fa-solid ${statusBadge.icon}`}></i>
                          {statusBadge.text}
                        </span>
                      </div>
                      {property.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            <i className="fa-solid fa-star mr-1"></i>
                            Destaque
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{property.title}</h3>
                      
                      {/* Features */}
                      {property.features && property.features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {property.features.slice(0, 3).map((featureId) => (
                              <span
                                key={featureId}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs"
                              >
                                <i className={`fa-solid ${getFeatureIcon(featureId)}`}></i>
                                {getFeatureLabel(featureId)}
                              </span>
                            ))}
                            {property.features.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                                +{property.features.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-slate-500 mb-3 flex items-center">
                        <i className="fa-solid fa-location-dot mr-2"></i>
                        {property.location}
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 mb-4">
                        {property.price.toLocaleString('pt-PT')} €
                        {property.price_type === 'rent' && <span className="text-sm text-slate-500">/mês</span>}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        {property.bedrooms && (
                          <span><i className="fa-solid fa-bed mr-1"></i>{property.bedrooms}</span>
                        )}
                        {property.bathrooms && (
                          <span><i className="fa-solid fa-bath mr-1"></i>{property.bathrooms}</span>
                        )}
                        {property.area_sqm && (
                          <span><i className="fa-solid fa-maximize mr-1"></i>{property.area_sqm}m²</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(property)}
                          className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors text-sm"
                        >
                          <i className="fa-solid fa-edit mr-2"></i>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'border border-gray-300 text-slate-600 hover:bg-gray-50'
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

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingProperty ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Apartamento T2 Moderno"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Descreva o imóvel..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Localização *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Lisboa, Parque das Nações"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Preço (€) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="450000"
                    />
                  </div>

                  {/* Price Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipo de Negócio *
                    </label>
                    <select
                      value={formData.price_type}
                      onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="sale">Venda</option>
                      <option value="rent">Arrendamento</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipo de Imóvel *
                    </label>
                    <select
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="apartment">Apartamento</option>
                      <option value="house">Moradia</option>
                      <option value="land">Terreno</option>
                      <option value="commercial">Comercial</option>
                    </select>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Quartos
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="2"
                    />
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Casas de Banho
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="2"
                    />
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.area_sqm}
                      onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="120"
                    />
                  </div>

                  {/* Features/Amenities */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Características e Comodidades
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
                      {availableFeatures.map((feature) => (
                        <label
                          key={feature.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.features.includes(feature.id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.features.includes(feature.id)}
                            onChange={() => toggleFeature(feature.id)}
                            className="w-4 h-4 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500"
                          />
                          <i className={`fa-solid ${feature.icon} text-emerald-600 text-sm`}></i>
                          <span className="text-sm text-slate-700">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                    {formData.features.length > 0 && (
                      <p className="mt-2 text-sm text-slate-500">
                        {formData.features.length} característica(s) selecionada(s)
                      </p>
                    )}
                  </div>

                  {/* type="number"
                      min="0"
                      value={formData.area_sqm}
                      onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="110"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="available">Disponível</option>
                      <option value="pending">Pendente</option>
                      <option value="sold">Vendido</option>
                      <option value="rented">Arrendado</option>
                    </select>
                  </div>

                  {/* Featured */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        <i className="fa-solid fa-star text-yellow-500 mr-2"></i>
                        Marcar como imóvel em destaque
                      </span>
                    </label>
                  </div>

                  {/* Images */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Imagens
                    </label>
                    
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2">Imagens atuais:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {existingImages.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Property ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImageFiles(Array.from(e.target.files))}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                    {imageFiles.length > 0 && (
                      <p className="mt-2 text-sm text-slate-500">
                        {imageFiles.length} nova(s) imagem(ns) selecionada(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImages ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        A guardar...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save mr-2"></i>
                        {editingProperty ? 'Atualizar' : 'Criar'} Imóvel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;
