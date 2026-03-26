import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-cookie-bite text-emerald-500"></i>
              <h3 className="font-bold text-slate-900">Este website utiliza cookies</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Utilizamos cookies essenciais para autenticação e funcionamento do site. 
              Não utilizamos cookies de rastreamento ou publicidade. 
              <a href="/cookies" className="text-emerald-600 hover:underline ml-1">Saber mais</a>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Rejeitar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
