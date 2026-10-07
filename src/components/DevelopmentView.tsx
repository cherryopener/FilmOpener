'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShootingRoll,
  FilmItem,
  DeveloperChemical,
  DevType,
  AgitationMethod,
  FilmFormat,
} from '@/types';
import {
  AGITATION_METHOD_CONFIG,
  COMMON_DILUTIONS,
} from '@/lib/constants';
import {
  FlaskConical,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Folder,
  ChevronRight,
  Layers,
  Thermometer,
  RotateCw,
  Droplets,
  Calendar,
  Building2,
  Film,
  Info,
} from 'lucide-react';

interface DevelopmentViewProps {
  rolls: ShootingRoll[];
  films: FilmItem[];
  developers: DeveloperChemical[];
  onSaveRoll: (roll: ShootingRoll, previousRoll?: ShootingRoll) => Promise<void>;
  onDeleteRoll?: (id: string) => Promise<void>;
  onNavigateToScan?: (rollId?: string) => void;
  initialRollId?: string | null;
  onClearInitialRollId?: () => void;
}

export default function DevelopmentView({
  rolls,
  films,
  developers,
  onSaveRoll,
  onDeleteRoll,
  onNavigateToScan,
  initialRollId,
  onClearInitialRollId,
}: DevelopmentViewProps) {
  // Tabs: 'pending' (현상 대기), 'developed' (현상 완료), 'all' (전체)
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'developed' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [devTypeFilter, setDevTypeFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState<ShootingRoll | null>(null);

  // Form Mode: 'pending_roll' (기존 촬영롤 현상) vs 'external_roll' (목록 외/외부 필름 현상)
  const [rollSelectionMode, setRollSelectionMode] = useState<'pending_roll' | 'external_roll'>('pending_roll');
  const [selectedPendingRollId, setSelectedPendingRollId] = useState('');

  // External Film Fields (남의 필름, 오래 묵힌 미등록 필름)
  const [externalTitle, setExternalTitle] = useState('');
  const [externalFilmName, setExternalFilmName] = useState('');
  const [externalFormat, setExternalFormat] = useState<FilmFormat>('135');
  const [externalIso, setExternalIso] = useState<number | ''>(400);

  // Chemistry Recipe Fields
  const [devType, setDevType] = useState<DevType>('self');
  const [developedDate, setDevelopedDate] = useState('');
  const [labName, setLabName] = useState('');

  // Self Development Details
  const [developerId, setDeveloperId] = useState('');
  const [devQuantityRolls, setDevQuantityRolls] = useState<number>(1);
  const [devMethod, setDevMethod] = useState<AgitationMethod>('inversion');
  const [dilutionRatio, setDilutionRatio] = useState('Stock (원액)');
  const [customDilution, setCustomDilution] = useState('');
  const [chemicalVolumeMl, setChemicalVolumeMl] = useState<number | ''>(300);
  const [dilutionLiquidVolumeMl, setDilutionLiquidVolumeMl] = useState<number | ''>('');
  const [devTempCelsius, setDevTempCelsius] = useState<number | ''>(20);
  const [devTime, setDevTime] = useState('');
  const [agitationDetails, setAgitationDetails] = useState('');
  const [stopFixWashNotes, setStopFixWashNotes] = useState('');
  const [notes, setNotes] = useState('');

  // Quick Post-Save Toast / Notice
  const [lastDevelopedRoll, setLastDevelopedRoll] = useState<ShootingRoll | null>(null);

  // Rolls pending development
  const pendingRolls = useMemo(() => {
    return rolls.filter((r) => r.status === 'unloaded');
  }, [rolls]);

  // Rolls that have been developed (developed or scanned)
  const developedRolls = useMemo(() => {
    return rolls.filter((r) => r.status === 'developed' || r.status === 'scanned');
  }, [rolls]);

  // Handle Initial Roll navigation from ShootingView or Dashboard
  useEffect(() => {
    if (initialRollId) {
      const target = rolls.find((r) => r.id === initialRollId);
      if (target) {
        openDevModalForRoll(target);
      }
      onClearInitialRollId?.();
    }
  }, [initialRollId, rolls, onClearInitialRollId]);

  const openDevModalForRoll = (roll: ShootingRoll) => {
    setEditingRoll(roll);
    setRollSelectionMode('pending_roll');
    setSelectedPendingRollId(roll.id);
    setExternalTitle('');
    setExternalFilmName('');
    setExternalFormat('135');
    setExternalIso(400);

    // Chemistry fields
    const today = new Date().toISOString().split('T')[0];
    setDevType(roll.dev_type !== 'none' ? roll.dev_type : 'self');
    setDevelopedDate(roll.developed_date || today);
    setLabName(roll.lab_name || '');
    setDeveloperId(roll.developer_id || developers[0]?.id || '');
    setDevQuantityRolls(roll.dev_quantity_rolls || 1);
    setDevMethod(roll.dev_method || 'inversion');

    const isCustom = roll.dilution_ratio && !COMMON_DILUTIONS.includes(roll.dilution_ratio);
    if (isCustom) {
      setDilutionRatio('기타 직접입력');
      setCustomDilution(roll.dilution_ratio || '');
    } else {
      setDilutionRatio(roll.dilution_ratio || 'Stock (원액)');
      setCustomDilution('');
    }

    setChemicalVolumeMl(roll.chemical_volume_ml ?? 300);
    setDilutionLiquidVolumeMl(roll.dilution_liquid_volume_ml ?? '');
    setDevTempCelsius(roll.dev_temp_celsius ?? 20);
    setDevTime(roll.dev_time || '');
    setAgitationDetails(roll.agitation_details || '초기 30초 연속 교반, 매 1분마다 10초간 4회 반전 교반');
    setStopFixWashNotes(roll.stop_fix_wash_notes || '물정지 1분 -> 래피드픽서 1:4 5분 -> 일포드 수세법 -> 포토플로');
    setNotes(roll.notes || '');

    setIsModalOpen(true);
  };

  const openNewDevModal = () => {
    setEditingRoll(null);
    const today = new Date().toISOString().split('T')[0];

    if (pendingRolls.length > 0) {
      setRollSelectionMode('pending_roll');
      setSelectedPendingRollId(pendingRolls[0].id);
    } else {
      setRollSelectionMode('external_roll');
      setSelectedPendingRollId('');
    }

    setExternalTitle('');
    setExternalFilmName(films[0]?.name || 'Kodak Gold 200');
    setExternalFormat('135');
    setExternalIso(400);

    setDevType('self');
    setDevelopedDate(today);
    setLabName('');
    setDeveloperId(developers[0]?.id || '');
    setDevQuantityRolls(1);
    setDevMethod('inversion');
    setDilutionRatio('Stock (원액)');
    setCustomDilution('');
    setChemicalVolumeMl(300);
    setDilutionLiquidVolumeMl('');
    setDevTempCelsius(20);
    setDevTime('9분 30초');
    setAgitationDetails('초기 30초 연속 교반, 매 1분마다 10초간 4회 반전 교반');
    setStopFixWashNotes('물정지 1분 -> 래피드픽서 1:4 5분 -> 일포드 수세법 -> 포토플로');
    setNotes('');

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!developedDate) {
      alert('현상 완료 날짜를 선택해주세요.');
      return;
    }

    const effectiveDilution = dilutionRatio === '기타 직접입력' ? customDilution.trim() || '커스텀 희석' : dilutionRatio;
    const selectedDevObj = developers.find((d) => d.id === developerId);

    if (devType === 'self' && developers.length > 0 && !developerId) {
      alert('자가 현상에 사용할 현상액을 선택해주세요.');
      return;
    }

    let targetRoll: ShootingRoll;
    let previousRollState: ShootingRoll | undefined = undefined;

    if (rollSelectionMode === 'pending_roll') {
      const found = rolls.find((r) => r.id === (editingRoll ? editingRoll.id : selectedPendingRollId));
      if (!found) {
        alert('현상할 필름 롤을 선택해주세요.');
        return;
      }
      previousRollState = found;
      targetRoll = {
        ...found,
        status: 'developed',
        dev_type: devType,
        developed_date: developedDate,
        lab_name: devType === 'lab' ? labName.trim() || undefined : undefined,
        developer_id: devType === 'self' ? developerId || undefined : undefined,
        developer_name_snapshot: devType === 'self' ? selectedDevObj?.name : undefined,
        dev_method: devType === 'self' ? devMethod : undefined,
        dilution_ratio: devType === 'self' ? effectiveDilution : undefined,
        dev_quantity_rolls: devType === 'self' ? Number(devQuantityRolls) || 1 : 1,
        chemical_volume_ml: devType === 'self' && chemicalVolumeMl !== '' ? Number(chemicalVolumeMl) : undefined,
        dilution_liquid_volume_ml: devType === 'self' && dilutionLiquidVolumeMl !== '' ? Number(dilutionLiquidVolumeMl) : undefined,
        dev_temp_celsius: devType === 'self' && devTempCelsius !== '' ? Number(devTempCelsius) : undefined,
        dev_time: devType === 'self' ? devTime.trim() || undefined : undefined,
        agitation_details: devType === 'self' ? agitationDetails.trim() || undefined : undefined,
        stop_fix_wash_notes: devType === 'self' ? stopFixWashNotes.trim() || undefined : undefined,
        notes: notes.trim() || found.notes,
        updated_at: new Date().toISOString(),
      };
    } else {
      // External Roll / 목록 외 필름
      const title = externalTitle.trim() || `[외부필름] ${externalFilmName || '필름'} 현상 (${developedDate})`;
      const newRollId = `roll-ext-${Date.now()}`;

      targetRoll = {
        id: editingRoll ? editingRoll.id : newRollId,
        title,
        is_external_roll: true,
        external_film_info: `${externalFilmName} (${externalFormat}, ISO ${externalIso})`,
        film_name_snapshot: externalFilmName || '외부 등록 필름',
        camera_name_snapshot: '외부 필름 (촬영 정보 미기록)',
        loaded_date: developedDate,
        unloaded_date: developedDate,
        status: 'developed',
        shooting_sessions: [],
        iso_rated: externalIso !== '' ? Number(externalIso) : undefined,
        total_shots: 36,
        dev_type: devType,
        developed_date: developedDate,
        lab_name: devType === 'lab' ? labName.trim() || undefined : undefined,
        developer_id: devType === 'self' ? developerId || undefined : undefined,
        developer_name_snapshot: devType === 'self' ? selectedDevObj?.name : undefined,
        dev_method: devType === 'self' ? devMethod : undefined,
        dilution_ratio: devType === 'self' ? effectiveDilution : undefined,
        dev_quantity_rolls: devType === 'self' ? Number(devQuantityRolls) || 1 : 1,
        chemical_volume_ml: devType === 'self' && chemicalVolumeMl !== '' ? Number(chemicalVolumeMl) : undefined,
        dilution_liquid_volume_ml: devType === 'self' && dilutionLiquidVolumeMl !== '' ? Number(dilutionLiquidVolumeMl) : undefined,
        dev_temp_celsius: devType === 'self' && devTempCelsius !== '' ? Number(devTempCelsius) : undefined,
        dev_time: devType === 'self' ? devTime.trim() || undefined : undefined,
        agitation_details: devType === 'self' ? agitationDetails.trim() || undefined : undefined,
        stop_fix_wash_notes: devType === 'self' ? stopFixWashNotes.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
        created_at: editingRoll ? editingRoll.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    await onSaveRoll(targetRoll, previousRollState);
    setLastDevelopedRoll(targetRoll);
    setIsModalOpen(false);
  };

  // Filtered lists
  const displayedRolls = useMemo(() => {
    let source: ShootingRoll[] = [];
    if (activeSubTab === 'pending') {
      source = pendingRolls;
    } else if (activeSubTab === 'developed') {
      source = developedRolls;
    } else {
      source = rolls;
    }

    return source.filter((r) => {
      const q = search.toLowerCase();
      const matchQ =
        r.title.toLowerCase().includes(q) ||
        r.film_name_snapshot.toLowerCase().includes(q) ||
        r.camera_name_snapshot.toLowerCase().includes(q) ||
        (r.developer_name_snapshot && r.developer_name_snapshot.toLowerCase().includes(q)) ||
        (r.lab_name && r.lab_name.toLowerCase().includes(q));

      if (!matchQ) return false;

      if (devTypeFilter !== 'all') {
        if (devTypeFilter === 'none' && r.dev_type !== 'none') return false;
        if (devTypeFilter === 'self' && r.dev_type !== 'self') return false;
        if (devTypeFilter === 'lab' && r.dev_type !== 'lab') return false;
      }

      return true;
    });
  }, [rolls, pendingRolls, developedRolls, activeSubTab, search, devTypeFilter]);

  return (
    <div className="view-container">
      {/* 4 Apple-style Minimal Stat Cards */}
      <div className="stats-grid">
        <div
          className="stat-card"
          style={{ '--stat-accent': '#3b82f6', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => setActiveSubTab('pending')}
        >
          <div className="stat-label">
            <FlaskConical size={15} /> 현상 대기 중인 롤
          </div>
          <div className="stat-value">{pendingRolls.length} 롤</div>
          <div className="stat-desc">촬영 완료 후 현상 대기</div>
        </div>

        <div
          className="stat-card"
          style={{ '--stat-accent': '#a855f7', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => setActiveSubTab('developed')}
        >
          <div className="stat-label">
            <Sparkles size={15} /> 자가 현상 누적
          </div>
          <div className="stat-value">{rolls.filter((r) => r.dev_type === 'self').length} 롤</div>
          <div className="stat-desc">다크룸 직접 현상 기록</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Building2 size={15} /> 현상소 위탁 누적
          </div>
          <div className="stat-value">{rolls.filter((r) => r.dev_type === 'lab').length} 롤</div>
          <div className="stat-desc">전문 랩 위탁 진행</div>
        </div>

        <div
          className="stat-card"
          style={{ '--stat-accent': '#10b981', cursor: onNavigateToScan ? 'pointer' : 'default' } as React.CSSProperties}
          onClick={() => onNavigateToScan?.()}
        >
          <div className="stat-label">
            <Folder size={15} /> 현상 완료 / 스캔 대기
          </div>
          <div className="stat-value">{rolls.filter((r) => r.status === 'developed').length} 롤</div>
          <div className="stat-desc">스캔 아카이빙 대기 중</div>
        </div>
      </div>

      {/* Post-Save Toast / Notice */}
      {lastDevelopedRoll && (
        <div
          className="notion-callout"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={17} color="#10b981" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <strong>‘{lastDevelopedRoll.title}’</strong> 현상이 완료되었습니다! (현상액 누적 롤 수 반영 완료)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onNavigateToScan && (
              <button
                className="btn btn-primary btn-sm"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                onClick={() => onNavigateToScan(lastDevelopedRoll.id)}
              >
                📷 스캔 관리로 바로가기 →
              </button>
            )}
            <button className="btn btn-subtle btn-sm" onClick={() => setLastDevelopedRoll(null)}>
              ✕ 닫기
            </button>
          </div>
        </div>
      )}

      {/* Segmented Control for Subtabs */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${activeSubTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('pending')}
          >
            🧪 현상 대기 필름 <span className="segmented-badge">{pendingRolls.length}</span>
          </button>
          <button
            className={`segmented-item ${activeSubTab === 'developed' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('developed')}
          >
            ✨ 현상 완료 내역 <span className="segmented-badge">{developedRolls.length}</span>
          </button>
          <button
            className={`segmented-item ${activeSubTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('all')}
          >
            📋 전체 필름 기록 <span className="segmented-badge">{rolls.length}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="롤 제목, 필름, 사용 현상액, 현상소명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={devTypeFilter}
            onChange={(e) => setDevTypeFilter(e.target.value)}
          >
            <option value="all">현상 방식 전체</option>
            <option value="self">🧪 자가 현상만</option>
            <option value="lab">🏬 현상소 위탁만</option>
            <option value="none">⏳ 미현상(대기)</option>
          </select>

          <button className="btn btn-primary" onClick={openNewDevModal}>
            <Plus size={16} /> 새 현상 작업 등록
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {displayedRolls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FlaskConical size={28} />
          </div>
          {activeSubTab === 'pending' ? (
            <>
              <h3>현상 대기 중인 필름이 없습니다</h3>
              <p>
                촬영 관리 탭에서 촬영을 마친 필름을 언로딩(촬영 종료)하거나,
                <br />
                남의 필름이나 오래 묵힌 미등록 필름을 바로 현상할 수 있습니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn-primary" onClick={openNewDevModal}>
                  <Plus size={16} /> 목록 외 / 외부 필름 바로 현상하기
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>조회된 현상 내역이 없습니다</h3>
              <p>현상 대기 중인 필름의 레시피를 등록하거나 새 현상을 시작해보세요.</p>
              <button className="btn btn-primary" onClick={openNewDevModal}>
                <Plus size={16} /> 새 현상 작업 등록
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {displayedRolls.map((roll) => {
            const statusClass = `status-pill ${roll.status}`;
            const isPending = roll.status === 'unloaded';
            const isDeveloped = roll.status === 'developed';
            const isScanned = roll.status === 'scanned';

            return (
              <div
                key={roll.id}
                className="item-card"
                style={{
                  borderLeft: isPending ? '3px solid var(--accent-blue)' : isDeveloped ? '3px solid var(--accent-purple)' : undefined,
                }}
              >
                <div className="card-top">
                  <div className="card-title-group">
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={statusClass}>
                        ● {isPending ? '현상 대기 (Pending)' : isDeveloped ? '현상 완료 (스캔 대기)' : isScanned ? '스캔 완료 (Archive)' : '촬영 중'}
                      </span>
                      {roll.is_external_roll && (
                        <span className="notion-tag" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
                          📦 목록 외 / 외부 필름
                        </span>
                      )}
                      {roll.dev_type === 'self' && (
                        <span className="notion-tag" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}>
                          🧪 자가 현상
                        </span>
                      )}
                      {roll.dev_type === 'lab' && (
                        <span className="notion-tag" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                          🏬 현상소 위탁
                        </span>
                      )}
                    </div>

                    <h3 className="card-title" style={{ marginTop: '5px' }}>
                      {roll.title}
                    </h3>
                  </div>
                </div>

                {/* Systematic Property Table */}
                <div className="notion-prop-table">
                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🎞️ 필름</span>
                    <span className="notion-prop-val">
                      <strong>{roll.film_name_snapshot}</strong>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📷 카메라</span>
                    <span className="notion-prop-val">{roll.camera_name_snapshot}</span>
                  </div>

                  {roll.unloaded_date && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">🏁 촬영 종료일</span>
                      <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                        {roll.unloaded_date}
                      </span>
                    </div>
                  )}

                  {roll.developed_date && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">🧪 현상 완료일</span>
                      <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                        {roll.developed_date}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recipe Notion Callout for Developed Rolls */}
                {roll.dev_type === 'self' && (
                  <div
                    className="notion-callout"
                    style={{
                      background: 'rgba(168, 85, 247, 0.08)',
                      borderColor: 'rgba(168, 85, 247, 0.25)',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ color: '#c084fc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FlaskConical size={14} />
                      현상 레시피: <strong>{roll.developer_name_snapshot || '지정 현상액'}</strong> (희석 {roll.dilution_ratio})
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.78rem', lineHeight: '1.45' }}>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>
                          온도: <strong>{roll.dev_temp_celsius ? `${roll.dev_temp_celsius}°C` : '-'}</strong>
                        </span>
                        <span>
                          시간: <strong>{roll.dev_time || '-'}</strong>
                        </span>
                        <span>
                          방식: <strong>{roll.dev_method ? (AGITATION_METHOD_CONFIG[roll.dev_method]?.label || roll.dev_method) : '-'}</strong>
                        </span>
                        <span>
                          동시현상: <strong>{roll.dev_quantity_rolls || 1}롤</strong>
                        </span>
                      </div>
                      {roll.agitation_details && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '3px' }}>
                          교반: {roll.agitation_details}
                        </div>
                      )}
                      {roll.stop_fix_wash_notes && (
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '2px' }}>
                          정지/정착: {roll.stop_fix_wash_notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {roll.dev_type === 'lab' && (
                  <div
                    className="notion-callout"
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderColor: 'rgba(59, 130, 246, 0.25)',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                      <Building2 size={14} />
                      <span>현상소 위탁: <strong>{roll.lab_name || '현상소'}</strong> ({roll.developed_date})</span>
                    </div>
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="card-bottom">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {isPending ? '대기 중' : isDeveloped ? '스캔 대기' : '완료됨'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isPending && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
                        onClick={() => openDevModalForRoll(roll)}
                        title="현상액과 교반 레시피를 입력하고 현상을 완료합니다"
                      >
                        <FlaskConical size={13} /> 지금 현상하기
                      </button>
                    )}

                    {isDeveloped && onNavigateToScan && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ background: '#10b981', borderColor: '#10b981' }}
                        onClick={() => onNavigateToScan(roll.id)}
                        title="스캔 관리 탭으로 이동하여 스캔 기록"
                      >
                        <Folder size={13} /> 스캔하러 가기
                      </button>
                    )}

                    <button className="btn btn-secondary btn-sm" onClick={() => openDevModalForRoll(roll)}>
                      <Edit2 size={13} /> {isPending ? '수정' : '레시피 수정'}
                    </button>

                    {onDeleteRoll && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`'${roll.title}' 현상 기록을 삭제하시겠습니까?`)) {
                            onDeleteRoll(roll.id);
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 현상 등록 / 수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2>
                {editingRoll
                  ? `현상 레시피 기록 & 수정: ${editingRoll.title}`
                  : '새 필름 현상 작업 등록 (자가 현상 & 현상소)'}
              </h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 1. 대상 필름 선택 (현상 대기 롤 vs 목록 외 필름) */}
                {!editingRoll && (
                  <div style={{ border: '1px solid var(--border-normal)', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.015)' }}>
                    <label className="form-label" style={{ marginBottom: '8px', fontWeight: '600' }}>
                      현상 대상 선택
                    </label>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${rollSelectionMode === 'pending_roll' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRollSelectionMode('pending_roll')}
                        disabled={pendingRolls.length === 0}
                      >
                        📋 촬영 완료 대기 필름에서 선택 ({pendingRolls.length}롤)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${rollSelectionMode === 'external_roll' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRollSelectionMode('external_roll')}
                      >
                        📦 목록 외 / 외부 필름 (남의 필름, 오래 묵힌 필름)
                      </button>
                    </div>

                    {rollSelectionMode === 'pending_roll' && (
                      <div className="form-group">
                        <label className="form-label">현상할 필름 롤 *</label>
                        <select
                          className="form-select"
                          value={selectedPendingRollId}
                          onChange={(e) => setSelectedPendingRollId(e.target.value)}
                          required
                        >
                          {pendingRolls.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title} - {r.film_name_snapshot} ({r.camera_name_snapshot}, 뺀 날: {r.unloaded_date || '-'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {rollSelectionMode === 'external_roll' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">식별명 / 제목</label>
                            <input
                              className="form-input"
                              type="text"
                              placeholder="예: 지수 부탁 롤, 장롱 속 10년 묵은 트라이엑스"
                              value={externalTitle}
                              onChange={(e) => setExternalTitle(e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">필름 종류 / 이름 *</label>
                            <input
                              className="form-input"
                              type="text"
                              placeholder="예: Kodak Tri-X 400, Fuji C200"
                              value={externalFilmName}
                              onChange={(e) => setExternalFilmName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">필름 포맷</label>
                            <select
                              className="form-select"
                              value={externalFormat}
                              onChange={(e) => setExternalFormat(e.target.value as FilmFormat)}
                            >
                              <option value="135">135 (35mm)</option>
                              <option value="120">120 (중형)</option>
                              <option value="large_sheet">대형 시트</option>
                              <option value="110">110</option>
                              <option value="other">기타</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label">기준 ISO (감도)</label>
                            <input
                              className="form-input"
                              type="number"
                              placeholder="400"
                              value={externalIso}
                              onChange={(e) => setExternalIso(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. 현상 구분 & 현상 완료일 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">현상 방식 구분 *</label>
                    <select
                      className="form-select"
                      value={devType}
                      onChange={(e) => setDevType(e.target.value as DevType)}
                      required
                    >
                      <option value="self">🧪 자가 현상 (Home Darkroom Development)</option>
                      <option value="lab">🏬 현상소 위탁 (Lab Consignment)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">현상 완료일 *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={developedDate}
                      onChange={(e) => setDevelopedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 3. 현상소 위탁 옵션 */}
                {devType === 'lab' && (
                  <div className="form-group">
                    <label className="form-label">위탁 현상소 명칭 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: 충무로 포토마루, 필름로그, 고래사진관, 망우삼림 등"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* 4. 자가 현상 상세 레시피 & 약품 연동 */}
                {devType === 'self' && (
                  <div style={{ border: '1px solid var(--border-normal)', borderRadius: '10px', padding: '16px', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FlaskConical size={15} color="var(--accent-purple)" />
                        현상액 선택 및 교반 레시피
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)' }}>
                        ★ 완료 시 현상액 사용롤 수 자동 누적
                      </span>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">사용한 현상액 (라이브러리 연동) *</label>
                        <select
                          className="form-select"
                          value={developerId}
                          onChange={(e) => setDeveloperId(e.target.value)}
                          required
                        >
                          {developers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.manufacturer}, {d.type}) - 누적 {d.total_rolls_processed}롤 사용됨
                            </option>
                          ))}
                          {developers.length === 0 && <option value="">등록된 현상액이 없습니다 (현상액 관리에서 먼저 등록 권장)</option>}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          동시 현상 롤 수 (약품 누적 카운트용) *
                        </label>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={devQuantityRolls}
                          onChange={(e) => setDevQuantityRolls(Number(e.target.value))}
                          required
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          💡 2구 탱크에 2롤 함께 현상 시 해당 수량만큼 현상액의 누적 롤에 가산됩니다.
                        </span>
                      </div>
                    </div>

                    {/* 희석 비율 & 교반 형태 */}
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">희석 비율 (Dilution)</label>
                        <select
                          className="form-select"
                          value={dilutionRatio}
                          onChange={(e) => setDilutionRatio(e.target.value)}
                        >
                          {COMMON_DILUTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">현상 방식 (교반 형태)</label>
                        <select
                          className="form-select"
                          value={devMethod}
                          onChange={(e) => setDevMethod(e.target.value as AgitationMethod)}
                        >
                          <option value="inversion">수교반 (탱크 수동 반전 교반)</option>
                          <option value="rotary">로터리 현상 (Jobo 등 연속 회전)</option>
                          <option value="stand">스탠딩 (정치현상 1시간+)</option>
                          <option value="semi_stand">세미 스탠딩</option>
                          <option value="other">기타 커스텀</option>
                        </select>
                      </div>
                    </div>

                    {dilutionRatio === '기타 직접입력' && (
                      <div className="form-group">
                        <label className="form-label">직접 희석비율 입력</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="예: 1:31 (HC-110 Dilution B)"
                          value={customDilution}
                          onChange={(e) => setCustomDilution(e.target.value)}
                        />
                      </div>
                    )}

                    {/* 온도, 시간, 약품량 */}
                    <div className="form-row-3">
                      <div className="form-group">
                        <label className="form-label">현상 온도 (°C)</label>
                        <input
                          className="form-input"
                          type="number"
                          step="0.5"
                          placeholder="20"
                          value={devTempCelsius}
                          onChange={(e) => setDevTempCelsius(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">현상 시간 (교반 시간) *</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="예: 9분 30초, 10분"
                          value={devTime}
                          onChange={(e) => setDevTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">현상액 원액/총용량 (ml)</label>
                        <input
                          className="form-input"
                          type="number"
                          placeholder="300"
                          value={chemicalVolumeMl}
                          onChange={(e) => setChemicalVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* 교반 세부 스케줄 & 프리셋 */}
                    <div className="form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>
                          교반 세부 스케줄 (몇 분마다 몇 회 반전/회전)
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.72rem', padding: '1px 6px' }}
                            onClick={() => setAgitationDetails('초기 30초 연속 교반, 매 1분마다 10초간 4회 반전 교반')}
                          >
                            표준 수교반
                          </button>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.72rem', padding: '1px 6px' }}
                            onClick={() => setAgitationDetails('로터리 프로세서 50rpm 연속 일정 속도 회전')}
                          >
                            로터리
                          </button>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.72rem', padding: '1px 6px' }}
                            onClick={() => setAgitationDetails('초기 1분 부드럽게 연속 반전 후 60분 완전 정치')}
                          >
                            스탠딩 정치
                          </button>
                        </div>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="예: 초기 30초 연속 교반, 매 1분마다 10초간 4회 반전 교반"
                        value={agitationDetails}
                        onChange={(e) => setAgitationDetails(e.target.value)}
                      />
                    </div>

                    {/* 정지 / 정착 / 수세 메모 & 프리셋 */}
                    <div className="form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>
                          정지 / 정착 / 수세 / 마무리 메모
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.72rem', padding: '1px 6px' }}
                            onClick={() => setStopFixWashNotes('물정지 1분 -> 래피드픽서 1:4 5분 -> 일포드 수세법 -> 포토플로 30초')}
                          >
                            표준 흑백 루틴
                          </button>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.72rem', padding: '1px 6px' }}
                            onClick={() => setStopFixWashNotes('블릭스 6분 30초 (38°C) -> 온수 수세 3분 -> 최종 안정액 1분')}
                          >
                            C-41 컬러 루틴
                          </button>
                        </div>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="예: 물정지 1분 -> 래피드픽서 1:4 5분 -> 일포드 수세법 -> 포토플로"
                        value={stopFixWashNotes}
                        onChange={(e) => setStopFixWashNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* 결과 총평 메모 */}
                <div className="form-group">
                  <label className="form-label">현상 결과 총평 / 다음 번 참고 메모</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="콘트라스트 느낌, 베이스 농도, 그레인 상태 등"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="notion-callout" style={{ background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                  <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                    현상 완료 저장을 누르면 현상액 관리에 누적 롤 수가 즉시 가산되며,
                    이 롤은 <strong>[필름 스캔 관리]</strong> 탭의 스캔 대기 목록에 자동으로 등록됩니다.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                  {editingRoll ? '현상 레시피 수정 완료' : '현상 완료 저장 (약품 누적 반영)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
