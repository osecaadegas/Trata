import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyListings = () => {
  const properties = [
    {
      id: 1,
      title: "Apartamento T2 Moderno",
      location: "Parque das Nações, Lisboa",
      price: "450.000 €",
      beds: 2,
      baths: 2,
      sqm: 110,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Venda"
    },
    {
      id: 2,
      title: "Moradia Minimalista V4",
      location: "Cascais, Portugal",
      price: "1.250.000 €",
      beds: 4,
      baths: 3,
      sqm: 280,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Venda"
    },
    {
      id: 3,
      title: "Loft Industrial",
      location: "Marvila, Lisboa",
      price: "1.800 € /mês",
      beds: 1,
      baths: 1,
      sqm: 85,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Arrendamento"
    },
    {
      id: 4,
      title: "Penthouse com Vista Rio",
      location: "Algés, Oeiras",
      price: "890.000 €",
      beds: 3,
      baths: 2,
      sqm: 165,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Venda"
    },
    {
      id: 5,
      title: "Moradia Tradicional Recuperada",
      location: "Sintra, Portugal",
      price: "620.000 €",
      beds: 3,
      baths: 2,
      sqm: 190,
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Venda"
    },
    {
      id: 6,
      title: "Apartamento T1 Conforto",
      location: "Arroios, Lisboa",
      price: "1.200 € /mês",
      beds: 1,
      baths: 1,
      sqm: 60,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Arrendamento"
    }
  ];

  return (
    <section id="imoveis" className="py-20 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Imóveis em Destaque</h2>
          <p className="text-slate-500">As melhores oportunidades selecionadas para si.</p>
        </div>
        <button className="text-emerald-600 font-bold hover:underline flex items-center">
          Ver todos <i className="fa-solid fa-arrow-right ml-2 text-sm"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default PropertyListings;
