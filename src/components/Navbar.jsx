import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userRole, logout, isAdmin, isConfigurator, isSeller } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    const handleHashChange = () => {
      setIsMobileMenuOpen(false);
      setIsAdminMenuOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '#home', label: 'Início', icon: 'fa-home' },
    { href: '#imoveis', label: 'Imóveis', icon: 'fa-building' },
    { href: '#servicos', label: 'Serviços', icon: 'fa-concierge-bell' },
    { href: '#contactos', label: 'Contactos', icon: 'fa-envelope' },
  ];

  const socialLinks = [
    { href: '#', icon: 'fa-facebook-f', label: 'Facebook' },
    { href: '#', icon: 'fa-instagram', label: 'Instagram' },
    { href: '#', icon: 'fa-linkedin-in', label: 'LinkedIn' },
    { href: 'https://wa.me/351934101523', icon: 'fa-whatsapp', label: 'WhatsApp', external: true },
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2 z-10">
              <img 
                src="/trata.jpg" 
                alt="TRATA Logo" 
                className="h-10 w-10 object-contain rounded-lg"
              />
              <span className="text-3xl font-bold tracking-tighter text-slate-900">
                TRA<span className="text-green-accent">TA</span>
              </span>
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 font-medium text-slate-600 items-center">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="hover:text-emerald-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              
              {/* Admin Menu - Desktop */}
              {(isAdmin || isSeller) && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    <i className="fa-solid fa-shield-halved"></i>
                    {isAdmin ? 'Admin' : 'Painel'}
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {isAdminMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Gestão</p>
                      </div>
                      
                      {isConfigurator && (
                        <a 
                          href="#user-management" 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <i className="fa-solid fa-users-gear text-emerald-500 w-5"></i>
                          <span className="text-sm text-slate-700">Gerir Utilizadores</span>
                        </a>
                      )}
                      
                      {isAdmin && (
                        <a 
                          href="#property-management" 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <i className="fa-solid fa-building text-emerald-500 w-5"></i>
                          <span className="text-sm text-slate-700">Gerir Imóveis</span>
                        </a>
                      )}
                      
                      <a 
                        href="#messages" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <i className="fa-solid fa-envelope text-emerald-500 w-5"></i>
                        <span className="text-sm text-slate-700">Mensagens</span>
                      </a>
                      
                      <div className="px-4 py-2 mt-2 border-t border-gray-100">
                        <p className="text-xs text-slate-400">
                          <i className="fa-solid fa-crown text-yellow-500 mr-1"></i>
                          {userRole === 'configurator' ? 'Configurador' : userRole === 'admin' ? 'Administrador' : 'Vendedor'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop User/Login */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <a 
                    href="#dashboard" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                  >
                    <i className="fa-solid fa-grid-2"></i>
                    <span>Minha Área</span>
                  </a>
                  <a href="#dashboard" className="group">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500 group-hover:border-emerald-400 transition-colors"
                    />
                  </a>
                  <div className="hidden lg:block text-left">
                    <a href="#dashboard" className="text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors">{user.name}</a>
                    <button 
                      onClick={handleLogout}
                      className="block text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-green-accent text-white px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-user"></i>
                  <span className="hidden sm:inline">Iniciar Sessão</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-600 transition-all z-10"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl transition-transform duration-200`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <span className="text-2xl font-bold tracking-tighter text-slate-900">
            TRA<span className="text-green-accent">TA</span>
          </span>
          <button
            onClick={closeMobileMenu}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-all"
            aria-label="Fechar menu"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-5rem)] overflow-hidden">
          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium active:scale-98"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <i className={`fa-solid ${link.icon} text-emerald-600`}></i>
                  </div>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Admin Section - Mobile */}
            {(isAdmin || isSeller) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-4 mb-3">
                  {isAdmin ? 'Administração' : 'Painel do Vendedor'}
                </p>
                <nav className="space-y-1">
                  {isConfigurator && (
                    <a 
                      href="#user-management" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all font-medium"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <i className="fa-solid fa-users-gear text-amber-600"></i>
                      </div>
                      Gerir Utilizadores
                    </a>
                  )}
                  {isAdmin && (
                    <a 
                      href="#property-management" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all font-medium"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <i className="fa-solid fa-building-user text-amber-600"></i>
                      </div>
                      Gerir Imóveis
                    </a>
                  )}
                  <a 
                    href="#messages" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all font-medium"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <i className="fa-solid fa-envelope text-amber-600"></i>
                    </div>
                    Mensagens
                  </a>
                </nav>
              </div>
            )}

            {/* Social Links */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-4 mb-4">
                Redes Sociais
              </p>
              <div className="flex gap-3 px-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.label}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                    aria-label={social.label}
                  >
                    <i className={`fa-brands ${social.icon} text-lg`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* User Section at Bottom */}
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
            {user ? (
              <div className="space-y-3">
                {/* Dashboard Link */}
                <a 
                  href="#dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-medium"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <i className="fa-solid fa-grid-2 text-white"></i>
                  </div>
                  <span>Minha Área</span>
                  <i className="fa-solid fa-arrow-right ml-auto text-emerald-500"></i>
                </a>
                
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        {userRole === 'configurator' ? 'Configurador' : userRole === 'admin' ? 'Administrador' : 'Utilizador'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2"></i>
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
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
