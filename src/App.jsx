import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PropertyListings from './components/PropertyListings';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import UserManagement from './components/UserManagement';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'user-management':
        return <UserManagement />;
      default:
        return (
          <>
            <Hero />
            <Features />
            <PropertyListings />
            <CallToAction />
            <Footer />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="text-slate-800">
        <Navbar />
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
