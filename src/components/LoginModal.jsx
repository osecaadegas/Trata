import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = (credentialResponse) => {
    console.log('Login Success:', credentialResponse);
    onSuccess(credentialResponse);
    onClose();
  };

  const handleError = () => {
    console.log('Login Failed');
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
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            locale="pt-PT"
          />
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
