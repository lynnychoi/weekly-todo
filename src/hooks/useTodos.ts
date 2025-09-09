import { useState, useEffect, useCallback } from 'react';
import { TodoService } from '@/services/todos';
import type { Database } from '@/lib/supabase';
import type { Todo, Category } from '@/types/todo';
import { defaultCategories } from '@/types/todo';

type DbTodo = Database['public']['Tables']['todos']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];

// 데이터베이스 Todo를 앱 Todo로 변환
const mapDbTodoToAppTodo = (dbTodo: DbTodo): Todo => ({
  id: dbTodo.id,
  title: dbTodo.title,
  description: dbTodo.description || '',
  categoryId: dbTodo.category_id || '',
  day: dbTodo.day,
  status: dbTodo.status as 'unchecked' | 'checked',
  priority: dbTodo.priority as 'low' | 'medium' | 'high',
  order: dbTodo.order_index,
  createdAt: dbTodo.created_at,
  completedAt: dbTodo.completed_at || undefined,
});

// 앱 Todo를 데이터베이스 Todo로 변환 
const mapAppTodoToDbTodo = (appTodo: Omit<Todo, 'id' | 'createdAt'>) => ({
  title: appTodo.title,
  description: appTodo.description || null,
  category_id: appTodo.categoryId || null,
  day: appTodo.day,
  status: appTodo.status,
  priority: appTodo.priority,
  order_index: appTodo.order,
});

// 데이터베이스 Category를 앱 Category로 변환
const mapDbCategoryToAppCategory = (dbCategory: DbCategory): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  color: dbCategory.color,
  icon: dbCategory.icon,
});

const GUEST_TODOS_KEY = 'todolist-guest-todos';
const GUEST_CATEGORIES_KEY = 'todolist-guest-categories';

