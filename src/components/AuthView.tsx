'use client';

import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase';
import { Film, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  onContinueOffline?: () => void;
}

export default function AuthView({ onAuthSuccess, onContinueOffline }: AuthViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
          } else {
            setErrorMessage(error.message);
          }
        } else if (data.user) {
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) {
          setErrorMessage(error.message);
        } else if (data.user) {
          if (data.session) {
            // Immediate signin
            onAuthSuccess(data.user);
          } else {
            setSuccessNotice('가입 확인 이메일이 발송되었습니다. 메일함의 링크를 확인해주세요. (이메일 인증을 끈 경우 즉시 로그인 탭에서 로그인할 수 있습니다)');
            setMode('signin');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--bg-main)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-amber-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Film size={24} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-main)', marginTop: '4px' }}>
            FilmOpener
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            개인 전용 아날로그 필름 스튜디오 볼트
          </p>
        </div>

        {/* Apple Segmented Control: 로그인 vs 회원가입 */}
        <div className="segmented-control" style={{ width: '100%' }}>
          <button
            type="button"
            className={`segmented-item ${mode === 'signin' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setSuccessNotice('');
            }}
          >
            로그인
          </button>
          <button
            type="button"
            className={`segmented-item ${mode === 'signup' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setSuccessNotice('');
            }}
          >
            회원가입 (최초 1회)
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="notion-callout"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
              padding: '10px 14px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div
            className="notion-callout"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              fontSize: '0.82rem',
              padding: '10px 14px',
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <div>{successNotice}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
              이메일 주소
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type="email"
                placeholder="master@filmopener.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ paddingLeft: '36px' }}
              />
              <Mail
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="6자 이상 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={{ paddingLeft: '36px', paddingRight: '38px' }}
              />
              <Lock
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                className="btn btn-subtle btn-icon"
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                비밀번호 확인
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 다시 입력"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingLeft: '36px' }}
                />
                <Lock
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px' }}
          >
            {isLoading ? (
              '처리 중...'
            ) : mode === 'signin' ? (
              <>
                스튜디오 입장하기 <ArrowRight size={15} />
              </>
            ) : (
              <>
                마스터 계정 생성 <Sparkles size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security Info Callout */}
        <div
          className="notion-callout"
          style={{
            background: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
            flexDirection: 'column',
            gap: '6px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: '700' }}>
            <ShieldCheck size={14} />
            <span>나만의 1인 스튜디오 보안 보호</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
            계정 생성 후 Supabase 대시보드(<strong>Authentication → Providers → Email</strong>)에서 <strong>'Allow new users to sign up'</strong>을 끄시면 다른 누구도 계정을 만들 수 없으며 데이터베이스가 완벽하게 보호됩니다.
          </p>
        </div>

        {/* Offline fallback button */}
        {onContinueOffline && (
          <button
            type="button"
            className="btn btn-subtle btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}
            onClick={onContinueOffline}
          >
            오프라인 브라우저 로컬 모드로 계속하기 →
          </button>
        )}
      </div>
    </div>
  );
}
