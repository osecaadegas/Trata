import React from 'react';

const Footer = () => {
  return (
    <footer id="contatos" className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <span className="text-2xl font-bold tracking-tighter text-slate-900 mb-6 block">
            TRA<span className="text-green-accent">TA</span>
          </span>
          <p className="text-slate-500 leading-relaxed mb-6">
            A TRATA é a sua parceira de confiança no mercado imobiliário, focada na eficácia e modernidade.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Links Rápidos</h4>
          <ul className="space-y-4 text-slate-500">
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Comprar</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Arrendar</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Vender</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Sobre Nós</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Serviços</h4>
          <ul className="space-y-4 text-slate-500">
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Avaliação de Imóveis</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Gestão de Arrendamento</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Apoio Jurídico</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Crédito Habitação</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Contactos</h4>
          <ul className="space-y-4 text-slate-500">
            <li className="flex items-center">
              <i className="fa-solid fa-phone mr-3 text-emerald-500"></i> +351 210 000 000
            </li>
            <li className="flex items-center">
              <i className="fa-solid fa-envelope mr-3 text-emerald-500"></i> geral@trata.pt
            </li>
            <li className="flex items-center">
              <i className="fa-solid fa-location-dot mr-3 text-emerald-500"></i> Av. da Liberdade, Lisboa
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 text-center text-slate-400 text-sm">
        <p>&copy; 2023 TRATA Imobiliária. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
