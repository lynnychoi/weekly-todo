// 간단한 인증 테스트
import { supabase } from './src/lib/supabase.js';

console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
console.log('Testing Supabase connection...');

// 테이블 존재 확인
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Users table accessible:', data !== null);
    
    // 테스트 회원가입
    console.log('\n🔄 Testing signup...');
    
    const testData = {
      email: 'test@test.com',
      name: 'Test User',
      password_hash: '$2a$10$test.hash.here'
    };
    
    const { data: newUser, error: signupError } = await supabase
      .from('users')
      .insert(testData)
      .select()
      .single();
      
    if (signupError) {
      console.error('❌ Signup test failed:', signupError);
    } else {
      console.log('✅ Signup test successful:', newUser);
      
      // 테스트 사용자 삭제
      await supabase.from('users').delete().eq('email', 'test@test.com');
      console.log('🗑️ Test user deleted');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();