import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, userRole, logout, isAdmin, isConfigurator, isSeller } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setIsAdminMenuOpen(false);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isAdminMenuOpen && !e.target.closest('.admin-menu-container')) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdminMenuOpen]);

  // Fetch unread messages count
  useEffect(() => {
    if (!user || (!isAdmin && !isConfigurator && !isSeller)) return;

    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unread');
        if (!error && count !== null) setUnreadCount(count);
      } catch (e) {
        // silent
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, isAdmin, isConfigurator, isSeller]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: '/', label: 'Início', icon: 'fa-home' },
    { href: '/imoveis', label: 'Imóveis', icon: 'fa-building' },
    { href: '/servicos', label: 'Serviços', icon: 'fa-concierge-bell' },
    { href: '/contactos', label: 'Contactos', icon: 'fa-envelope' },
    { href: '/guias', label: 'Guias', icon: 'fa-book-open' },
  ];

  const getRoleBadge = () => {
    const role = userRole?.toLowerCase() || 'user';
    if (role === 'configurator' || role === 'configurador') return { text: 'Configurador', color: 'bg-purple-100 text-purple-700', icon: 'fa-crown' };
    if (role === 'admin') return { text: 'Admin', color: 'bg-blue-100 text-blue-700', icon: 'fa-shield-halved' };
    if (role === 'seller' || role === 'vendedor') return { text: 'Vendedor', color: 'bg-green-100 text-green-700', icon: 'fa-briefcase' };
    return { text: 'Utilizador', color: 'bg-gray-100 text-gray-700', icon: 'fa-user' };
  };

  const adminMenuItems = [
    ...((isAdmin || isConfigurator) ? [{ href: '/user-management', label: 'Gerir Utilizadores', icon: 'fa-users-gear', color: 'text-purple-500', bgColor: 'bg-purple-50', description: 'Funções e permissões' }] : []),
    ...((isAdmin || isConfigurator || isSeller) ? [{ href: '/property-management', label: 'Gerir Imóveis', icon: 'fa-building', color: 'text-emerald-500', bgColor: 'bg-emerald-50', description: 'Propriedades e listagens' }] : []),
    ...((isAdmin || isConfigurator || isSeller) ? [{ href: '/messages', label: 'Mensagens', icon: 'fa-inbox', color: 'text-blue-500', bgColor: 'bg-blue-50', description: 'Caixa de entrada' }] : []),
    ...((isAdmin || isConfigurator) ? [{ href: '/job-management', label: 'Carreiras', icon: 'fa-briefcase', color: 'text-amber-500', bgColor: 'bg-amber-50', description: 'Vagas e candidaturas' }] : []),
    ...(isConfigurator ? [{ href: '/storage-cleanup', label: 'Limpar Imagens', icon: 'fa-images', color: 'text-red-500', bgColor: 'bg-red-50', description: 'Bucket de imóveis' }] : []),
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 ${
        scrolled ? 'shadow-sm' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-18 items-center">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 z-10 group">
              <img 
                src="/trata.png" 
                alt="TRATA Logo" 
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter text-slate-900 leading-none">
                  TRA<span className="text-emerald-500">TA</span>
                </span>
                <span className="text-xs font-medium tracking-wide leading-none mt-0.5">
                  <span className="text-emerald-500">IMOB</span><span className="text-slate-900">ILIÁRIA</span>
                </span>
              </div>
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              {/* Admin Panel Button - Desktop */}
              {(isAdmin || isConfigurator || isSeller) && (
                <div className="relative admin-menu-container">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                      isAdminMenuOpen 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fa-solid fa-grid-2"></i>
                    <span>Painel</span>
                    {unreadCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none min-w-[18px] justify-center">
                        <i className="fa-solid fa-envelope text-[8px]"></i>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {/* Desktop Dropdown */}
                  {isAdminMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                      {/* Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Área de Gestão</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadge().color}`}>
                            <i className={`fa-solid ${getRoleBadge().icon} mr-1`}></i>
                            {getRoleBadge().text}
                          </span>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        {adminMenuItems.map((item) => (
                          <a 
                            key={item.href}
                            href={item.href} 
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                            onClick={() => setIsAdminMenuOpen(false)}
                          >
                            <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                              <i className={`fa-solid ${item.icon} ${item.color}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-400">{item.description}</p>
                            </div>
                            <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-slate-500 transition-colors"></i>
                          </a>
                        ))}
                      </div>

                      {/* Quick Stats Footer */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <a 
                          href="/property-management"
                          onClick={() => setIsAdminMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          <i className="fa-solid fa-plus"></i>
                          Adicionar Imóvel
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-2">
                  <a 
                    href="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-semibold"
                  >
                    <i className="fa-solid fa-th-large"></i>
                    <span className="hidden xl:inline">Minha Área</span>
                  </a>
                  <a href="/dashboard" className="group relative">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-10 h-10 rounded-xl border-2 border-emerald-200 group-hover:border-emerald-400 transition-colors object-cover"
                    />
                    {(isAdmin || isConfigurator || isSeller) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <i className="fa-solid fa-check text-[8px] text-white"></i>
                      </span>
                    )}
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Sair"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Entrar</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-600 transition-all z-10"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg transition-transform duration-200`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu Panel */}
      <div 
        className={`lg:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 bg-gray-50">
          <span className="text-xl font-bold tracking-tighter text-slate-900">
            TRA<span className="text-emerald-500">TA</span>
          </span>
          <button
            onClick={closeMobileMenu}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* User Info (if logged in) */}
            {user && (
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-12 h-12 rounded-xl border-2 border-emerald-200 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadge().color}`}>
                      <i className={`fa-solid ${getRoleBadge().icon} text-[10px]`}></i>
                      {getRoleBadge().text}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Navegação</p>
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <i className={`fa-solid ${link.icon} text-slate-500`}></i>
                    </div>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Admin Section - Mobile */}
            {(isAdmin || isConfigurator || isSeller) && (
              <div className="px-4 py-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  Área de Gestão
                  {unreadCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none normal-case tracking-normal">
                      <i className="fa-solid fa-envelope text-[8px]"></i>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </p>
                <nav className="space-y-1">
                  {adminMenuItems.map((item) => (
                    <a 
                      key={item.href}
                      href={item.href} 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 hover:bg-gray-50 transition-all font-medium"
                    >
                      <div className={`w-9 h-9 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                        <i className={`fa-solid ${item.icon} ${item.color}`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Action */}
            {user && (
              <div className="px-4 py-4 border-t border-gray-100">
                <a 
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                >
                  <i className="fa-solid fa-th-large"></i>
                  Minha Área
                </a>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle - Mobile */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Modo Escuro</span>
            <DarkModeToggle />
          </div>

          {/* Bottom Action */}
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Terminar Sessão
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <i className="fa-solid fa-user"></i>
                Iniciar Sessão
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Navbar;
