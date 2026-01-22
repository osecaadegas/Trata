import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userRole, logout, isAdmin, isConfigurator, isSeller } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <a href="#home" className="text-3xl font-bold tracking-tighter text-slate-900">
                TRA<span className="text-green-accent">TA</span>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 font-medium text-slate-600 items-center">
              <a href="#home" className="hover:text-emerald-500 transition-colors">Início</a>
              <a href="#imoveis" className="hover:text-emerald-500 transition-colors">Imóveis</a>
              <a href="#servicos" className="hover:text-emerald-500 transition-colors">Serviços</a>
              <a href="#contactos" className="hover:text-emerald-500 transition-colors">Contactos</a>
              
              {/* Admin Menu */}
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    <i className="fa-solid fa-shield-halved"></i>
                    Admin
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {isAdminMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Gestão</p>
                      </div>
                      
                      {isConfigurator && (
                        <a href="#user-management" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <i className="fa-solid fa-users-gear text-emerald-500 w-5"></i>
                          <span className="text-sm text-slate-700">Gerir Utilizadores</span>
                        </a>
                      )}
                      
                      <a href="#property-management" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-building text-emerald-500 w-5"></i>
                        <span className="text-sm text-slate-700">Gerir Imóveis</span>
                      </a>
                      
                      <div className="px-4 py-2 mt-2 border-t border-gray-100">
                        <p className="text-xs text-slate-400">
                          <i className="fa-solid fa-crown text-yellow-500 mr-1"></i>
                          {userRole === 'configurator' ? 'Configurador' : 'Administrador'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop User/Login */}
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-emerald-500"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <button 
                      onClick={handleLogout}
                      className="text-xs text-slate-500 hover:text-emerald-600"
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
                  Iniciar Sessão
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-600 transition-all"
              aria-label="Abrir menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden fixed inset-0 top-20 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <nav className="space-y-2">
                <a 
                  href="#home" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                >
                  <i className="fa-solid fa-home w-6 text-center text-emerald-500"></i>
                  Início
                </a>
                <a 
                  href="#imoveis" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                >
                  <i className="fa-solid fa-building w-6 text-center text-emerald-500"></i>
                  Imóveis
                </a>
                <a 
                  href="#servicos" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                >
                  <i className="fa-solid fa-concierge-bell w-6 text-center text-emerald-500"></i>
                  Serviços
                </a>
                <a 
                  href="#contactos" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                >
                  <i className="fa-solid fa-envelope w-6 text-center text-emerald-500"></i>
                  Contactos
                </a>

                {/* Admin Section (Mobile) */}
                {isAdmin && (
                  <>
                    <div className="pt-4 pb-2 px-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Administração</p>
                    </div>
                    {isConfigurator && (
                      <a 
                        href="#user-management" 
                        onClick={closeMobileMenu}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                      >
                        <i className="fa-solid fa-users-gear w-6 text-center text-emerald-500"></i>
                        Gerir Utilizadores
                      </a>
                    )}
                    <a 
                      href="#property-management" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium"
                    >
                      <i className="fa-solid fa-building-user w-6 text-center text-emerald-500"></i>
                      Gerir Imóveis
                    </a>
                  </>
                )}
              </nav>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-4 mb-4">Redes Sociais</p>
                <div className="flex gap-3 px-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"
                    aria-label="Facebook"
                  >
                    <i className="fa-brands fa-facebook-f text-lg"></i>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"
                    aria-label="Instagram"
                  >
                    <i className="fa-brands fa-instagram text-lg"></i>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"
                    aria-label="LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in text-lg"></i>
                  </a>
                  <a 
                    href="https://wa.me/351934101523" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"
                    aria-label="WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* User Section at Bottom */}
            <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        {userRole === 'configurator' ? 'Configurador' : userRole === 'admin' ? 'Administrador' : 'Utilizador'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-green-accent text-white py-4 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-user"></i>
                  Iniciar Sessão
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={closeMobileMenu}
        />
      )}

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Navbar;
