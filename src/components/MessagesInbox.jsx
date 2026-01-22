import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const MessagesInbox = () => {
  const { user, userRole, isAdmin, isSeller } = useAuth();
  const [activeView, setActiveView] = useState('contacts'); // 'contacts' or 'conversations'
  
  // Contact form messages state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationFilter, setConversationFilter] = useState('all');
  const [conversationSearch, setConversationSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchConversations();
    fetchOnlineUsers();
    
    // Poll for conversation updates
    const interval = setInterval(() => {
      if (activeView === 'conversations') {
        fetchConversations();
        fetchOnlineUsers();
        if (selectedConversation) {
          fetchChatMessages(selectedConversation.id, true);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeView, selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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

  // ========== CONTACT FORM MESSAGES ==========
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/messages?select=*&order=created_at.desc`,
          { headers: getSupabaseHeaders() }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
    setLoading(false);
  };

  // ========== CONVERSATIONS (Chat) ==========
  const fetchConversations = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured');
      setConversations([]);
      setConversationsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/conversations?order=last_message_at.desc`,
        { headers: getSupabaseHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setConversationsLoading(false);
  };

  const fetchOnlineUsers = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      setOnlineUsers([]);
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

  const fetchChatMessages = async (conversationId, silent = false) => {
    if (!silent) setConversationsLoading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      setChatMessages([]);
      if (!silent) setConversationsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_messages?conversation_id=eq.${conversationId}&order=created_at.asc`,
        { headers: getSupabaseHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
        markChatMessagesRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
    if (!silent) setConversationsLoading(false);
  };

  const markChatMessagesRead = async (conversationId) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/mark_messages_read`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ p_conversation_id: conversationId, p_reader_type: 'agent' })
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
    fetchChatMessages(conversation.id);
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    const tempMessage = {
      id: `temp-${Date.now()}`, conversation_id: selectedConversation.id,
      sender_id: user?.id, sender_name: user?.name || 'TRATA', sender_type: 'agent',
      message: newChatMessage.trim(), created_at: new Date().toISOString(), is_read: false
    };
    
    setChatMessages(prev => [...prev, tempMessage]);
    const messageText = newChatMessage;
    setNewChatMessage('');

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
          sender_id: user?.id, sender_name: user?.name || 'TRATA',
          sender_avatar: user?.picture, sender_type: 'agent', message: messageText
        })
      });
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  const updateConversationStatus = async (conversationId, status) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status } : c));
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
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, priority } : c));
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

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  // ========== ORIGINAL CONTACT MESSAGES FUNCTIONS ==========

  const updateMessageStatus = async (messageId, newStatus) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus, read_at: newStatus === 'read' ? new Date().toISOString() : msg.read_at }
        : msg
    ));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(prev => ({ ...prev, status: newStatus }));
    }
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
          method: 'PATCH',
          headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: newStatus })
        });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const updateMessageNotes = async (messageId, newNotes) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, notes: newNotes } : msg
    ));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(prev => ({ ...prev, notes: newNotes }));
    }
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
          method: 'PATCH',
          headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
          body: JSON.stringify({ notes: newNotes })
        });
      }
    } catch (error) {
      console.error('Error updating message notes:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        const response = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });

        if (response.ok) {
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
          }
          setShowDeleteConfirm(false);
          setMessageToDelete(null);
        } else {
          console.error('Failed to delete message');
          alert('Erro ao eliminar mensagem');
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erro ao eliminar mensagem');
    }
  };

  const confirmDelete = (message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setNotes(message.notes || '');
    
    // Mark as read if unread
    if (message.status === 'unread') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const getSubjectLabel = (subject) => {
    const subjects = {
      'comprar': 'Comprar Imóvel',
      'vender': 'Vender Imóvel',
      'arrendar': 'Arrendar Imóvel',
      'avaliacao': 'Avaliação de Imóvel',
      'parceria': 'Proposta de Parceria',
      'outro': 'Outro Assunto',
      'interesse': 'Interesse em Imóvel'
    };
    return subjects[subject] || subject || 'Contacto Geral';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'unread': { bg: 'bg-red-100', text: 'text-red-700', label: 'Não lida' },
      'read': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lida' },
      'replied': { bg: 'bg-green-100', text: 'text-green-700', label: 'Respondida' },
      'archived': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Arquivada' }
    };
    const badge = badges[status] || badges['unread'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias`;
    } else {
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesFilter = filter === 'all' || msg.status === filter;
    const matchesSearch = searchTerm === '' || 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.property_title && msg.property_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const conversationUnreadCount = conversations.reduce((sum, c) => sum + (c.agent_unread_count || 0), 0);
  const totalUnread = unreadCount + conversationUnreadCount;

  // Filtered conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = conversationFilter === 'all' || 
      (conversationFilter === 'unread' && conv.agent_unread_count > 0) ||
      (conversationFilter === 'active' && conv.status === 'active') ||
      (conversationFilter === 'resolved' && conv.status === 'resolved') ||
      (conversationFilter === 'urgent' && conv.priority === 'urgent');
    
    const matchesSearch = conversationSearch === '' || 
      conv.user_name?.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      conv.user_email?.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      conv.property_title?.toLowerCase().includes(conversationSearch.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Access check - allow admin, configurator, and vendedor roles
  if (!isAdmin && !isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-lock text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">
            Não tem permissões para aceder a esta área.
          </p>
          <a 
            href="#home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
          >
            <i className="fa-solid fa-home"></i>
            Voltar ao Início
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <i className="fa-solid fa-headset text-emerald-500"></i>
                Central de Mensagens
                {totalUnread > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    {totalUnread} nova{totalUnread !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-slate-600 mt-1">
                Gerir contactos e conversas com clientes
              </p>
            </div>
            <a
              href="#property-management"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Voltar à Gestão
            </a>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 mt-6 bg-gray-100 p-1.5 rounded-xl w-fit">
            <button
              onClick={() => { setActiveView('contacts'); setSelectedConversation(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeView === 'contacts'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-envelope"></i>
              <span>Contactos</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveView('conversations'); setSelectedMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeView === 'conversations'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-comments"></i>
              <span>Conversas</span>
              {conversationUnreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {conversationUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {activeView === 'contacts' ? (
              <>
                {[
                  { label: 'Total', value: messages.length, icon: 'fa-inbox', color: 'bg-slate-500' },
                  { label: 'Não Lidas', value: messages.filter(m => m.status === 'unread').length, icon: 'fa-envelope', color: 'bg-red-500' },
                  { label: 'Respondidas', value: messages.filter(m => m.status === 'replied').length, icon: 'fa-reply', color: 'bg-green-500' },
                  { label: 'Esta Semana', value: messages.filter(m => {
                    const msgDate = new Date(m.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return msgDate > weekAgo;
                  }).length, icon: 'fa-calendar-week', color: 'bg-blue-500' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <i className={`fa-solid ${stat.icon} text-white`}></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'Total', value: conversations.length, icon: 'fa-comments', color: 'bg-slate-500' },
                  { label: 'Por Responder', value: conversations.filter(c => c.agent_unread_count > 0).length, icon: 'fa-clock', color: 'bg-red-500' },
                  { label: 'Urgentes', value: conversations.filter(c => c.priority === 'urgent').length, icon: 'fa-exclamation', color: 'bg-orange-500' },
                  { label: 'Online Agora', value: onlineUsers.length, icon: 'fa-circle', color: 'bg-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <i className={`fa-solid ${stat.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ========== CONTACTS VIEW ========== */}
        {activeView === 'contacts' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Pesquisar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { value: 'all', label: 'Todas', icon: 'fa-inbox' },
                  { value: 'unread', label: 'Não lidas', icon: 'fa-envelope' },
                  { value: 'read', label: 'Lidas', icon: 'fa-envelope-open' },
                  { value: 'replied', label: 'Respondidas', icon: 'fa-reply' },
                  { value: 'archived', label: 'Arquivadas', icon: 'fa-archive' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      filter === f.value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <i className={`fa-solid ${f.icon} text-xs`}></i>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-350px)] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fa-solid fa-inbox text-4xl mb-3 opacity-50"></i>
                  <p>Nenhuma mensagem encontrada</p>
                </div>
              ) : (
                filteredMessages.map(message => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                    } ${message.status === 'unread' ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-medium text-slate-900 truncate ${message.status === 'unread' ? 'font-bold' : ''}`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600 mb-1">
                      {getSubjectLabel(message.subject)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {message.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(message.status)}
                      {message.property_title && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs truncate max-w-[120px]">
                          <i className="fa-solid fa-building mr-1"></i>
                          {message.property_title}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedMessage.name}</h2>
                      <p className="text-emerald-600 font-medium">
                        {getSubjectLabel(selectedMessage.subject)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedMessage.status)}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <i className="fa-solid fa-envelope"></i>
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.phone && (
                      <a 
                        href={`tel:${selectedMessage.phone}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <i className="fa-solid fa-phone"></i>
                        {selectedMessage.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-2 text-gray-400">
                      <i className="fa-solid fa-clock"></i>
                      {new Date(selectedMessage.created_at).toLocaleString('pt-PT')}
                    </span>
                  </div>

                  {/* Property Link */}
                  {selectedMessage.property_title && (
                    <a 
                      href={`#imovel/${selectedMessage.property_id}`}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <i className="fa-solid fa-building"></i>
                      {selectedMessage.property_title}
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Mensagem
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Notes Section */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <i className="fa-solid fa-sticky-note mr-2"></i>
                    Notas Internas
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => updateMessageNotes(selectedMessage.id, notes)}
                    placeholder="Adicionar notas sobre este contacto..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="p-6 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${getSubjectLabel(selectedMessage.subject)} - TRATA Imobiliária`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                  >
                    <i className="fa-solid fa-reply"></i>
                    Responder por Email
                  </a>
                  {selectedMessage.phone && (
                    <>
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <i className="fa-solid fa-phone"></i>
                        Ligar
                      </a>
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        WhatsApp
                      </a>
                    </>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <i className="fa-solid fa-archive"></i>
                      Arquivar
                    </button>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <i className="fa-solid fa-inbox"></i>
                      Restaurar
                    </button>
                  )}
                  
                  {/* Delete button - only for admins */}
                  {isAdmin && (
                    <button
                      onClick={() => confirmDelete(selectedMessage)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <i className="fa-solid fa-envelope-open text-6xl mb-4 opacity-50"></i>
                  <p className="text-lg">Selecione uma mensagem para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ========== CONVERSATIONS VIEW ========== */}
        {activeView === 'conversations' && (
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
                      value={conversationSearch}
                      onChange={(e) => setConversationSearch(e.target.value)}
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
                        onClick={() => setConversationFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          conversationFilter === f.id
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
                  {conversationsLoading ? (
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
                                  {formatDate(conv.last_message_at)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                <span className={`text-xs ${online ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {online ? 'Online' : 'Offline'}
                                </span>
                                <span className="text-xs text-slate-300">•</span>
                                <span className="text-xs text-slate-500 truncate">{conv.user_email}</span>
                              </div>
                              
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
              <div className={`lg:col-span-8 flex flex-col h-full overflow-hidden ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
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
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isUserOnline(selectedConversation.user_id) ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            <span className={`text-xs ${isUserOnline(selectedConversation.user_id) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isUserOnline(selectedConversation.user_id) ? 'Online' : 'Offline'}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500 truncate">{selectedConversation.user_email}</span>
                          </div>
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
                            href={`#imovel/${selectedConversation.property_id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {chatMessages.map((msg) => {
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
                                {formatChatTime(msg.created_at)}
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
                            value={newChatMessage}
                            onChange={(e) => setNewChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendChatMessage();
                              }
                            }}
                            placeholder="Escreva uma resposta..."
                            rows={1}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            style={{ minHeight: '46px', maxHeight: '120px' }}
                          />
                        </div>
                        
                        <button
                          onClick={sendChatMessage}
                          disabled={!newChatMessage.trim() || sendingMessage}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                            newChatMessage.trim()
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && messageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-trash text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Eliminar Mensagem?</h3>
              <p className="text-slate-600 mb-6">
                Tem a certeza que deseja eliminar a mensagem de <strong>{messageToDelete.name}</strong>? Esta ação não pode ser revertida.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMessageToDelete(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMessage(messageToDelete.id)}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesInbox;
