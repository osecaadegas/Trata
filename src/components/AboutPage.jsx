import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <i className="fa-solid fa-heart text-emerald-400"></i>
            <span className="text-sm font-medium text-emerald-300">Quem Somos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Sobre a <span className="text-emerald-400">TRATA</span> Imobiliária
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            A sua parceira de confiança no mercado imobiliário em Braga e região.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-bullseye text-3xl text-emerald-600"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">A Nossa Missão</h2>
              <p className="text-slate-600 leading-relaxed">
                A TRATA Imobiliária nasceu com a missão de simplificar e modernizar o processo de compra, 
                venda e arrendamento de imóveis. Acreditamos que todos merecem um serviço transparente, 
                eficiente e sem custos iniciais. O nosso compromisso é com resultados reais e a satisfação 
                dos nossos clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-handshake text-2xl text-emerald-600"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confiança</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Construímos relações duradouras baseadas na honestidade, transparência e integridade em cada negócio.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-rocket text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Inovação</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Utilizamos tecnologia de ponta para proporcionar a melhor experiência na pesquisa e gestão de imóveis.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-users text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Proximidade</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Cada cliente é único. Oferecemos acompanhamento personalizado e dedicado em todas as fases do processo.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">O Que Fazemos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-chart-line text-emerald-600"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Avaliações Imobiliárias</h3>
                <p className="text-slate-600 text-sm">Avaliação profissional com análise de mercado e relatório detalhado.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-key text-blue-600"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Compra e Venda</h3>
                <p className="text-slate-600 text-sm">Acompanhamento completo desde a procura até à escritura.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-file-signature text-purple-600"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Arrendamento</h3>
                <p className="text-slate-600 text-sm">Gestão de contratos de arrendamento e acompanhamento de inquilinos.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-scale-balanced text-amber-600"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Apoio Jurídico</h3>
                <p className="text-slate-600 text-sm">Verificação de documentação e apoio legal em todas as fases.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Onde Estamos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-emerald-600"></i>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Morada</p>
                  <p className="text-slate-600">Centro Comercial Galecia R7C, Loja 45, 4700-026 Braga</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone text-emerald-600"></i>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Telefone</p>
                  <a href="tel:+351934101523" className="text-emerald-600 hover:underline">+351 934 101 523</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope text-emerald-600"></i>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <a href="mailto:geral@trata.pt" className="text-emerald-600 hover:underline">geral@trata.pt</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-clock text-emerald-600"></i>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Horário</p>
                  <p className="text-slate-600">Seg - Sex: 8h-12h, 13h-18h</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2984.5!2d-8.4265!3d41.5495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDMyJzU4LjIiTiA4wrAyNSczNS40Ilc!5e0!3m2!1spt-PT!2spt!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização TRATA Imobiliária"
              ></iframe>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">Tem alguma questão? Fale connosco.</p>
          <a
            href="/contactos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
          >
            <i className="fa-solid fa-envelope"></i>
            Contactar-nos
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
