import { useState, useEffect } from 'react';
import type { Todo, Category } from '@/types/todo';
import { defaultCategories } from '@/types/todo';

const TODOS_STORAGE_KEY = 'todolist-todos';
const CATEGORIES_STORAGE_KEY = 'todolist-categories';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('할일 데이터 로드 실패:', error);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('카테고리 데이터 로드 실패:', error);
        setCategories(defaultCategories);
      }
    }
  }, []);

  // 할일 추가
  const addTodo = (todoData: Omit<Todo, 'id' | 'status' | 'createdAt' | 'order'>) => {
    console.log('addTodo 호출됨:', todoData);
    const dayTodos = todos.filter(todo => todo.day === todoData.day);
    const maxOrder = dayTodos.length > 0 ? Math.max(...dayTodos.map(t => t.order)) : -1;
    
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'unchecked',
      createdAt: new Date().toISOString(),
      order: maxOrder + 1,
    };

    console.log('새로운 할일:', newTodo);
    const updatedTodos = [...todos, newTodo];
    console.log('업데이트된 할일 목록:', updatedTodos);
    setTodos(updatedTodos);
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
    console.log('localStorage 저장 완료');
  };

  // 할일 상태 변경
  const updateTodoStatus = (todoId: string, status: Todo['status']) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const updated = { 
          ...todo, 
          status,
          completedAt: status === 'checked' ? new Date().toISOString() : undefined
        };
        return updated;
      }
      return todo;
    });

    setTodos(updatedTodos);
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  // 할일 삭제
  const deleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    setTodos(updatedTodos);
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  // 할일 수정
  const updateTodo = (todoId: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        return { ...todo, ...updates };
      }
      return todo;
    });

    setTodos(updatedTodos);
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  // 특정 날짜의 할일 가져오기
  const getTodosByDay = (day: string) => {
    return todos.filter(todo => todo.day === day).sort((a, b) => {
      // 먼저 order로 정렬
      return a.order - b.order;
    });
  };

  // 할일 순서 변경
  const reorderTodos = (day: string, activeId: string, overId: string) => {
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
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(allTodos));
  };

  // 카테고리 정보 가져오기
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // 카테고리 추가
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
  };

  // 카테고리 수정
  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, ...updates };
      }
      return category;
    });

    setCategories(updatedCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
  };

  // 카테고리 삭제
  const deleteCategory = (categoryId: string) => {
    // 해당 카테고리를 사용하는 할일들은 기본 카테고리로 변경
    const updatedTodos = todos.map(todo => 
      todo.categoryId === categoryId 
        ? { ...todo, categoryId: defaultCategories[0].id }
        : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));

    // 카테고리 삭제
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
  };

  return {
    todos,
    categories,
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
  };
};