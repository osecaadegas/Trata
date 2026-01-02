import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PropertyListings from './components/PropertyListings';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="text-slate-800">
        <Navbar />
        <Hero />
        <Features />
        <PropertyListings />
        <CallToAction />
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
