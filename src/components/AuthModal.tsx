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
import { User, LogIn } from 'lucide-react';
import type { LoginData, SignupData } from '@/types/user';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: LoginData) => Promise<boolean>;
  onSignup: (data: SignupData) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePasswordChange = (value: string) => {
    // 숫자만 입력 가능하고 4자리까지만
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPassword(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }
        
        const success = await onLogin({ email, password });
        if (!success) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
        
        handleClose();
      } else {
        if (!email || !name || !password) {
          throw new Error('모든 필드를 입력해주세요.');
        }
        
        if (password.length !== 4) {
          throw new Error('비밀번호는 4자리 숫자여야 합니다.');
        }
        
        await onSignup({ email, name, password });
        handleClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[400px] max-h-[85vh] overflow-y-auto bg-slate-900/95 border-white/20 text-white">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center">
            {mode === 'login' ? (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                로그인
              </>
            ) : (
              <>
                <User className="h-5 w-5 mr-2" />
                회원가입
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {mode === 'login' 
              ? '계정에 로그인하여 할일을 관리하세요' 
              : '새 계정을 만들어 할일 관리를 시작하세요'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* 이메일 */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-white font-medium text-sm sm:text-base">
              이메일 *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            />
          </div>

          {/* 이름 (회원가입 시만) */}
          {mode === 'signup' && (
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-white font-medium text-sm sm:text-base">
                이름 *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
          )}

          {/* 비밀번호 (4자리 숫자) */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="password" className="text-white font-medium text-sm sm:text-base">
              비밀번호 (4자리 숫자) *
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="1234"
              maxLength={4}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-center text-lg tracking-widest"
            />
            <p className="text-xs text-slate-400">
              보안을 위해 4자리 숫자로 간단하게 설정하세요
            </p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-3 sm:gap-0">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
            >
              {isLoading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              취소
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};