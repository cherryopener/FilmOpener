'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { verifyAndUnlockPin } from '@/lib/securityService';

interface MasterPinLockModalProps {
  onUnlocked: () => void;
}

export default function MasterPinLockModal({ onUnlocked }: MasterPinLockModalProps) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const success = await verifyAndUnlockPin(pin);
      if (success) {
        onUnlocked();
      } else {
        setIsError(true);
        setPin('');
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 12, 16, 0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'rgba(24, 27, 34, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}
      >
        {/* Lock Orb */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isError
              ? 'rgba(239, 68, 68, 0.15)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: isError ? '1px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isError ? '#ef4444' : '#f59e0b',
            boxShadow: isError ? '0 0 24px rgba(239, 68, 68, 0.3)' : '0 0 24px rgba(245, 158, 11, 0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          {isError ? <AlertCircle size={32} /> : <Lock size={30} />}
        </div>

        <div>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            비공개 보관소 보안 잠금
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              color: '#a1a1aa',
              lineHeight: 1.45,
            }}
          >
            이 사이트는 소유자 전용으로 보호되고 있습니다.<br />
            설정된 마스터 PIN 번호를 입력하세요.
          </p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (isError) setIsError(false);
              }}
              placeholder="마스터 PIN 번호 입력"
              autoFocus
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 42px 12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: isError ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                fontSize: '1.1rem',
                letterSpacing: '0.2em',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#f59e0b',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                cursor: pin.trim() ? 'pointer' : 'not-allowed',
                opacity: pin.trim() ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}
              title="잠금 해제"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {isError && (
            <div
              style={{
                fontSize: '0.8rem',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              PIN 번호가 올바르지 않습니다. 다시 입력해주세요.
            </div>
          )}

          <button
            type="submit"
            className="apple-primary-btn"
            disabled={isLoading || !pin.trim()}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '4px',
              padding: '11px',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {isLoading ? '확인 중...' : '잠금 해제'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            color: '#71717a',
          }}
        >
          <ShieldCheck size={13} color="#f59e0b" />
          <span>개인 프라이버시 암호화 세션 작동 중</span>
        </div>
      </div>
    </div>
  );
}
