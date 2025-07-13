import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  fullName: string;
  walletBalance: number;
  isAdmin: boolean;
  dailyAccessGrantedUntil?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateWallet: (amount: number) => void;
  grantDailyAccess: () => void;
  hasDailyAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cache for user profiles to avoid repeated database calls
const userProfileCache = new Map<string, User>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    // Check cache first
    if (userProfileCache.has(userId)) {
      return userProfileCache.get(userId) || null;
    }

    try {
      // Parallel queries for better performance
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
      ]);

      const profile = profileResult.data;
      const roles = rolesResult.data;
      const isAdmin = roles?.some(r => r.role === 'admin') || false;

      if (profile) {
        const userProfile = {
          id: profile.id,
          email: session?.user?.email || '',
          fullName: profile.username || profile.email || '',
          walletBalance: Number(profile.wallet_balance),
          isAdmin,
          dailyAccessGrantedUntil: profile.daily_access_granted_until
        };

        // Cache the result
        userProfileCache.set(userId, userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(userProfile);
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session with timeout
    const sessionCheck = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(userProfile);
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout

    sessionCheck();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [fetchUserProfile, isLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      // Set minimal user state immediately for fast UI feedback
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email || '',
          walletBalance: 0,
          isAdmin: false,
        });
        // Fetch full profile in background
        fetchUserProfile(data.user.id).then((profile) => {
          if (profile) setUser(profile);
        });
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });
      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }
      // Attempt to log in immediately after signup
      const loginSuccess = await login(email, password);
      if (!loginSuccess) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    // Clear cache on logout
    if (user) {
      userProfileCache.delete(user.id);
    }
    await supabase.auth.signOut();
  };

  const updateWallet = async (amount: number) => {
    if (user) {
      const newBalance = user.walletBalance + amount;
      
      // Optimistic update
      setUser({ ...user, walletBalance: newBalance });
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (!error) {
        // Update cache
        userProfileCache.set(user.id, { ...user, walletBalance: newBalance });
        
        // Add transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: amount > 0 ? 'deposit' : 'bet',
            amount: Math.abs(amount),
            description: amount > 0 ? 'Wallet deposit' : 'Bet placed'
          });
      } else {
        // Revert optimistic update on error
        setUser({ ...user, walletBalance: user.walletBalance });
      }
    }
  };

  const grantDailyAccess = async () => {
    if (user) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const newBalance = user.walletBalance - 500;
      
      // Optimistic update
      setUser({ 
        ...user, 
        dailyAccessGrantedUntil: tomorrow.toISOString(),
        walletBalance: newBalance
      });
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          daily_access_granted_until: tomorrow.toISOString(),
          wallet_balance: newBalance
        })
        .eq('id', user.id);

      if (!error) {
        // Update cache
        userProfileCache.set(user.id, { 
          ...user, 
          dailyAccessGrantedUntil: tomorrow.toISOString(),
          walletBalance: newBalance
        });
        
        // Add transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'subscription',
            amount: 500,
            description: 'Daily subscription fee'
          });
      } else {
        // Revert optimistic update on error
        setUser({ ...user, walletBalance: user.walletBalance });
      }
    }
  };

  const hasDailyAccess = (): boolean => {
    if (!user?.dailyAccessGrantedUntil) return false;
    return new Date() < new Date(user.dailyAccessGrantedUntil);
  };

  // Show loading only for a short time
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateWallet, 
      grantDailyAccess, 
      hasDailyAccess 
    }}>
      {user ? children : <AuthPrompt />}
    </AuthContext.Provider>
  );
};

const AuthPrompt: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">⚽ BetWise</h1>
          <p className="text-muted-foreground">Your trusted football betting partner</p>
        </div>
        
        {isLogin ? <LoginForm /> : <SignupForm />}
        
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};