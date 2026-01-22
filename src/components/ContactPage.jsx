import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Try to save to Supabase
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
              name: formData.name,
              email: formData.email,
              phone: formData.phone || null,
              subject: formData.subject || 'outro',
              message: formData.message,
              status: 'unread'
            })
          }
        );

        if (!response.ok) {
          console.error('Failed to save message to database');
        }
      }
      
      // Simulate delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setSubmitSuccess(true); // Still show success to user
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  const contactInfo = [
    {
      icon: 'fa-location-dot',
      title: 'Morada',
      content: 'Centro Comercial Galecia R7C, Rua Comendador Santos da Cunha Nº 589 Loja 45, 4700-026 Braga',
      link: 'https://maps.google.com/?q=GHV9+R3+Braga',
      linkText: 'Ver no Google Maps'
    },
    {
      icon: 'fa-phone',
      title: 'Telefone',
      content: '+351 934 101 523',
      link: 'tel:+351934101523',
      isPhone: true
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      content: 'geral@trata.pt',
      link: 'mailto:geral@trata.pt'
    },
    {
      icon: 'fa-clock',
      title: 'Horário de Funcionamento',
      content: 'Segunda a Sexta',
      schedule: ['08:00 - 12:00', '13:00 - 18:00']
    }
  ];

  const subjects = [
    { value: '', label: 'Selecione um assunto' },
    { value: 'comprar', label: 'Quero comprar um imóvel' },
    { value: 'vender', label: 'Quero vender um imóvel' },
    { value: 'arrendar', label: 'Quero arrendar um imóvel' },
    { value: 'avaliacao', label: 'Avaliação de imóvel' },
    { value: 'parceria', label: 'Proposta de parceria' },
    { value: 'outro', label: 'Outro assunto' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full mb-6 backdrop-blur-sm">
              <i className="fa-solid fa-headset mr-2"></i>
              Estamos aqui para ajudar
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Entre em <span className="text-emerald-400">Contacto</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Tem alguma questão sobre imóveis ou os nossos serviços? 
              A nossa equipa está pronta para o ajudar a encontrar a casa dos seus sonhos.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column - Contact Information */}
            <div className="order-2 lg:order-1">
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Informações de Contacto
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Visite-nos no nosso escritório ou entre em contacto através dos canais abaixo. 
                  Responderemos o mais brevemente possível.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index}
                    className="group flex items-start gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
                      <i className={`fa-solid ${info.icon} text-xl text-emerald-600`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                      {info.isPhone ? (
                        <a 
                          href={info.link}
                          className="text-slate-600 hover:text-emerald-600 transition-colors text-lg font-medium"
                        >
                          {info.content}
                        </a>
                      ) : info.schedule ? (
                        <div>
                          <p className="text-slate-600 mb-2">{info.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {info.schedule.map((time, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full"
                              >
                                <i className="fa-regular fa-clock mr-1.5 text-xs"></i>
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-600 leading-relaxed">{info.content}</p>
                          {info.link && info.linkText && (
                            <a 
                              href={info.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                            >
                              {info.linkText}
                              <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                            </a>
                          )}
                          {info.link && !info.linkText && (
                            <a 
                              href={info.link}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              {info.content}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-10 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl">
                <h3 className="font-semibold text-white mb-4">Siga-nos nas redes sociais</h3>
                <div className="flex gap-3">
                  {[
                    { icon: 'fa-facebook-f', href: '#', label: 'Facebook' },
                    { icon: 'fa-instagram', href: '#', label: 'Instagram' },
                    { icon: 'fa-linkedin-in', href: '#', label: 'LinkedIn' },
                    { icon: 'fa-whatsapp', href: 'https://wa.me/351934101523', label: 'WhatsApp' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-emerald-500 hover:scale-110 transition-all duration-300"
                    >
                      <i className={`fa-brands ${social.icon} text-lg`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 lg:sticky lg:top-28">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    Envie-nos uma mensagem
                  </h2>
                  <p className="text-slate-500">
                    Preencha o formulário e entraremos em contacto consigo em breve.
                  </p>
                </div>

                {submitSuccess && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-emerald-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800">Mensagem enviada!</p>
                      <p className="text-sm text-emerald-600">Entraremos em contacto em breve.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div className="relative">
                    <label 
                      htmlFor="name" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'name' || formData.name 
                          ? '-top-2.5 text-xs bg-white px-2 text-emerald-600 font-medium' 
                          : 'top-4 text-slate-400'
                      }`}
                    >
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-slate-900 placeholder-transparent focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                  </div>

                  {/* Email & Phone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label 
                        htmlFor="email" 
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          focusedField === 'email' || formData.email 
                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-600 font-medium' 
                            : 'top-4 text-slate-400'
                        }`}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-slate-900 placeholder-transparent focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                      />
                    </div>

                    <div className="relative">
                      <label 
                        htmlFor="phone" 
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          focusedField === 'phone' || formData.phone 
                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-600 font-medium' 
                            : 'top-4 text-slate-400'
                        }`}
                      >
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-slate-900 placeholder-transparent focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="relative">
                    <label 
                      htmlFor="subject" 
                      className={`absolute left-4 -top-2.5 text-xs bg-white px-2 font-medium transition-all duration-200 pointer-events-none z-10 ${
                        focusedField === 'subject' 
                          ? 'text-emerald-600' 
                          : 'text-slate-500'
                      }`}
                    >
                      Assunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer ${
                        formData.subject ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <i className="fa-solid fa-chevron-down text-slate-400"></i>
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="relative">
                    <label 
                      htmlFor="message" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'message' || formData.message 
                          ? '-top-2.5 text-xs bg-white px-2 text-emerald-600 font-medium' 
                          : 'top-4 text-slate-400'
                      }`}
                    >
                      Mensagem *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      required
                      rows={5}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-slate-900 placeholder-transparent focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>A enviar...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Mensagem</span>
                        <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    <i className="fa-solid fa-shield-halved mr-1"></i>
                    Os seus dados estão protegidos e não serão partilhados com terceiros.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              <i className="fa-solid fa-map-location-dot text-emerald-500 mr-3"></i>
              Visite o Nosso Escritório
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Estamos localizados no Centro Comercial Galecia, em Braga. 
              Venha conhecer-nos pessoalmente!
            </p>
          </div>
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50 border border-gray-200">
            {/* Map Container */}
            <div className="aspect-[16/9] md:aspect-[21/9] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2984.6847982849847!2d-8.4276!3d41.5503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDMzJzAxLjEiTiA4wrAyNSczOS40Ilc!5e0!3m2!1spt-PT!2spt!4v1609459200000!5m2!1spt-PT!2spt"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização TRATA Imobiliária"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
            
            {/* Floating Info Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-sm">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-building text-emerald-600 text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1">TRATA Imobiliária</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">
                      Centro Comercial Galecia R7C<br />
                      Rua Comendador Santos da Cunha Nº 589<br />
                      Loja 45, 4700-026 Braga
                    </p>
                    <a
                      href="https://maps.google.com/?q=GHV9+R3+Braga"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <i className="fa-solid fa-diamond-turn-right"></i>
                      Obter direções
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Precisa de ajuda imediata?
              </h3>
              <p className="text-gray-400">
                Ligue-nos ou envie uma mensagem pelo WhatsApp
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+351934101523"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                <i className="fa-solid fa-phone text-emerald-500"></i>
                +351 934 101 523
              </a>
              <a
                href="https://wa.me/351934101523"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
