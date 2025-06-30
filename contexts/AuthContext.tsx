import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user data
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  user_metadata: { username: 'Demo User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as User;

const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER,
} as Session;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    return url && key && 
           url !== 'https://placeholder.supabase.co' && 
           key !== 'placeholder-anon-key';
  };

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
          setIsDemoMode(false);
        } else {
          // Check if we're in demo mode from localStorage
          const demoMode = localStorage.getItem('zenroute-demo-mode');
          if (demoMode === 'true') {
            setSession(DEMO_SESSION);
            setUser(DEMO_USER);
            setIsDemoMode(true);
          }
        }
      } catch (error) {
        console.warn('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener only if Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsDemoMode(false);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check for demo credentials
      if (email === 'demo@example.com' && password === 'demo123') {
        setSession(DEMO_SESSION);
        setUser(DEMO_USER);
        setIsDemoMode(true);
        localStorage.setItem('zenroute-demo-mode', 'true');
        return { error: null };
      }

      if (!isSupabaseConfigured()) {
        return { 
          error: { 
            message: 'Supabase is not configured. Use demo@example.com / demo123 for demo mode.' 
          } 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return { 
          error: { 
            message: 'Supabase is not configured. Use demo@example.com / demo123 for demo mode.' 
          } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create profile if sign up was successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username,
              email,
            },
          ]);

        if (profileError) {
          console.warn('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if (isDemoMode) {
        setSession(null);
        setUser(null);
        setIsDemoMode(false);
        localStorage.removeItem('zenroute-demo-mode');
        return;
      }

      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}