// Supabase Database 타입을 재export
export type { Database } from '@/lib/supabase';

// Auth 관련 타입들을 재export
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  name: string;
  password: string;
}

// User 타입 정의
export type User = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};