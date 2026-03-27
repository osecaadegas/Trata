import React, { useState, useEffect } from 'react';

const DarkModeToggle = ({ className = '' }) => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Listen for system theme changes when no explicit preference is stored
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setDark(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
        dark ? 'bg-slate-700' : 'bg-gray-200'
      } ${className}`}
      aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={dark ? 'Modo Claro' : 'Modo Escuro'}
    >
      {/* Icons inside track */}
      <span className="absolute left-1.5 text-amber-400 text-xs">
        <i className="fa-solid fa-sun"></i>
      </span>
      <span className="absolute right-1.5 text-blue-300 text-xs">
        <i className="fa-solid fa-moon"></i>
      </span>

      {/* Sliding knob */}
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          dark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {dark ? (
          <i className="fa-solid fa-moon text-[10px] text-slate-700"></i>
        ) : (
          <i className="fa-solid fa-sun text-[10px] text-amber-500"></i>
        )}
      </span>
    </button>
  );
};

export default DarkModeToggle;
