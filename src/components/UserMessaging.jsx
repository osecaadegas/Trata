import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const UserMessaging = ({ embedded = false }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Polling for new messages
  useEffect(() => {
    if (user) {
      fetchConversations();
      updatePresence();
      
      // Poll for updates every 5 seconds for smooth UX
      const interval = setInterval(() => {
        fetchConversations();
        updatePresence();
        if (selectedConversation) {
          fetchMessages(selectedConversation.id, true);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const updatePresence = async () => {
    if (!user) return;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) return;

    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/update_user_presence`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          p_user_id: user.id,
          p_user_name: user.name,
          p_user_avatar: user.picture,
          p_current_page: 'messaging'
        })
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const fetchConversations = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      // Demo data
      setConversations([
        { 
          id: '1', 
          property_title: 'Apartamento T3 Vista Mar',
          property_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
          subject: 'Informações sobre o apartamento',
          last_message: 'Obrigado pela sua resposta! Vou analisar.',
          last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          last_message_by: 'user',
          user_unread_count: 1,
          status: 'active',
          assigned_agent_name: 'TRATA Imobiliária'
        },
        { 
          id: '2', 
          property_title: 'Moradia T4 com Jardim',
          property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
          subject: 'Agendamento de visita',
          last_message: 'Perfeito! Sábado às 15h está confirmado.',
          last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          last_message_by: 'agent',
          user_unread_count: 0,
          status: 'active',
          assigned_agent_name: 'TRATA Imobiliária'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/conversations?user_id=eq.${user.id}&order=last_message_at.desc`,
        { headers: getSupabaseHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        // Preserve unread_count=0 for currently selected conversation
        setConversations(prev => {
          return data.map(conv => {
            // If this is the selected conversation, keep unread as 0
            if (selectedConversation && conv.id === selectedConversation.id) {
              return { ...conv, user_unread_count: 0 };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId, silent = false) => {
    if (!silent) setLoading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      // Demo messages
      setMessages([
        { id: '1', sender_type: 'user', sender_name: user?.name, message: 'Olá! Gostaria de saber mais informações sobre o apartamento T3 com vista mar.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), is_read: true },
        { id: '2', sender_type: 'agent', sender_name: 'TRATA Imobiliária', message: 'Bom dia! Claro, terei todo o gosto em ajudar. O apartamento tem 120m², 3 quartos, 2 casas de banho, varanda com vista mar e estacionamento. O preço é 285.000€. Tem interesse em agendar uma visita?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), is_read: true },
        { id: '3', sender_type: 'user', sender_name: user?.name, message: 'Sim, gostaria de visitar. Qual a disponibilidade?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), is_read: true },
        { id: '4', sender_type: 'agent', sender_name: 'TRATA Imobiliária', message: 'Temos disponibilidade esta semana: quinta às 10h ou 16h, sexta às 14h, ou sábado às 11h. Qual prefere?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(), is_read: true },
        { id: '5', sender_type: 'user', sender_name: user?.name, message: 'Obrigado pela sua resposta! Vou analisar e dou feedback.', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), is_read: false },
      ]);
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
        setMessages(data);
        
        // Mark as read
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
          p_reader_type: 'user'
        })
      });
      
      // Update local state
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, user_unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking messages read:', error);
    }
  };

  const selectConversation = (conversation) => {
    // Immediately update local state to remove unread badge
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, user_unread_count: 0 } : c
    ));
    setSelectedConversation({ ...conversation, user_unread_count: 0 });
    fetchMessages(conversation.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      sender_name: user.name,
      sender_type: 'user',
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
      const response = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          sender_name: user.name,
          sender_avatar: user.picture,
          sender_type: 'user',
          message: messageText
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send message:', response.status, errorText);
      }
      
      // Refresh conversations to update last_message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  const startNewConversation = async (propertyId, propertyTitle, propertyImage, subject) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    const newConv = {
      id: `new-${Date.now()}`,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_avatar: user.picture,
      property_id: propertyId,
      property_title: propertyTitle || 'Consulta Geral',
      property_image: propertyImage,
      subject: subject || 'Nova conversa',
      status: 'active',
      last_message: '',
      last_message_at: new Date().toISOString(),
      user_unread_count: 0,
      assigned_agent_name: 'TRATA Imobiliária'
    };

    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setMessages([]);
      setShowNewConversation(false);
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/conversations`, {
        method: 'POST',
        headers: { ...getSupabaseHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          user_avatar: user.picture,
          property_id: propertyId,
          property_title: propertyTitle,
          property_image: propertyImage,
          subject: subject
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(prev => [data[0], ...prev]);
        setSelectedConversation(data[0]);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    setShowNewConversation(false);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatFullTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
    
    const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return time;
    if (isYesterday) return `Ontem, ${time}`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.user_unread_count || 0), 0);

  const filteredConversations = conversations.filter(conv => 
    searchTerm === '' || 
    conv.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200" style={{ height: 'calc(100vh - 280px)', minHeight: '550px' }}>
      <div className="grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden">
        
        {/* Conversations Sidebar */}
        <div className={`md:col-span-4 lg:col-span-4 border-r border-gray-200 flex flex-col min-h-0 bg-gray-50 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-comments text-emerald-500"></i>
                Mensagens
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowNewConversation(true)}
                className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                title="Nova conversa"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Pesquisar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse p-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-regular fa-comments text-gray-400 text-2xl"></i>
                </div>
                <p className="text-slate-700 font-medium">Sem conversas</p>
                <p className="text-sm text-slate-400 mt-1">
                  Inicie uma conversa com um vendedor
                </p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2"></i>
                  Nova Conversa
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex gap-3 border-b border-gray-100 hover:bg-white transition-all text-left ${
                    selectedConversation?.id === conv.id ? 'bg-white border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Property Image */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.property_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    {conv.user_unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.user_unread_count}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm truncate ${conv.user_unread_count > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {conv.property_title || conv.subject}
                      </h4>
                      <span className={`text-xs whitespace-nowrap ${conv.user_unread_count > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                        {formatMessageTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${conv.user_unread_count > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                      {conv.last_message_by === 'user' && <span className="text-slate-400">Tu: </span>}
                      {conv.last_message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`md:col-span-8 lg:col-span-8 flex flex-col h-full overflow-hidden bg-white ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                
                <img 
                  src={selectedConversation.property_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop'}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate text-sm">
                    {selectedConversation.property_title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-emerald-600">{selectedConversation.assigned_agent_name || 'TRATA Imobiliária'}</span>
                    <span className="text-slate-400">• Normalmente responde em minutos</span>
                  </div>
                </div>
                
                {selectedConversation.property_id && (
                  <a
                    href={`#imovel/${selectedConversation.property_id}`}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 text-slate-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <i className="fa-solid fa-building"></i>
                    Ver Imóvel
                  </a>
                )}
                
                <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>

              {/* Property Card (if property linked) */}
              {selectedConversation.property_id && (
                <a 
                  href={`#imovel/${selectedConversation.property_id}`}
                  className="mx-4 mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-3 hover:border-emerald-300 transition-colors"
                >
                  <img 
                    src={selectedConversation.property_image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-emerald-600 font-medium mb-0.5">Imóvel em discussão</p>
                    <h5 className="font-semibold text-slate-900 truncate">{selectedConversation.property_title}</h5>
                  </div>
                  <i className="fa-solid fa-arrow-right text-emerald-500"></i>
                </a>
              )}

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <i className="fa-regular fa-comments text-5xl mb-4"></i>
                    <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
                    <p className="text-xs mt-1">Escreva uma mensagem para começar a conversa</p>
                  </div>
                ) : (
                  <>
                    {/* Date Separator */}
                    <div className="flex items-center gap-4 my-2">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-xs text-slate-400 font-medium">Início da conversa</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {messages.map((msg, index) => {
                      const isUser = msg.sender_type === 'user';
                      const showAvatar = index === 0 || messages[index - 1]?.sender_type !== msg.sender_type;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                        >
                          {/* Avatar */}
                          <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                            {isUser ? (
                              <img 
                                src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}`}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">T</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl ${
                              isUser
                                ? 'bg-emerald-500 text-white rounded-br-md'
                                : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-gray-100'
                            }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        
                        {/* Time & Read Status */}
                        <div className={`flex items-center gap-1.5 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-slate-400">
                            {formatFullTime(msg.created_at)}
                          </span>
                          {isUser && (
                            <i className={`fa-solid ${msg.is_read ? 'fa-check-double text-emerald-500' : 'fa-check text-slate-400'} text-xs`}></i>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-3">
                  {/* Attachment Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Anexar ficheiro"
                  >
                    <i className="fa-solid fa-paperclip"></i>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" />
                  
                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Escreva uma mensagem..."
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      style={{ minHeight: '46px', maxHeight: '120px' }}
                    />
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                      newMessage.trim()
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {sendingMessage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 mt-2 text-center">
                  <i className="fa-solid fa-shield-halved mr-1"></i>
                  As suas mensagens são encriptadas e seguras
                </p>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-comments text-emerald-500 text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">As suas mensagens</h3>
              <p className="text-slate-500 max-w-sm mb-6">
                Selecione uma conversa ou inicie uma nova para contactar a nossa equipa sobre imóveis.
              </p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                Iniciar Nova Conversa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Nova Conversa</h3>
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Escolha um assunto para iniciar uma conversa com a nossa equipa:
              </p>
              
              {[
                { icon: 'fa-building', title: 'Informação sobre Imóvel', subject: 'Informação sobre imóvel' },
                { icon: 'fa-calendar', title: 'Agendar Visita', subject: 'Agendamento de visita' },
                { icon: 'fa-file-invoice-dollar', title: 'Financiamento', subject: 'Questões sobre financiamento' },
                { icon: 'fa-question-circle', title: 'Dúvida Geral', subject: 'Dúvida geral' }
              ].map((option, index) => (
                <button
                  key={index}
                  onClick={() => startNewConversation(null, null, null, option.subject)}
                  className="w-full p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <i className={`fa-solid ${option.icon} text-emerald-600 text-lg`}></i>
                  </div>
                  <span className="font-medium text-slate-900">{option.title}</span>
                  <i className="fa-solid fa-chevron-right text-slate-400 ml-auto"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessaging;
