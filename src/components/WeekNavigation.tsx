import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Eye, EyeOff, Settings, LogIn, LogOut } from 'lucide-react';
import type { User as UserType } from '@/types/user';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  viewMode: 'basic' | 'detailed';
  onViewModeChange: (mode: 'basic' | 'detailed') => void;
  onOpenCategoryModal: () => void;
  user: UserType | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  onWeekChange,
  viewMode,
  onViewModeChange,
  onOpenCategoryModal,
  user,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // 주차 계산
  const getWeekString = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    
    // 월의 몇 번째 주인지 계산
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startOfFirstWeek = new Date(firstDayOfMonth);
    const dayOfWeek = startOfFirstWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfFirstWeek.setDate(startOfFirstWeek.getDate() + diffToMonday);
    
    const weekOfMonth = Math.ceil((date.getDate() + new Date(year, month - 1, 1).getDay()) / 7);
    
    return `${year}년 ${month}월 ${weekOfMonth}째주 (${weekNumber}주차)`;
  };

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeek);
    previousWeek.setDate(previousWeek.getDate() - 7);
    onWeekChange(previousWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    onWeekChange(nextWeek);
  };

  const goToToday = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);
    onWeekChange(startOfWeek);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    onWeekChange(startOfWeek);
    setShowCalendar(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-3 sm:p-6 mb-6 sm:mb-8 relative z-40">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {/* 첫 번째 줄: 주간 네비게이션 */}
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10 tooltip"
            data-tooltip="이전 주"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 min-w-[160px] sm:min-w-[280px] text-xs sm:text-base px-3 sm:px-4 h-8 sm:h-10 tooltip"
              data-tooltip="날짜 선택"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">{getWeekString(currentWeek)}</span>
              <span className="sm:hidden">{getWeekString(currentWeek).replace('년 ', '/').replace('월 ', '/').replace('째주 (', ' (').replace('주차)', '주)')}</span>
            </Button>
            
            {showCalendar && (
              <div 
                className="absolute top-full mt-2 left-0 bg-slate-900/95 border border-white/20 rounded-lg p-4 z-[60] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="date"
                  onChange={handleDateChange}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/10 border border-white/20 text-white rounded px-3 py-2"
                />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10 tooltip"
            data-tooltip="다음 주"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* 두 번째 줄 (모바일) / 같은 줄 (데스크톱): 컨트롤 버튼들 */}
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            onClick={goToToday}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-xs sm:text-base px-3 sm:px-4 h-8 sm:h-10 tooltip"
            data-tooltip="오늘로 이동"
          >
            오늘
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewModeChange(viewMode === 'basic' ? 'detailed' : 'basic')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 tooltip"
            data-tooltip={viewMode === 'basic' ? '자세히 보기' : '기본 보기'}
          >
            {viewMode === 'basic' ? (
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenCategoryModal}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10 tooltip"
            data-tooltip="카테고리 관리"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* 데스크톱에서만 로그인/로그아웃 버튼 표시 */}
          <div className="hidden sm:block">
            {user ? (
              <Button
                variant="outline"
                size="icon"
                onClick={onLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10 tooltip"
                data-tooltip={`${user.name}님, 로그아웃`}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenAuthModal}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10 tooltip"
                data-tooltip="로그인"
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};