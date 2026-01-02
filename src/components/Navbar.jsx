import React, { useState } from 'react';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    // Decode JWT token to get user info
    const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    setUser({
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture
    });
  };

  const handleLogout = () => {
    setUser(null);
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
            <div className="hidden md:flex space-x-8 font-medium text-slate-600">
              <a href="#home" className="hover:text-emerald-500 transition-colors">Início</a>
              <a href="#imoveis" className="hover:text-emerald-500 transition-colors">Imóveis</a>
              <a href="#servicos" className="hover:text-emerald-500 transition-colors">Serviços</a>
              <a href="#contatos" className="hover:text-emerald-500 transition-colors">Contactos</a>
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
