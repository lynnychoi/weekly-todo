import { supabase } from '@/lib/supabase'

// 간단한 Supabase 연결 테스트
export const testSupabaseConnection = async () => {
  console.log('🧪 Starting Supabase connection tests...')
  
  try {
    // 1. 간단한 쿼리 테스트
    console.log('1️⃣ Testing basic query...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('version')
    
    if (tablesError) {
      console.error('❌ Basic query failed:', tablesError)
    } else {
      console.log('✅ Basic query successful:', tables)
    }

    // 2. users 테이블 접근 테스트
    console.log('2️⃣ Testing users table access...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table access failed:', usersError)
      
      // 3. 대안: REST API 직접 호출 테스트
      console.log('3️⃣ Testing direct REST API call...')
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🌐 Direct API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      const text = await response.text()
      console.log('📄 Response body:', text)
      
    } else {
      console.log('✅ Users table access successful:', usersData)
    }
    
  } catch (err) {
    console.error('💥 Test crashed:', err)
  }
}

// 컴포넌트에서 사용할 수 있도록 export
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection
}