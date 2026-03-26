import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminConversations = () => {
  const { user, userRole, isAdmin, isSeller } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && (isAdmin || isSeller)) {
      fetchConversations();
      fetchOnlineUsers();
      
      // Poll for updates
      const interval = setInterval(() => {
        fetchConversations();
        fetchOnlineUsers();
        if (selectedConversation) {
          fetchMessages(selectedConversation.id, true);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, isAdmin, isSeller]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSupabaseHeaders = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Get auth token from Supabase's default storage
    let accessToken = supabaseKey;
    const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
    const storageKey = `sb-${projectId}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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

  const fetchConversations = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setError('Base de dados não configurada. Configure as variáveis de ambiente do Supabase.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `${supabaseUrl}/rest/v1/conversations?order=last_message_at.desc`,
        { headers: getSupabaseHeaders() }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Erro ao carregar conversas.');
    }
    setLoading(false);
  };

  const fetchOnlineUsers = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/user_presence?is_online=eq.true&select=user_id`,
        { headers: getSupabaseHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.map(p => p.user_id));
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    if (!silent) setLoading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      if (!silent) setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_messages?conversation_id=eq.${conversationId}&order=created_at.asc`,
        { headers: getSupabaseHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
        markMessagesRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    if (!silent) setLoading(false);
  };

  const markMessagesRead = async (conversationId) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/mark_messages_read`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          p_conversation_id: conversationId,
          p_reader_type: 'agent'
        })
      });
      
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, agent_unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking messages read:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      sender_name: user.name || 'TRATA',
      sender_type: 'agent',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const messageText = newMessage;
    setNewMessage('');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setSendingMessage(false);
      return;
    }

    try {
      await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          sender_name: user.name || 'TRATA',
          sender_avatar: user.picture,
          sender_type: 'agent',
          message: messageText
        })
      });
      
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  const updateConversationStatus = async (conversationId, status) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, status } : c
    ));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

    try {
      await fetch(`${supabaseUrl}/rest/v1/conversations?id=eq.${conversationId}`, {
        method: 'PATCH',
        headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateConversationPriority = async (conversationId, priority) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, priority } : c
    ));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

    try {
      await fetch(`${supabaseUrl}/rest/v1/conversations?id=eq.${conversationId}`, {
        method: 'PATCH',
        headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({ priority })
      });
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatFullTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Offline';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins < 5) return 'Online';
    if (diffMins < 60) return `Visto há ${diffMins}min`;
    if (diffMins < 1440) return `Visto há ${Math.floor(diffMins / 60)}h`;
    return `Visto há ${Math.floor(diffMins / 1440)}d`;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alta' },
      normal: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normal' },
      low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Baixa' }
    };
    return badges[priority] || badges.normal;
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.agent_unread_count || 0), 0);

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && conv.agent_unread_count > 0) ||
      (filter === 'active' && conv.status === 'active') ||
      (filter === 'resolved' && conv.status === 'resolved') ||
      (filter === 'urgent' && conv.priority === 'urgent');
    
    const matchesSearch = searchTerm === '' || 
      conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.property_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Access check
  if (!isAdmin && !isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-lock text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600">Não tem permissões para aceder a esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <i className="fa-solid fa-headset text-emerald-500"></i>
                Central de Conversas
                {totalUnread > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    {totalUnread} nova{totalUnread !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-slate-600 mt-1">Gerir conversas com clientes</p>
            </div>
            <a
              href="/property-management"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Voltar à Gestão
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total', value: conversations.length, icon: 'fa-comments', color: 'bg-slate-500' },
              { label: 'Por Responder', value: conversations.filter(c => c.agent_unread_count > 0).length, icon: 'fa-clock', color: 'bg-red-500' },
              { label: 'Urgentes', value: conversations.filter(c => c.priority === 'urgent').length, icon: 'fa-exclamation', color: 'bg-orange-500' },
              { label: 'Online Agora', value: onlineUsers.length, icon: 'fa-circle', color: 'bg-emerald-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <i className={`fa-solid ${stat.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            
            {/* Conversations List */}
            <div className={`lg:col-span-4 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Pesquisar cliente ou imóvel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'unread', label: 'Por Ler' },
                    { id: 'urgent', label: 'Urgentes' },
                    { id: 'resolved', label: 'Resolvidas' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === f.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <i className="fa-solid fa-exclamation-triangle text-4xl mb-3 text-amber-500"></i>
                    <p className="text-slate-700 font-medium mb-2">Erro ao carregar</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button
                      onClick={fetchConversations}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                    >
                      <i className="fa-solid fa-refresh mr-2"></i>
                      Tentar novamente
                    </button>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <i className="fa-regular fa-comments text-4xl mb-3 text-gray-300"></i>
                    <p>Sem conversas</p>
                  </div>
                ) : (
                  filteredConversations.map(conv => {
                    const priority = getPriorityBadge(conv.priority);
                    const online = isUserOnline(conv.user_id);
                    
                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                          selectedConversation?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Avatar with online indicator */}
                          <div className="relative flex-shrink-0">
                            <img 
                              src={conv.user_avatar || `https://ui-avatars.com/api/?name=${conv.user_name}`}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              online ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}></span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-sm truncate ${conv.agent_unread_count > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {conv.user_name}
                              </h4>
                              <span className="text-xs text-slate-400">
                                {formatMessageTime(conv.last_message_at)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-500 truncate">{conv.user_email}</p>
                            
                            <div className="flex items-center gap-2 mt-1">
                              {conv.property_title && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded truncate max-w-[120px]">
                                  {conv.property_title}
                                </span>
                              )}
                              {conv.priority !== 'normal' && (
                                <span className={`text-xs px-2 py-0.5 rounded ${priority.bg} ${priority.text}`}>
                                  {priority.label}
                                </span>
                              )}
                            </div>
                            
                            <p className={`text-sm truncate mt-1 ${conv.agent_unread_count > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                              {conv.last_message}
                            </p>
                          </div>
                          
                          {conv.agent_unread_count > 0 && (
                            <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {conv.agent_unread_count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-8 flex flex-col ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-gray-100 rounded-lg"
                      >
                        <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      
                      <div className="relative">
                        <img 
                          src={selectedConversation.user_avatar || `https://ui-avatars.com/api/?name=${selectedConversation.user_name}`}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isUserOnline(selectedConversation.user_id) ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {selectedConversation.user_name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {selectedConversation.user_email} • {getLastSeenText(selectedConversation.user_last_seen)}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedConversation.priority}
                          onChange={(e) => updateConversationPriority(selectedConversation.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="low">Baixa</option>
                          <option value="normal">Normal</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                        
                        <select
                          value={selectedConversation.status}
                          onChange={(e) => updateConversationStatus(selectedConversation.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="active">Ativa</option>
                          <option value="resolved">Resolvida</option>
                          <option value="archived">Arquivada</option>
                        </select>
                        
                        <a
                          href={`mailto:${selectedConversation.user_email}`}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Enviar Email"
                        >
                          <i className="fa-solid fa-envelope"></i>
                        </a>
                      </div>
                    </div>
                    
                    {/* Property Info */}
                    {selectedConversation.property_title && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-3">
                        <img 
                          src={selectedConversation.property_image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-600">Imóvel em discussão</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{selectedConversation.property_title}</p>
                        </div>
                        <a
                          href={`/imovel/${selectedConversation.property_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => {
                      const isAgent = msg.sender_type === 'agent';
                      
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 flex-shrink-0">
                            {isAgent ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">T</span>
                              </div>
                            ) : (
                              <img 
                                src={selectedConversation.user_avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                          </div>
                          
                          <div className="max-w-[75%]">
                            <div className={`px-4 py-3 rounded-2xl ${
                              isAgent
                                ? 'bg-emerald-500 text-white rounded-br-md'
                                : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-gray-100'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <p className={`text-xs text-slate-400 mt-1 ${isAgent ? 'text-right' : ''}`}>
                              {formatFullTime(msg.created_at)}
                              {!msg.is_read && !isAgent && <span className="ml-2 text-red-500">• Novo</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder="Escreva uma resposta..."
                          rows={1}
                          className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          style={{ minHeight: '46px', maxHeight: '120px' }}
                        />
                      </div>
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                          newMessage.trim()
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-comments text-gray-400 text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Selecione uma conversa</h3>
                    <p className="text-slate-500 text-sm mt-1">Escolha uma conversa da lista para responder</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConversations;
