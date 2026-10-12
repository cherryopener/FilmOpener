'use client';

import React, { useState, useEffect } from 'react';
import { exportFullBackup, importFullBackup, resetToInitialData, syncLocalDataToSupabase } from '@/lib/storageService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isPinSet, setMasterPin, removeMasterPin, lockAppNow } from '@/lib/securityService';
import { Sun, Moon, Monitor, Download, Upload, RotateCcw, CheckCircle2, ShieldCheck, GitBranch, Cloud, CloudUpload, Lock, KeyRound, Unlock, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
  currentTheme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onRefreshData,
  currentTheme,
  onThemeChange,
}: SettingsModalProps) {
  const [statusMsg, setStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');

  // Master PIN Security State
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHasPin(isPinSet());
      setPinInput('');
      setPinConfirmInput('');
      setPinMsg('');
    }
  }, [isOpen]);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinMsg('PIN 번호를 입력해주세요.');
      return;
    }
    if (pinInput.length < 4) {
      setPinMsg('PIN 번호는 최소 4자리 이상이어야 합니다.');
      return;
    }
    if (pinInput !== pinConfirmInput) {
      setPinMsg('PIN 번호 확인이 일치하지 않습니다.');
      return;
    }

    await setMasterPin(pinInput);
    setHasPin(true);
    setPinInput('');
    setPinConfirmInput('');
    setPinMsg('✅ 마스터 보안 PIN이 성공적으로 설정되었습니다. 이제 혼자만 안전하게 접근할 수 있습니다.');
  };

  const handleRemovePin = () => {
    if (confirm('보안 PIN 잠금을 해제하시겠습니까? 해제 시 누구나 사이트에 바로 접속할 수 있게 됩니다.')) {
      removeMasterPin();
      setHasPin(false);
      setPinMsg('보안 PIN이 제거되었습니다.');
    }
  };

  const handleInstantLock = () => {
    lockAppNow();
    onClose();
    window.location.reload();
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    setSyncResult('');
    try {
      const res = await syncLocalDataToSupabase();
      if (res.success) {
        setSyncResult(`✅ 총 ${res.count}개의 데이터가 Supabase 클라우드에 성공적으로 동기화되었습니다.`);
        await onRefreshData();
      } else {
        setSyncResult(`❌ 동기화 실패: ${res.error}`);
      }
    } catch (e: any) {
      setSyncResult(`❌ 오류: ${e?.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filmopener-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const success = importFullBackup(content);
      if (success) {
        alert('백업 데이터가 성공적으로 복원되었습니다.');
        await onRefreshData();
        onClose();
      } else {
        alert('백업 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = async () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? (등록된 모든 데이터가 삭제되고 깨끗한 빈 상태로 초기화됩니다)')) {
      resetToInitialData();
      await onRefreshData();
      alert('모든 데이터가 깨끗하게 초기화되었습니다.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2>환경 설정</h2>
          <button type="button" className="btn btn-subtle btn-icon" onClick={onClose} title="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* 테마 모드 선택 (라이트 / 다크 / 시스템) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 화면 테마 설정 (Light / Dark Mode)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              시스템 설정(맥/아이폰 라이트·다크모드)에 자동으로 맞추거나 직접 선택할 수 있습니다.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className={`btn ${currentTheme === 'system' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => onThemeChange('system')}
                style={{ padding: '8px 10px' }}
              >
                <Monitor size={14} /> 시스템 자동
              </button>

              <button
                type="button"
                className={`btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => onThemeChange('light')}
                style={{ padding: '8px 10px' }}
              >
                <Sun size={14} /> ☀️ 라이트 모드
              </button>

              <button
                type="button"
                className={`btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => onThemeChange('dark')}
                style={{ padding: '8px 10px' }}
              >
                <Moon size={14} /> 🌙 다크 모드
              </button>
            </div>
          </div>

          {/* GitHub / Vercel 배포 & Supabase 연결 상태 */}
          <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                <Cloud size={16} color="var(--accent-blue)" /> Supabase 클라우드 & 보안
              </div>
              <span
                className="notion-tag"
                style={{
                  background: isSupabaseConfigured() ? 'rgba(16, 185, 129, 0.12)' : 'rgba(120, 119, 116, 0.12)',
                  color: isSupabaseConfigured() ? '#10b981' : 'var(--text-dim)',
                }}
              >
                {isSupabaseConfigured() ? '● 클라우드 연결됨 (RLS 보안)' : '○ 로컬 브라우저 모드'}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              {isSupabaseConfigured()
                ? '현재 계정에 RLS(Row Level Security)가 적용되어, 오직 본인만 데이터를 조회/수정할 수 있습니다. 로컬에 저장된 기존 데이터를 클라우드로 즉시 업로드하려면 아래 동기화 버튼을 누르세요.'
                : 'Vercel 환경 변수에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 등록하면 클라우드 동기화와 계정 로그인이 활성화됩니다.'}
            </p>

            {isSupabaseConfigured() && (
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSyncCloud}
                  disabled={isSyncing}
                  style={{ background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}
                >
                  <CloudUpload size={14} /> {isSyncing ? '동기화 진행 중...' : '로컬 데이터를 Supabase 클라우드로 올리기'}
                </button>
                {syncResult && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-emerald)', marginTop: '6px' }}>
                    {syncResult}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1인 전용 마스터 PIN 보안 잠금 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Lock size={15} color="var(--accent-amber)" />
                1인 전용 마스터 PIN 보안 잠금 (Private Screen Lock)
              </h4>
              {hasPin && (
                <span className="notion-tag" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.74rem' }}>
                  🔒 보안 잠금 활성화됨
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
              온라인(Vercel 등)에 사이트를 배포했거나 공용 기기에서 사용할 때, 4~8자리 마스터 PIN을 설정하면 본인 외의 방문자가 내 소중한 필름 기록을 열람하거나 조작하는 것을 완벽하게 차단합니다.
            </p>

            {hasPin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000000', fontWeight: 700 }}
                    onClick={handleInstantLock}
                    title="지금 즉시 앱을 잠금 상태로 전환합니다"
                  >
                    <Lock size={13} /> 지금 즉시 화면 잠그기
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--accent-red)' }}
                    onClick={handleRemovePin}
                  >
                    <Unlock size={13} /> PIN 잠금 해제 (삭제)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="새 마스터 PIN (4~8자리)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="apple-input"
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                  <input
                    type="password"
                    placeholder="PIN 번호 다시 입력"
                    value={pinConfirmInput}
                    onChange={(e) => setPinConfirmInput(e.target.value)}
                    className="apple-input"
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000000', fontWeight: 700 }}
                >
                  <KeyRound size={13} /> 마스터 PIN 등록하기
                </button>
              </form>
            )}

            {pinMsg && (
              <div style={{ fontSize: '0.78rem', color: pinMsg.startsWith('✅') ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {pinMsg}
              </div>
            )}
          </div>

          {/* 데이터 백업 & 복원 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
              📦 데이터 백업 및 복원
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportBackup}>
                <Download size={14} /> JSON 백업 저장
              </button>

              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> JSON 백업 복원
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportBackup}
                />
              </label>

              <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetDemoData}>
                <RotateCcw size={14} /> 데이터 전체 초기화
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
