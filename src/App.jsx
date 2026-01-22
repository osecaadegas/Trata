import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PropertyListings from './components/PropertyListings';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import UserManagement from './components/UserManagement';
import PropertyManagement from './components/PropertyManagement';
import ContactPage from './components/ContactPage';
import ServicesPage from './components/ServicesPage';
import PropertiesPage from './components/PropertiesPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import MessagesInbox from './components/MessagesInbox';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [propertyId, setPropertyId] = useState(null);

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Check if it's a property detail page (e.g., #imovel/123)
        if (hash.startsWith('imovel/')) {
          const id = hash.split('/')[1];
          setPropertyId(id);
          setCurrentPage('imovel-detail');
        } else {
          setPropertyId(null);
          setCurrentPage(hash);
        }
      } else {
        setPropertyId(null);
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
      case 'property-management':
        return <PropertyManagement />;
      case 'messages':
        return <MessagesInbox />;
      case 'contactos':
        return (
          <>
            <ContactPage />
            <Footer />
          </>
        );
      case 'servicos':
        return (
          <>
            <ServicesPage />
            <Footer />
          </>
        );
      case 'imoveis':
        return (
          <>
            <PropertiesPage />
            <Footer />
          </>
        );
      case 'imovel-detail':
        return (
          <>
            <PropertyDetailPage propertyId={propertyId} />
            <Footer />
          </>
        );
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
