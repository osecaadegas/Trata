import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MessagesInbox = () => {
  const { user, userRole, isAdmin, isSeller } = useAuth();
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/messages?select=*&order=created_at.desc`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error('Failed to fetch messages');
          setMessages([]);
        }
      } else {
        console.warn('Supabase not configured - no messages available');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
    setLoading(false);
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    // Update locally first
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus, read_at: newStatus === 'read' ? new Date().toISOString() : msg.read_at }
        : msg
    ));

    if (selectedMessage?.id === messageId) {
      setSelectedMessage(prev => ({ ...prev, status: newStatus }));
    }

    // Try to update in Supabase
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        await fetch(
          `${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status: newStatus })
          }
        );
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
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        await fetch(
          `${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ notes: newNotes })
          }
        );
      }
    } catch (error) {
      console.error('Error updating message notes:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          // Remove from local state
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">A carregar mensagens...</p>
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
                <i className="fa-solid fa-inbox text-emerald-500"></i>
                Caixa de Mensagens
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-slate-600 mt-1">
                Gerir mensagens e contactos de clientes
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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
        </div>
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
