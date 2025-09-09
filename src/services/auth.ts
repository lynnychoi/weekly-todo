import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

type User = Database['public']['Tables']['users']['Row']

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  email: string
  name: string
  password: string
}

export class AuthService {
  // 회원가입
  static async signup(data: SignupData): Promise<User> {
    console.log('🔍 Attempting signup for:', data.email)
    console.log('🌐 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    
    // 4자리 숫자 비밀번호 검증
    if (!/^\d{4}$/.test(data.password)) {
      throw new Error('비밀번호는 4자리 숫자여야 합니다.')
    }

    // 이메일 중복 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single()

    console.log('📡 Duplicate check response:', { existingUser, checkError })

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Database error during duplicate check:', checkError)
      throw new Error(`데이터베이스 오류: ${checkError.message}`)
    }

    if (existingUser) {
      throw new Error('이미 등록된 이메일입니다.')
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(data.password, 10)

    // 사용자 생성
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        name: data.name,
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`회원가입 실패: ${error.message}`)
    }

    // 기본 카테고리 생성
    await this.createDefaultCategories(newUser.id)

    return newUser
  }

  // 로그인
  static async login(data: LoginData): Promise<User> {
    console.log('🔍 Attempting login for:', data.email)
    console.log('🌐 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single()

    console.log('📡 Supabase response:', { user, error })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }
    
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(data.password, user.password_hash)
    
    if (!isValidPassword) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    return user
  }

  // 기본 카테고리 생성
  private static async createDefaultCategories(userId: string): Promise<void> {
    const { error } = await supabase.rpc('create_default_categories', {
      user_uuid: userId
    })

    if (error) {
      console.error('기본 카테고리 생성 실패:', error)
    }
  }

  // 사용자 정보 조회
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  }
}