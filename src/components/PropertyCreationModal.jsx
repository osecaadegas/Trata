import React, { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PropertyCreationModal = ({ isOpen, onClose, editingProperty, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Available property features/amenities
  const availableFeatures = [
    { id: 'piscina', label: 'Piscina', icon: 'fa-swimming-pool', category: 'exterior' },
    { id: 'garagem', label: 'Garagem', icon: 'fa-car', category: 'exterior' },
    { id: 'jardim', label: 'Jardim', icon: 'fa-tree', category: 'exterior' },
    { id: 'varanda', label: 'Varanda', icon: 'fa-building', category: 'exterior' },
    { id: 'terraço', label: 'Terraço', icon: 'fa-house-flag', category: 'exterior' },
    { id: 'churrasqueira', label: 'Churrasqueira', icon: 'fa-utensils', category: 'exterior' },
    { id: 'elevador', label: 'Elevador', icon: 'fa-elevator', category: 'building' },
    { id: 'ar_condicionado', label: 'Ar Condicionado', icon: 'fa-wind', category: 'interior' },
    { id: 'aquecimento', label: 'Aquecimento Central', icon: 'fa-temperature-high', category: 'interior' },
    { id: 'lareira', label: 'Lareira', icon: 'fa-fire', category: 'interior' },
    { id: 'arrecadacao', label: 'Arrecadação', icon: 'fa-box', category: 'building' },
    { id: 'despensa', label: 'Despensa', icon: 'fa-boxes-stacked', category: 'interior' },
    { id: 'suite', label: 'Suite', icon: 'fa-bed', category: 'interior' },
    { id: 'closet', label: 'Closet', icon: 'fa-shirt', category: 'interior' },
    { id: 'escritorio', label: 'Escritório', icon: 'fa-briefcase', category: 'interior' },
    { id: 'ginasio', label: 'Ginásio', icon: 'fa-dumbbell', category: 'building' },
    { id: 'sauna', label: 'Sauna', icon: 'fa-hot-tub-person', category: 'building' },
    { id: 'jacuzzi', label: 'Jacuzzi', icon: 'fa-bath', category: 'exterior' },
    { id: 'condominio_fechado', label: 'Condomínio Fechado', icon: 'fa-shield-halved', category: 'security' },
    { id: 'portaria_24h', label: 'Portaria 24h', icon: 'fa-user-shield', category: 'security' },
    { id: 'video_vigilancia', label: 'Vídeo Vigilância', icon: 'fa-video', category: 'security' },
    { id: 'alarme', label: 'Sistema de Alarme', icon: 'fa-bell', category: 'security' },
    { id: 'paineis_solares', label: 'Painéis Solares', icon: 'fa-solar-panel', category: 'sustainability' },
    { id: 'vidros_duplos', label: 'Vidros Duplos', icon: 'fa-window-maximize', category: 'sustainability' },
    { id: 'cozinha_equipada', label: 'Cozinha Equipada', icon: 'fa-kitchen-set', category: 'interior' },
    { id: 'mobilado', label: 'Mobilado', icon: 'fa-couch', category: 'interior' },
    { id: 'vista_mar', label: 'Vista Mar', icon: 'fa-water', category: 'views' },
    { id: 'vista_montanha', label: 'Vista Montanha', icon: 'fa-mountain', category: 'views' },
    { id: 'pet_friendly', label: 'Pet Friendly', icon: 'fa-paw', category: 'other' },
    { id: 'acessibilidade', label: 'Acessibilidade', icon: 'fa-wheelchair', category: 'other' },
  ];

  const featureCategories = {
    interior: { label: 'Interior', icon: 'fa-couch' },
    exterior: { label: 'Exterior', icon: 'fa-tree' },
    building: { label: 'Edifício', icon: 'fa-building' },
    security: { label: 'Segurança', icon: 'fa-shield-halved' },
    sustainability: { label: 'Sustentabilidade', icon: 'fa-leaf' },
    views: { label: 'Vistas', icon: 'fa-eye' },
    other: { label: 'Outros', icon: 'fa-ellipsis' },
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    price_type: 'sale',
    property_type: 'apartment',
    condition: 'new',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    features: [],
    status: 'available',
    featured: false,
    virtual_tour_url: '',
    video_url: '',
    year_built: '',
    energy_rating: '',
    seller_id: '',
    lot_area_sqm: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageOrder, setImageOrder] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [draggedImageType, setDraggedImageType] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  // Fetch sellers (vendedores) for assignment dropdown
  useEffect(() => {
    const fetchSellers = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

      setLoadingSellers(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token || supabaseKey;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/users?role=in.("vendedor","seller")&select=id,name,email,phone,avatar_url`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSellers(data || []);
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
      } finally {
        setLoadingSellers(false);
      }
    };

    if (isOpen) fetchSellers();
  }, [isOpen]);

  // Initialize form when editing
  useEffect(() => {
    if (editingProperty) {
      setFormData({
        title: editingProperty.title || '',
        description: editingProperty.description || '',
        location: editingProperty.location || '',
        price: editingProperty.price?.toString() || '',
        price_type: editingProperty.price_type || 'sale',
        property_type: editingProperty.property_type || 'apartment',
        condition: editingProperty.condition || 'new',
        bedrooms: editingProperty.bedrooms?.toString() || '',
        bathrooms: editingProperty.bathrooms?.toString() || '',
        area_sqm: editingProperty.area_sqm?.toString() || '',
        features: editingProperty.features || [],
        status: editingProperty.status || 'available',
        featured: editingProperty.featured || false,
        virtual_tour_url: editingProperty.virtual_tour_url || '',
        video_url: editingProperty.video_url || '',
        year_built: editingProperty.year_built?.toString() || '',
        energy_rating: editingProperty.energy_rating || '',
        seller_id: editingProperty.seller_id || '',
        lot_area_sqm: editingProperty.lot_area_sqm?.toString() || '',
      });
      setExistingImages(editingProperty.images || []);
      setImageOrder(editingProperty.images || []);
      setThumbnailIndex(0);
    }
  }, [editingProperty]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setErrors({});
      setShowPreview(false);
      if (!editingProperty) {
        resetForm();
      }
    }
  }, [isOpen, editingProperty]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: '',
      price_type: 'sale',
      property_type: 'apartment',
      condition: 'new',
      bedrooms: '',
      bathrooms: '',
      area_sqm: '',
      features: [],
      status: 'available',
      featured: false,
      virtual_tour_url: '',
      video_url: '',
      year_built: '',
      energy_rating: '',
      seller_id: '',
      lot_area_sqm: '',
    });
    setImageFiles([]);
    setExistingImages([]);
    setImageOrder([]);
    setThumbnailIndex(0);
    setDraggedImageIndex(null);
    setDraggedImageType(null);
  };

  const steps = [
    { id: 1, name: 'Informações', icon: 'fa-info-circle', description: 'Dados básicos' },
    { id: 2, name: 'Detalhes', icon: 'fa-list-check', description: 'Características' },
    { id: 3, name: 'Imagens', icon: 'fa-images', description: 'Galeria de fotos' },
    { id: 4, name: 'Vendedor', icon: 'fa-user-tie', description: 'Vendedor responsável' },
    { id: 5, name: 'Publicar', icon: 'fa-rocket', description: 'Revisão final' },
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
      if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Preço válido é obrigatório';
    }
    
    if (step === 3) {
      if (existingImages.length === 0 && imageFiles.length === 0) {
        newErrors.images = 'Adicione pelo menos uma imagem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Drag and Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleImageUpload = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!validateStep(currentStep)) return;
    
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setErrors({ submit: 'Base de dados não configurada. Configure as variáveis de ambiente do Supabase.' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || supabaseKey;
      
      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        const newUrls = await handleImageUpload(imageFiles);
        imageUrls = [...imageUrls, ...newUrls];
      }

      // Reorder so thumbnail is first
      if (thumbnailIndex > 0 && thumbnailIndex < imageUrls.length) {
        const thumb = imageUrls.splice(thumbnailIndex, 1)[0];
        imageUrls.unshift(thumb);
      }

      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        lot_area_sqm: formData.lot_area_sqm ? parseInt(formData.lot_area_sqm) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        virtual_tour_url: formData.virtual_tour_url || null,
        video_url: formData.video_url || null,
        energy_rating: formData.energy_rating || null,
        seller_id: formData.seller_id || null,
        images: imageUrls,
        created_by: user.id,
        status: asDraft ? 'pending' : formData.status,
      };

      if (editingProperty) {
        // UPDATE using REST API
        const response = await fetch(
          `${supabaseUrl}/rest/v1/properties?id=eq.${editingProperty.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(propertyData)
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
      } else {
        // INSERT using REST API
        const response = await fetch(
          `${supabaseUrl}/rest/v1/properties`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(propertyData)
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        // Trigger property alerts for matching subscribers (fire and forget)
        try {
          const [newProperty] = await response.json();
          if (newProperty?.id) {
            fetch('/api/send-property-alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ propertyId: newProperty.id })
            }).catch(err => console.error('Alert trigger failed:', err));
          }
        } catch (alertErr) {
          console.error('Could not trigger alerts:', alertErr);
        }
      }

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({ submit: error.message || 'Erro ao guardar imóvel. Verifique a ligação à base de dados.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.id !== currentStep && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    currentStep === step.id
                      ? 'bg-emerald-500 text-white'
                      : currentStep > step.id
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fa-solid ${step.icon} text-sm`}></i>
                  <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded ${currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Título do Imóvel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Ex: Apartamento T3 com Vista Mar"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.title}
                    </p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 transition-all resize-none"
                    placeholder="Descreva as características do imóvel, localização, acabamentos..."
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.description.length}/2000 caracteres</p>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Localização <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Ex: Braga, Centro"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço (€) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="250000"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de Negócio
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, price_type: 'sale' })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.price_type === 'sale'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-slate-600 hover:border-gray-300'
                      }`}
                    >
                      <i className="fa-solid fa-tag mr-2"></i>
                      Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, price_type: 'rent' })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.price_type === 'rent'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-slate-600 hover:border-gray-300'
                      }`}
                    >
                      <i className="fa-solid fa-key mr-2"></i>
                      Arrendamento
                    </button>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de Imóvel
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 transition-all appearance-none bg-white"
                  >
                    <option value="apartment">🏢 Apartamento</option>
                    <option value="house">🏠 Moradia</option>
                    <option value="land">🌳 Terreno</option>
                    <option value="commercial">🏪 Comercial</option>
                    <option value="farm">🌾 Quinta</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 transition-all appearance-none bg-white"
                  >
                    <option value="new">✨ Novo</option>
                    <option value="renovated">🔧 Renovado</option>
                    <option value="to_renovate">🏗️ Para Renovar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-bed text-emerald-500 mr-2"></i>
                    Quartos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-bath text-emerald-500 mr-2"></i>
                    WC
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-ruler-combined text-emerald-500 mr-2"></i>
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-vector-square text-emerald-500 mr-2"></i>
                    Lote (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lot_area_sqm}
                    onChange={(e) => setFormData({ ...formData, lot_area_sqm: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-center">Opcional</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-calendar text-emerald-500 mr-2"></i>
                    Ano de Construção
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <i className="fa-solid fa-leaf text-emerald-500 mr-2"></i>
                    Certificado Energético
                  </label>
                  <select
                    value={formData.energy_rating}
                    onChange={(e) => setFormData({ ...formData, energy_rating: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">Selecionar...</option>
                    <option value="A+">A+ (Muito Eficiente)</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G (Pouco Eficiente)</option>
                    <option value="isento">Isento</option>
                  </select>
                </div>
              </div>

              {/* Features by Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Características e Comodidades
                </label>
                <div className="space-y-4">
                  {Object.entries(featureCategories).map(([catKey, cat]) => {
                    const categoryFeatures = availableFeatures.filter(f => f.category === catKey);
                    if (categoryFeatures.length === 0) return null;
                    
                    return (
                      <div key={catKey} className="border border-gray-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                          <i className={`fa-solid ${cat.icon} text-slate-400`}></i>
                          {cat.label}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {categoryFeatures.map((feature) => (
                            <button
                              key={feature.id}
                              type="button"
                              onClick={() => toggleFeature(feature.id)}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left ${
                                formData.features.includes(feature.id)
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <i className={`fa-solid ${feature.icon} text-sm ${formData.features.includes(feature.id) ? 'text-emerald-500' : 'text-slate-400'}`}></i>
                              <span className="text-sm font-medium truncate">{feature.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.features.length > 0 && (
                  <p className="mt-3 text-sm text-emerald-600 font-medium">
                    <i className="fa-solid fa-check-circle mr-1"></i>
                    {formData.features.length} característica(s) selecionada(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50'
                    : errors.images
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDragging ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <i className={`fa-solid fa-cloud-arrow-up text-3xl ${
                    isDragging ? 'text-emerald-500' : 'text-slate-400'
                  }`}></i>
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
                </p>
                <p className="text-sm text-slate-500">
                  Formatos suportados: JPG, PNG, WEBP • Máx. 10MB por imagem
                </p>
              </div>
              {errors.images && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.images}
                </p>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Imagens Atuais ({existingImages.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        draggable
                        onDragStart={() => { setDraggedImageIndex(index); setDraggedImageType('existing'); }}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedImageType === 'existing' && draggedImageIndex !== index) {
                            setExistingImages(prev => {
                              const updated = [...prev];
                              const [moved] = updated.splice(draggedImageIndex, 1);
                              updated.splice(index, 0, moved);
                              return updated;
                            });
                            if (thumbnailIndex === draggedImageIndex) setThumbnailIndex(index);
                            else if (thumbnailIndex === index) setThumbnailIndex(draggedImageIndex);
                          }
                          setDraggedImageIndex(null);
                          setDraggedImageType(null);
                        }}
                        onDragEnd={() => { setDraggedImageIndex(null); setDraggedImageType(null); }}
                        className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing ${
                          draggedImageType === 'existing' && draggedImageIndex === index ? 'opacity-50 ring-2 ring-emerald-500' : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        {/* Order number badge */}
                        <span className="absolute top-2 left-2 w-7 h-7 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setThumbnailIndex(index); }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              thumbnailIndex === index ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title="Definir como thumbnail"
                          >
                            <i className="fa-solid fa-image text-sm"></i>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExistingImage(index);
                              if (thumbnailIndex >= existingImages.length - 1) setThumbnailIndex(Math.max(0, existingImages.length - 2));
                              else if (index < thumbnailIndex) setThumbnailIndex(prev => prev - 1);
                            }}
                            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600"
                          >
                            <i className="fa-solid fa-trash text-sm"></i>
                          </button>
                        </div>
                        {thumbnailIndex === index && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                            <i className="fa-solid fa-image text-[10px]"></i>
                            Thumbnail
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity">
                          <i className="fa-solid fa-grip-vertical text-white text-sm"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {imageFiles.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Novas Imagens ({imageFiles.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imageFiles.map((file, index) => {
                      const globalIndex = existingImages.length + index;
                      return (
                        <div
                          key={`new-${index}`}
                          draggable
                          onDragStart={() => { setDraggedImageIndex(index); setDraggedImageType('new'); }}
                          onDragOver={(e) => { e.preventDefault(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedImageType === 'new' && draggedImageIndex !== index) {
                              setImageFiles(prev => {
                                const updated = [...prev];
                                const [moved] = updated.splice(draggedImageIndex, 1);
                                updated.splice(index, 0, moved);
                                return updated;
                              });
                              const dragGlobal = existingImages.length + draggedImageIndex;
                              if (thumbnailIndex === dragGlobal) setThumbnailIndex(globalIndex);
                              else if (thumbnailIndex === globalIndex) setThumbnailIndex(dragGlobal);
                            }
                            setDraggedImageIndex(null);
                            setDraggedImageType(null);
                          }}
                          onDragEnd={() => { setDraggedImageIndex(null); setDraggedImageType(null); }}
                          className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing ${
                            draggedImageType === 'new' && draggedImageIndex === index ? 'opacity-50 ring-2 ring-emerald-500' : ''
                          }`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Nova imagem ${index + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                          {/* Order number badge */}
                          <span className="absolute top-2 left-2 w-7 h-7 bg-blue-500/80 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {globalIndex + 1}
                          </span>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setThumbnailIndex(globalIndex); }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                thumbnailIndex === globalIndex ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-emerald-500 hover:text-white'
                              }`}
                              title="Definir como thumbnail"
                            >
                              <i className="fa-solid fa-image text-sm"></i>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNewImage(index);
                                const totalImages = existingImages.length + imageFiles.length - 1;
                                if (thumbnailIndex >= totalImages) setThumbnailIndex(Math.max(0, totalImages - 1));
                                else if (globalIndex < thumbnailIndex) setThumbnailIndex(prev => prev - 1);
                                else if (globalIndex === thumbnailIndex) setThumbnailIndex(0);
                              }}
                              className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600"
                            >
                              <i className="fa-solid fa-trash text-sm"></i>
                            </button>
                          </div>
                          {thumbnailIndex === globalIndex ? (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                              <i className="fa-solid fa-image text-[10px]"></i>
                              Thumbnail
                            </span>
                          ) : (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg">
                              Novo
                            </span>
                          )}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity">
                            <i className="fa-solid fa-grip-vertical text-white text-sm"></i>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tip */}
              {(existingImages.length + imageFiles.length) > 1 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                  <p className="text-sm text-blue-700">
                    <strong>Dica:</strong> Arraste as imagens para reordenar. Clique no ícone <i className="fa-solid fa-image"></i> para definir a imagem de capa (thumbnail).
                  </p>
                </div>
              )}

              {/* Virtual Tour & Video */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-vr-cardboard text-emerald-500"></i>
                  Tour Virtual & Vídeo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 3D Tour URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Link do Tour 3D / Virtual
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-cube absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input
                        type="url"
                        value={formData.virtual_tour_url}
                        onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        placeholder="https://matterport.com/tour/..."
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Suporta Matterport, Kuula, etc.</p>
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Link do Vídeo
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-video absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input
                        type="url"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">YouTube ou Vimeo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Seller Assignment */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-100">
                  <i className="fa-solid fa-user-tie text-3xl text-emerald-500"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Vendedor Responsável</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Selecione o vendedor responsável por este imóvel. As informações de contacto deste vendedor serão apresentadas na página do imóvel.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <i className="fa-solid fa-user-tie text-emerald-500 mr-2"></i>
                  Vendedor <span className="text-red-500">*</span>
                </label>
                {loadingSellers ? (
                  <div className="flex items-center gap-2 text-slate-500 py-3">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    A carregar vendedores...
                  </div>
                ) : sellers.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-700 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      Nenhum vendedor encontrado. Adicione utilizadores com o papel "vendedor" no sistema.
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.seller_id}
                    onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 transition-all appearance-none bg-white ${
                      errors.seller_id ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecionar vendedor...</option>
                    {sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name || seller.email}{seller.phone ? ` - ${seller.phone}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {errors.seller_id && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.seller_id}
                  </p>
                )}
              </div>

              {/* Selected Seller Preview */}
              {formData.seller_id && (() => {
                const selected = sellers.find(s => s.id === formData.seller_id);
                if (!selected) return null;
                return (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-emerald-800 mb-2">
                      <i className="fa-solid fa-check-circle mr-1"></i>
                      Vendedor selecionado
                    </p>
                    <div className="flex items-center gap-3">
                      {selected.avatar_url ? (
                        <img
                          src={selected.avatar_url}
                          alt={selected.name || 'Vendedor'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center">
                          <i className="fa-solid fa-user text-emerald-600 text-lg"></i>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{selected.name || 'Sem nome'}</p>
                        <p className="text-sm text-slate-600">{selected.email}</p>
                        {selected.phone && (
                          <p className="text-sm text-slate-600">
                            <i className="fa-solid fa-phone text-xs mr-1"></i>
                            {selected.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              {/* Preview Card */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {/* Preview Image */}
                <div className="relative h-48 bg-gray-100">
                  {(() => {
                    const allImages = [...existingImages, ...imageFiles.map(f => URL.createObjectURL(f))];
                    const thumbSrc = allImages[thumbnailIndex] || allImages[0];
                    return thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <i className="fa-solid fa-image text-4xl"></i>
                      </div>
                    );
                  })()}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      formData.condition === 'new' ? 'bg-emerald-500 text-white' :
                      formData.condition === 'renovated' ? 'bg-blue-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      {formData.condition === 'new' ? 'Novo' : formData.condition === 'renovated' ? 'Renovado' : 'Para Renovar'}
                    </span>
                    {formData.featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                        <i className="fa-solid fa-star mr-1"></i>
                        Destaque
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900">{formData.title || 'Sem título'}</h3>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-emerald-500"></i>
                    {formData.location || 'Localização não definida'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-3">
                    {formData.price ? formatPrice(parseFloat(formData.price)) : '€0'}
                    {formData.price_type === 'rent' && <span className="text-sm text-slate-500">/mês</span>}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    {formData.bedrooms && (
                      <span><i className="fa-solid fa-bed mr-1 text-emerald-500"></i>{formData.bedrooms} quartos</span>
                    )}
                    {formData.bathrooms && (
                      <span><i className="fa-solid fa-bath mr-1 text-emerald-500"></i>{formData.bathrooms} WC</span>
                    )}
                    {formData.area_sqm && (
                      <span><i className="fa-solid fa-ruler-combined mr-1 text-emerald-500"></i>{formData.area_sqm}m²</span>
                    )}
                    {formData.lot_area_sqm && (
                      <span><i className="fa-solid fa-vector-square mr-1 text-emerald-500"></i>{formData.lot_area_sqm}m² lote</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Resumo</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className="font-medium text-slate-700">
                      {formData.property_type === 'apartment' ? 'Apartamento' :
                       formData.property_type === 'house' ? 'Moradia' :
                       formData.property_type === 'land' ? 'Terreno' :
                       formData.property_type === 'commercial' ? 'Comercial' : 'Quinta'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Negócio:</span>
                    <span className="font-medium text-slate-700">
                      {formData.price_type === 'sale' ? 'Venda' : 'Arrendamento'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Imagens:</span>
                    <span className="font-medium text-slate-700">
                      {existingImages.length + imageFiles.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Características:</span>
                    <span className="font-medium text-slate-700">{formData.features.length}</span>
                  </div>
                  <div className="flex justify-between md:col-span-2">
                    <span className="text-slate-500">Vendedor:</span>
                    <span className="font-medium text-slate-700">
                      {(() => {
                        const s = sellers.find(s => s.id === formData.seller_id);
                        return s ? (s.name || s.email) : 'Não atribuído';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Publish Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estado de Publicação
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="available">🟢 Disponível - Visível no site</option>
                    <option value="pending">🟡 Pendente - Aguarda revisão</option>
                    <option value="sold">🔴 Vendido</option>
                    <option value="rented">🔵 Arrendado</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-700">
                      <i className="fa-solid fa-star text-yellow-500 mr-2"></i>
                      Marcar como Destaque
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      O imóvel aparecerá em primeiro lugar nas listagens
                    </p>
                  </div>
                </label>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i>
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep === 5 && (
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 text-slate-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <i className="fa-solid fa-save mr-2"></i>
                  Guardar Rascunho
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Continuar
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      A publicar...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-rocket"></i>
                      {editingProperty ? 'Guardar Alterações' : 'Publicar Imóvel'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCreationModal;
