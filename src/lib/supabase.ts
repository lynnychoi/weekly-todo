import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          day: string
          status: 'unchecked' | 'checked'
          priority: 'low' | 'medium' | 'high'
          order_index: number
          created_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          day: string
          status?: 'unchecked' | 'checked'
          priority?: 'low' | 'medium' | 'high'
          order_index?: number
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          day?: string
          status?: 'unchecked' | 'checked'
          priority?: 'low' | 'medium' | 'high'
          order_index?: number
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
    }
  }
}