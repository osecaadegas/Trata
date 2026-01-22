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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserWithRole(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (session?.user) {
        await loadUserWithRole(session.user);
      } else {
        setUser(null);
        setUserRole('user');
        localStorage.removeItem('trata-user-role');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserWithRole = async (authUser) => {
    try {
      // Set user immediately
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email,
        email: authUser.email,
        picture: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.email)}`
      });

      // Try to get role from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create them
        const { data: newUser } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.email,
            avatar_url: authUser.user_metadata?.avatar_url,
            role: 'user'
          }])
          .select('role')
          .single();

        const role = newUser?.role || 'user';
        setUserRole(role);
        localStorage.setItem('trata-user-role', role);
      } else if (userData) {
        const role = userData.role || 'user';
        console.log('User role:', role);
        setUserRole(role);
        localStorage.setItem('trata-user-role', role);
      } else {
        // Fallback to stored role
        const storedRole = localStorage.getItem('trata-user-role');
        setUserRole(storedRole || 'user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      const storedRole = localStorage.getItem('trata-user-role');
      setUserRole(storedRole || 'user');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setUserRole('user');
    localStorage.removeItem('trata-user-role');
  };

  // Role checks
  const normalizedRole = userRole?.toLowerCase() || 'user';
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'configurator' || normalizedRole === 'configurador';
  const isConfigurator = normalizedRole === 'configurator' || normalizedRole === 'configurador';
  const isSeller = ['vendedor', 'seller', 'admin', 'configurator', 'configurador'].includes(normalizedRole);

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
