import React from 'react';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider">
          {property.tag}
        </div>
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors">
          <i className="fa-regular fa-heart"></i>
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
    </div>
  );
};

export default PropertyCard;
