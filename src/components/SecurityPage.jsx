import React from 'react';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <i className="fa-solid fa-lock text-emerald-400"></i>
            <span className="text-sm font-medium text-emerald-300">Segurança</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Segurança</h1>
          <p className="text-slate-300">Como protegemos os seus dados e garantimos a segurança dos nossos serviços.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-shield-halved text-2xl text-emerald-600"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">O Nosso Compromisso com a Segurança</h2>
              <p className="text-slate-600 leading-relaxed">
                Na TRATA Imobiliária, a proteção dos dados dos nossos clientes é uma prioridade fundamental. 
                Implementámos múltiplas camadas de segurança para garantir que as suas informações pessoais 
                estão seguras em todas as interações com o nosso website.
              </p>
            </div>
          </div>
        </div>

        {/* Security Measures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-lock text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Encriptação HTTPS/TLS</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Toda a comunicação entre o seu navegador e os nossos servidores é encriptada com protocolo 
              HTTPS/TLS, impedindo a interceção de dados durante a transmissão.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-user-lock text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Autenticação Segura</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Utilizamos Google OAuth 2.0 para autenticação, garantindo que nunca armazenamos as suas 
              palavras-passe. O processo de login é gerido diretamente pela Google com protocolos de 
              segurança de nível empresarial.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-database text-emerald-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Base de Dados Protegida</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Os dados são armazenados em infraestrutura Supabase com encriptação em repouso, 
              políticas de segurança ao nível de linhas (RLS) e backups automáticos regulares.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-user-shield text-amber-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Controlo de Acessos</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Implementámos um sistema de controlo de acessos baseado em funções (RBAC), garantindo 
              que cada utilizador apenas acede às funcionalidades e dados que lhe são destinados.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-shield-virus text-red-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Proteção contra Ataques</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              O nosso website está protegido contra ataques comuns incluindo XSS (Cross-Site Scripting), 
              CSRF (Cross-Site Request Forgery), e injeção de SQL, seguindo as melhores práticas OWASP.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
              <i className="fa-solid fa-cloud-arrow-up text-indigo-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Alojamento Seguro</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              O website é alojado na Vercel, uma plataforma com certificação SOC 2, CDN global, 
              proteção DDoS automática e monitorização contínua de segurança.
            </p>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <i className="fa-solid fa-lightbulb text-emerald-500"></i>
            Recomendações de Segurança
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Para garantir a sua segurança enquanto utiliza o nosso website, recomendamos:
          </p>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <span>Mantenha o seu navegador atualizado para a versão mais recente</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <span>Proteja a sua conta Google com verificação em dois passos</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <span>Termine sempre a sessão quando utilizar computadores partilhados</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <span>Desconfie de emails que peçam dados pessoais em nome da TRATA — nunca pedimos dados por email</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <span>Verifique que o URL começa com <strong>https://www.trataimobiliaria.pt</strong></span>
            </li>
          </ul>
        </div>

        {/* Report */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-2xl p-8 sm:p-12 text-white text-center">
          <i className="fa-solid fa-bug text-3xl text-emerald-400 mb-4"></i>
          <h2 className="text-2xl font-bold mb-3">Reportar Vulnerabilidades</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Se detetar alguma vulnerabilidade de segurança no nosso website, agradecemos que nos 
            contacte de forma responsável. Levamos todas as comunicações de segurança a sério.
          </p>
          <a
            href="mailto:geral@trata.pt"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <i className="fa-solid fa-envelope"></i>
            geral@trata.pt
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
