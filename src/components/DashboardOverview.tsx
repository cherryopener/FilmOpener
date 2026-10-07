'use client';

import React from 'react';
import { FilmItem, CameraItem, LensItem, DeveloperChemical, ShootingRoll, ScanLog } from '@/types';
import { Film, Camera, Aperture, FlaskConical, Droplets, Folder, Sparkles, Plus, Clock, CheckCircle2, AlertTriangle, ArrowRight, Snowflake } from 'lucide-react';

interface DashboardOverviewProps {
  films: FilmItem[];
  cameras: CameraItem[];
  lenses: LensItem[];
  developers: DeveloperChemical[];
  rolls: ShootingRoll[];
  scans: ScanLog[];
  onNavigate: (tab: 'dashboard' | 'films' | 'gear' | 'shooting' | 'development' | 'developers' | 'scans') => void;
}

export default function DashboardOverview({
  films,
  cameras,
  lenses,
  developers,
  rolls,
  scans,
  onNavigate,
}: DashboardOverviewProps) {
  const loadedRolls = rolls.filter((r) => r.status === 'loaded');
  const unloadedRolls = rolls.filter((r) => r.status === 'unloaded');
  const developedRolls = rolls.filter((r) => r.status === 'developed');
  const totalFilmQuantity = films.reduce((acc, f) => acc + (f.quantity || 0), 0);
  const coldStoredCount = films.filter((f) => f.storage_method === 'refrigerated' || f.storage_method === 'frozen').reduce((acc, f) => acc + f.quantity, 0);
  const activeCameras = cameras.filter((c) => c.status === 'active');
  const totalScannedFrames = scans.reduce((acc, s) => acc + (s.total_frames || 0), 0);

  return (
    <div className="content-body">
      {/* Hero Welcome Card - Apple Minimal Studio Aesthetic */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontSize: '0.82rem', fontWeight: '600' }}>
          <Sparkles size={15} /> 필름 워크플로우 통합 매니저
        </div>
        <h2 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
          FilmOpener Studio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '680px', lineHeight: '1.55' }}>
          보유 필름 및 껍데기 바뀐 필름 관리부터, 정상 작동 카메라 선별, 다중 출사일 날씨 기록, 로터리/수교반 세부 자가현상 약품 누적, 그리고 스캔 폴더 아카이브까지 모든 아날로그 여정을 한곳에서 관리합니다.
        </p>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('shooting')}>
            <Plus size={14} /> 새 촬영 롤 장전
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('development')}>
            <FlaskConical size={14} /> 현상 관리 ({unloadedRolls.length}롤 대기)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('films')}>
            <Film size={14} /> 필름 보관함 ({totalFilmQuantity}롤)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('gear')}>
            <Camera size={14} /> 카메라/렌즈 관리
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('developers')}>
            <Droplets size={14} /> 현상액 라이브러리
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('scans')}>
            <Folder size={14} /> 스캔 아카이브 ({scans.length}롤)
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties} onClick={() => onNavigate('films')}>
          <div className="stat-label"><Film size={15} /> 보유 필름 재고</div>
          <div className="stat-value">{totalFilmQuantity} 롤</div>
          <div className="stat-desc">냉장/냉동 {coldStoredCount}롤 신선 보관</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#3b82f6' } as React.CSSProperties} onClick={() => onNavigate('gear')}>
          <div className="stat-label"><Camera size={15} /> 즉시 촬영 가능 바디</div>
          <div className="stat-value">{activeCameras.length} 대</div>
          <div className="stat-desc">정상 작동 카메라 (고장/수리중 제외)</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7', cursor: 'pointer' } as React.CSSProperties} onClick={() => onNavigate('development')}>
          <div className="stat-label"><Clock size={15} /> 현상 대기 중인 롤</div>
          <div className="stat-value">{unloadedRolls.length} 롤</div>
          <div className="stat-desc">촬영 완료 후 현상 대기 (클릭 시 이동)</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#10b981', cursor: 'pointer' } as React.CSSProperties} onClick={() => onNavigate('scans')}>
          <div className="stat-label"><Folder size={15} /> 총 스캔 완료 컷수</div>
          <div className="stat-value">{totalScannedFrames} 컷</div>
          <div className="stat-desc">{scans.length}개 폴더 아카이빙</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
        {/* Left: Currently Loaded Rolls (카메라에 장전된 필름) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={17} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>현재 카메라에 장전된 롤</h3>
            </div>
            <span className="notion-tag" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)' }}>
              {loadedRolls.length}롤 장전 중
            </span>
          </div>

          {loadedRolls.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              현재 장전된 필름이 없습니다. 출사를 위해 새 필름을 장전해보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadedRolls.map((roll) => (
                <div
                  key={roll.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {roll.title}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      장전일: {roll.loaded_date}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber-light)' }}>
                    🎞️ {roll.film_name_snapshot}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📷 {roll.camera_name_snapshot} {roll.lens_name_snapshot ? `(${roll.lens_name_snapshot})` : ''}
                  </div>

                  {roll.shooting_sessions && roll.shooting_sessions.length > 0 && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      최근 출사: {roll.shooting_sessions[roll.shooting_sessions.length - 1].location} ({roll.shooting_sessions[roll.shooting_sessions.length - 1].date})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 'auto' }}
            onClick={() => onNavigate('shooting')}
          >
            촬영 롤 전체 보기 <ArrowRight size={13} />
          </button>
        </div>

        {/* Right: Active Developer Chemistry (현상액 상태) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={17} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>현상액 수명 및 사용 현황</h3>
            </div>
            <span className="notion-tag" style={{ background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple)' }}>
              {developers.length}종 보유
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {developers.slice(0, 3).map((dev) => {
              const limit = dev.capacity_rolls_limit || 16;
              const pct = Math.min(100, Math.round(((dev.total_rolls_processed || 0) / limit) * 100));

              return (
                <div
                  key={dev.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {dev.name}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber-light)', fontWeight: '700' }}>
                      {dev.total_rolls_processed || 0}롤 처리됨
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '5px', background: 'var(--bg-card)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct > 80 ? 'var(--accent-red)' : 'var(--accent-emerald)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    <span>조제/개봉: {dev.mixed_or_opened_date}</span>
                    <span>한도 대비 {pct}% 사용</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 'auto' }}
            onClick={() => onNavigate('developers')}
          >
            현상액 상세 관리 <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
