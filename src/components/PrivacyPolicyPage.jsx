import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <i className="fa-solid fa-shield-halved text-emerald-400"></i>
            <span className="text-sm font-medium text-emerald-300">Proteção de Dados</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-slate-300">Última atualização: março de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-building text-emerald-500"></i>
              1. Responsável pelo Tratamento
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A TRATA Imobiliária (AMI 20736), com sede no Centro Comercial Galecia R7C, Loja 45, Maximinos, 4700-026 Braga, 
              é a entidade responsável pelo tratamento dos dados pessoais recolhidos através deste website. 
              Para qualquer questão relacionada com a proteção de dados, pode contactar-nos pelo email 
              <a href="mailto:geral@trata.pt" className="text-emerald-600 hover:underline"> geral@trata.pt</a> ou 
              pelo telefone <a href="tel:+351934101523" className="text-emerald-600 hover:underline"> +351 934 101 523</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-database text-emerald-500"></i>
              2. Dados Pessoais Recolhidos
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">Recolhemos os seguintes dados pessoais:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Nome completo</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Endereço de email</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Número de telefone</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Dados de autenticação (via Google OAuth)</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Imagem de perfil</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Mensagens enviadas através do formulário de contacto</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Preferências de imóveis e favoritos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-emerald-500"></i>
              3. Finalidade do Tratamento
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">Os seus dados pessoais são tratados para as seguintes finalidades:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Responder a pedidos de informação e contactos</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Gestão de conta e autenticação no website</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Envio de alertas de novos imóveis (mediante consentimento)</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Gestão de favoritos e preferências</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Comunicação entre compradores e vendedores</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Melhoria dos nossos serviços e experiência do utilizador</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-scale-balanced text-emerald-500"></i>
              4. Base Legal
            </h2>
            <p className="text-slate-600 leading-relaxed">
              O tratamento dos seus dados baseia-se no consentimento do titular (artigo 6.º, n.º 1, alínea a) do RGPD), 
              na execução de um contrato ou diligências pré-contratuais (alínea b), e no interesse legítimo da TRATA 
              Imobiliária em prestar os seus serviços (alínea f).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-clock text-emerald-500"></i>
              5. Prazo de Conservação
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Os dados pessoais serão conservados apenas durante o período necessário para as finalidades que 
              motivaram a sua recolha. Os dados de conta são mantidos enquanto a conta estiver ativa. 
              Após o encerramento da conta, os dados são eliminados no prazo máximo de 30 dias, salvo 
              obrigação legal de conservação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-emerald-500"></i>
              6. Direitos do Titular
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">Nos termos do RGPD, tem direito a:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Aceder aos seus dados pessoais</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Retificar dados incorretos ou incompletos</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Solicitar a eliminação dos seus dados</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Limitar o tratamento dos seus dados</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Portabilidade dos dados</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Opor-se ao tratamento</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Retirar o consentimento a qualquer momento</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Para exercer estes direitos, contacte-nos em <a href="mailto:geral@trata.pt" className="text-emerald-600 hover:underline">geral@trata.pt</a>.
              Tem ainda o direito de apresentar reclamação junto da 
              <strong> CNPD – Comissão Nacional de Proteção de Dados</strong> (www.cnpd.pt).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-share-nodes text-emerald-500"></i>
              7. Partilha de Dados
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Os seus dados não são vendidos a terceiros. Podemos partilhar dados com prestadores de serviços 
              que auxiliam nas nossas operações (alojamento web, serviço de email), sempre com as devidas garantias 
              de segurança e sigilo. Os dados podem ser processados pela Supabase (infraestrutura) e pela Google 
              (autenticação), ambos com políticas de proteção de dados conformes ao RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-lock text-emerald-500"></i>
              8. Segurança
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Implementámos medidas técnicas e organizativas adequadas para proteger os seus dados pessoais 
              contra acesso não autorizado, alteração, divulgação ou destruição. Isto inclui encriptação de 
              dados em trânsito (HTTPS/TLS), controlos de acesso baseados em funções e monitorização contínua.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
