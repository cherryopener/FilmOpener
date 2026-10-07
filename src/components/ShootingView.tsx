'use client';

import React, { useState, useMemo } from 'react';
import {
  ShootingRoll,
  FilmItem,
  CameraItem,
  LensItem,
  DeveloperChemical,
  ShootingSession,
  WeatherType,
  RollStatus,
  DevType,
  AgitationMethod,
} from '@/types';
import {
  WEATHER_CONFIG,
  AGITATION_METHOD_CONFIG,
  COMMON_DILUTIONS,
} from '@/lib/constants';
import {
  Film,
  Camera,
  Calendar,
  CloudSun,
  Plus,
  Trash2,
  Edit2,
  FlaskConical,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
  Eye,
  AlertCircle,
  ChevronDown,
  Search,
} from 'lucide-react';

interface ShootingViewProps {
  rolls: ShootingRoll[];
  films: FilmItem[];
  cameras: CameraItem[];
  lenses: LensItem[];
  developers: DeveloperChemical[];
  onSaveRoll: (roll: ShootingRoll, previousRoll?: ShootingRoll) => Promise<void>;
  onDeleteRoll: (id: string) => Promise<void>;
}

export default function ShootingView({
  rolls,
  films,
  cameras,
  lenses,
  developers,
  onSaveRoll,
  onDeleteRoll,
}: ShootingViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState<ShootingRoll | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [filmId, setFilmId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [lensId, setLensId] = useState('');
  const [loadedDate, setLoadedDate] = useState('');
  const [unloadedDate, setUnloadedDate] = useState('');
  const [status, setStatus] = useState<RollStatus>('loaded');
  const [isoRated, setIsoRated] = useState<number | ''>('');
  const [totalShots, setTotalShots] = useState<number | ''>(36);

  // 3-3 & 3-4. 출사일 세션 목록 (다중 추가 지원)
  const [sessions, setSessions] = useState<ShootingSession[]>([]);

  // 3-6. 현상 방법 관리
  const [devType, setDevType] = useState<DevType>('none');
  const [labName, setLabName] = useState('');
  const [developedDate, setDevelopedDate] = useState('');
  const [developerId, setDeveloperId] = useState('');
  const [devMethod, setDevMethod] = useState<AgitationMethod>('inversion');
  const [dilutionRatio, setDilutionRatio] = useState('1:1');
  const [customDilution, setCustomDilution] = useState('');
  const [devQuantityRolls, setDevQuantityRolls] = useState<number>(1);
  const [chemicalVolumeMl, setChemicalVolumeMl] = useState<number | ''>(250);
  const [dilutionLiquidVolumeMl, setDilutionLiquidVolumeMl] = useState<number | ''>(250);
  const [agitationDetails, setAgitationDetails] = useState('');
  const [devTempCelsius, setDevTempCelsius] = useState<number | ''>(20);
  const [devTime, setDevTime] = useState('');
  const [stopFixWashNotes, setStopFixWashNotes] = useState('');
  const [notes, setNotes] = useState('');

  // 2-2 & 3-1. 수리필요(고장)이나 수리중일 경우 현재 사용이 불가능하므로 "사용한 카메라 목록"에 뜨지 않도록 필터링!
  const availableCameras = useMemo(() => {
    return cameras.filter((c) => c.status !== 'needs_repair' && c.status !== 'in_repair');
  }, [cameras]);

  // Selected camera to check if lens is fixed
  const selectedCamera = useMemo(() => {
    return cameras.find((c) => c.id === cameraId);
  }, [cameras, cameraId]);

  const openAddModal = () => {
    setEditingRoll(null);
    setTitle('');
    setFilmId(films[0]?.id || '');
    setCameraId(availableCameras[0]?.id || '');
    setLensId(lenses[0]?.id || '');
    const today = new Date().toISOString().split('T')[0];
    setLoadedDate(today);
    setUnloadedDate('');
    setStatus('loaded');
    setIsoRated(400);
    setTotalShots(36);

    // Initial session
    setSessions([
      {
        id: `sess-${Date.now()}`,
        date: today,
        weather: 'sunny',
        location: '',
        shots_taken: 12,
        notes: '',
      },
    ]);

    setDevType('none');
    setLabName('');
    setDevelopedDate('');
    setDeveloperId(developers[0]?.id || '');
    setDevMethod('inversion');
    setDilutionRatio('1:1');
    setCustomDilution('');
    setDevQuantityRolls(1);
    setChemicalVolumeMl(250);
    setDilutionLiquidVolumeMl(250);
    setAgitationDetails('초기 30초 연속 반전 교반 후, 매 1분마다 10초간 4회 반전 교반');
    setDevTempCelsius(20);
    setDevTime('9분 30초');
    setStopFixWashNotes('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (roll: ShootingRoll) => {
    setEditingRoll(roll);
    setTitle(roll.title);
    setFilmId(roll.film_id || '');
    setCameraId(roll.camera_id || '');
    setLensId(roll.lens_id || '');
    setLoadedDate(roll.loaded_date);
    setUnloadedDate(roll.unloaded_date || '');
    setStatus(roll.status);
    setIsoRated(roll.iso_rated ?? '');
    setTotalShots(roll.total_shots ?? 36);
    setSessions(roll.shooting_sessions && roll.shooting_sessions.length > 0 ? [...roll.shooting_sessions] : []);
    setDevType(roll.dev_type);
    setLabName(roll.lab_name || '');
    setDevelopedDate(roll.developed_date || '');
    setDeveloperId(roll.developer_id || developers[0]?.id || '');
    setDevMethod(roll.dev_method || 'inversion');

    const isPresetDilution = COMMON_DILUTIONS.includes(roll.dilution_ratio || '');
    if (isPresetDilution) {
      setDilutionRatio(roll.dilution_ratio || '1:1');
      setCustomDilution('');
    } else {
      setDilutionRatio('기타 직접입력');
      setCustomDilution(roll.dilution_ratio || '');
    }

    setDevQuantityRolls(roll.dev_quantity_rolls || 1);
    setChemicalVolumeMl(roll.chemical_volume_ml ?? '');
    setDilutionLiquidVolumeMl(roll.dilution_liquid_volume_ml ?? '');
    setAgitationDetails(roll.agitation_details || '');
    setDevTempCelsius(roll.dev_temp_celsius ?? 20);
    setDevTime(roll.dev_time || '');
    setStopFixWashNotes(roll.stop_fix_wash_notes || '');
    setNotes(roll.notes || '');
    setIsModalOpen(true);
  };

  // 3-4. 출사일 세션 추가 핸들러
  const addSession = () => {
    const today = new Date().toISOString().split('T')[0];
    setSessions([
      ...sessions,
      {
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: today,
        weather: 'sunny',
        location: '',
        shots_taken: 10,
        notes: '',
      },
    ]);
  };

  const updateSession = (id: string, field: keyof ShootingSession, value: any) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSession = (id: string) => {
    if (sessions.length <= 1) {
      alert('최소 1개의 출사 세션이 필요합니다.');
      return;
    }
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadedDate) {
      alert('필름 로딩 날짜를 선택해주세요.');
      return;
    }

    // Resolve snapshots
    const filmObj = films.find((f) => f.id === filmId);
    const camObj = cameras.find((c) => c.id === cameraId);
    const lensObj = lenses.find((l) => l.id === lensId);
    const devObj = developers.find((d) => d.id === developerId);

    const effectiveTitle = title.trim() || `${camObj ? `${camObj.brand} ${camObj.model}` : 'Roll'} - ${filmObj ? filmObj.name : 'Film'} (${loadedDate})`;

    const finalDilution = dilutionRatio === '기타 직접입력' ? customDilution.trim() : dilutionRatio;

    const newRoll: ShootingRoll = {
      id: editingRoll ? editingRoll.id : `roll-${Date.now()}`,
      title: effectiveTitle,
      film_id: filmId || undefined,
      film_name_snapshot: filmObj ? `${filmObj.name} (ISO ${filmObj.iso})` : (editingRoll?.film_name_snapshot || '기타 필름'),
      camera_id: cameraId || undefined,
      camera_name_snapshot: camObj ? `${camObj.brand} ${camObj.model}` : (editingRoll?.camera_name_snapshot || '기타 카메라'),
      lens_id: camObj?.lens_type === 'fixed' ? undefined : (lensId || undefined),
      lens_name_snapshot: camObj?.lens_type === 'fixed'
        ? (camObj.fixed_lens_name || `${camObj.fixed_focal_length}mm f/${camObj.fixed_max_aperture}`)
        : (lensObj ? `${lensObj.brand} ${lensObj.name}` : undefined),
      loaded_date: loadedDate,
      unloaded_date: unloadedDate || undefined,
      status,
      shooting_sessions: sessions,
      iso_rated: isoRated !== '' ? Number(isoRated) : undefined,
      total_shots: totalShots !== '' ? Number(totalShots) : undefined,
      dev_type: devType,
      lab_name: devType === 'lab' ? labName.trim() : undefined,
      developed_date: developedDate || undefined,
      developer_id: devType === 'self' ? developerId : undefined,
      developer_name_snapshot: devType === 'self' && devObj ? devObj.name : undefined,
      dev_method: devType === 'self' ? devMethod : undefined,
      dilution_ratio: devType === 'self' ? finalDilution : undefined,
      dev_quantity_rolls: Number(devQuantityRolls) || 1,
      chemical_volume_ml: chemicalVolumeMl !== '' ? Number(chemicalVolumeMl) : undefined,
      dilution_liquid_volume_ml: dilutionLiquidVolumeMl !== '' ? Number(dilutionLiquidVolumeMl) : undefined,
      agitation_details: devType === 'self' ? agitationDetails.trim() : undefined,
      dev_temp_celsius: devTempCelsius !== '' ? Number(devTempCelsius) : undefined,
      dev_time: devTime.trim() || undefined,
      stop_fix_wash_notes: stopFixWashNotes.trim() || undefined,
      notes: notes.trim() || undefined,
      created_at: editingRoll ? editingRoll.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveRoll(newRoll, editingRoll || undefined);
    setIsModalOpen(false);
  };

  const filteredRolls = useMemo(() => {
    return rolls.filter((r) => {
      const q = search.toLowerCase();
      const matchQ =
        r.title.toLowerCase().includes(q) ||
        r.film_name_snapshot.toLowerCase().includes(q) ||
        r.camera_name_snapshot.toLowerCase().includes(q) ||
        (r.shooting_sessions && r.shooting_sessions.some((s) => s.location.toLowerCase().includes(q)));

      if (!matchQ) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      return true;
    });
  }, [rolls, search, statusFilter]);

  return (
    <div className="content-body">
      {/* Top Banner */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#3b82f6' } as React.CSSProperties}>
          <div className="stat-label">
            <Film size={15} /> 촬영 중인 롤 (Loaded)
          </div>
          <div className="stat-value">{rolls.filter((r) => r.status === 'loaded').length} 롤</div>
          <div className="stat-desc">카메라에 장전된 필름</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Clock size={15} /> 촬영 완료 / 현상 대기
          </div>
          <div className="stat-value">{rolls.filter((r) => r.status === 'unloaded').length} 롤</div>
          <div className="stat-desc">필름 뺌 (현상 필요)</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' } as React.CSSProperties}>
          <div className="stat-label">
            <FlaskConical size={15} /> 현상 완료된 롤
          </div>
          <div className="stat-value">{rolls.filter((r) => r.status === 'developed').length} 롤</div>
          <div className="stat-desc">스캔 대기 중</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#10b981' } as React.CSSProperties}>
          <div className="stat-label">
            <CheckCircle size={15} /> 스캔 & 아카이브 완료
          </div>
          <div className="stat-value">{rolls.filter((r) => r.status === 'scanned').length} 롤</div>
          <div className="stat-desc">모든 과정 완료</div>
        </div>
      </div>

      {/* Apple-style Segmented Status Control */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            전체 롤 <span className="segmented-badge">{rolls.length}</span>
          </button>
          <button
            className={`segmented-item ${statusFilter === 'loaded' ? 'active' : ''}`}
            onClick={() => setStatusFilter('loaded')}
          >
            촬영 중 <span className="segmented-badge">{rolls.filter((r) => r.status === 'loaded').length}</span>
          </button>
          <button
            className={`segmented-item ${statusFilter === 'unloaded' ? 'active' : ''}`}
            onClick={() => setStatusFilter('unloaded')}
          >
            촬영 완료 <span className="segmented-badge">{rolls.filter((r) => r.status === 'unloaded').length}</span>
          </button>
          <button
            className={`segmented-item ${statusFilter === 'developed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('developed')}
          >
            현상 완료 <span className="segmented-badge">{rolls.filter((r) => r.status === 'developed').length}</span>
          </button>
          <button
            className={`segmented-item ${statusFilter === 'scanned' ? 'active' : ''}`}
            onClick={() => setStatusFilter('scanned')}
          >
            스캔 완료 <span className="segmented-badge">{rolls.filter((r) => r.status === 'scanned').length}</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="롤 이름, 카메라, 필름, 출사 장소 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 새 롤 장전 / 촬영 기록
          </button>
        </div>
      </div>

      {/* Rolls Grid */}
      {filteredRolls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Film size={28} /></div>
          <h3>기록된 촬영 롤이 없습니다</h3>
          <p>카메라에 필름을 장전하고 첫 번째 출사 기록을 남겨보세요.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 첫 롤 장전하기
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredRolls.map((roll) => {
            const statusClass = `status-pill ${roll.status}`;
            const statusLabel =
              roll.status === 'loaded'
                ? '촬영 중 (Loaded)'
                : roll.status === 'unloaded'
                ? '촬영 완료 (현상 대기)'
                : roll.status === 'developed'
                ? '현상 완료 (스캔 대기)'
                : '스캔 완료 (Archive)';

            return (
              <div key={roll.id} className="item-card">
                <div className="card-top">
                  <div className="card-title-group">
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={statusClass}>
                        ● {statusLabel}
                      </span>
                      {roll.iso_rated && (
                        <span className="spec-pill">
                          촬영 ISO <strong>{roll.iso_rated}</strong>
                        </span>
                      )}
                      {roll.total_shots && (
                        <span className="spec-pill">
                          <strong>{roll.total_shots}컷</strong>
                        </span>
                      )}
                    </div>

                    <h3 className="card-title" style={{ marginTop: '4px' }}>
                      {roll.title}
                    </h3>
                  </div>
                </div>

                {/* Notion Systematic Database Property Rows */}
                <div className="notion-prop-table">
                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🎞️ 장전 필름</span>
                    <span className="notion-prop-val">
                      <strong style={{ color: 'var(--accent-amber-light)' }}>{roll.film_name_snapshot}</strong>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📷 카메라 바디</span>
                    <span className="notion-prop-val">
                      {roll.camera_name_snapshot}
                    </span>
                  </div>

                  {roll.lens_name_snapshot && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">🔭 마운트 렌즈</span>
                      <span className="notion-prop-val">
                        {roll.lens_name_snapshot}
                      </span>
                    </div>
                  )}

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📅 필름 장전일</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {roll.loaded_date}
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🏁 필름 뺀 날</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {roll.unloaded_date || (
                        <span style={{ color: 'var(--accent-blue)', fontSize: '0.74rem' }}>촬영 진행 중</span>
                      )}
                    </span>
                  </div>

                  {roll.developed_date && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">🧪 현상 완료일</span>
                      <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                        {roll.developed_date}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3-3 & 3-4. 출사 세션 목록 Notion Callout */}
                {roll.shooting_sessions && roll.shooting_sessions.length > 0 && (
                  <div className="notion-callout" style={{ flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} /> 출사 일정 기록 ({roll.shooting_sessions.length}회)
                    </div>
                    {roll.shooting_sessions.map((s, idx) => {
                      const weatherCfg = WEATHER_CONFIG[s.weather] || WEATHER_CONFIG.sunny;
                      return (
                        <div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', width: '100%', paddingTop: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span title={weatherCfg.label}>{weatherCfg.icon}</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{s.location || '출사 장소 미기재'}</span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>({s.date})</span>
                          </div>
                          {s.shots_taken && (
                            <span style={{ color: 'var(--accent-amber-light)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                              {s.shots_taken}컷
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3-6. 현상 방법 요약 Notion Callout */}
                {roll.dev_type !== 'none' && (
                  <div className="notion-callout" style={{ background: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.25)', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#c084fc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FlaskConical size={13} />
                      {roll.dev_type === 'self' ? '자가 현상 (Home Development)' : `현상소 위탁 (${roll.lab_name || '현상소'})`}
                    </div>

                    {roll.dev_type === 'self' && (
                      <div style={{ color: 'var(--text-main)', lineHeight: '1.45', fontSize: '0.78rem' }}>
                        <div>약품: <strong>{roll.developer_name_snapshot}</strong> (희석 <strong>{roll.dilution_ratio}</strong>, 동시 <strong>{roll.dev_quantity_rolls}롤</strong>)</div>
                        {roll.dev_method && (
                          <div style={{ color: 'var(--text-muted)' }}>
                            방식: {AGITATION_METHOD_CONFIG[roll.dev_method]?.label || roll.dev_method} ({roll.dev_temp_celsius}°C, {roll.dev_time})
                          </div>
                        )}
                        {roll.agitation_details && (
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.73rem', marginTop: '2px' }}>
                            교반: {roll.agitation_details}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Bottom */}
                <div className="card-bottom">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    등록: {roll.created_at?.split('T')[0] || '-'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(roll)}>
                      <Edit2 size={13} /> 수정 / 현상기록
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`'${roll.title}' 롤 기록을 삭제하시겠습니까?`)) {
                          onDeleteRoll(roll.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 촬영 롤 등록 / 수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2>{editingRoll ? '촬영 롤 상세 및 현상 관리' : '새 필름 장전 & 촬영 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 롤 타이틀 & 상태 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">롤 제목 / 식별명</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: #2026-04 제주 성산일출봉"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">현재 진행 상태</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as RollStatus)}
                    >
                      <option value="loaded">촬영 중 (Loaded)</option>
                      <option value="unloaded">촬영 완료 (Unloaded - 필름 뺌)</option>
                      <option value="developed">현상 완료 (Developed)</option>
                      <option value="scanned">스캔 완료 (Scanned)</option>
                    </select>
                  </div>
                </div>

                {/* 필름 & 카메라 & 렌즈 선택 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">사용한 필름 *</label>
                    <select
                      className="form-select"
                      value={filmId}
                      onChange={(e) => setFilmId(e.target.value)}
                      required
                    >
                      {films.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.brand}, ISO {f.iso}, 잔여 {f.quantity}롤)
                        </option>
                      ))}
                      {films.length === 0 && <option value="">보유 필름 없음</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      사용한 카메라 *
                    </label>
                    <select
                      className="form-select"
                      value={cameraId}
                      onChange={(e) => setCameraId(e.target.value)}
                      required
                    >
                      {availableCameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.model} ({c.format})
                        </option>
                      ))}
                      {availableCameras.length === 0 && (
                        <option value="">사용 가능한 정상 카메라가 없습니다</option>
                      )}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      💡 수리필요(고장) 및 수리중인 카메라는 자동으로 제외되었습니다.
                    </span>
                  </div>
                </div>

                {/* 렌즈 선택 (일체형 카메라가 아닌 경우) */}
                {selectedCamera?.lens_type !== 'fixed' && (
                  <div className="form-group">
                    <label className="form-label">사용한 렌즈 (선택사항)</label>
                    <select
                      className="form-select"
                      value={lensId}
                      onChange={(e) => setLensId(e.target.value)}
                    >
                      <option value="">렌즈 미선택 / 바디 기본</option>
                      {lenses
                        .filter((l) => l.status !== 'needs_repair' && l.status !== 'in_repair')
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.brand} {l.name} ({l.focal_length_min}mm f/{l.max_aperture})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* 날짜 정보 & 감도 설정 */}
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">필름 로딩(장전) 날짜 *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={loadedDate}
                      onChange={(e) => setLoadedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">필름 뺀 날짜 (언로딩)</label>
                    <input
                      className="form-input"
                      type="date"
                      value={unloadedDate}
                      onChange={(e) => setUnloadedDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">촬영 설정 ISO (증감 등)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 400 (800)"
                      value={isoRated}
                      onChange={(e) => setIsoRated(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* 출사일 세션 관리 (+ 버튼으로 다중 추가) */}
                <div style={{ border: '1px solid var(--border-normal)', borderRadius: '10px', padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        출사 세션 기록 ({sessions.length}건)
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        출사일, 날씨 드롭다운, 장소를 기록합니다. + 버튼을 눌러 계속 추가할 수 있습니다.
                      </p>
                    </div>

                    <button type="button" className="btn btn-secondary btn-sm" onClick={addSession}>
                      <Plus size={14} /> 출사일 추가
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sessions.map((sess, idx) => (
                      <div
                        key={sess.id}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--accent-amber-light)' }}>
                            #{idx + 1} 출사 세션
                          </span>
                          {sessions.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ padding: '2px 6px' }}
                              onClick={() => removeSession(sess.id)}
                            >
                              <Trash2 size={12} /> 삭제
                            </button>
                          )}
                        </div>

                        <div className="form-row-3">
                          <div className="form-group">
                            <label className="form-label">출사일</label>
                            <input
                              className="form-input"
                              type="date"
                              value={sess.date}
                              onChange={(e) => updateSession(sess.id, 'date', e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">날씨 (선택)</label>
                            <select
                              className="form-select"
                              value={sess.weather}
                              onChange={(e) => updateSession(sess.id, 'weather', e.target.value as WeatherType)}
                            >
                              <option value="sunny">☀️ 맑음</option>
                              <option value="cloud">⛅ 구름</option>
                              <option value="overcast">☁️ 흐림</option>
                              <option value="rain_snow">🌧️ 비 / 눈</option>
                              <option value="indoor">🏠 실내</option>
                              <option value="indoor_tungsten">💡 실내 (텅스텐)</option>
                              <option value="indoor_dim">🕯️ 실내 (어두움)</option>
                              <option value="night">🌙 야간</option>
                              <option value="long_exposure">⏱️ 장노출</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label">출사 장소</label>
                            <input
                              className="form-input"
                              type="text"
                              placeholder="예: 종로 세운상가, 제주 성산"
                              value={sess.location}
                              onChange={(e) => updateSession(sess.id, 'location', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">촬영 컷수</label>
                            <input
                              className="form-input"
                              type="number"
                              placeholder="예: 18"
                              value={sess.shots_taken ?? ''}
                              onChange={(e) => updateSession(sess.id, 'shots_taken', e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">세션 메모</label>
                            <input
                              className="form-input"
                              type="text"
                              placeholder="조리개 수치, 조명 메모 등"
                              value={sess.notes || ''}
                              onChange={(e) => updateSession(sess.id, 'notes', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 현상 방법 관리 (현상소 vs 자가현상) */}
                <div style={{ border: '1px solid var(--border-normal)', borderRadius: '10px', padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                    필름 현상 방법 및 약품 관리
                  </h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">현상 구분</label>
                      <select
                        className="form-select"
                        value={devType}
                        onChange={(e) => setDevType(e.target.value as DevType)}
                      >
                        <option value="none">현상 전 (미정)</option>
                        <option value="lab">🏬 현상소 위탁</option>
                        <option value="self">🧪 자가 현상 (Home Development)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">현상 날짜</label>
                      <input
                        className="form-input"
                        type="date"
                        value={developedDate}
                        onChange={(e) => setDevelopedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {devType === 'lab' && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">현상소 이름</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="예: 고래사진관, 필름로그, 충무로 포토마루 등"
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                      />
                    </div>
                  )}

                  {devType === 'self' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">사용한 현상액 *</label>
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
                            {developers.length === 0 && <option value="">등록된 현상액이 없습니다</option>}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            함께 현상한 롤 수 (누적 카운트용) *
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
                            탱크에 2롤, 3롤 함께 현상 시 해당 수량만큼 4번 현상액에 누적됩니다.
                          </span>
                        </div>
                      </div>

                      {/* 현상 방식 & 희석 비율 */}
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">현상 방식 (교반 형태)</label>
                          <select
                            className="form-select"
                            value={devMethod}
                            onChange={(e) => setDevMethod(e.target.value as AgitationMethod)}
                          >
                            <option value="rotary">로터리 현상 (Rotary - Jobo 등)</option>
                            <option value="inversion">수교반 (탱크 수동 반전 교반)</option>
                            <option value="stand">스탠딩 (정치현상 1시간+)</option>
                            <option value="semi_stand">세미스탠딩</option>
                            <option value="other">기타</option>
                          </select>
                        </div>

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

                      {/* 액량, 온도, 시간 */}
                      <div className="form-row-3">
                        <div className="form-group">
                          <label className="form-label">현상액 원액량 (ml)</label>
                          <input
                            className="form-input"
                            type="number"
                            placeholder="250"
                            value={chemicalVolumeMl}
                            onChange={(e) => setChemicalVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>

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
                          <label className="form-label">현상 시간</label>
                          <input
                            className="form-input"
                            type="text"
                            placeholder="예: 9분 45초"
                            value={devTime}
                            onChange={(e) => setDevTime(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* 세세한 교반 설정 (몇분간 몇회의 회전/반전) */}
                      <div className="form-group">
                        <label className="form-label">
                          교반 세부 설정 (몇분간 몇회의 회전/반전 교반) *
                        </label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="예: 초기 30초 연속 교반, 매 1분마다 10초간 4회 반전 교반 / 로터리 50rpm"
                          value={agitationDetails}
                          onChange={(e) => setAgitationDetails(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">정지 / 정착 / 수세 메모</label>
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
                </div>

                {/* 기타 메모 */}
                <div className="form-group">
                  <label className="form-label">총평 / 촬영 및 현상 비고</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="노출 상태, 콘트라스트 느낌 등"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">{editingRoll ? '수정 완료' : '촬영 롤 저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
