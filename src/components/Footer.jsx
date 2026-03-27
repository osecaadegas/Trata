import React from 'react';

const Footer = () => {
  return (
    <footer id="contatos" className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <a href="/" className="flex items-center gap-2 mb-6">
            <img 
              src="/trata.png" 
              alt="TRATA Logo" 
              className="h-12 w-auto object-contain"
            />
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-bold tracking-tighter text-slate-900">
                TRA<span className="text-emerald-400">TA</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[0.15em]">
                <span className="text-emerald-400">IMOB</span><span className="text-slate-900">ILIÁRIA</span>
              </span>
            </div>
          </a>
          <p className="text-slate-500 leading-relaxed mb-6">
            A TRATA é a sua parceira de confiança no mercado imobiliário, focada na eficácia e modernidade.
          </p>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/p/Trata-Imobili%C3%A1ria-61555254285406/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">
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
            <li><a href="/imoveis" className="hover:text-emerald-500 transition-colors">Imóveis</a></li>
            <li><a href="/servicos" className="hover:text-emerald-500 transition-colors">Serviços</a></li>
            <li><a href="/contactos" className="hover:text-emerald-500 transition-colors">Contactos</a></li>
            <li><a href="/sobre" className="hover:text-emerald-500 transition-colors">Sobre Nós</a></li>
            <li><a href="/carreiras" className="hover:text-emerald-500 transition-colors">Carreiras</a></li>
            <li><a href="/guias" className="hover:text-emerald-500 transition-colors">Guias</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Legal</h4>
          <ul className="space-y-4 text-slate-500">
            <li><a href="/privacidade" className="hover:text-emerald-500 transition-colors">Política de Privacidade</a></li>
            <li><a href="/termos" className="hover:text-emerald-500 transition-colors">Termos e Condições</a></li>
            <li><a href="/cookies" className="hover:text-emerald-500 transition-colors">Política de Cookies</a></li>
            <li><a href="/seguranca" className="hover:text-emerald-500 transition-colors">Segurança</a></li>
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
                Centro Comercial Galecia R7C,<br />Loja 45, Maximinos, 4700-026 Braga
              </a>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-clock mr-3 text-emerald-500 mt-1"></i>
              <span>Seg - Sex: 8h-12h, 13h-18h</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 text-center text-slate-400 text-sm space-y-1">
        <p>AMI 20736</p>
        <p>&copy; 2026 TRATA Imobiliária. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
