import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AddTodoModal } from '@/components/AddTodoModal';
import { EditTodoModal } from '@/components/EditTodoModal';
import { CategoryManageModal } from '@/components/CategoryManageModal';
import { TodoItem } from '@/components/TodoItem';
import { WeekNavigation } from '@/components/WeekNavigation';
import { WeeklySummary } from '@/components/WeeklySummary';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/types/todo';

function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek;
  });
  const [viewMode, setViewMode] = useState<'basic' | 'detailed'>('basic');
  
  const { 
    todos,
    addTodo, 
    updateTodo,
    updateTodoStatus, 
    deleteTodo, 
    getTodosByDay, 
    getCategoryById,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderTodos
  } = useTodos();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getDayColor = (day: string) => {
    const colors = {
      '이번 주에 할 일': 'from-purple-500 to-pink-500',
      '월': 'from-blue-500 to-cyan-500',
      '화': 'from-emerald-500 to-teal-500', 
      '수': 'from-amber-500 to-orange-500',
      '목': 'from-rose-500 to-pink-500',
      '금': 'from-indigo-500 to-purple-500',
      '토': 'from-green-500 to-emerald-500',
      '일': 'from-red-500 to-rose-500'
    };
    return colors[day as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const handleAddTodo = (day: string) => {
    setSelectedDay(day);
    setIsAddModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDay('');
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTodo(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // 드래그된 아이템이 속한 day 찾기
    let activeItem = getTodosByDay('이번 주에 할 일').find(todo => todo.id === active.id);
    
    if (!activeItem) {
      const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
      for (const day of days) {
        activeItem = getTodosByDay(`${day.charAt(0)}요일`).find(todo => todo.id === active.id);
        if (activeItem) break;
      }
    }

    if (!activeItem) return;

    reorderTodos(activeItem.day, active.id as string, over.id as string);
  };

  // 현재 주의 날짜들 계산
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              ✨ 할일 관리
            </h1>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            >
              <Settings className="h-4 w-4 mr-2" />
              카테고리 관리
            </Button>
          </div>
          <p className="text-slate-300 text-lg">오늘도 멋진 하루를 계획해보세요</p>
        </div>

        {/* 주간 네비게이션 */}
        <WeekNavigation
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* 주간 요약 */}
        <WeeklySummary
          todos={todos}
          categories={categories}
          getCategoryById={getCategoryById}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 이번 주에 할 일 */}
          <div className="group">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              {/* 그라데이션 테두리 효과 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getDayColor('이번 주에 할 일')} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">📋</span>
                  이번 주에 할 일
                </h2>
                {/* 할일 목록 */}
                <SortableContext 
                  items={getTodosByDay('이번 주에 할 일').map(todo => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 mb-4">
                    {getTodosByDay('이번 주에 할 일').map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        category={getCategoryById(todo.categoryId)}
                        onStatusChange={updateTodoStatus}
                        onDelete={deleteTodo}
                        onEdit={handleEditTodo}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                <button 
                  onClick={() => handleAddTodo('이번 주에 할 일')}
                  className="w-full text-left text-slate-300 hover:text-white py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 cursor-pointer active:scale-95">
                  <span className="text-lg">+</span> 새 할일 추가
                </button>
              </div>
            </div>
          </div>
          
          {/* 요일별 카드들 */}
          {[
            { day: '월', icon: '🌙' },
            { day: '화', icon: '🔥' },
            { day: '수', icon: '🌟' },
            { day: '목', icon: '🌳' },
            { day: '금', icon: '💫' },
            { day: '토', icon: '🎉' },
            { day: '일', icon: '☀️' }
          ].map(({ day, icon }, index) => (
            <div key={day} className="group">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                {/* 그라데이션 테두리 효과 */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getDayColor(day)} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-2">{icon}</span>
                    <div className="flex flex-col">
                      <span>{day}요일</span>
                      <span className="text-sm font-normal text-slate-300">
                        {weekDates[index].getMonth() + 1}/{weekDates[index].getDate()}
                      </span>
                    </div>
                  </h3>
                  
                  {/* 할일 목록 */}
                  <SortableContext 
                    items={getTodosByDay(`${day}요일`).map(todo => todo.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-4">
                      {getTodosByDay(`${day}요일`).map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          category={getCategoryById(todo.categoryId)}
                          onStatusChange={updateTodoStatus}
                          onDelete={deleteTodo}
                          onEdit={handleEditTodo}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  <button 
                    onClick={() => handleAddTodo(`${day}요일`)}
                    className="w-full text-left text-slate-300 hover:text-white py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 cursor-pointer active:scale-95">
                    <span className="text-lg">+</span> 새 할일 추가
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 하단 장식 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-slate-400">
            <span>✨</span>
            <span>오늘 할 일을 완료하고 성취감을 느껴보세요</span>
            <span>✨</span>
          </div>
        </div>
      </div>

      {/* 할일 추가 모달 */}
      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        selectedDay={selectedDay}
        categories={categories}
        onAddTodo={addTodo}
      />

      {/* 할일 수정 모달 */}
      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        todo={editingTodo}
        categories={categories}
        onUpdateTodo={updateTodo}
      />

      {/* 카테고리 관리 모달 */}
      <CategoryManageModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
      </div>
    </DndContext>
  )
}

export default App