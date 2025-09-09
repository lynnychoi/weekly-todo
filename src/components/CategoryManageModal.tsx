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
// import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Category } from '@/types/todo';

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const availableColors = [
  { name: '빨강', color: '#ef4444' },
  { name: '주황', color: '#f97316' },
  { name: '노랑', color: '#eab308' },
  { name: '연두', color: '#84cc16' },
  { name: '초록', color: '#22c55e' },
  { name: '하늘', color: '#06b6d4' },
  { name: '파랑', color: '#3b82f6' },
  { name: '보라', color: '#8b5cf6' },
  { name: '자주', color: '#a855f7' },
  { name: '핑크', color: '#ec4899' },
  { name: '회색', color: '#6b7280' },
  { name: '검정', color: '#374151' },
];

export const CategoryManageModal: React.FC<CategoryManageModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ef4444');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('#ef4444');

  const validateName = (name: string) => {
    const koreanLength = (name.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || []).length;
    const englishLength = (name.match(/[a-zA-Z]/g) || []).length;
    const otherLength = name.length - koreanLength - englishLength;
    
    return koreanLength + otherLength <= 5 && englishLength <= 12;
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !validateName(newCategoryName)) return;
    
    onAddCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      icon: '📁', // 기본 아이콘
    });
    
    setNewCategoryName('');
    setNewCategoryColor('#ef4444');
    setIsAddMode(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editCategoryName.trim() || !validateName(editCategoryName) || !editingId) return;
    
    onUpdateCategory(editingId, {
      name: editCategoryName.trim(),
      color: editCategoryColor,
    });
    
    setEditingId(null);
    setEditCategoryName('');
    setEditCategoryColor('#ef4444');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCategoryName('');
    setEditCategoryColor('#ef4444');
  };

  const handleCancelAdd = () => {
    setIsAddMode(false);
    setNewCategoryName('');
    setNewCategoryColor('#ef4444');
  };

  const handleClose = () => {
    handleCancelEdit();
    handleCancelAdd();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-900/95 border-white/20 text-white mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <span className="mr-2">🏷️</span>
            카테고리 관리
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            카테고리를 추가하거나 수정할 수 있습니다
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* 기존 카테고리 목록 */}
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              {editingId === category.id ? (
                /* 수정 모드 */
                <div className="flex-1 space-y-3">
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="카테고리 이름"
                    className="w-full bg-white/10 border-white/20 text-white"
                    maxLength={12}
                  />
                  <div className="flex flex-wrap gap-1">
                    {availableColors.map((colorOption) => (
                      <button
                        key={colorOption.color}
                        type="button"
                        onClick={() => setEditCategoryColor(colorOption.color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          editCategoryColor === colorOption.color
                            ? 'border-white scale-110'
                            : 'border-white/30'
                        } transition-all`}
                        style={{ backgroundColor: colorOption.color }}
                        title={colorOption.name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={handleUpdateCategory}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={!editCategoryName.trim() || !validateName(editCategoryName)}
                    >
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                /* 일반 모드 */
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCategory(category)}
                      className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/20"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteCategory(category.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-400/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* 새 카테고리 추가 */}
          {isAddMode ? (
            <div className="p-3 bg-white/5 rounded-lg border-2 border-dashed border-white/30">
              <div className="space-y-3">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="새 카테고리 이름"
                  className="w-full bg-white/10 border-white/20 text-white"
                  maxLength={12}
                />
                <div className="flex flex-wrap gap-1">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      onClick={() => setNewCategoryColor(colorOption.color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategoryColor === colorOption.color
                          ? 'border-white scale-110'
                          : 'border-white/30'
                      } transition-all`}
                      style={{ backgroundColor: colorOption.color }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddCategory}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!newCategoryName.trim() || !validateName(newCategoryName)}
                  >
                    추가
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelAdd}
                    className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    취소
                  </Button>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                한글 최대 5자, 영어 최대 12자
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddMode(true)}
              className="w-full bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/30 text-white"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 카테고리 추가
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};