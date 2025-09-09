import { useState, useEffect } from 'react';
import type { User, LoginData, SignupData } from '@/types/user';

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

  // 로그인 (임시로 로컬스토리지 사용)
  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      // 임시: 로컬스토리지에서 사용자 확인
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => 
        u.email === loginData.email && u.password === loginData.password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          createdAt: foundUser.createdAt
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (onUserLogin) {
          onUserLogin(foundUser.id);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // 회원가입 (임시로 로컬스토리지 사용)
  const signup = async (signupData: SignupData): Promise<boolean> => {
    try {
      // 4자리 숫자 비밀번호 검증
      if (!/^\d{4}$/.test(signupData.password)) {
        throw new Error('비밀번호는 4자리 숫자여야 합니다.');
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
      }

      // 임시: 로컬스토리지에 사용자 저장
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 이메일 중복 확인
      if (users.some((u: any) => u.email === signupData.email)) {
        throw new Error('이미 등록된 이메일입니다.');
      }

      const newUser = {
        id: Date.now().toString(),
        email: signupData.email,
        name: signupData.name,
        password: signupData.password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (onUserLogin) {
        onUserLogin(newUser.id);
      }
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
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