import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { user, userRole, logout, isAdmin, isConfigurator, isSeller } = useAuth();

  const handleLoginSuccess = () => {
    // Auth context handles this automatically
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <span className="text-3xl font-bold tracking-tighter text-slate-900">
                TRA<span className="text-green-accent">TA</span>
              </span>
            </div>
            <div className="hidden md:flex space-x-8 font-medium text-slate-600 items-center">
              <a href="#home" className="hover:text-emerald-500 transition-colors">Início</a>
              <a href="#imoveis" className="hover:text-emerald-500 transition-colors">Imóveis</a>
              <a href="#servicos" className="hover:text-emerald-500 transition-colors">Serviços</a>
              <a href="#contatos" className="hover:text-emerald-500 transition-colors">Contactos</a>
              
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
                        <>
                          <a href="#roles" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <i className="fa-solid fa-users-gear text-emerald-500 w-5"></i>
                            <span className="text-sm text-slate-700">Gerir Utilizadores</span>
                          </a>
                          <a href="#settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <i className="fa-solid fa-sliders text-emerald-500 w-5"></i>
                            <span className="text-sm text-slate-700">Configurações</span>
                          </a>
                        </>
                      )}
                      
                      <a href="#properties-admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-building text-emerald-500 w-5"></i>
                        <span className="text-sm text-slate-700">Gerir Imóveis</span>
                      </a>
                      
                      <a href="#analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-chart-line text-emerald-500 w-5"></i>
                        <span className="text-sm text-slate-700">Estatísticas</span>
                      </a>
                      
                      {isConfigurator && (
                        <>
                          <div className="border-t border-gray-100 my-2"></div>
                          <a href="#audit" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <i className="fa-solid fa-clipboard-list text-emerald-500 w-5"></i>
                            <span className="text-sm text-slate-700">Logs de Sistema</span>
                          </a>
                        </>
                      )}
                      
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
            <div>
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
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;
