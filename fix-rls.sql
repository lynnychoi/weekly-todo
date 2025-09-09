-- 1단계: 모든 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Categories belong to user" ON categories;
DROP POLICY IF EXISTS "Todos belong to user" ON todos;

-- 2단계: RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- 3단계: 테이블 접근 권한 확인
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON todos TO anon, authenticated;

-- 4단계: 시퀀스 권한 (UUID 생성용)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;