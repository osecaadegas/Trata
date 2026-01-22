import React from 'react';

const Footer = () => {
  return (
    <footer id="contatos" className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <a href="#home" className="flex items-center gap-2 mb-6">
            <img 
              src="/trata.jpg" 
              alt="TRATA Logo" 
              className="h-9 w-9 object-contain rounded-lg"
            />
            <span className="text-2xl font-bold tracking-tighter text-slate-900">
              TRA<span className="text-green-accent">TA</span>
            </span>
          </a>
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
            <li className="flex items-start">
              <i className="fa-solid fa-phone mr-3 text-emerald-500 mt-1"></i>
              <a href="tel:+351934101523" className="hover:text-emerald-500 transition-colors">+351 934 101 523</a>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-envelope mr-3 text-emerald-500 mt-1"></i>
              <a href="mailto:geral@trata.pt" className="hover:text-emerald-500 transition-colors">geral@trata.pt</a>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-location-dot mr-3 text-emerald-500 mt-1"></i>
              <a href="https://maps.google.com/?q=GHV9+R3+Braga" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
                Centro Comercial Galecia R7C,<br />Loja 45, 4700-026 Braga
              </a>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-clock mr-3 text-emerald-500 mt-1"></i>
              <span>Seg - Sex: 8h-12h, 13h-18h</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 text-center text-slate-400 text-sm">
        <p>&copy; 2026 TRATA Imobiliária. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
