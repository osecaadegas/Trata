import React, { useState, useEffect } from 'react';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const tooltipTimer = setTimeout(() => setShowTooltip(true), 4000);
      const hideTimer = setTimeout(() => setShowTooltip(false), 12000);
      return () => { clearTimeout(tooltipTimer); clearTimeout(hideTimer); };
    }
  }, [isVisible]);

  const phoneNumber = '351934101523';
  const message = encodeURIComponent('Olá! Gostaria de saber mais informações sobre os vossos imóveis.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 max-w-[200px] animate-fade-in hidden sm:block">
          <p className="text-sm text-slate-700 font-medium">Precisa de ajuda? Fale connosco!</p>
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-[-45deg]"></div>
        </div>
      )}

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar via WhatsApp"
        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce-once"
      >
        <i className="fa-brands fa-whatsapp text-2xl"></i>
      </a>

      <style>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WhatsAppButton;
