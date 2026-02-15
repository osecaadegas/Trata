import React, { useState } from 'react';

const SellerValueSection = () => {
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    {
      number: '01',
      title: 'Avaliação Gratuita',
      description: 'Visitamos o seu imóvel e apresentamos uma proposta de valorização personalizada.',
      icon: 'fa-magnifying-glass-location',
      detail: 'Sem compromisso. Analisamos o potencial real do seu imóvel.'
    },
    {
      number: '02',
      title: 'Renovação por Nossa Conta',
      description: 'Assumimos os custos de renovação e preparação. Você não paga nada.',
      icon: 'fa-paintbrush',
      detail: 'Investimos na valorização para que você não tenha de o fazer.'
    },
    {
      number: '03',
      title: 'Venda ao Melhor Preço',
      description: 'Promovemos e negociamos a venda para maximizar o valor final.',
      icon: 'fa-chart-line',
      detail: 'Marketing profissional, fotografia, e negociação especializada.'
    },
    {
      number: '04',
      title: 'Recebe Mais, Sem Risco',
      description: 'Só cobramos quando vender — e normalmente por um valor superior.',
      icon: 'fa-handshake',
      detail: 'O nosso sucesso depende do seu. Interesses 100% alinhados.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-emerald-700 text-sm font-medium">Para Proprietários</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Venda o Seu Imóvel pelo
            <span className="block text-emerald-600">Valor que Ele Merece</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
            Tratamos de tudo — da renovação à venda.
            <span className="block font-medium text-slate-700">Sem investimento inicial da sua parte.</span>
          </p>
        </div>

        {/* Process Steps - Desktop */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group relative cursor-pointer transition-all duration-500 ${
                  activeStep === index ? 'scale-[1.02]' : ''
                }`}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-emerald-200 to-emerald-100 z-0"></div>
                )}
                
                {/* Card */}
                <div className={`relative z-10 bg-white rounded-2xl p-6 border transition-all duration-300 ${
                  activeStep === index 
                    ? 'border-emerald-200 shadow-xl shadow-emerald-500/10' 
                    : 'border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100'
                }`}>
                  {/* Step Number */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                    activeStep === index 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                  }`}>
                    <i className={`fa-solid ${step.icon} text-xl`}></i>
                  </div>
                  
                  {/* Step Number Badge */}
                  <span className={`absolute top-4 right-4 text-sm font-bold transition-colors ${
                    activeStep === index ? 'text-emerald-500' : 'text-slate-300'
                  }`}>
                    {step.number}
                  </span>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Expanded Detail */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    activeStep === index ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-xs text-emerald-600 font-medium bg-emerald-50 rounded-lg p-3">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps - Mobile */}
        <div className="lg:hidden space-y-4 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Icon & Number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <i className={`fa-solid ${step.icon} text-lg`}></i>
                  </div>
                  <span className="block text-center text-xs font-bold text-slate-300 mt-2">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Progress indicator for mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="w-[2px] h-4 bg-gradient-to-b from-emerald-200 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Indicator */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">+90%</span> dos proprietários venderam acima do valor estimado
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contacto"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <i className="fa-solid fa-calculator"></i>
            Pedir Avaliação Gratuita
            <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
          </a>
          
          <button
            onClick={() => {
              const section = document.getElementById('como-funciona');
              if (section) section.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-4 text-slate-600 hover:text-emerald-600 font-medium transition-colors"
          >
            <i className="fa-solid fa-play-circle"></i>
            Ver Como Funciona
          </button>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-shield-check text-emerald-500"></i>
              <span>Sem custos ocultos</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-file-contract text-emerald-500"></i>
              <span>Contrato transparente</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-clock text-emerald-500"></i>
              <span>Resposta em 24h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerValueSection;
