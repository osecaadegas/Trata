import React from 'react';
import { supabase } from '../lib/supabase';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Login error:', error);
        alert('Erro ao iniciar sessão. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Login exception:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Iniciar Sessão</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <p className="text-slate-600 mb-8 text-center">
          Entre com a sua conta Google para continuar
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg px-6 py-3 font-semibold text-slate-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.8055 10.2292C19.8055 9.55134 19.7508 8.86671 19.6344 8.19562H10.2002V12.0491H15.6014C15.3773 13.2909 14.6571 14.3898 13.6025 15.0879V17.5866H16.825C18.7172 15.8448 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
              <path d="M10.2002 20.0007C12.9508 20.0007 15.2709 19.1152 16.8251 17.5866L13.6026 15.0879C12.7025 15.697 11.5469 16.0435 10.2002 16.0435C7.54567 16.0435 5.29146 14.2834 4.48817 11.9097H1.16504V14.4826C2.75568 17.6466 6.30829 20.0007 10.2002 20.0007Z" fill="#34A853"/>
              <path d="M4.48811 11.9097C4.07895 10.6679 4.07895 9.33329 4.48811 8.09149V5.51855H1.16498C-0.403535 8.6387 -0.403535 12.3621 1.16498 15.4823L4.48811 11.9097Z" fill="#FBBC04"/>
              <path d="M10.2002 3.95671C11.6242 3.93537 13.0008 4.47322 14.0363 5.45678L16.8978 2.60129C15.1858 0.990782 12.9326 0.0958252 10.2002 0.117166C6.30829 0.117166 2.75568 2.47124 1.16504 5.63525L4.48817 8.20819C5.29146 5.83454 7.54567 3.95671 10.2002 3.95671Z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-slate-500">
          Ao continuar, você concorda com os nossos{' '}
          <a href="#" className="text-emerald-600 hover:underline">Termos de Serviço</a>
          {' '}e{' '}
          <a href="#" className="text-emerald-600 hover:underline">Política de Privacidade</a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
