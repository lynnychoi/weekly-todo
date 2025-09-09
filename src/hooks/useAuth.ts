import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  name: string;
  password: string;
}

export const useAuth = (onUserLogin?: (userId: string) => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬스토리지에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 로그인 (Supabase 사용)
  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await AuthService.login(loginData);
      
      // 비밀번호 해시 제거 후 저장
      const userForStorage = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      if (onUserLogin) {
        onUserLogin(userData.id);
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 (Supabase 사용)
  const signup = async (signupData: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await AuthService.signup(signupData);
      
      // 비밀번호 해시 제거 후 저장
      const userForStorage = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      if (onUserLogin) {
        onUserLogin(userData.id);
      }
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
};