import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, Check, Clock, X, GripVertical } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  category: { name: string; color: string } | undefined;
  onStatusChange: (todoId: string, status: Todo['status']) => void;
  onDelete: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
  viewMode: 'basic' | 'detailed';
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  category,
  onStatusChange,
  onDelete,
  onEdit,
  viewMode,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const getStatusIcon = () => {
    switch (todo.status) {
      case 'loading':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'unchecked':
        return <div className="h-4 w-4 rounded border-2 border-slate-400" />;
      case 'checked':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (todo.status) {
      case 'loading':
        return 'border-yellow-400/30 bg-yellow-400/10';
      case 'unchecked':
        return 'border-slate-400/30 bg-slate-400/10';
      case 'checked':
        return 'border-green-400/30 bg-green-400/10';
      case 'cancelled':
        return 'border-red-400/30 bg-red-400/10';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return '';
    const dateStr = new Date(date).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
    return time ? `${dateStr} ${time}` : dateStr;
  };

  const cycleStatus = () => {
    const statusCycle: Todo['status'][] = ['unchecked', 'loading', 'checked'];
    const currentIndex = statusCycle.indexOf(todo.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    onStatusChange(todo.id, statusCycle[nextIndex]);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-200 ${getStatusColor()} ${
        isDragging ? 'z-50 shadow-lg scale-105' : ''
      } py-3 gap-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="px-3">
        <div className="flex items-start gap-3">
        {/* 드래그 핸들 - 조건부 렌더링 */}
        {isHovered && (
          <button
            className="mt-0.5 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        
        {/* 상태 아이콘 */}
        <button
          onClick={cycleStatus}
          className="mt-0.5 hover:scale-110 transition-transform"
        >
          {getStatusIcon()}
        </button>

        {/* 할일 내용 */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit(todo)}
        >
          <h4 
            className={`font-medium text-white hover:text-blue-300 transition-colors ${
              todo.status === 'checked' ? 'line-through opacity-60' : ''
            } ${todo.status === 'cancelled' ? 'line-through opacity-40' : ''}`}
          >
            {todo.title}
          </h4>
          
          {/* 기본 보기: 카테고리만 */}
          {viewMode === 'basic' && (
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <Badge
                  className="text-white border-0"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </Badge>
              )}
            </div>
          )}

          {/* 자세히 보기: 모든 정보 */}
          {viewMode === 'detailed' && (
            <div className="space-y-1 mt-2">
              {/* 상태 표시 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">상태:</span>
                <Badge variant={todo.status === 'checked' ? 'default' : todo.status === 'cancelled' ? 'destructive' : 'secondary'}>
                  {todo.status === 'checked' ? '완료' :
                   todo.status === 'loading' ? '진행중' :
                   todo.status === 'cancelled' ? '취소됨' : '미완료'}
                </Badge>
              </div>

              {/* 카테고리 */}
              {category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">카테고리:</span>
                  <Badge
                    className="text-white border-0"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </Badge>
                </div>
              )}

              {/* 마감 일시 */}
              {(todo.dueDate || todo.dueTime) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">마감일시:</span>
                  <span className="text-xs text-white">
                    {formatDateTime(todo.dueDate, todo.dueTime)}
                  </span>
                </div>
              )}

              {/* 완료한 시간 */}
              {todo.status === 'checked' && todo.completedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">완료시간:</span>
                  <span className="text-xs text-green-400">
                    {new Date(todo.completedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              )}

              {/* 설명 */}
              {todo.description && (
                <div>
                  <span className="text-xs text-slate-400">메모:</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {todo.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </CardContent>

      {/* 호버 시 액션 버튼 */}
      {isHovered && (
        <div className="absolute right-2 top-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusChange(todo.id, 'cancelled')}
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/20"
            title="취소"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(todo.id)}
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/20"
            title="삭제"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Card>
  );
};