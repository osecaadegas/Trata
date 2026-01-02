import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { supabase } from '../lib/supabase';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('Fetching with direct API call...');
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/properties?status=eq.available&order=created_at.desc&limit=6`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      if (!data || data.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const transformedProperties = data.map(prop => ({
        id: prop.id,
        title: prop.title,
        location: prop.location,
        price: prop.price_type === 'sale' 
          ? `${Number(prop.price).toLocaleString('pt-PT')} €` 
          : `${Number(prop.price).toLocaleString('pt-PT')} € /mês`,
        beds: prop.bedrooms,
        baths: prop.bathrooms,
        sqm: prop.area_sqm,
        image: prop.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
        tag: prop.price_type === 'sale' ? 'Venda' : 'Arrendamento'
      }));

      setProperties(transformedProperties);
    } catch (err) {
      console.error('Exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <p className="text-gray-600 text-lg mb-2">Erro ao carregar imóveis</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchProperties}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <i className="fa-solid fa-home text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">Nenhum imóvel disponível no momento.</p>
          <p className="text-gray-400 text-sm mt-2">Novos imóveis serão adicionados em breve!</p>
        </div>
      )}
    </section>
  );
};

export default PropertyListings;
