'use client';

import React, { useState, useEffect } from 'react';
import { exportFullBackup, importFullBackup, resetToInitialData } from '@/lib/storageService';
import { Sun, Moon, Monitor, Download, Upload, RotateCcw, CheckCircle2, ShieldCheck, Github } from 'lucide-react';

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
    if (confirm('현재 데이터를 초기 테스트용 샘플 데이터로 복원하시겠습니까? (기존 수정내용은 덮어씌워집니다)')) {
      resetToInitialData();
      await onRefreshData();
      alert('초기 테스트 데이터가 성공적으로 로드되었습니다.');
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

          {/* GitHub / Vercel 배포 안내 */}
          <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              <Github size={16} /> GitHub & Vercel 배포 연결
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              이 프로젝트는 GitHub 레포지토리(<code>cherryopener/FilmOpener</code>)에 push 후 Vercel에서 Git 저장소를 연결하여 배포할 수 있습니다.
              Supabase 클라우드 데이터베이스 연동은 Vercel 환경 변수(<code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)에 등록하면 안전하게 자동 연결됩니다.
            </div>
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
                <RotateCcw size={14} /> 샘플 데이터 복원
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