export const useTodos = (userId?: string) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      try {
        const savedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const savedCategories = localStorage.getItem(GUEST_CATEGORIES_KEY);

        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        } else {
          setTodos([]);
        }

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('게스트 데이터 로드 실패:', error);
        setTodos([]);
        setCategories(defaultCategories);
      }
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      setIsLoading(true);
      
      const [dbTodos, dbCategories] = await Promise.all([
        TodoService.getTodos(userId),
        TodoService.getCategories(userId)
      ]);

      const appTodos = dbTodos.map(mapDbTodoToAppTodo);
      const appCategories = dbCategories.map(mapDbCategoryToAppCategory);

      setTodos(appTodos);
      setCategories(appCategories.length > 0 ? appCategories : defaultCategories);
    } catch (error) {
      console.error('Supabase 데이터 로드 실패:', error);
      setTodos([]);
      setCategories(defaultCategories);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 게스트 데이터를 Supabase로 이전
  const transferGuestDataToUser = useCallback(async (newUserId: string) => {
    try {
      const guestTodos = localStorage.getItem(GUEST_TODOS_KEY);
      const guestCategories = localStorage.getItem(GUEST_CATEGORIES_KEY);

      if (!guestTodos && !guestCategories) {
        return; // 이전할 데이터가 없음
      }

      setIsLoading(true);

      // 게스트 카테고리를 Supabase에 추가
      if (guestCategories) {
        const parsedCategories: Category[] = JSON.parse(guestCategories);
        for (const category of parsedCategories) {
          if (!defaultCategories.find(dc => dc.id === category.id)) {
            // 기본 카테고리가 아닌 경우만 추가
            await TodoService.addCategory(newUserId, {
              name: category.name,
              color: category.color,
              icon: category.icon,
            });
          }
        }
      }

      // 게스트 할일을 Supabase에 추가
      if (guestTodos) {
        const parsedTodos: Todo[] = JSON.parse(guestTodos);
        for (const todo of parsedTodos) {
          const dbTodoData = mapAppTodoToDbTodo(todo);
          await TodoService.addTodo(newUserId, dbTodoData);
        }
      }

      // 게스트 데이터 삭제
      localStorage.removeItem(GUEST_TODOS_KEY);
      localStorage.removeItem(GUEST_CATEGORIES_KEY);

      // 데이터 다시 로드
      await loadData();

      console.log(`게스트 데이터를 사용자 ${newUserId}에게 이전 완료`);
    } catch (error) {
      console.error('게스트 데이터 이전 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // 사용자 변경 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 할일 추가
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'status' | 'createdAt' | 'order'>) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const dayTodos = todos.filter(todo => todo.day === todoData.day);
      const maxOrder = dayTodos.length > 0 ? Math.max(...dayTodos.map(t => t.order)) : -1;
      
      const newTodo: Todo = {
        ...todoData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        status: 'unchecked',
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
      };

      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(updatedTodos));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const dbTodoData = mapAppTodoToDbTodo({ ...todoData, status: 'unchecked', order: 0 });
      const dbTodo = await TodoService.addTodo(userId, dbTodoData);
      const newTodo = mapDbTodoToAppTodo(dbTodo);
      
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('할일 추가 실패:', error);
    }
  }, [userId, todos]);

  // 할일 상태 변경
  const updateTodoStatus = useCallback(async (todoId: string, status: Todo['status']) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const updatedTodos = todos.map(todo => {
        if (todo.id === todoId) {
          return { 
            ...todo, 
            status,
            completedAt: status === 'checked' ? new Date().toISOString() : undefined
          };
        }
        return todo;
      });

      setTodos(updatedTodos);
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(updatedTodos));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const dbTodo = await TodoService.updateTodoStatus(userId, todoId, status);
      const updatedTodo = mapDbTodoToAppTodo(dbTodo);
      
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('할일 상태 업데이트 실패:', error);
    }
  }, [userId, todos]);

  // 할일 삭제
  const deleteTodo = useCallback(async (todoId: string) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(updatedTodos));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      await TodoService.deleteTodo(userId, todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('할일 삭제 실패:', error);
    }
  }, [userId, todos]);

  // 할일 수정
  const updateTodo = useCallback(async (todoId: string, updates: Partial<Todo>) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const updatedTodos = todos.map(todo => {
        if (todo.id === todoId) {
          return { ...todo, ...updates };
        }
        return todo;
      });

      setTodos(updatedTodos);
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(updatedTodos));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const dbUpdates = {
        title: updates.title,
        description: updates.description || null,
        category_id: updates.categoryId || null,
        day: updates.day,
        status: updates.status,
        priority: updates.priority,
        order_index: updates.order,
      };

      const dbTodo = await TodoService.updateTodo(userId, todoId, dbUpdates);
      const updatedTodo = mapDbTodoToAppTodo(dbTodo);
      
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('할일 수정 실패:', error);
    }
  }, [userId, todos]);

  // 특정 날짜의 할일 가져오기
  const getTodosByDay = useCallback((day: string) => {
    return todos.filter(todo => todo.day === day).sort((a, b) => a.order - b.order);
  }, [todos]);

  // 할일 순서 변경
  const reorderTodos = useCallback(async (day: string, activeId: string, overId: string) => {
    const dayTodos = todos.filter(todo => todo.day === day);
    const otherTodos = todos.filter(todo => todo.day !== day);
    
    const activeIndex = dayTodos.findIndex(todo => todo.id === activeId);
    const overIndex = dayTodos.findIndex(todo => todo.id === overId);
    
    if (activeIndex === -1 || overIndex === -1) return;
    
    const reorderedTodos = [...dayTodos];
    const [removed] = reorderedTodos.splice(activeIndex, 1);
    reorderedTodos.splice(overIndex, 0, removed);
    
    // order 재정렬
    const updatedDayTodos = reorderedTodos.map((todo, index) => ({
      ...todo,
      order: index
    }));
    
    const allTodos = [...otherTodos, ...updatedDayTodos];
    setTodos(allTodos);

    if (!userId) {
      // 게스트 모드: localStorage 사용
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(allTodos));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const todoIds = updatedDayTodos.map(todo => todo.id);
      await TodoService.reorderTodos(userId, day, todoIds);
    } catch (error) {
      console.error('할일 순서 변경 실패:', error);
    }
  }, [todos, userId]);

  // 카테고리 정보 가져오기
  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  // 카테고리 추가
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem(GUEST_CATEGORIES_KEY, JSON.stringify(updatedCategories));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const dbCategory = await TodoService.addCategory(userId, categoryData);
      const newCategory = mapDbCategoryToAppCategory(dbCategory);
      
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
    }
  }, [userId, categories]);

  // 카테고리 수정
  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return { ...category, ...updates };
        }
        return category;
      });

      setCategories(updatedCategories);
      localStorage.setItem(GUEST_CATEGORIES_KEY, JSON.stringify(updatedCategories));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      const dbCategory = await TodoService.updateCategory(userId, categoryId, updates);
      const updatedCategory = mapDbCategoryToAppCategory(dbCategory);
      
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updatedCategory : category
      ));
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
    }
  }, [userId, categories]);

  // 카테고리 삭제
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!userId) {
      // 게스트 모드: localStorage 사용
      const updatedTodos = todos.map(todo => 
        todo.categoryId === categoryId 
          ? { ...todo, categoryId: defaultCategories[0].id }
          : todo
      );
      setTodos(updatedTodos);
      localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(updatedTodos));

      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      localStorage.setItem(GUEST_CATEGORIES_KEY, JSON.stringify(updatedCategories));
      return;
    }

    // 로그인 모드: Supabase 사용
    try {
      await TodoService.deleteCategory(userId, categoryId);
      
      // 로컬 상태 업데이트
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // 해당 카테고리를 사용하는 할일들 업데이트는 서버에서 처리됨
      await loadData(); // 데이터 다시 로드
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
    }
  }, [userId, todos, categories, loadData]);

  return {
    todos,
    categories,
    isLoading,
    addTodo,
    updateTodoStatus,
    deleteTodo,
    updateTodo,
    getTodosByDay,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderTodos,
    transferGuestDataToUser,
  };
};