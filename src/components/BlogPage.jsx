import React from 'react';
import blogArticles from './blogArticles';

const BlogPage = () => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgt MnYtMnptLTQgOHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            <i className="fa-solid fa-book-open"></i>
            Guias Imobiliários
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Guias e <span className="text-emerald-400">Artigos</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Informação útil para tomar as melhores decisões no mercado imobiliário português.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogArticles.map((article) => (
            <a
              key={article.slug}
              href={`/guias/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 flex flex-col"
            >
              <div className="relative overflow-hidden aspect-[16/10]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <i className="fa-regular fa-calendar"></i>
                    {formatDate(article.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fa-regular fa-clock"></i>
                    {article.readTime}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  Ler artigo
                  <i className="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-10 border border-emerald-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Precisa de ajuda personalizada?</h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            A nossa equipa está disponível para o orientar em todas as etapas da compra ou venda do seu imóvel.
          </p>
          <a
            href="/contactos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <i className="fa-solid fa-envelope"></i>
            Fale Connosco
          </a>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
