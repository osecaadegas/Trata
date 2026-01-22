import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PropertyCard = ({ property }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
  }, [user, property.id]);

  const getSupabaseHeaders = () => {
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Try to get auth token from localStorage
    let accessToken = supabaseKey;
    const trataAuth = localStorage.getItem('trata-auth');
    if (trataAuth) {
      try {
        const parsed = JSON.parse(trataAuth);
        if (parsed?.access_token) {
          accessToken = parsed.access_token;
        }
      } catch (e) {}
    }
    
    return {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  const checkIfFavorite = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project') || !user) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${property.id}`,
        { headers: getSupabaseHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.length > 0);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Show login prompt or redirect
      alert('Faça login para guardar favoritos');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setIsFavorite(!isFavorite);
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&property_id=eq.${property.id}`,
          { method: 'DELETE', headers: getSupabaseHeaders() }
        );
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch(
          `${supabaseUrl}/rest/v1/user_favorites`,
          {
            method: 'POST',
            headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
            body: JSON.stringify({ user_id: user.id, property_id: property.id })
          }
        );
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setLoading(false);
  };

  return (
    <a 
      href={`#imovel/${property.id}`}
      className="block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider">
          {property.tag}
        </div>
        <button 
          onClick={toggleFavorite}
          disabled={loading}
          className={`absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
            isFavorite ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900 leading-tight">{property.title}</h3>
          <span className="text-emerald-600 font-bold whitespace-nowrap ml-2">{property.price}</span>
        </div>
        <p className="text-slate-500 text-sm mb-6 flex items-center">
          <i className="fa-solid fa-location-dot mr-2"></i> {property.location}
        </p>
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-4">
            <span className="text-sm text-slate-600 flex items-center">
              <i className="fa-solid fa-bed mr-2 text-emerald-500"></i> {property.beds}
            </span>
            <span className="text-sm text-slate-600 flex items-center">
              <i className="fa-solid fa-bath mr-2 text-emerald-500"></i> {property.baths}
            </span>
            <span className="text-sm text-slate-600 flex items-center">
              <i className="fa-solid fa-maximize mr-2 text-emerald-500"></i> {property.sqm} m²
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default PropertyCard;
