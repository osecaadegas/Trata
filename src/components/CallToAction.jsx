import React from 'react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-slate-900 text-white rounded-[3rem] mx-4 mb-20 overflow-hidden relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl font-bold mb-6">Quer vender o seu imóvel?</h2>
        <p className="text-slate-400 text-lg mb-8">
          Nós tratamos de toda a burocracia e marketing para que não se tenha de preocupar com nada.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="https://wa.me/351934101523?text=Olá!%20Gostaria%20de%20falar%20com%20um%20consultor."
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all text-center"
          >
            Falar com Consultor
          </a>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mb-24"></div>
    </section>
  );
};

export default CallToAction;
