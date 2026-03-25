import React, { useState } from 'react';

const ServicesPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const services = [
    {
      icon: 'fa-chart-line',
      title: 'Avaliações Imobiliárias',
      description: 'Avaliação profissional e precisa do seu imóvel, com análise de mercado e comparação de valores na região.',
      features: ['Análise comparativa de mercado', 'Relatório detalhado', 'Preço justo e competitivo']
    },
    {
      icon: 'fa-scale-balanced',
      title: 'Apoio Jurídico',
      description: 'Acompanhamento legal completo em todas as fases do processo de compra, venda ou arrendamento.',
      features: ['Verificação de documentação', 'Contratos seguros', 'Apoio no escritório']
    },
    {
      icon: 'fa-comments',
      title: 'Aconselhamento Personalizado',
      description: 'Orientação especializada adaptada às suas necessidades e objetivos no mercado imobiliário.',
      features: ['Consultoria individual', 'Estratégias personalizadas', 'Suporte contínuo']
    },
    {
      icon: 'fa-clipboard-check',
      title: 'Gestão de Processo de Venda',
      description: 'Gerimos todo o processo de venda do seu imóvel, desde a avaliação até à escritura final.',
      features: ['Gestão completa', 'Negociação profissional', 'Acompanhamento total']
    },
    {
      icon: 'fa-bullhorn',
      title: 'Marketing e Divulgação',
      description: 'Promoção do seu imóvel nos melhores canais com fotografia profissional e estratégias de marketing.',
      features: ['Fotografia profissional', 'Portais imobiliários', 'Redes sociais']
    }
  ];

  const timelineSteps = [
    {
      number: '01',
      title: 'Avaliação do Imóvel',
      description: 'Visitamos e avaliamos o seu imóvel, identificando o potencial de valorização com obras.',
      icon: 'fa-magnifying-glass-location'
    },
    {
      number: '02',
      title: 'Renovação e Valorização',
      description: 'Coordenamos todas as obras necessárias para maximizar o valor do seu imóvel.',
      icon: 'fa-hammer'
    },
    {
      number: '03',
      title: 'Colocação no Mercado',
      description: 'Marketing profissional e divulgação nos melhores canais para atrair compradores.',
      icon: 'fa-house-flag'
    },
    {
      number: '04',
      title: 'Venda e Pagamento Final',
      description: 'Fechamos o negócio e só então recebe a fatura das obras e comissões.',
      icon: 'fa-handshake'
    }
  ];

  const trustBadges = [
    { icon: 'fa-shield-halved', title: 'Sem Riscos', description: 'Só paga após a venda' },
    { icon: 'fa-clock', title: '+15 Anos', description: 'Experiência no mercado' },
    { icon: 'fa-house-circle-check', title: '+500 Imóveis', description: 'Vendidos com sucesso' },
    { icon: 'fa-star', title: '98%', description: 'Clientes satisfeitos' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Special Service - Highlighted Section */}
      <section id="special-service" className="py-20 lg:py-28 bg-gradient-to-b from-emerald-50/50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200 rounded-full filter blur-[200px] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-4">
              <i className="fa-solid fa-star"></i>
              Serviço Exclusivo
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Renove Primeiro.<br />
              <span className="text-emerald-600">Pague Só Depois de Vender.</span>
            </h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg leading-relaxed">
              Especializamo-nos em ajudar proprietários com imóveis que precisam de renovação. 
              Tratamos de todo o processo: avaliação, obras, valorização e venda. 
              <strong className="text-slate-700"> Só paga as obras e comissões após receber o dinheiro da venda.</strong>
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            {[
              { icon: 'fa-piggy-bank', text: 'Sem custos iniciais', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
              { icon: 'fa-tools', text: 'Gerimos as obras', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
              { icon: 'fa-chart-line', text: 'Valorização garantida', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
              { icon: 'fa-calendar-check', text: 'Paga só após venda', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
              { icon: 'fa-shield-heart', text: 'Risco mínimo', bgColor: 'bg-rose-100', textColor: 'text-rose-600' }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${benefit.bgColor}`}>
                  <i className={`fa-solid ${benefit.icon} text-xl ${benefit.textColor}`}></i>
                </div>
                <p className="font-semibold text-slate-800">{benefit.text}</p>
              </div>
            ))}
          </div>

          {/* How it Works - Timeline */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Como Funciona?
              </h3>
              <p className="text-slate-500">Um processo simples em 4 passos</p>
            </div>

            {/* Desktop Timeline */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${((activeStep + 1) / timelineSteps.length) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-8">
                  {timelineSteps.map((step, index) => (
                    <div 
                      key={index}
                      className="relative cursor-pointer group"
                      onMouseEnter={() => setActiveStep(index)}
                    >
                      <div className={`w-32 h-32 mx-auto mb-8 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                        index <= activeStep 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-gray-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                      }`}>
                        <i className={`fa-solid ${step.icon} text-3xl mb-2`}></i>
                        <span className="text-2xl font-bold">{step.number}</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="lg:hidden space-y-6">
              {timelineSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-4 items-start"
                >
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    index === 0 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' 
                      : 'bg-gray-100 text-slate-500'
                  }`}>
                    <i className={`fa-solid ${step.icon} text-lg`}></i>
                    <span className="text-xs font-bold mt-1">{step.number}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a 
              href="#contactos"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 text-lg group"
            >
              <i className="fa-solid fa-calculator"></i>
              Pedir Avaliação Gratuita
              <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </a>
            <p className="mt-4 text-slate-500 text-sm">
              <i className="fa-solid fa-clock mr-2"></i>
              Resposta em menos de 24 horas
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
              Os Nossos Serviços
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tudo o que Precisa, Num Só Lugar
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Oferecemos uma gama completa de serviços para tornar a sua experiência imobiliária simples e eficaz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
                  <i className={`fa-solid ${service.icon} text-2xl text-emerald-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <i className="fa-solid fa-check text-emerald-500 text-xs"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fa-solid fa-phone text-2xl text-emerald-400"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Precisa de Ajuda?</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Fale connosco e descubra como podemos ajudar com o seu projeto imobiliário.
                </p>
              </div>
              <a 
                href="#contactos"
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300"
              >
                Fale Connosco
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <i className={`fa-solid ${badge.icon} text-2xl text-emerald-400`}></i>
                </div>
                <h4 className="text-2xl font-bold text-white mb-1">{badge.title}</h4>
                <p className="text-gray-400 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Why Choose Us */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-6">
                Porquê Escolher-nos?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                A Sua Tranquilidade é a Nossa Prioridade
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Com mais de 15 anos de experiência no mercado imobiliário de Braga, 
                conhecemos cada detalhe que faz a diferença no sucesso da venda do seu imóvel.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'Transparência Total', desc: 'Sem surpresas ou custos escondidos' },
                  { title: 'Equipa Dedicada', desc: 'Acompanhamento personalizado do início ao fim' },
                  { title: 'Resultados Comprovados', desc: 'Histórico de vendas acima da média do mercado' },
                  { title: 'Tecnologia Avançada', desc: 'Marketing digital e ferramentas modernas' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-emerald-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-10 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-quote-left text-2xl"></i>
                  </div>
                  <div>
                    <div className="flex gap-1 text-amber-300 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fa-solid fa-star text-sm"></i>
                      ))}
                    </div>
                    <p className="text-emerald-100 text-sm">Cliente Verificado</p>
                  </div>
                </div>
                <p className="text-lg md:text-xl leading-relaxed mb-6">
                  "A TRATA tratou de tudo. Renovaram o apartamento da minha mãe, 
                  venderam por um valor muito acima do esperado, e só pagámos depois 
                  de receber o dinheiro. Serviço impecável!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-user text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Maria Santos</p>
                    <p className="text-emerald-100 text-sm">Braga, 2025</p>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-award text-2xl text-amber-600"></i>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Top Agência</p>
                    <p className="text-sm text-slate-500">Braga 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full filter blur-[150px] opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para Valorizar o Seu Imóvel?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Entre em contacto connosco hoje e descubra como podemos ajudá-lo a 
            obter o melhor valor pelo seu imóvel, sem riscos e sem custos iniciais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contactos"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 text-lg group"
            >
              <i className="fa-solid fa-calculator"></i>
              Pedir Avaliação Gratuita
            </a>
            <a 
              href="tel:+351934101523"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg backdrop-blur-sm"
            >
              <i className="fa-solid fa-phone"></i>
              +351 934 101 523
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
