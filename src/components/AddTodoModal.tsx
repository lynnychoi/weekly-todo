import React, { useState } from 'react';
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
import type { Category } from '@/types/todo';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: string;
  categories: Category[];
  onAddTodo: (todoData: {
    title: string;
    categoryId: string;
    dueDate: string;
    dueTime: string;
    description: string;
    day: string;
  }) => void;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  categories,
  onAddTodo,
}) => {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const todoData = {
      title,
      categoryId: selectedCategory,
      dueDate,
      dueTime,
      description,
      day: selectedDay,
    };
    
    console.log('할일 추가 시도:', todoData);
    onAddTodo(todoData);
    console.log('할일 추가 완료');
    
    // 폼 초기화
    setTitle('');
    setSelectedCategory('1');
    setDueDate('');
    setDueTime('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-slate-900/95 border-white/20 text-white mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <span className="mr-2">✨</span>
            새 할일 추가
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {selectedDay}에 새로운 할일을 추가해보세요
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 할일 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium">
              할일 제목 *
            </Label>
            <Input
              id="title"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-white font-medium">
                마감일
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-white font-medium">
                마감시간
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-medium">
              메모 (선택)
            </Label>
            <textarea
              id="description"
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
              onClick={onClose}
              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
              disabled={!title.trim()}
            >
              ✨ 추가하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};