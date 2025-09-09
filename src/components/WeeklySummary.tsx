import React from 'react';
import { CheckCircle2, Clock, Circle, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Todo, Category } from '@/types/todo';

interface WeeklySummaryProps {
  todos: Todo[];
  categories: Category[];
  getCategoryById: (id: string) => Category | undefined;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  todos,
  categories,
}) => {
  const getWeeklyStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.status === 'checked').length;
    const inProgress = todos.filter(todo => todo.status === 'loading').length;
    const cancelled = todos.filter(todo => todo.status === 'cancelled').length;
    const pending = todos.filter(todo => todo.status === 'unchecked').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, cancelled, pending, completionRate };
  };

  const getCategoryStats = () => {
    const categoryStats = categories.map(category => {
      const categoryTodos = todos.filter(todo => todo.categoryId === category.id);
      const completed = categoryTodos.filter(todo => todo.status === 'checked').length;
      return {
        category,
        total: categoryTodos.length,
        completed,
        completionRate: categoryTodos.length > 0 ? Math.round((completed / categoryTodos.length) * 100) : 0
      };
    }).filter(stat => stat.total > 0);
    
    return categoryStats.sort((a, b) => b.completionRate - a.completionRate);
  };

  const getMostProductiveDay = () => {
    const days = ['이번 주에 할 일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    const dayStats = days.map(day => {
      const dayTodos = todos.filter(todo => todo.day === day);
      const completed = dayTodos.filter(todo => todo.status === 'checked').length;
      return { day, completed, total: dayTodos.length };
    });
    
    return dayStats.reduce((max, current) => 
      current.completed > max.completed ? current : max
    );
  };

  const stats = getWeeklyStats();
  const categoryStats = getCategoryStats();
  const mostProductiveDay = getMostProductiveDay();

  const getMotivationalMessage = () => {
    if (stats.completionRate >= 80) {
      return "🎉 훌륭해요! 이번 주를 정말 알차게 보내고 계시네요!";
    } else if (stats.completionRate >= 50) {
      return "💪 잘하고 있어요! 조금 더 힘내면 목표 달성이에요!";
    } else if (stats.completionRate >= 20) {
      return "🚀 시작이 좋네요! 꾸준히 진행해보세요!";
    } else {
      return "✨ 새로운 시작! 하나씩 차근차근 해나가보세요!";
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6 sm:mb-8 py-4 sm:py-6">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
            <span className="text-lg sm:text-2xl">이번 주 진행상황</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            <Badge variant="outline" className="text-slate-300 border-slate-300 text-xs sm:text-sm">
              완료율 {stats.completionRate}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className="bg-white/5 rounded-lg p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Circle className="h-3 w-3 sm:h-5 sm:w-5 text-slate-400" />
          </div>
          <div className="text-base sm:text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-400">전체</div>
        </div>
        
        <div className="bg-green-500/10 rounded-lg p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 text-green-400" />
          </div>
          <div className="text-base sm:text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-slate-400">완료</div>
        </div>
        
        <div className="bg-yellow-500/10 rounded-lg p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-400" />
          </div>
          <div className="text-base sm:text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
          <div className="text-xs text-slate-400">진행중</div>
        </div>
        
        <div className="bg-slate-500/10 rounded-lg p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Circle className="h-3 w-3 sm:h-5 sm:w-5 text-slate-400" />
          </div>
          <div className="text-base sm:text-2xl font-bold text-slate-400">{stats.pending}</div>
          <div className="text-xs text-slate-400">대기중</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-3 sm:mb-6">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-slate-300">주간 진행률</span>
          <span className="text-xs sm:text-sm text-white font-medium">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 sm:h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* 카테고리별 성과 & 가장 생산적인 날 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
        {/* 카테고리별 성과 */}
        <div>
          <h3 className="text-xs font-medium text-slate-300 mb-2">카테고리별 진행률</h3>
          <div className="space-y-1">
            {categoryStats.slice(0, 2).map((stat) => (
              <div key={stat.category.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.category.color }}
                ></div>
                <span className="text-xs text-white flex-1 truncate">{stat.category.name}</span>
                <span className="text-xs text-slate-400">
                  {stat.completed}/{stat.total}
                </span>
                <span className="text-xs text-green-400 font-medium">
                  {stat.completionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 가장 생산적인 날 */}
        <div>
          <h3 className="text-xs font-medium text-slate-300 mb-2">가장 활발한 날</h3>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-sm font-bold text-white">
              {mostProductiveDay.day === '이번 주에 할 일' ? '주간 할일' : mostProductiveDay.day}
            </div>
            <div className="text-xs text-slate-400">
              {mostProductiveDay.completed}개 완료 / {mostProductiveDay.total}개 중
            </div>
          </div>
        </div>
      </div>

      {/* 격려 메시지 */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2 sm:p-4 border border-blue-500/20">
        <p className="text-white text-center font-medium text-xs sm:text-base">
          {getMotivationalMessage()}
        </p>
      </div>
      </CardContent>
    </Card>
  );
};