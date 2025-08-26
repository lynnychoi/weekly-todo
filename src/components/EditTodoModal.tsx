import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Todo, Category } from '@/types/todo';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  categories: Category[];
  onUpdateTodo: (todoId: string, updates: Partial<Todo>) => void;
}

export const EditTodoModal: React.FC<EditTodoModalProps> = ({
  isOpen,
  onClose,
  todo,
  categories,
  onUpdateTodo,
}) => {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [description, setDescription] = useState('');

  // 모달이 열릴 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (todo && isOpen) {
      setTitle(todo.title);
      setSelectedCategory(todo.categoryId);
      setDueDate(todo.dueDate || '');
      setDueTime(todo.dueTime || '');
      setDescription(todo.description || '');
    }
  }, [todo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!todo) return;

    const updates = {
      title,
      categoryId: selectedCategory,
      dueDate,
      dueTime,
      description,
    };
    
    console.log('할일 수정:', updates);
    onUpdateTodo(todo.id, updates);
    
    onClose();
  };

  const handleClose = () => {
    // 폼 초기화
    setTitle('');
    setSelectedCategory('1');
    setDueDate('');
    setDueTime('');
    setDescription('');
    onClose();
  };

  if (!todo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <span className="mr-2">✏️</span>
            할일 수정
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {todo.day}의 할일을 수정해보세요
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 할일 제목 */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-white font-medium">
              할일 제목 *
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 프로젝트 기획서 작성"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label className="text-white font-medium">카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'ring-2 ring-white/50 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: category.color,
                    color: 'white',
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate" className="text-white font-medium">
                마감일
              </Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueTime" className="text-white font-medium">
                마감시간
              </Label>
              <Input
                id="edit-dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-white font-medium">
              메모 (선택)
            </Label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 정보나 메모를 입력하세요"
              className="w-full h-20 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
              disabled={!title.trim()}
            >
              ✏️ 수정하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};