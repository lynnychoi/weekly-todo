export interface Todo {
  id: string;
  title: string;
  categoryId: string;
  dueDate: string;
  dueTime: string;
  description: string;
  day: string;
  status: 'loading' | 'unchecked' | 'checked' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const defaultCategories: Category[] = [
  { id: '1', name: '개인', color: '#ef4444' },
  { id: '2', name: '업무', color: '#3b82f6' },
  { id: '3', name: '학습', color: '#10b981' },
  { id: '4', name: '운동', color: '#f59e0b' },
  { id: '5', name: '취미', color: '#8b5cf6' },
];