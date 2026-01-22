import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper to get auth data from Supabase's storage
const getStoredAuth = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;
  
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  const storageKey = `sb-${projectId}-auth-token`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // IMMEDIATELY restore from localStorage for instant UI
    const storedAuth = getStoredAuth();
    const storedRole = localStorage.getItem('trata-user-role');
    
    if (storedAuth?.user) {
      console.log('Restoring user from localStorage');
      setUser({
        id: storedAuth.user.id,
        name: storedAuth.user.user_metadata?.full_name || storedAuth.user.email,
        email: storedAuth.user.email,
        picture: storedAuth.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedAuth.user.email)}`
      });
      if (storedRole) {
        setUserRole(storedRole);
      }
      setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('Loading user with role...');
          await loadUserWithRole(session.user);
        }
        // Clean up OAuth tokens from URL
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole('user');
        localStorage.removeItem('trata-user-role');
      }
      
      setLoading(false);
    });

    // Set loading false after a timeout if nothing happened
    setTimeout(() => setLoading(false), 2000);

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserWithRole(user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWithRole = async (authUser) => {
    try {
      // Get user role from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, email, name, avatar_url')
        .eq('id', authUser.id)
        .single();

      let role = 'user';

      if (error && error.code === 'PGRST116') {
        // User doesn't exist in users table, create them
        const { data: newUser } = await supabase
          .from('users')
          .insert([
            {
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata.full_name || authUser.email,
              avatar_url: authUser.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${authUser.email}`,
              role: 'user' // default role
            }
          ])
          .select()
          .single();

        role = newUser?.role || 'user';
      } else if (userData) {
        role = userData.role || 'user';
        console.log('User role from database:', role);
      }

      // Store role in localStorage for instant restore on page reload
      localStorage.setItem('trata-user-role', role);
      setUserRole(role);
      console.log('Setting userRole to:', role);

      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || authUser.email,
        email: authUser.email,
        picture: authUser.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${authUser.email}`
      });
    } catch (error) {
      console.error('Error loading user role:', error);
      // Fallback: use stored role if available
      const storedRole = localStorage.getItem('trata-user-role');
      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || authUser.email,
        email: authUser.email,
        picture: authUser.user_metadata.avatar_url
      });
      setUserRole(storedRole || 'user');
    }
  };

  const logout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setUserRole('user');
      localStorage.removeItem('trata-user-role');
      localStorage.removeItem('trata-auth');
      
      // Try to sign out from Supabase (don't wait if it fails)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project')) {
        supabase.auth.signOut().catch(err => console.error('Supabase signOut error:', err));
      }
      
      // Force redirect to home
      window.location.hash = '#home';
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even on error
      setUser(null);
      setUserRole('user');
      localStorage.removeItem('trata-user-role');
      localStorage.removeItem('trata-auth');
      window.location.hash = '#home';
      window.location.reload();
    }
  };

  // Normalize role for comparisons (lowercase)
  const normalizedRole = userRole?.toLowerCase() || 'user';

  const value = {
    user,
    userRole,
    loading,
    logout,
    isAdmin: normalizedRole === 'admin' || normalizedRole === 'configurator' || normalizedRole === 'configurador',
    isConfigurator: normalizedRole === 'configurator' || normalizedRole === 'configurador',
    isSeller: normalizedRole === 'vendedor' || normalizedRole === 'seller' || normalizedRole === 'admin' || normalizedRole === 'configurator' || normalizedRole === 'configurador',
    refreshUser: checkUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
