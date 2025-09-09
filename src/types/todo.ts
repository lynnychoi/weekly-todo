export interface Todo {
  id: string;
  title: string;
  categoryId: string;
  dueDate?: string; // 선택적 필드로 변경
  dueTime?: string; // 선택적 필드로 변경
  description: string;
  day: string;
  status: 'loading' | 'unchecked' | 'checked' | 'cancelled'; // UI 상태 포함
  priority: 'low' | 'medium' | 'high'; // 추가
  createdAt: string;
  completedAt?: string;
  order: number;
}

// 데이터베이스 전용 상태 타입
export type DbTodoStatus = 'unchecked' | 'checked';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // 추가
}

export const defaultCategories: Category[] = [
  { id: '1', name: '일반', color: '#6366f1', icon: '📝' },
  { id: '2', name: '업무', color: '#ef4444', icon: '💼' },
  { id: '3', name: '개인', color: '#10b981', icon: '🏠' },
  { id: '4', name: '학습', color: '#f59e0b', icon: '📚' },
];