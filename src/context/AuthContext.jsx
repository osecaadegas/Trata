import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Initialize auth
    const initAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (mounted && session?.user) {
          await loadUserWithRole(session.user);
        }
      } catch (error) {
        console.log('Init auth:', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (!mounted) return;
      
      if (session?.user) {
        await loadUserWithRole(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole('user');
        localStorage.removeItem('trata-user-role');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserWithRole = async (authUser) => {
    // Set user immediately
    setUser({
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email,
      email: authUser.email,
      picture: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.email)}`
    });
    
    // Restore role from localStorage first (instant)
    const storedRole = localStorage.getItem('trata-user-role');
    if (storedRole) {
      setUserRole(storedRole);
    }
    setLoading(false);

    // Then fetch role from database (background, with timeout)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Get auth token from localStorage
      const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
      const tokenData = localStorage.getItem(`sb-${projectId}-auth-token`);
      let accessToken = supabaseKey;
      if (tokenData) {
        try {
          accessToken = JSON.parse(tokenData)?.access_token || supabaseKey;
        } catch (e) {}
      }
      
      // Use REST API (Supabase client sometimes blocks)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${authUser.id}&select=role`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const role = data[0].role || 'user';
          console.log('User role:', role);
          setUserRole(role);
          localStorage.setItem('trata-user-role', role);
        } else {
          // Create user if doesn't exist
          fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name || authUser.email,
              avatar_url: authUser.user_metadata?.avatar_url,
              role: 'user'
            })
          }).catch(() => {});
        }
      }
    } catch (error) {
      console.log('Role fetch:', error.message);
    }
  };

  const logout = () => {
    // Clear everything immediately
    setUser(null);
    setUserRole('user');
    localStorage.removeItem('trata-user-role');
    
    // Clear Supabase token
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
      localStorage.removeItem(`sb-${projectId}-auth-token`);
    }
    
    // Try to sign out (don't wait)
    supabase.auth.signOut().catch(() => {});
    
    // Reload page
    window.location.href = '/';
  };

  // Role checks
  const normalizedRole = userRole?.toLowerCase() || 'user';
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'configurator' || normalizedRole === 'configurador';
  const isConfigurator = normalizedRole === 'configurator' || normalizedRole === 'configurador';
  const isSeller = ['vendedor', 'seller', 'admin', 'configurator', 'configurador'].includes(normalizedRole);

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      logout,
      isAdmin,
      isConfigurator,
      isSeller,
      refreshUser: () => supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) loadUserWithRole(session.user);
      })
    }}>
      {children}
    </AuthContext.Provider>
  );
};
