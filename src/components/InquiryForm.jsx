import { useState } from 'react';
import { X, Send, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function InquiryForm({ property, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: property 
      ? `Olá, gostaria de obter mais informações sobre o imóvel "${property.title}".`
      : '',
    inquiryType: 'info',
    preferredContact: 'email',
    preferredTime: '',
    marketingConsent: false
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const response = await fetch(`${API_URL}/api/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          propertyId: property?.id,
          propertyTitle: property?.title,
          utmSource: urlParams.get('utm_source'),
          utmMedium: urlParams.get('utm_medium'),
          utmCampaign: urlParams.get('utm_campaign')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar pedido');
      }

      setStatus('success');
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          inquiryType: 'info',
          preferredContact: 'email',
          preferredTime: '',
          marketingConsent: false
        });
        onClose?.();
      }, 3000);

    } catch (error) {
      console.error('Inquiry submission error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Ocorreu um erro. Por favor tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Pedir Informações</h2>
          {property && (
            <p className="text-white/80 mt-1 text-sm truncate">
              {property.title}
            </p>
          )}
        </div>

        {/* Success State */}
        {status === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pedido enviado com sucesso!
            </h3>
            <p className="text-gray-600">
              Entraremos em contacto consigo em breve.
              <br />
              Verifique também a sua caixa de email.
            </p>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="O seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="+351 900 000 000"
                />
              </div>
            </div>

            {/* Inquiry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de pedido
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'visit', label: '🏠 Visita' },
                  { value: 'info', label: 'ℹ️ Informação' },
                  { value: 'price', label: '💰 Preço' },
                  { value: 'general', label: '📝 Outro' }
                ].map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.inquiryType === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="inquiryType"
                      value={option.value}
                      checked={formData.inquiryType === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto preferido
                </label>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📞 Telefone</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Qualquer</option>
                  <option value="morning">🌅 Manhã</option>
                  <option value="afternoon">☀️ Tarde</option>
                  <option value="evening">🌆 Noite</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Escreva a sua mensagem..."
              />
            </div>

            {/* Marketing Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="marketingConsent"
                id="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="marketingConsent" className="text-sm text-gray-600">
                Aceito receber comunicações de marketing sobre novos imóveis e ofertas da Trata Imobiliária. 
                Pode cancelar a qualquer momento.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Pedido
                </>
              )}
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              Ao submeter este formulário, concorda com a nossa{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
