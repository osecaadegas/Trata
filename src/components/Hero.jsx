import React, { useState } from 'react';

const Hero = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    // Build search params and navigate to properties
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);
    
    // Navigate to properties section with filters
    window.location.hash = params.toString() ? `imoveis?${params.toString()}` : 'imoveis';
    
    // Scroll to the properties section
    setTimeout(() => {
      document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="home" className="hero-gradient py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          Encontre o seu espaço ideal com a <span className="text-green-accent">TRATA</span>.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Soluções imobiliárias transparentes, modernas e eficazes. Nós tratamos de tudo por si.
        </p>
        
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
          <div className="flex-1 flex items-center px-4 border-r border-gray-100">
            <i className="fa-solid fa-location-dot text-gray-400 mr-3"></i>
            <input 
              type="text" 
              placeholder="Localização..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full py-3 outline-none text-slate-700"
            />
          </div>
          <div className="flex-1 flex items-center px-4 border-r border-gray-100">
            <i className="fa-solid fa-house text-gray-400 mr-3"></i>
            <select 
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full py-3 outline-none text-slate-700 bg-transparent cursor-pointer"
            >
              <option value="">Tipo de Imóvel</option>
              <option value="apartamento">Apartamento</option>
              <option value="moradia">Moradia</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
          <button 
            onClick={handleSearch}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Procurar
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
