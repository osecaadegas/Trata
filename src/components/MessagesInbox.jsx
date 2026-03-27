import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const MessagesInbox = () => {
  const { user, userRole, isAdmin, isSeller } = useAuth();

  // View state
  const [activeView, setActiveView] = useState('inquiries');

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');

  // Contact messages state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [notes, setNotes] = useState('');

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationFilter, setConversationFilter] = useState('all');
  const [conversationSearch, setConversationSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });

  // Staff messaging state
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [newConvSubject, setNewConvSubject] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  const messagesEndRef = useRef(null);

  // ==================== HELPERS ====================

  const getSupabaseHeaders = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let accessToken = supabaseKey;

    const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
    const stored = localStorage.getItem(`sb-${projectId}-auth-token`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.access_token) accessToken = parsed.access_token;
      } catch (e) {}
    }

    return {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('your-project');

  const apiFetch = async (path, options = {}) => {
    if (!isConfigured) return null;
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: { ...getSupabaseHeaders(), ...(options.headers || {}) }
    });
    return response;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatChatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'unread': { bg: 'bg-red-100', text: 'text-red-700', label: 'Não lida' },
      'new': { bg: 'bg-red-100', text: 'text-red-700', label: 'Novo' },
      'read': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lida' },
      'contacted': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Contactado' },
      'replied': { bg: 'bg-green-100', text: 'text-green-700', label: 'Respondida' },
      'closed': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Fechado' },
      'archived': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Arquivada' }
    };
    const badge = badges[status] || badges['unread'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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

  const getSubjectLabel = (subject) => {
    const subjects = {
      'comprar': 'Comprar Imóvel', 'vender': 'Vender Imóvel',
      'arrendar': 'Arrendar Imóvel', 'avaliacao': 'Avaliação de Imóvel',
      'parceria': 'Proposta de Parceria', 'outro': 'Outro Assunto',
      'interesse': 'Interesse em Imóvel'
    };
    return subjects[subject] || subject || 'Contacto Geral';
  };

  const getRoleBadge = (role) => {
    const roles = {
      'admin': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
      'configurador': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Configurador' },
      'configurator': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Configurador' },
      'vendedor': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Vendedor' },
      'seller': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Vendedor' }
    };
    return roles[role] || { bg: 'bg-gray-100', text: 'text-gray-600', label: role };
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchInquiries();
    fetchMessages();
    fetchConversations();
    fetchOnlineUsers();

    const interval = setInterval(() => {
      if (activeView === 'inquiries') fetchInquiries();
      else if (activeView === 'contacts') fetchMessages();
      else if (activeView === 'conversations') {
        fetchConversations();
        fetchOnlineUsers();
        if (selectedConversation) fetchChatMessages(selectedConversation.id, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeView, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchInquiries = async () => {
    try {
      const res = await apiFetch('inquiries?select=*&order=created_at.desc');
      if (res?.ok) setInquiries(await res.json());
      else setInquiries([]);
    } catch { setInquiries([]); }
    setInquiriesLoading(false);
  };

  const fetchMessages = async () => {
    try {
      const res = await apiFetch('messages?select=*&order=created_at.desc');
      if (res?.ok) setMessages(await res.json());
      else setMessages([]);
    } catch { setMessages([]); }
    setMessagesLoading(false);
  };

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('conversations?order=last_message_at.desc');
      if (res?.ok) setConversations(await res.json());
    } catch {}
    setConversationsLoading(false);
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await apiFetch('user_presence?is_online=eq.true&select=user_id');
      if (res?.ok) {
        const data = await res.json();
        setOnlineUsers(data.map(p => p.user_id));
      }
    } catch {}
  };

  const fetchChatMessages = async (conversationId, silent = false) => {
    if (!silent) setConversationsLoading(true);
    try {
      const res = await apiFetch(`chat_messages?conversation_id=eq.${conversationId}&order=created_at.asc`);
      if (res?.ok) {
        setChatMessages(await res.json());
        markChatMessagesRead(conversationId);
      } else {
        setChatMessages([]);
      }
    } catch { setChatMessages([]); }
    if (!silent) setConversationsLoading(false);
  };

  const fetchStaffMembers = async () => {
    try {
      const res = await apiFetch('users?role=in.(admin,configurador,configurator,vendedor,seller)&select=id,name,email,avatar_url,role');
      if (res?.ok) {
        const data = await res.json();
        setStaffMembers(data.filter(s => s.id !== user?.id));
      }
    } catch {}
  };

  // ==================== CRUD OPERATIONS ====================

  // --- Inquiries ---
  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const body = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'contacted') body.first_response_at = new Date().toISOString();
      await apiFetch(`inquiries?id=eq.${inquiryId}`, {
        method: 'PATCH', body: JSON.stringify(body)
      });
      fetchInquiries();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch {}
  };

  const deleteInquiry = async (inquiryId) => {
    try {
      const res = await apiFetch(`inquiries?id=eq.${inquiryId}`, { method: 'DELETE' });
      if (res?.ok) {
        setInquiries(prev => prev.filter(i => i.id !== inquiryId));
        if (selectedInquiry?.id === inquiryId) setSelectedInquiry(null);
      }
    } catch {}
  };

  // --- Contact Messages ---
  const updateMessageStatus = async (messageId, newStatus) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: newStatus } : m));
    if (selectedMessage?.id === messageId) setSelectedMessage(prev => ({ ...prev, status: newStatus }));
    try {
      await apiFetch(`messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {}
  };

  const updateMessageNotes = async (messageId, newNotes) => {
    try {
      await apiFetch(`messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ notes: newNotes })
      });
    } catch {}
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await apiFetch(`messages?id=eq.${messageId}`, { method: 'DELETE' });
      if (res?.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) setSelectedMessage(null);
      } else {
        alert('Erro ao eliminar mensagem');
      }
    } catch {
      alert('Erro ao eliminar mensagem');
    }
  };

  // --- Conversations ---
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchChatMessages(conversation.id);
  };

  const updateConversationStatus = async (conversationId, status) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status } : c));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => ({ ...prev, status }));
    }
    try {
      await apiFetch(`conversations?id=eq.${conversationId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status })
      });
    } catch {}
  };

  const updateConversationPriority = async (conversationId, priority) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, priority } : c));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => ({ ...prev, priority }));
    }
    try {
      await apiFetch(`conversations?id=eq.${conversationId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ priority })
      });
    } catch {}
  };

  const deleteConversation = async (conversationId) => {
    try {
      const res = await apiFetch(`conversations?id=eq.${conversationId}`, { method: 'DELETE' });
      if (res?.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setChatMessages([]);
        }
      } else {
        alert('Erro ao eliminar conversa');
      }
    } catch {
      alert('Erro ao eliminar conversa');
    }
  };

  const markChatMessagesRead = async (conversationId) => {
    if (!isConfigured) return;
    try {
      await apiFetch('rpc/mark_messages_read', {
        method: 'POST',
        body: JSON.stringify({ p_conversation_id: conversationId, p_reader_type: 'agent' })
      });
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, agent_unread_count: 0 } : c
      ));
    } catch {}
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedConversation) return;
    setSendingMessage(true);

    const messageText = newChatMessage.trim();
    const tempMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user?.id,
      sender_name: user?.name || 'TRATA',
      sender_type: 'agent',
      message: messageText,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setChatMessages(prev => [...prev, tempMsg]);
    setNewChatMessage('');

    try {
      const res = await apiFetch('chat_messages', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          sender_name: user?.name || 'TRATA',
          sender_type: 'agent',
          message: messageText
        })
      });
      if (res?.ok) fetchConversations();
    } catch {}
    setSendingMessage(false);
  };

  // --- Staff Messaging ---
  const openNewConversation = () => {
    setShowNewConversation(true);
    setSelectedStaff(null);
    setNewConvSubject('');
    setStaffSearch('');
    fetchStaffMembers();
  };

  const createStaffConversation = async () => {
    if (!selectedStaff) return;
    try {
      const res = await apiFetch('conversations', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          user_id: selectedStaff.id,
          user_name: selectedStaff.name || selectedStaff.email,
          user_email: selectedStaff.email,
          user_avatar: selectedStaff.avatar_url,
          subject: newConvSubject || 'Mensagem Interna',
          status: 'active',
          priority: 'normal',
          last_message: 'Nova conversa interna',
          last_message_at: new Date().toISOString(),
          last_message_by: 'agent'
        })
      });

      if (res?.ok) {
        const data = await res.json();
        const newConv = Array.isArray(data) ? data[0] : data;
        setShowNewConversation(false);
        await fetchConversations();
        if (newConv) selectConversation(newConv);
      } else {
        alert('Erro ao criar conversa');
      }
    } catch {
      alert('Erro ao criar conversa');
    }
  };

  // ==================== DELETE HANDLER ====================

  const handleDelete = () => {
    if (!deleteModal.item) return;
    if (deleteModal.type === 'inquiry') deleteInquiry(deleteModal.item.id);
    else if (deleteModal.type === 'message') deleteMessage(deleteModal.item.id);
    else if (deleteModal.type === 'conversation') deleteConversation(deleteModal.item.id);
    setDeleteModal({ show: false, type: null, item: null });
  };

  const confirmDelete = (type, item) => {
    setDeleteModal({ show: true, type, item });
  };

  // ==================== SELECT HANDLERS ====================

  const handleSelectInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'new') updateInquiryStatus(inquiry.id, 'contacted');
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setNotes(message.notes || '');
    if (message.status === 'unread') updateMessageStatus(message.id, 'read');
  };

  // ==================== FILTERED DATA ====================

  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = inquiryFilter === 'all' || inq.status === inquiryFilter;
    const matchesSearch = !inquirySearch ||
      inq.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.property_title?.toLowerCase().includes(inquirySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredMessages = messages.filter(msg => {
    const matchesFilter = messageFilter === 'all' || msg.status === messageFilter;
    const matchesSearch = !messageSearch ||
      msg.name?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.email?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.message?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.property_title?.toLowerCase().includes(messageSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = conversationFilter === 'all' ||
      (conversationFilter === 'unread' && conv.agent_unread_count > 0) ||
      (conversationFilter === 'urgent' && conv.priority === 'urgent') ||
      (conversationFilter === 'resolved' && conv.status === 'resolved');
    const matchesSearch = !conversationSearch ||
      conv.user_name?.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      conv.user_email?.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      conv.property_title?.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(conversationSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const inquiryUnread = inquiries.filter(i => i.status === 'new').length;
  const messageUnread = messages.filter(m => m.status === 'unread').length;
  const conversationUnread = conversations.reduce((sum, c) => sum + (c.agent_unread_count || 0), 0);

  const filteredStaff = staffMembers.filter(s =>
    !staffSearch ||
    s.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  // ==================== ACCESS CHECK ====================

  if (!isAdmin && !isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-lock text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">Não tem permissões para aceder a esta área.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium">
            <i className="fa-solid fa-home"></i> Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              <i className="fa-solid fa-headset mr-3 text-emerald-500"></i>
              Central de Mensagens
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gerir pedidos, contactos e conversas</p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: 'Pedidos', count: inquiries.length, unread: inquiryUnread, icon: 'fa-clipboard-list', color: 'emerald' },
              { label: 'Contactos', count: messages.length, unread: messageUnread, icon: 'fa-envelope', color: 'blue' },
              { label: 'Conversas', count: conversations.length, unread: conversationUnread, icon: 'fa-comments', color: 'purple' }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <i className={`fa-solid ${stat.icon} text-${stat.color}-500 text-sm`}></i>
                  <span className="text-lg font-bold text-slate-900">{stat.count}</span>
                </div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                {stat.unread > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {stat.unread} novo{stat.unread > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { id: 'inquiries', label: 'Pedidos Imóveis', icon: 'fa-clipboard-list', badge: inquiryUnread },
            { id: 'contacts', label: 'Contactos', icon: 'fa-envelope', badge: messageUnread },
            { id: 'conversations', label: 'Conversas', icon: 'fa-comments', badge: conversationUnread }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  activeView === tab.id ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========== INQUIRIES VIEW ========== */}
        {activeView === 'inquiries' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Pesquisar pedidos..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Todos', icon: 'fa-list' },
                    { id: 'new', label: 'Novos', icon: 'fa-circle-exclamation' },
                    { id: 'contacted', label: 'Contactados', icon: 'fa-phone' },
                    { id: 'closed', label: 'Fechados', icon: 'fa-check-circle' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setInquiryFilter(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        inquiryFilter === f.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`fa-solid ${f.icon} text-xs`}></i>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[calc(100vh-350px)] overflow-y-auto">
                {inquiriesLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fa-solid fa-clipboard text-4xl mb-3 opacity-50"></i>
                    <p>Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  filteredInquiries.map(inquiry => (
                    <button
                      key={inquiry.id}
                      onClick={() => handleSelectInquiry(inquiry)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                      } ${inquiry.status === 'new' ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium text-slate-900 truncate ${inquiry.status === 'new' ? 'font-bold' : ''}`}>
                          {inquiry.name}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(inquiry.created_at)}</span>
                      </div>
                      {inquiry.property_title && (
                        <p className="text-sm text-emerald-600 mb-1 truncate">
                          <i className="fa-solid fa-building mr-1"></i>{inquiry.property_title}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 truncate">{inquiry.message}</p>
                      <div className="mt-2">{getStatusBadge(inquiry.status)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedInquiry ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedInquiry.name}</h2>
                        <p className="text-sm text-slate-500">{selectedInquiry.email}</p>
                      </div>
                      {getStatusBadge(selectedInquiry.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                        <i className="fa-solid fa-envelope"></i>{selectedInquiry.email}
                      </a>
                      {selectedInquiry.phone && (
                        <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                          <i className="fa-solid fa-phone"></i>{selectedInquiry.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-2 text-gray-400">
                        <i className="fa-solid fa-clock"></i>
                        {new Date(selectedInquiry.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>

                    {selectedInquiry.property_title && (
                      <a href={`/imovel/${selectedInquiry.property_id}`}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                        <i className="fa-solid fa-building"></i>
                        {selectedInquiry.property_title}
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                      </a>
                    )}
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Mensagem</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                  </div>

                  <div className="p-6 flex flex-wrap gap-3">
                    <a href={`mailto:${selectedInquiry.email}?subject=Re: Pedido de Informação - TRATA Imobiliária`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      onClick={() => updateInquiryStatus(selectedInquiry.id, 'contacted')}>
                      <i className="fa-solid fa-reply"></i>Responder
                    </a>
                    {selectedInquiry.phone && (
                      <>
                        <a href={`tel:${selectedInquiry.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          <i className="fa-solid fa-phone"></i>Ligar
                        </a>
                        <a href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          <i className="fa-brands fa-whatsapp"></i>WhatsApp
                        </a>
                      </>
                    )}

                    <div className="flex-1"></div>

                    {selectedInquiry.status !== 'closed' && (
                      <button onClick={() => updateInquiryStatus(selectedInquiry.id, 'closed')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        <i className="fa-solid fa-check-circle"></i>Fechar
                      </button>
                    )}

                    {isAdmin && (
                      <button onClick={() => confirmDelete('inquiry', selectedInquiry)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        <i className="fa-solid fa-trash"></i>Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <i className="fa-solid fa-clipboard-list text-6xl mb-4 opacity-50"></i>
                    <p className="text-lg">Selecione um pedido para ver os detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== CONTACTS VIEW ========== */}
        {activeView === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Pesquisar contactos..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Todos', icon: 'fa-list' },
                    { id: 'unread', label: 'Não lidos', icon: 'fa-circle-exclamation' },
                    { id: 'replied', label: 'Respondidos', icon: 'fa-reply' },
                    { id: 'archived', label: 'Arquivados', icon: 'fa-archive' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setMessageFilter(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        messageFilter === f.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`fa-solid ${f.icon} text-xs`}></i>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[calc(100vh-350px)] overflow-y-auto">
                {messagesLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  </div>
                ) : filteredMessages.length === 0 ? (
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
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(message.created_at)}</span>
                      </div>
                      <p className="text-sm text-emerald-600 mb-1">{getSubjectLabel(message.subject)}</p>
                      <p className="text-sm text-gray-500 truncate">{message.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(message.status)}
                        {message.property_title && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs truncate max-w-[120px]">
                            <i className="fa-solid fa-building mr-1"></i>{message.property_title}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedMessage.name}</h2>
                        <p className="text-emerald-600 font-medium">{getSubjectLabel(selectedMessage.subject)}</p>
                      </div>
                      {getStatusBadge(selectedMessage.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                        <i className="fa-solid fa-envelope"></i>{selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                          <i className="fa-solid fa-phone"></i>{selectedMessage.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-2 text-gray-400">
                        <i className="fa-solid fa-clock"></i>
                        {new Date(selectedMessage.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>

                    {selectedMessage.property_title && (
                      <a href={`/imovel/${selectedMessage.property_id}`}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                        <i className="fa-solid fa-building"></i>
                        {selectedMessage.property_title}
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                      </a>
                    )}
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Mensagem</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>

                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      <i className="fa-solid fa-sticky-note mr-2"></i>Notas Internas
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

                  <div className="p-6 flex flex-wrap gap-3">
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${getSubjectLabel(selectedMessage.subject)} - TRATA Imobiliária`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}>
                      <i className="fa-solid fa-reply"></i>Responder por Email
                    </a>
                    {selectedMessage.phone && (
                      <>
                        <a href={`tel:${selectedMessage.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          <i className="fa-solid fa-phone"></i>Ligar
                        </a>
                        <a href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          <i className="fa-brands fa-whatsapp"></i>WhatsApp
                        </a>
                      </>
                    )}

                    <div className="flex-1"></div>

                    {selectedMessage.status !== 'archived' ? (
                      <button onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        <i className="fa-solid fa-archive"></i>Arquivar
                      </button>
                    ) : (
                      <button onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        <i className="fa-solid fa-inbox"></i>Restaurar
                      </button>
                    )}

                    {isAdmin && (
                      <button onClick={() => confirmDelete('message', selectedMessage)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        <i className="fa-solid fa-trash"></i>Eliminar
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
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">

              {/* Conversations List */}
              <div className={`lg:col-span-4 border-r border-gray-200 flex flex-col min-h-0 ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
                {/* Search, Filters & New Conversation */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Pesquisar conversa..."
                        value={conversationSearch}
                        onChange={(e) => setConversationSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      onClick={openNewConversation}
                      className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium whitespace-nowrap"
                      title="Nova Conversa"
                    >
                      <i className="fa-solid fa-plus"></i>
                      <span className="hidden xl:inline">Nova</span>
                    </button>
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
                          conversationFilter === f.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {conversationsLoading && conversations.length === 0 ? (
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
                      const isInternal = conv.subject === 'Mensagem Interna';

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
                                src={conv.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user_name || 'U')}`}
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
                                <span className="text-xs text-slate-400">{formatDate(conv.last_message_at)}</span>
                              </div>

                              <div className="flex items-center gap-2 mt-0.5">
                                {isInternal && (
                                  <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Interna</span>
                                )}
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
                            src={selectedConversation.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user_name || 'U')}`}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isUserOnline(selectedConversation.user_id) ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}></span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm">{selectedConversation.user_name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isUserOnline(selectedConversation.user_id) ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            <span className={`text-xs ${isUserOnline(selectedConversation.user_id) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isUserOnline(selectedConversation.user_id) ? 'Online' : 'Offline'}
                            </span>
                            {selectedConversation.subject === 'Mensagem Interna' && (
                              <>
                                <span className="text-xs text-slate-300">•</span>
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Interna</span>
                              </>
                            )}
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

                          <a href={`mailto:${selectedConversation.user_email}`}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Enviar Email">
                            <i className="fa-solid fa-envelope"></i>
                          </a>

                          <button
                            onClick={() => confirmDelete('conversation', selectedConversation)}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar Conversa"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      {selectedConversation.property_title && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-3">
                          {selectedConversation.property_image && (
                            <img src={selectedConversation.property_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-600">Imóvel em discussão</p>
                            <p className="text-sm font-medium text-slate-900 truncate">{selectedConversation.property_title}</p>
                          </div>
                          <a href={`/imovel/${selectedConversation.property_id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                            Ver →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <i className="fa-regular fa-comments text-5xl mb-4"></i>
                          <p className="text-sm">Nenhuma mensagem ainda</p>
                          <p className="text-xs mt-1">Escreva uma mensagem para começar a conversa</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isMe = msg.sender_id === user?.id;

                          return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 h-8 flex-shrink-0">
                                {isMe ? (
                                  <img
                                    src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'T')}`}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={selectedConversation.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name || 'U')}`}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                              </div>

                              <div className="max-w-[75%]">
                                {!isMe && msg.sender_name && (
                                  <p className="text-xs text-slate-500 mb-1 font-medium">{msg.sender_name}</p>
                                )}
                                <div className={`px-4 py-3 rounded-2xl ${
                                  isMe
                                    ? 'bg-emerald-500 text-white rounded-br-md'
                                    : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-gray-100'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                </div>
                                <p className={`text-xs text-slate-400 mt-1 ${isMe ? 'text-right' : ''}`}>
                                  {formatChatTime(msg.created_at)}
                                  {!msg.is_read && !isMe && <span className="ml-2 text-red-500">• Novo</span>}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex items-end gap-3">
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
                          className="flex-1 px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          style={{ minHeight: '46px', maxHeight: '120px' }}
                        />
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

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {deleteModal.show && deleteModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-trash text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {deleteModal.type === 'conversation' ? 'Eliminar Conversa?' :
                 deleteModal.type === 'inquiry' ? 'Eliminar Pedido?' : 'Eliminar Mensagem?'}
              </h3>
              <p className="text-slate-600 mb-6">
                {deleteModal.type === 'conversation' ? (
                  <>Tem a certeza que deseja eliminar a conversa com <strong>{deleteModal.item.user_name}</strong>? Todas as mensagens serão eliminadas permanentemente.</>
                ) : deleteModal.type === 'inquiry' ? (
                  <>Tem a certeza que deseja eliminar o pedido de <strong>{deleteModal.item.name}</strong>? Esta ação não pode ser revertida.</>
                ) : (
                  <>Tem a certeza que deseja eliminar a mensagem de <strong>{deleteModal.item.name}</strong>? Esta ação não pode ser revertida.</>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, type: null, item: null })}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== NEW CONVERSATION MODAL ========== */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  <i className="fa-solid fa-plus-circle mr-2 text-emerald-500"></i>
                  Nova Conversa
                </h3>
                <button onClick={() => setShowNewConversation(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Enviar mensagem para um membro da equipa</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assunto (opcional)</label>
                <input
                  type="text"
                  value={newConvSubject}
                  onChange={(e) => setNewConvSubject(e.target.value)}
                  placeholder="Mensagem Interna"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Staff Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar destinatário</label>
                <div className="relative mb-3">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Pesquisar equipa..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
                  {filteredStaff.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">Nenhum membro encontrado</p>
                  ) : (
                    filteredStaff.map(member => {
                      const roleBadge = getRoleBadge(member.role);
                      return (
                        <button
                          key={member.id}
                          onClick={() => setSelectedStaff(member)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            selectedStaff?.id === member.id
                              ? 'bg-emerald-50 border-2 border-emerald-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <img
                            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email)}`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{member.name || member.email}</h4>
                            <p className="text-xs text-slate-500 truncate">{member.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                            {roleBadge.label}
                          </span>
                          {selectedStaff?.id === member.id && (
                            <i className="fa-solid fa-check-circle text-emerald-500"></i>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowNewConversation(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createStaffConversation}
                disabled={!selectedStaff}
                className={`flex-1 py-3 font-semibold rounded-xl transition-colors ${
                  selectedStaff
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Iniciar Conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesInbox;
