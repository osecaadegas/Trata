import { useState } from 'react';
import { Bell, MapPin, Home, Euro, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Braga locations - customize as needed
const LOCATIONS = [
  'Braga, Centro',
  'Braga, Gualtar',
  'Braga, Lamaçães',
  'Braga, Nogueira',
  'Braga, Real',
  'Braga, São Vicente',
  'Braga, São Victor',
  'Braga, Maximinos',
  'Braga, Fraião',
  'Guimarães',
  'Famalicão',
  'Barcelos',
  'Outras'
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'office', label: 'Escritório' }
];

const PRICE_RANGES = [
  { min: null, max: 100000, label: 'Até 100.000€' },
  { min: 100000, max: 200000, label: '100.000€ - 200.000€' },
  { min: 200000, max: 350000, label: '200.000€ - 350.000€' },
  { min: 350000, max: 500000, label: '350.000€ - 500.000€' },
  { min: 500000, max: null, label: 'Mais de 500.000€' }
];

export default function PropertyAlertSubscription({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    locations: [],
    propertyTypes: [],
    priceRange: null,
    frequency: 'instant',
    marketingConsent: false
  });
  
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const togglePropertyType = (type) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const selectPriceRange = (range) => {
    setFormData(prev => ({
      ...prev,
      priceRange: prev.priceRange === range ? null : range
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.marketingConsent) {
      setStatus('error');
      setErrorMessage('Deve aceitar receber comunicações de marketing');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const selectedRange = formData.priceRange !== null 
        ? PRICE_RANGES[formData.priceRange] 
        : null;

      const response = await fetch(`${API_URL}/api/subscribe-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          locations: formData.locations,
          propertyTypes: formData.propertyTypes,
          minPrice: selectedRange?.min,
          maxPrice: selectedRange?.max,
          frequency: formData.frequency,
          marketingConsent: formData.marketingConsent
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar subscrição');
      }

      setStatus('success');
      onSuccess?.();
      
      // Reset after delay
      setTimeout(() => {
        setFormData({
          email: '',
          name: '',
          phone: '',
          locations: [],
          propertyTypes: [],
          priceRange: null,
          frequency: 'instant',
          marketingConsent: false
        });
        setStatus('idle');
        onClose?.();
      }, 4000);

    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Ocorreu um erro. Por favor tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Alertas de Imóveis</h2>
              <p className="text-white/80 text-sm">
                Seja o primeiro a saber quando surgem novos imóveis
              </p>
            </div>
          </div>
        </div>

        {/* Success State */}
        {status === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Subscrição criada!
            </h3>
            <p className="text-gray-600 mb-4">
              Receberá um email de confirmação em breve.
              <br />
              Iremos notificá-lo quando surgir um imóvel que corresponda às suas preferências.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Bell className="w-4 h-4" />
              Alertas ativos
            </div>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Email & Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="O seu nome"
                />
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Localizações de interesse
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(location => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => toggleLocation(location)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.locations.includes(location)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.locations.length === 0 
                  ? 'Nenhuma selecionada = todas as localizações'
                  : `${formData.locations.length} selecionada(s)`
                }
              </p>
            </div>

            {/* Property Types */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Home className="w-4 h-4 text-indigo-600" />
                Tipo de imóvel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => togglePropertyType(type.value)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      formData.propertyTypes.includes(type.value)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Euro className="w-4 h-4 text-indigo-600" />
                Orçamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PRICE_RANGES.map((range, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectPriceRange(index)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      formData.priceRange === index
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência dos alertas
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'instant', label: '⚡ Imediato' },
                  { value: 'daily', label: '📅 Diário' },
                  { value: 'weekly', label: '📆 Semanal' }
                ].map(option => (
                  <label
                    key={option.value}
                    className={`flex-1 p-3 rounded-lg cursor-pointer text-center transition-colors border-2 ${
                      formData.frequency === option.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={formData.frequency === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="marketingConsent"
                  id="alertMarketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="alertMarketingConsent" className="text-sm text-gray-700">
                  <span className="font-medium">Aceito receber alertas de novos imóveis</span> e comunicações 
                  de marketing da Trata Imobiliária por email. Pode cancelar a qualquer momento através do 
                  link presente em cada email. *
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A criar subscrição...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Ativar Alertas
                </>
              )}
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              Ao subscrever, concorda com a nossa{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">
                Política de Privacidade
              </a>
              . Os seus dados são processados de acordo com o RGPD.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// Inline component for embedding in pages
export function PropertyAlertBanner({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Não perca nenhum imóvel</h3>
              <p className="text-white/80 mt-1">
                Receba alertas quando surgir um imóvel que corresponda às suas preferências
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Bell className="w-5 h-5" />
            Ativar Alertas
          </button>
        </div>
      </div>
      
      <PropertyAlertSubscription
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
