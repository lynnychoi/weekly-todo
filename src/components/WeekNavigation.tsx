import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Eye, EyeOff } from 'lucide-react';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  viewMode: 'basic' | 'detailed';
  onViewModeChange: (mode: 'basic' | 'detailed') => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  onWeekChange,
  viewMode,
  onViewModeChange,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // 주차 계산
  const getWeekString = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}년 ${month}월 ${weekNumber}주차`;
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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 relative z-40">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 주간 네비게이션 */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 min-w-[200px]"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {getWeekString(currentWeek)}
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
            onClick={goToToday}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            오늘
          </Button>
        </div>

        {/* 오른쪽: 뷰 모드 토글 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onViewModeChange(viewMode === 'basic' ? 'detailed' : 'basic')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {viewMode === 'basic' ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                자세히 보기
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                기본 보기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};