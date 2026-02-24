import React, { useState } from 'react';

const Hero = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);
    window.location.hash = params.toString() ? `imoveis?${params.toString()}` : 'imoveis';
    setTimeout(() => {
      document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/hero.png')`
        }}
      ></div>
      
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 mb-8">
            <span className="text-sm font-medium text-slate-600">Comprar</span>
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-600">Vender</span>
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-600">Valorizar</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            O imóvel certo.
            <span className="block text-emerald-500">O valor certo.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Encontre a sua nova casa ou venda pelo melhor preço
            <span className="block sm:inline"> — sem investimento inicial.</span>
          </p>

          {/* Search Bar - Primary CTA */}
          <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 max-w-3xl mx-auto mb-6">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-location-dot text-emerald-500 mr-3"></i>
                <input 
                  type="text" 
                  placeholder="Localização..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full py-3.5 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-house text-emerald-500 mr-3"></i>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full py-3.5 outline-none text-slate-700 bg-transparent cursor-pointer"
                >
                  <option value="">Tipo de Imóvel</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="moradia">Moradia</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-all hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Procurar Imóvel</span>
                <i className="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
              </button>
            </div>
          </div>

          {/* Divider with Seller CTA */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="text-slate-500 text-base font-medium"></span>
            <a
              href="#contactos"
              className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fa-solid fa-calculator"></i>
              <span>Pedir Avaliação Gratuita</span>
              <i className="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
            </a>
            <a
              href="#servicos"
              className="group inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-slate-200"
            >
              <i className="fa-solid fa-star"></i>
              <span>Conhecer Serviço Especial</span>
              <i className="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
            </a>
          </div>

          {/* Trust Signals / Micro-benefits */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-shield-check text-emerald-600 text-sm"></i>
              </div>
              <span className="text-sm font-medium">Sem custos iniciais</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-clock text-emerald-600 text-sm"></i>
              </div>
              <span className="text-sm font-medium">Resposta em 24h</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-building text-emerald-600 text-sm"></i>
              </div>
              <span className="text-sm font-medium">+500 imóveis</span>
            </div>
          </div>
        </div>

        {/* Floating Stats - Desktop Only */}
        <div className="hidden xl:block">
          {/* Left floating card */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-5 border border-gray-100 max-w-[200px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-handshake text-white"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">90%</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Dos proprietários venderam acima do valor de mercado</p>
          </div>

          {/* Right floating card */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-5 border border-gray-100 max-w-[200px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-euro-sign text-white"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">0€</p>
                <p className="text-xs text-slate-500">investimento inicial</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Nós investimos na valorização do seu imóvel</p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;
