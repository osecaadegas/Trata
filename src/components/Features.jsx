import React from 'react';

const Features = () => {
  const features = [
    {
      icon: "fa-shield-halved",
      title: "Segurança Total",
      description: "Processos verificados e transparentes."
    },
    {
      icon: "fa-bolt",
      title: "Rapidez",
      description: "Venda ou alugue o seu imóvel num tempo recorde."
    },
    {
      icon: "fa-handshake",
      title: "Acompanhamento",
      description: "Apoio jurídico e financeiro personalizado."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-emerald-500">
              <i className={`fa-solid ${feature.icon} text-2xl`}></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">{feature.title}</h3>
              <p className="text-slate-500 text-sm">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
