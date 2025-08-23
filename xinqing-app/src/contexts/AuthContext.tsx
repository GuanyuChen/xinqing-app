import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseStorage';

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('获取会话失败:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 处理不同的认证事件
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ 用户已登录:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('👋 用户已登出');
            break;
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token 已刷新');
            break;
          case 'USER_UPDATED':
            console.log('👤 用户信息已更新');
            break;
        }
      }
    );

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google 登录
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('🚀 Google 登录流程启动');
    } catch (error) {
      console.error('Google 登录失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      console.log('✅ 用户已登出');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 认证 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};