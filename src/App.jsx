import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SellerValueSection from './components/SellerValueSection';
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
import UserDashboard from './components/UserDashboard';
import UnsubscribePage from './components/UnsubscribePage';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import AboutPage from './components/AboutPage';
import CookiesPage from './components/CookiesPage';
import SecurityPage from './components/SecurityPage';
import CareersPage from './components/CareersPage';
import JobManagement from './components/JobManagement';
import BlogPage from './components/BlogPage';
import BlogArticlePage from './components/BlogArticlePage';
import WhatsAppButton from './components/WhatsAppButton';
import LocationPage, { LOCATION_SLUGS } from './components/LocationPage';
import { updateSeoMeta, PAGE_SEO } from './lib/seo';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [propertyId, setPropertyId] = useState(null);

  // Initialize dark mode from localStorage before first paint
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Backwards compatibility: redirect old hash URLs to path URLs
    if (window.location.hash && window.location.hash !== '#') {
      const hashPath = window.location.hash.slice(1).split('?')[0];
      const hashParams = window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '';
      const newPath = (hashPath === 'home' ? '/' : `/${hashPath}`) + hashParams;
      history.replaceState(null, '', newPath);
    }

    // Path-based routing
    const handleNavigation = () => {
      const pathname = window.location.pathname;
      const path = pathname === '/' ? '' : pathname.replace(/^\//, '');

      if (path.startsWith('imovel/')) {
        const id = path.split('/')[1];
        setPropertyId(id);
        setCurrentPage('imovel-detail');
      } else if (path.startsWith('guias/')) {
        const slug = path.replace('guias/', '');
        setPropertyId(slug);
        setCurrentPage('guias-article');
      } else if (path.startsWith('imoveis/')) {
        const locSlug = path.replace('imoveis/', '');
        setPropertyId(locSlug);
        setCurrentPage('imoveis-location');
      } else if (path) {
        setPropertyId(null);
        setCurrentPage(path);
      } else {
        setPropertyId(null);
        setCurrentPage('home');
      }
    };

    // Intercept internal link clicks for SPA navigation
    const handleClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href === '#' || href.startsWith('/api/')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (href.startsWith('/')) {
        e.preventDefault();
        if (href !== window.location.pathname + window.location.search) {
          history.pushState(null, '', href);
        }
        handleNavigation();
      }
    };

    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('click', handleClick);
    handleNavigation();

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, propertyId]);

  // Update SEO meta tags on page change
  useEffect(() => {
    const seoKey = currentPage === 'guias-article' ? null : currentPage;
    if (seoKey && PAGE_SEO[seoKey]) {
      updateSeoMeta(PAGE_SEO[seoKey]);
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'user-management':
        return <UserManagement />;
      case 'property-management':
        return <PropertyManagement />;
      case 'messages':
      case 'conversations':
        return <MessagesInbox />;
      case 'dashboard':
        return <UserDashboard />;
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
      case 'unsubscribe':
        return <UnsubscribePage />;
      case 'privacidade':
        return (
          <>
            <PrivacyPolicyPage />
            <Footer />
          </>
        );
      case 'termos':
        return (
          <>
            <TermsPage />
            <Footer />
          </>
        );
      case 'sobre':
        return (
          <>
            <AboutPage />
            <Footer />
          </>
        );
      case 'cookies':
        return (
          <>
            <CookiesPage />
            <Footer />
          </>
        );
      case 'seguranca':
        return (
          <>
            <SecurityPage />
            <Footer />
          </>
        );
      case 'carreiras':
        return (
          <>
            <CareersPage />
            <Footer />
          </>
        );
      case 'guias':
        return (
          <>
            <BlogPage />
            <Footer />
          </>
        );
      case 'guias-article':
        return (
          <>
            <BlogArticlePage slug={propertyId} />
            <Footer />
          </>
        );
      case 'imoveis-location':
        return (
          <>
            <LocationPage locationSlug={propertyId} />
            <Footer />
          </>
        );
      case 'job-management':
        return <JobManagement />;
      default:
        return (
          <>
            <Hero />
            {/* <SellerValueSection /> */}
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
        <WhatsAppButton />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;
