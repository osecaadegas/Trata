import React, { useEffect, useState } from 'react';
import blogArticles from './blogArticles';
import { updateSeoMeta } from '../lib/seo';

const BlogArticlePage = ({ slug }) => {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const found = blogArticles.find((a) => a.slug === slug);
    setArticle(found || null);
    if (found) {
      updateSeoMeta({
        title: `${found.title} | TRATA Imobiliária`,
        description: found.description,
        keywords: `${found.category.toLowerCase()}, imobiliário portugal, comprar casa`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": found.title,
          "description": found.description,
          "image": found.image,
          "datePublished": found.date,
          "author": { "@type": "Organization", "name": "TRATA Imobiliária" },
          "publisher": { "@type": "Organization", "name": "TRATA Imobiliária", "logo": { "@type": "ImageObject", "url": "https://www.trataimobiliaria.pt/trata.png" } }
        }
      });
    }
  }, [slug]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-file-circle-xmark text-5xl text-slate-300 mb-4"></i>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Artigo não encontrado</h1>
          <p className="text-slate-500 mb-6">O artigo que procura não existe ou foi removido.</p>
          <a href="/guias" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
            Voltar aos Guias
          </a>
        </div>
      </div>
    );
  }

  const otherArticles = blogArticles.filter((a) => a.slug !== slug);

  const renderBlock = (block, i) => {
    switch (block.type) {
      case 'heading':
        return (
          <h2 key={i} className="text-xl md:text-2xl font-bold text-slate-900 mt-10 mb-4 first:mt-0">
            {block.text}
          </h2>
        );
      case 'paragraph':
        return (
          <p key={i} className="text-slate-600 leading-relaxed mb-4">
            {block.text}
          </p>
        );
      case 'tip':
        return (
          <div key={i} className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-4 my-6">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-lightbulb text-emerald-500 mt-0.5"></i>
              <p className="text-sm text-emerald-800 leading-relaxed">{block.text}</p>
            </div>
          </div>
        );
      case 'list':
        return (
          <ul key={i} className="space-y-2 my-4 ml-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-3 text-slate-600">
                <i className="fa-solid fa-check text-emerald-500 mt-1.5 text-xs"></i>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <a href="/guias" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-4">
              <i className="fa-solid fa-arrow-left text-xs"></i>
              Voltar aos Guias
            </a>
            <span className="block">
              <span className="inline-flex px-3 py-1 bg-emerald-500/90 text-xs font-semibold text-white rounded-full mb-3">
                {article.category}
              </span>
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/60 mt-4">
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-calendar"></i>
                {formatDate(article.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-clock"></i>
                {article.readTime} de leitura
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 lg:p-12">
          {article.content.map((block, i) => renderBlock(block, i))}
        </div>

        {/* Share + CTA */}
        <div className="mt-10 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Gostou deste artigo?</h3>
          <p className="text-slate-600 mb-6">Entre em contacto connosco para saber como o podemos ajudar.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <i className="fa-solid fa-envelope"></i>
              Contactar
            </a>
            <a
              href="/imoveis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <i className="fa-solid fa-building"></i>
              Ver Imóveis
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {otherArticles.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Outros Artigos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherArticles.map((other) => (
                <a
                  key={other.slug}
                  href={`/guias/${other.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 flex flex-col"
                >
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <img
                      src={other.image}
                      alt={other.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-emerald-600 mb-1 block">{other.category}</span>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {other.title}
                    </h4>
                    <span className="text-xs text-slate-400 mt-2 block">{other.readTime} de leitura</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogArticlePage;
