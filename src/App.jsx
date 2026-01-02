import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PropertyListings from './components/PropertyListings';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <div className="text-slate-800">
        <Navbar />
        <Hero />
        <Features />
        <PropertyListings />
        <CallToAction />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
