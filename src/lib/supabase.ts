import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // 자체 인증 시스템이므로 Supabase 세션 비활성화
  }
})

// 테스트 연결
supabase.from('users').select('count').limit(1).then(({ error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error)
  } else {
    console.log('✅ Supabase connection test successful')
  }
})

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