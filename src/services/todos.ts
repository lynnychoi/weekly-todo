import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Todo = Database['public']['Tables']['todos']['Row']
type TodoInsert = Database['public']['Tables']['todos']['Insert']
type TodoUpdate = Database['public']['Tables']['todos']['Update']
type Category = Database['public']['Tables']['categories']['Row']

export class TodoService {
  // 사용자의 모든 할일 조회
  static async getTodos(userId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error(`할일 조회 실패: ${error.message}`)
    }

    return data || []
  }

  // 특정 날짜의 할일 조회
  static async getTodosByDay(userId: string, day: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('day', day)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error(`일별 할일 조회 실패: ${error.message}`)
    }

    return data || []
  }

  // 할일 추가
  static async addTodo(userId: string, todoData: Omit<TodoInsert, 'user_id' | 'id'>): Promise<Todo> {
    // 해당 날짜의 최대 order_index 구하기
    const { data: existingTodos } = await supabase
      .from('todos')
      .select('order_index')
      .eq('user_id', userId)
      .eq('day', todoData.day)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = existingTodos && existingTodos.length > 0 
      ? existingTodos[0].order_index 
      : -1

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todoData,
        user_id: userId,
        order_index: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`할일 추가 실패: ${error.message}`)
    }

    return data
  }

  // 할일 상태 업데이트
  static async updateTodoStatus(userId: string, todoId: string, status: 'unchecked' | 'checked'): Promise<Todo> {
    const updateData: TodoUpdate = {
      status,
      completed_at: status === 'checked' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', todoId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`할일 상태 업데이트 실패: ${error.message}`)
    }

    return data
  }

  // 할일 수정
  static async updateTodo(userId: string, todoId: string, updates: Partial<TodoUpdate>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`할일 수정 실패: ${error.message}`)
    }

    return data
  }

  // 할일 삭제
  static async deleteTodo(userId: string, todoId: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`할일 삭제 실패: ${error.message}`)
    }
  }

  // 할일 순서 변경
  static async reorderTodos(userId: string, day: string, todoIds: string[]): Promise<void> {
    const updates = todoIds.map((id, index) => ({
      id,
      user_id: userId,
      order_index: index,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('todos')
      .upsert(updates)

    if (error) {
      throw new Error(`할일 순서 변경 실패: ${error.message}`)
    }
  }

  // 사용자의 카테고리 조회
  static async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`카테고리 조회 실패: ${error.message}`)
    }

    return data || []
  }

  // 카테고리 추가
  static async addCategory(userId: string, categoryData: Omit<Database['public']['Tables']['categories']['Insert'], 'user_id' | 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`카테고리 추가 실패: ${error.message}`)
    }

    return data
  }

  // 카테고리 수정
  static async updateCategory(userId: string, categoryId: string, updates: Partial<Database['public']['Tables']['categories']['Update']>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`카테고리 수정 실패: ${error.message}`)
    }

    return data
  }

  // 카테고리 삭제 (관련 할일들은 첫 번째 카테고리로 이동)
  static async deleteCategory(userId: string, categoryId: string): Promise<void> {
    // 첫 번째 카테고리 조회
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(2)

    if (!categories || categories.length < 2) {
      throw new Error('카테고리는 최소 1개 이상 있어야 합니다.')
    }

    const defaultCategoryId = categories.find(cat => cat.id !== categoryId)?.id

    // 해당 카테고리를 사용하는 할일들을 기본 카테고리로 변경
    await supabase
      .from('todos')
      .update({ category_id: defaultCategoryId })
      .eq('user_id', userId)
      .eq('category_id', categoryId)

    // 카테고리 삭제
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`카테고리 삭제 실패: ${error.message}`)
    }
  }
}