import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import UserMessaging from './UserMessaging';

const UserDashboard = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const itemsPerPage = 12;

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notifications: true
  });

  useEffect(() => {
    if (user) {
      if (activeTab === 'favorites') {
        fetchFavorites();
      } else if (activeTab === 'messages') {
        fetchConversations();
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSupabaseHeaders = () => {
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        // Demo data
        setFavorites([
          { id: '1', property: { id: '1', title: 'Apartamento T3 Vista Mar', price: 285000, location: 'Braga, Centro', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', bedrooms: 3, bathrooms: 2, area: 120 } },
          { id: '2', property: { id: '2', title: 'Moradia T4 com Jardim', price: 425000, location: 'Braga, Gualtar', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', bedrooms: 4, bathrooms: 3, area: 200 } },
          { id: '3', property: { id: '5', title: 'Moradia T5 de Luxo', price: 750000, location: 'Braga, Bom Jesus', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', bedrooms: 5, bathrooms: 4, area: 350 } },
        ]);
        setLoading(false);
        return;
      }

      // First, get the user's favorites
      const favoritesResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${user.id}&order=created_at.desc`,
        { headers: getSupabaseHeaders() }
      );

      if (!favoritesResponse.ok) {
        console.error('Failed to fetch favorites');
        setFavorites([]);
        setLoading(false);
        return;
      }

      const favoritesData = await favoritesResponse.json();
      
      if (favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Get property IDs
      const propertyIds = favoritesData.map(f => f.property_id).filter(Boolean);
      
      if (propertyIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch properties details
      const propertiesResponse = await fetch(
        `${supabaseUrl}/rest/v1/properties?id=in.(${propertyIds.join(',')})`,
        { headers: getSupabaseHeaders() }
      );

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        
        // Combine favorites with property data
        const combinedData = favoritesData.map(fav => {
          const prop = propertiesData.find(p => p.id === fav.property_id);
          return {
            id: fav.id,
            property: prop ? {
              id: prop.id,
              title: prop.title,
              price: parseFloat(prop.price),
              location: prop.location,
              image: prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              area: prop.area_sqm
            } : null
          };
        }).filter(f => f.property !== null);

        setFavorites(combinedData);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
    setLoading(false);
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        // Demo data
        setConversations([
          { 
            id: '1', 
            property_title: 'Apartamento T3 Vista Mar', 
            property_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
            last_message: 'Olá! Gostaria de agendar uma visita.',
            last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            unread_count: 2
          },
          { 
            id: '2', 
            property_title: 'Moradia T4 com Jardim', 
            property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
            last_message: 'O imóvel ainda está disponível?',
            last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            unread_count: 0
          },
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/conversations?user_id=eq.${user.id}&order=last_message_at.desc`,
        { headers: getSupabaseHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        // Demo messages
        setMessages([
          { id: '1', message: 'Olá! Gostaria de agendar uma visita ao apartamento.', sender_type: 'user', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
          { id: '2', message: 'Bom dia! Claro, temos disponibilidade para sábado às 10h ou 15h. Qual prefere?', sender_type: 'admin', sender_name: 'TRATA', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
          { id: '3', message: 'Sábado às 15h seria perfeito!', sender_type: 'user', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
          { id: '4', message: 'Perfeito! Fica agendado. O endereço é Rua das Flores, 123, Braga. Até sábado!', sender_type: 'admin', sender_name: 'TRATA', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        ]);
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_messages?conversation_id=eq.${conversationId}&order=created_at.asc`,
        { headers: getSupabaseHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    // Mark as read
    if (conversation.unread_count > 0) {
      setConversations(prev => prev.map(c => 
        c.id === conversation.id ? { ...c, unread_count: 0 } : c
      ));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    const tempMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender_type: 'user',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            conversation_id: selectedConversation.id,
            sender_id: user.id,
            sender_name: user.name,
            sender_type: 'user',
            message: newMessage
          })
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  const removeFavorite = async (favoriteId) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        await fetch(`${supabaseUrl}/rest/v1/user_favorites?id=eq.${favoriteId}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatFullTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  // Pagination
  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-user text-emerald-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Área de Cliente</h2>
          <p className="text-slate-600 mb-6">
            Faça login para aceder aos seus favoritos, mensagens e definições de conta.
          </p>
          <a 
            href="#home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img 
              src={user.picture} 
              alt={user.name}
              className="w-16 h-16 rounded-full border-4 border-emerald-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Olá, {user.name?.split(' ')[0]}!</h1>
              <p className="text-slate-600">Bem-vindo à sua área de cliente</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { id: 'favorites', label: 'Favoritos', icon: 'fa-heart', count: favorites.length },
              { id: 'messages', label: 'Mensagens', icon: 'fa-comments', count: totalUnread },
              { id: 'settings', label: 'Definições', icon: 'fa-gear', count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    tab.id === 'messages' && tab.count > 0
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-regular fa-heart text-gray-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sem favoritos</h3>
                <p className="text-slate-600 mb-6">
                  Ainda não adicionou nenhum imóvel aos favoritos.
                </p>
                <a 
                  href="#imoveis"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                >
                  <i className="fa-solid fa-search"></i>
                  Explorar Imóveis
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedFavorites.map(fav => (
                    <div key={fav.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                      <div className="relative">
                        <a href={`#imovel/${fav.property?.id || fav.id}`}>
                          <img 
                            src={fav.property?.image || fav.property?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
                            alt={fav.property?.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                        >
                          <i className="fa-solid fa-heart"></i>
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-500 mb-1">
                          <i className="fa-solid fa-location-dot mr-1"></i>
                          {fav.property?.location}
                        </p>
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                          {fav.property?.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          {fav.property?.bedrooms > 0 && (
                            <span><i className="fa-solid fa-bed mr-1"></i>{fav.property.bedrooms}</span>
                          )}
                          {fav.property?.bathrooms > 0 && (
                            <span><i className="fa-solid fa-bath mr-1"></i>{fav.property.bathrooms}</span>
                          )}
                          {fav.property?.area && (
                            <span><i className="fa-solid fa-ruler-combined mr-1"></i>{fav.property.area}m²</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-emerald-600">
                            {formatPrice(fav.property?.price)}
                          </p>
                          <a 
                            href={`#imovel/${fav.property?.id || fav.id}`}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Ver <i className="fa-solid fa-arrow-right ml-1"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === i + 1
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <UserMessaging embedded={true} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4"
                />
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-emerald-100">{user.email}</p>
              </div>

              {/* Profile Form */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+351 912 345 678"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-900">Notificações por Email</h4>
                    <p className="text-sm text-slate-500">Receber alertas de novos imóveis</p>
                  </div>
                  <button
                    onClick={() => setProfileData({ ...profileData, notifications: !profileData.notifications })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      profileData.notifications ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      profileData.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                <button className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors">
                  Guardar Alterações
                </button>

                <hr className="border-gray-200" />

                <div className="space-y-3">
                  <button className="w-full py-3 text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-key"></i>
                    Alterar Palavra-passe
                  </button>
                  <button className="w-full py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-trash"></i>
                    Eliminar Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
