import React from 'react';

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <i className="fa-solid fa-cookie-bite text-emerald-400"></i>
            <span className="text-sm font-medium text-emerald-300">Cookies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Cookies</h1>
          <p className="text-slate-300">Última atualização: março de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-question text-emerald-500"></i>
              1. O Que São Cookies?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo (computador, 
              tablet ou telemóvel) quando visita um website. São amplamente utilizados para fazer os websites 
              funcionarem de forma mais eficiente e para fornecer informações aos proprietários do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-emerald-500"></i>
              2. Cookies que Utilizamos
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">O nosso website utiliza os seguintes tipos de cookies:</p>
            
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Essenciais</span>
                  <span className="text-sm text-slate-400">Sempre ativos</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Cookies de Autenticação</h3>
                <p className="text-slate-600 text-sm">
                  Utilizados para manter a sessão iniciada após o login com Google. Incluem tokens de 
                  autenticação da Supabase armazenados no localStorage. São essenciais para o funcionamento 
                  da conta de utilizador.
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-medium">Nome:</span> sb-*-auth-token &nbsp;|&nbsp; 
                  <span className="font-medium">Duração:</span> Sessão do navegador
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Essenciais</span>
                  <span className="text-sm text-slate-400">Sempre ativos</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Cookies de Preferências</h3>
                <p className="text-slate-600 text-sm">
                  Armazenam preferências do utilizador como favoritos e configurações da interface. 
                  Necessários para uma experiência personalizada no website.
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-medium">Nome:</span> user-preferences &nbsp;|&nbsp; 
                  <span className="font-medium">Duração:</span> Persistente
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Funcionais</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Google OAuth</h3>
                <p className="text-slate-600 text-sm">
                  Cookies definidos pela Google durante o processo de autenticação. São necessários para 
                  permitir o início de sessão seguro através da conta Google.
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-medium">Terceiro:</span> Google &nbsp;|&nbsp; 
                  <span className="font-medium">Duração:</span> Variável
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-ban text-emerald-500"></i>
              3. Cookies que NÃO Utilizamos
            </h2>
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <p className="text-slate-700 leading-relaxed">
                <strong>O nosso website não utiliza cookies de rastreamento, publicidade ou analytics de terceiros.</strong> 
                Não utilizamos Google Analytics, Facebook Pixel, nem qualquer outro serviço de rastreamento publicitário. 
                A sua navegação no nosso website não é monitorizada para fins de marketing.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-emerald-500"></i>
              4. Como Gerir Cookies
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Pode gerir ou eliminar cookies através das definições do seu navegador:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <i className="fa-brands fa-chrome text-emerald-500 mt-1"></i>
                <span><strong>Chrome:</strong> Definições → Privacidade e segurança → Cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-brands fa-firefox-browser text-emerald-500 mt-1"></i>
                <span><strong>Firefox:</strong> Definições → Privacidade e Segurança → Cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-brands fa-safari text-emerald-500 mt-1"></i>
                <span><strong>Safari:</strong> Preferências → Privacidade → Gerir dados de websites</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-brands fa-edge text-emerald-500 mt-1"></i>
                <span><strong>Edge:</strong> Definições → Cookies e permissões do site</span>
              </li>
            </ul>
            <p className="text-slate-500 text-sm mt-3">
              Nota: a desativação de cookies essenciais pode afetar o funcionamento do website, 
              nomeadamente a impossibilidade de iniciar sessão.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-envelope text-emerald-500"></i>
              5. Contacto
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Para questões sobre a nossa política de cookies, contacte-nos em 
              <a href="mailto:geral@trata.pt" className="text-emerald-600 hover:underline"> geral@trata.pt</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
