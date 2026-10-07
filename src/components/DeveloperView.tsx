'use client';

import React, { useState, useMemo } from 'react';
import { DeveloperChemical, DeveloperType } from '@/types';
import { DEVELOPER_TYPE_CONFIG } from '@/lib/constants';
import { FlaskConical, Plus, Search, Calendar, Droplets, Activity, Edit2, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';

interface DeveloperViewProps {
  developers: DeveloperChemical[];
  onSaveDeveloper: (dev: DeveloperChemical) => Promise<void>;
  onDeleteDeveloper: (id: string) => Promise<void>;
}

export default function DeveloperView({
  developers,
  onSaveDeveloper,
  onDeleteDeveloper,
}: DeveloperViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDev, setEditingDev] = useState<DeveloperChemical | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState<DeveloperType>('bw');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [mixedOrOpenedDate, setMixedOrOpenedDate] = useState('');
  const [capacityRollsLimit, setCapacityRollsLimit] = useState<number | ''>(16);
  const [volumeMl, setVolumeMl] = useState<number | ''>(1000);
  const [currentVolumeMl, setCurrentVolumeMl] = useState<number | ''>(1000);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingDev(null);
    setName('');
    setManufacturer('');
    setType('bw');
    const today = new Date().toISOString().split('T')[0];
    setPurchaseDate(today);
    setMixedOrOpenedDate(today);
    setCapacityRollsLimit(16);
    setVolumeMl(1000);
    setCurrentVolumeMl(1000);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (dev: DeveloperChemical) => {
    setEditingDev(dev);
    setName(dev.name);
    setManufacturer(dev.manufacturer);
    setType(dev.type);
    setPurchaseDate(dev.purchase_date);
    setMixedOrOpenedDate(dev.mixed_or_opened_date);
    setCapacityRollsLimit(dev.capacity_rolls_limit ?? '');
    setVolumeMl(dev.volume_ml ?? '');
    setCurrentVolumeMl(dev.current_volume_ml ?? '');
    setNotes(dev.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !manufacturer.trim()) {
      alert('현상액 이름과 제조사를 입력해주세요.');
      return;
    }

    const newDev: DeveloperChemical = {
      id: editingDev ? editingDev.id : `dev-chem-${Date.now()}`,
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      type,
      purchase_date: purchaseDate,
      mixed_or_opened_date: mixedOrOpenedDate,
      total_rolls_processed: editingDev ? editingDev.total_rolls_processed : 0,
      total_batches: editingDev ? editingDev.total_batches : 0,
      dilution_usage: editingDev ? editingDev.dilution_usage : {},
      capacity_rolls_limit: capacityRollsLimit !== '' ? Number(capacityRollsLimit) : undefined,
      volume_ml: volumeMl !== '' ? Number(volumeMl) : undefined,
      current_volume_ml: currentVolumeMl !== '' ? Number(currentVolumeMl) : undefined,
      last_used_date: editingDev?.last_used_date,
      notes: notes.trim() || undefined,
      created_at: editingDev ? editingDev.created_at : new Date().toISOString(),
    };

    await onSaveDeveloper(newDev);
    setIsModalOpen(false);
  };

  // Manual roll count adjustment
  const handleAdjustRolls = async (dev: DeveloperChemical, delta: number) => {
    const updated: DeveloperChemical = {
      ...dev,
      total_rolls_processed: Math.max(0, (dev.total_rolls_processed || 0) + delta),
      total_batches: delta > 0 ? (dev.total_batches || 0) + 1 : Math.max(0, (dev.total_batches || 0) - 1),
      last_used_date: delta > 0 ? new Date().toISOString().split('T')[0] : dev.last_used_date,
    };
    await onSaveDeveloper(updated);
  };

  const filteredDevelopers = useMemo(() => {
    return developers.filter((d) => {
      const q = search.toLowerCase();
      const matchQ = d.name.toLowerCase().includes(q) || d.manufacturer.toLowerCase().includes(q);
      if (!matchQ) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      return true;
    });
  }, [developers, search, typeFilter]);

  // Statistics
  const totalProcessedAll = developers.reduce((acc, d) => acc + (d.total_rolls_processed || 0), 0);
  const totalBatchesAll = developers.reduce((acc, d) => acc + (d.total_batches || 0), 0);

  return (
    <div className="content-body">
      {/* Top Banner Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#10b981' } as React.CSSProperties}>
          <div className="stat-label">
            <FlaskConical size={15} /> 보유 현상액
          </div>
          <div className="stat-value">{developers.length} 종</div>
          <div className="stat-desc">보유 약품 라이브러리</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Activity size={15} /> 총 누적 현상 롤 수
          </div>
          <div className="stat-value">{totalProcessedAll} 롤</div>
          <div className="stat-desc">모든 약품 통산 처리량</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' } as React.CSSProperties}>
          <div className="stat-label">
            <Droplets size={15} /> 총 자가현상 세션
          </div>
          <div className="stat-value">{totalBatchesAll} 회</div>
          <div className="stat-desc">현상 작업 진행 횟수</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#38bdf8' } as React.CSSProperties}>
          <div className="stat-label">
            <CheckCircle2 size={15} /> 컬러/흑백 균형
          </div>
          <div className="stat-value">
            {developers.filter((d) => d.type === 'bw').length} : {developers.filter((d) => d.type === 'color' || d.type === 'cinema').length}
          </div>
          <div className="stat-desc">흑백약품 : 컬러/영화용</div>
        </div>
      </div>

      {/* Apple-style Segmented Type Navigation */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            전체 약품 <span className="segmented-badge">{developers.length}</span>
          </button>
          <button
            className={`segmented-item ${typeFilter === 'bw' ? 'active' : ''}`}
            onClick={() => setTypeFilter('bw')}
          >
            흑백용 (B&W) <span className="segmented-badge">{developers.filter((d) => d.type === 'bw').length}</span>
          </button>
          <button
            className={`segmented-item ${typeFilter === 'color' ? 'active' : ''}`}
            onClick={() => setTypeFilter('color')}
          >
            컬러용 (C-41) <span className="segmented-badge">{developers.filter((d) => d.type === 'color').length}</span>
          </button>
          <button
            className={`segmented-item ${typeFilter === 'cinema' ? 'active' : ''}`}
            onClick={() => setTypeFilter('cinema')}
          >
            영화용 (ECN-2) <span className="segmented-badge">{developers.filter((d) => d.type === 'cinema').length}</span>
          </button>
          <button
            className={`segmented-item ${typeFilter === 'slide' ? 'active' : ''}`}
            onClick={() => setTypeFilter('slide')}
          >
            슬라이드용 (E-6) <span className="segmented-badge">{developers.filter((d) => d.type === 'slide').length}</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="현상액 이름, 제조사 검색 (D-76, Rodinal, Bellini 등)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 새 현상액 등록
          </button>
        </div>
      </div>

      {/* Developers Card Grid */}
      {filteredDevelopers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FlaskConical size={28} /></div>
          <h3>등록된 현상액이 없습니다</h3>
          <p>흑백 또는 컬러 자가현상용 약품을 등록하고 사용 횟수와 희석비율을 관리하세요.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 첫 현상액 등록하기
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredDevelopers.map((dev) => {
            const typeCfg = DEVELOPER_TYPE_CONFIG[dev.type] || DEVELOPER_TYPE_CONFIG.other;
            const limit = dev.capacity_rolls_limit || 16;
            const progressPct = Math.min(100, Math.round(((dev.total_rolls_processed || 0) / limit) * 100));

            return (
              <div key={dev.id} className="item-card">
                <div className="card-top">
                  <div className="card-title-group">
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span
                        className="notion-tag"
                        style={{ background: typeCfg.bg, color: typeCfg.color }}
                      >
                        {typeCfg.label}
                      </span>
                      {dev.volume_ml && (
                        <span className="spec-pill">
                          <strong>{dev.volume_ml}ml</strong>
                        </span>
                      )}
                    </div>

                    <h3 className="card-title" style={{ marginTop: '4px' }}>
                      {dev.name}
                    </h3>

                    <div className="card-subtitle">
                      <span>제조사: <strong>{dev.manufacturer}</strong></span>
                    </div>
                  </div>

                  {/* 누적 현상 롤 수 뱃지 */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: 'var(--accent-amber-light)',
                        lineHeight: 1,
                      }}
                    >
                      {dev.total_rolls_processed || 0}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> 롤</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {dev.total_batches || 0}회 세션
                    </div>
                  </div>
                </div>

                {/* Notion Systematic Database Property Rows */}
                <div className="notion-prop-table">
                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🧪 약품 분류</span>
                    <span className="notion-prop-val">
                      <span className="notion-tag" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                        {typeCfg.label}
                      </span>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🛒 구매일자</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {dev.purchase_date}
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">⚗️ 개봉 / 조제일</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {dev.mixed_or_opened_date}
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🕒 최근 사용일</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {dev.last_used_date || '사용 기록 없음'}
                    </span>
                  </div>
                </div>

                {/* 수명 프로그레스 바 (권장 처리 롤 수 대비) */}
                {dev.capacity_rolls_limit && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>권장 처리 한도 대비</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: progressPct > 80 ? 'var(--accent-red)' : 'var(--text-main)', fontWeight: '600' }}>
                        {dev.total_rolls_processed} / {dev.capacity_rolls_limit} 롤 ({progressPct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: progressPct > 90 ? 'var(--accent-red)' : progressPct > 70 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 희석비율별 사용 내역 Notion Callout */}
                <div className="notion-callout" style={{ flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    🧪 희석 비율별 누적 사용 내역
                  </div>

                  {dev.dilution_usage && Object.keys(dev.dilution_usage).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {Object.entries(dev.dilution_usage).map(([ratio, count]) => (
                        <span
                          key={ratio}
                          className="spec-pill"
                          style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.25)',
                            color: 'var(--accent-amber-light)',
                          }}
                        >
                          {ratio}: <strong>{count}회</strong>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      등록된 희석비율 사용 이력이 없습니다.
                    </div>
                  )}
                </div>

                {/* 롤 수동 빠른 가감 버튼 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>빠른 롤 수 조절:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleAdjustRolls(dev, 1)}
                      title="1롤 추가"
                    >
                      +1롤
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleAdjustRolls(dev, 2)}
                      title="2롤 추가"
                    >
                      +2롤
                    </button>
                    <button
                      className="btn btn-subtle btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                      onClick={() => handleAdjustRolls(dev, -1)}
                      title="1롤 차감"
                    >
                      -1
                    </button>
                  </div>
                </div>

                {dev.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                    {dev.notes}
                  </div>
                )}

                <div className="card-bottom">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    등록: {dev.created_at?.split('T')[0] || '-'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(dev)}>
                      <Edit2 size={13} /> 수정
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`'${dev.name}' 현상액을 삭제하시겠습니까?`)) {
                          onDeleteDeveloper(dev.id);
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

      {/* 현상액 등록/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingDev ? '현상액 정보 수정' : '새 현상액 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">현상액 이름 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Kodak D-76, Rodinal, Bellini C-41 Kit"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">제조사 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Kodak, Ilford, Adox, Bellini, CineStill"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">약품 용도</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value as DeveloperType)}
                    >
                      <option value="bw">흑백용 (B&W)</option>
                      <option value="color">컬러용 (C-41)</option>
                      <option value="cinema">영화용 (ECN-2)</option>
                      <option value="slide">슬라이드용 (E-6)</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">권장 최대 처리 롤 수</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 16롤"
                      value={capacityRollsLimit}
                      onChange={(e) => setCapacityRollsLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* 구매 날짜 & 조제/개봉 날짜 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">구매한 날짜 *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">만든(조제) 날짜 / 개봉 날짜 *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={mixedOrOpenedDate}
                      onChange={(e) => setMixedOrOpenedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">조제 총 용량 (ml)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 1000"
                      value={volumeMl}
                      onChange={(e) => setVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">현재 잔여 용량 (ml)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 850"
                      value={currentVolumeMl}
                      onChange={(e) => setCurrentVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">보관 방법 및 수명 메모</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="갈색 차광병 보관, 산소차단제 사용, 유효기간 6개월 등"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">{editingDev ? '수정 완료' : '현상액 등록'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
