-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Categories belong to user" ON categories;  
DROP POLICY IF EXISTS "Todos belong to user" ON todos;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블  
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 할일 테이블
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  day TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unchecked',
  priority TEXT NOT NULL DEFAULT 'medium',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 기본 카테고리 생성 함수
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon) VALUES 
    (user_uuid, '일반', '#6366f1', '📝'),
    (user_uuid, '업무', '#ef4444', '💼'),
    (user_uuid, '개인', '#10b981', '🏠'),
    (user_uuid, '학습', '#f59e0b', '📚');
END;
$$ LANGUAGE plpgsql;

-- RLS 비활성화 (자체 인증 시스템 사용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- 또는 모든 사용자가 접근 가능하도록 설정
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;  
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all access" ON users FOR ALL USING (true);
-- CREATE POLICY "Allow all access" ON categories FOR ALL USING (true);
-- CREATE POLICY "Allow all access" ON todos FOR ALL USING (true);