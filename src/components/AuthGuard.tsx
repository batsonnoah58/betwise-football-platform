import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';

// User type
export interface User {
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
  logout: () => Promise<void>;
  updateWallet: (amount: number) => Promise<void>;
  grantDailyAccess: () => Promise<void>;
  hasDailyAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AuthProvider] Render start');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from DB
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    console.log('[AuthProvider] fetchUserProfile called with userId:', userId);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('[AuthProvider] profiles query result:', { profile, profileError });
      if (!profile) console.warn('[AuthProvider] profile is null or undefined!');
      if (profileError) console.error('[AuthProvider] profileError:', profileError);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      console.log('[AuthProvider] user_roles query result:', { roles, rolesError });
      if (!roles) console.warn('[AuthProvider] roles is null or undefined!');
      if (rolesError) console.error('[AuthProvider] rolesError:', rolesError);
      const isAdmin = roles?.some(r => r.role === 'admin') || false;
      if (profile) {
        console.log('[AuthProvider] Profile loaded:', profile);
        return {
          id: profile.id,
          email: profile.email || '',
          fullName: profile.username || profile.email || '',
          walletBalance: Number(profile.wallet_balance),
          isAdmin,
          dailyAccessGrantedUntil: profile.daily_access_granted_until,
        };
      }
      return null;
    } catch (error) {
      console.error('[AuthProvider] Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    console.log('[AuthProvider] useEffect (restore session)');
    let mounted = true;
    const restore = async () => {
      setIsLoading(true);
      console.log('[AuthProvider] Calling supabase.auth.getSession()');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('[AuthProvider] getSession error:', error);
      console.log('[AuthProvider] Session:', session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      setIsLoading(false);
      console.log('[AuthProvider] setIsLoading(false) called');
    };
    restore();
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] onAuthStateChange:', event, session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      if (data?.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Signup
  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) return false;
      // Try to login immediately
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Update wallet
  const updateWallet = async (amount: number) => {
    if (!user) return;
    const newBalance = user.walletBalance + amount;
    await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
    setUser({ ...user, walletBalance: newBalance });
  };

  // Grant daily access
  const grantDailyAccess = async () => {
    if (!user) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await supabase.from('profiles').update({ daily_access_granted_until: tomorrow.toISOString() }).eq('id', user.id);
    setUser({ ...user, dailyAccessGrantedUntil: tomorrow.toISOString() });
  };

  // Check daily access
  const hasDailyAccess = () => {
    if (!user?.dailyAccessGrantedUntil) return false;
    return new Date() < new Date(user.dailyAccessGrantedUntil);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateWallet, grantDailyAccess, hasDailyAccess }}>
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