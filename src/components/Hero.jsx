import React from 'react';

const Hero = () => {
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
              className="w-full py-3 outline-none text-slate-700"
            />
          </div>
          <div className="flex-1 flex items-center px-4 border-r border-gray-100">
            <i className="fa-solid fa-house text-gray-400 mr-3"></i>
            <select className="w-full py-3 outline-none text-slate-700 bg-transparent cursor-pointer">
              <option>Tipo de Imóvel</option>
              <option>Apartamento</option>
              <option>Moradia</option>
              <option>Terreno</option>
            </select>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Procurar
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
