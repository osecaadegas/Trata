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
  const [userRole, setUserRole] = useState('user'); // default role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserWithRole(session.user);
        
        // Clean up URL hash after successful login
        if (event === 'SIGNED_IN' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setUser(null);
        setUserRole('user');
      }
      setLoading(false);
    });

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

        setUserRole(newUser?.role || 'user');
      } else if (userData) {
        setUserRole(userData.role || 'user');
      }

      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || authUser.email,
        email: authUser.email,
        picture: authUser.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${authUser.email}`
      });
    } catch (error) {
      console.error('Error loading user role:', error);
      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || authUser.email,
        email: authUser.email,
        picture: authUser.user_metadata.avatar_url
      });
      setUserRole('user');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('user');
  };

  const value = {
    user,
    userRole,
    loading,
    logout,
    isAdmin: userRole === 'admin' || userRole === 'configurator',
    isConfigurator: userRole === 'configurator',
    isSeller: userRole === 'seller' || userRole === 'admin' || userRole === 'configurator',
    refreshUser: checkUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
