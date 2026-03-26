import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <i className="fa-solid fa-file-contract text-emerald-400"></i>
            <span className="text-sm font-medium text-emerald-300">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Termos e Condições</h1>
          <p className="text-slate-300">Última atualização: março de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-emerald-500"></i>
              1. Disposições Gerais
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Os presentes Termos e Condições regulam o acesso e utilização do website da TRATA Imobiliária, 
              acessível em <strong>www.trataimobiliaria.pt</strong>. Ao utilizar este website, o utilizador 
              aceita ficar vinculado a estes termos. Caso não concorde com alguma das condições, deverá 
              cessar a utilização do website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-building text-emerald-500"></i>
              2. Identificação da Entidade
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A TRATA Imobiliária tem sede no Centro Comercial Galecia R7C, Loja 45, 4700-026 Braga, Portugal. 
              Contactos: email <a href="mailto:geral@trata.pt" className="text-emerald-600 hover:underline">geral@trata.pt</a>, 
              telefone <a href="tel:+351934101523" className="text-emerald-600 hover:underline">+351 934 101 523</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-laptop text-emerald-500"></i>
              3. Utilização do Website
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">O utilizador compromete-se a:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Utilizar o website de forma lícita e de boa fé</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Não reproduzir, copiar ou distribuir conteúdos sem autorização</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Não utilizar mecanismos automatizados para aceder ao website</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Fornecer informações verdadeiras e atualizadas nos formulários</li>
              <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1 text-sm"></i>Não praticar atos que possam danificar, sobrecarregar ou comprometer o website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-user-plus text-emerald-500"></i>
              4. Registo e Conta de Utilizador
            </h2>
            <p className="text-slate-600 leading-relaxed">
              O registo no website é efetuado através de autenticação Google OAuth. O utilizador é responsável 
              por manter a segurança da sua conta e por todas as atividades realizadas sob a mesma. 
              A TRATA reserva-se o direito de suspender ou eliminar contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-home text-emerald-500"></i>
              5. Anúncios e Imóveis
            </h2>
            <p className="text-slate-600 leading-relaxed">
              As informações sobre imóveis apresentadas no website são fornecidas de boa fé e com base nas 
              informações disponíveis. A TRATA Imobiliária não garante a exatidão de todas as informações 
              e recomenda a verificação presencial antes de qualquer decisão de compra ou arrendamento. 
              Os preços e disponibilidades podem ser alterados sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-copyright text-emerald-500"></i>
              6. Propriedade Intelectual
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Todo o conteúdo do website, incluindo textos, imagens, logótipos, marcas, design e código, 
              é propriedade da TRATA Imobiliária ou dos seus licenciantes e está protegido pelas leis de 
              propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-emerald-500"></i>
              7. Limitação de Responsabilidade
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A TRATA Imobiliária não se responsabiliza por danos diretos ou indiretos resultantes da utilização 
              do website, incluindo interrupções de serviço, erros técnicos ou perda de dados. O website é 
              disponibilizado "tal como está", sem garantias expressas ou implícitas de disponibilidade contínua.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-link text-emerald-500"></i>
              8. Links Externos
            </h2>
            <p className="text-slate-600 leading-relaxed">
              O website pode conter links para websites de terceiros. A TRATA não tem controlo sobre esses 
              websites e não assume qualquer responsabilidade pelo seu conteúdo ou políticas de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-pen text-emerald-500"></i>
              9. Alterações aos Termos
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A TRATA Imobiliária reserva-se o direito de alterar estes termos a qualquer momento. 
              As alterações entram em vigor após a publicação no website. Recomendamos a consulta 
              periódica desta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-gavel text-emerald-500"></i>
              10. Lei Aplicável
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Estes Termos e Condições são regidos pela legislação portuguesa. Para a resolução de qualquer 
              litígio emergente, é competente o tribunal da comarca de Braga, com renúncia a qualquer outro.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
