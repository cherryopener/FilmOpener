'use client';

import React, { useState, useMemo } from 'react';
import { ScanLog, ShootingRoll, ScanMethod } from '@/types';
import { SCAN_METHOD_CONFIG } from '@/lib/constants';
import { Folder, HardDrive, Plus, Search, Filter, Camera, Aperture, Sparkles, Edit2, Trash2, Archive, CheckCircle } from 'lucide-react';

interface ScanVaultViewProps {
  scans: ScanLog[];
  developedRolls: ShootingRoll[];
  onSaveScan: (scan: ScanLog) => Promise<void>;
  onDeleteScan: (id: string) => Promise<void>;
}

export default function ScanVaultView({
  scans,
  developedRolls,
  onSaveScan,
  onDeleteScan,
}: ScanVaultViewProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanLog | null>(null);

  // Form State
  const [isLegacyArchive, setIsLegacyArchive] = useState(false);
  const [selectedRollId, setSelectedRollId] = useState('');
  const [filmTitle, setFilmTitle] = useState('');
  const [cameraLensInfo, setCameraLensInfo] = useState('');
  const [scanMethod, setScanMethod] = useState<ScanMethod>('dslr');
  const [scannerModel, setScannerModel] = useState('');
  const [totalFrames, setTotalFrames] = useState<number | ''>(36);
  const [folderName, setFolderName] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('');
  const [scanDate, setScanDate] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingScan(null);
    setIsLegacyArchive(false);
    const today = new Date().toISOString().split('T')[0];
    setScanDate(today);

    if (developedRolls.length > 0) {
      const firstRoll = developedRolls[0];
      setSelectedRollId(firstRoll.id);
      setFilmTitle(`${firstRoll.title} - ${firstRoll.film_name_snapshot}`);
      setCameraLensInfo(`${firstRoll.camera_name_snapshot}${firstRoll.lens_name_snapshot ? ` + ${firstRoll.lens_name_snapshot}` : ''}`);
      setTotalFrames(firstRoll.total_shots || 36);
      const safeDate = firstRoll.loaded_date || today;
      setFolderName(`${safeDate}_${firstRoll.film_name_snapshot.split(' ')[0]}_${firstRoll.camera_name_snapshot.split(' ')[0]}`);
    } else {
      setSelectedRollId('');
      setFilmTitle('');
      setCameraLensInfo('');
      setTotalFrames(36);
      setFolderName(`${today}_Roll_Scan`);
    }

    setScanMethod('dslr');
    setScannerModel('Sony A7R IV + 90mm Macro');
    setStoragePath('외장SSD / Photo_Archive / 2026');
    setSoftwareUsed('Lightroom + Negative Lab Pro v3.0');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (scan: ScanLog) => {
    setEditingScan(scan);
    setIsLegacyArchive(scan.is_legacy_archive);
    setSelectedRollId(scan.roll_id || '');
    setFilmTitle(scan.film_title);
    setCameraLensInfo(scan.camera_lens_info || '');
    setScanMethod(scan.scan_method);
    setScannerModel(scan.scanner_model || '');
    setTotalFrames(scan.total_frames);
    setFolderName(scan.folder_name);
    setStoragePath(scan.storage_path || '');
    setSoftwareUsed(scan.software_used || '');
    setScanDate(scan.scan_date);
    setNotes(scan.notes || '');
    setIsModalOpen(true);
  };

  // 5-2. 현상 완료된 필름 선택 시 자동 채우기 핸들러
  const handleSelectRoll = (rollId: string) => {
    setSelectedRollId(rollId);
    const roll = developedRolls.find((r) => r.id === rollId);
    if (roll) {
      setFilmTitle(`${roll.title} - ${roll.film_name_snapshot}`);
      setCameraLensInfo(`${roll.camera_name_snapshot}${roll.lens_name_snapshot ? ` + ${roll.lens_name_snapshot}` : ''}`);
      setTotalFrames(roll.total_shots || 36);
      const safeDate = roll.loaded_date || new Date().toISOString().split('T')[0];
      setFolderName(`${safeDate}_${roll.film_name_snapshot.split(' ')[0]}_${roll.camera_name_snapshot.split(' ')[0]}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmTitle.trim() || !folderName.trim()) {
      alert('필름 제목과 저장 폴더명을 입력해주세요.');
      return;
    }

    const newScan: ScanLog = {
      id: editingScan ? editingScan.id : `scan-${Date.now()}`,
      roll_id: !isLegacyArchive && selectedRollId ? selectedRollId : undefined,
      is_legacy_archive: isLegacyArchive,
      film_title: filmTitle.trim(),
      camera_lens_info: cameraLensInfo.trim() || undefined,
      scan_method: scanMethod,
      scanner_model: scannerModel.trim() || undefined,
      total_frames: Number(totalFrames) || 36,
      folder_name: folderName.trim(),
      storage_path: storagePath.trim() || undefined,
      software_used: softwareUsed.trim() || undefined,
      scan_date: scanDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      created_at: editingScan ? editingScan.created_at : new Date().toISOString(),
    };

    await onSaveScan(newScan);
    setIsModalOpen(false);
  };

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const q = search.toLowerCase();
      const matchQ =
        s.film_title.toLowerCase().includes(q) ||
        s.folder_name.toLowerCase().includes(q) ||
        (s.storage_path && s.storage_path.toLowerCase().includes(q)) ||
        (s.camera_lens_info && s.camera_lens_info.toLowerCase().includes(q));

      if (!matchQ) return false;
      if (methodFilter !== 'all' && s.scan_method !== methodFilter) return false;
      return true;
    });
  }, [scans, search, methodFilter]);

  const totalFramesAll = scans.reduce((acc, s) => acc + (s.total_frames || 0), 0);

  return (
    <div className="content-body">
      {/* Top Banner Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#10b981' } as React.CSSProperties}>
          <div className="stat-label">
            <Folder size={15} /> 스캔 아카이브 목록
          </div>
          <div className="stat-value">{scans.length} 롤</div>
          <div className="stat-desc">정리 완료된 스캔 폴더</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Camera size={15} /> 총 디지털화된 컷수
          </div>
          <div className="stat-value">{totalFramesAll} 컷</div>
          <div className="stat-desc">총 나온 컷수 누적</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#38bdf8' } as React.CSSProperties}>
          <div className="stat-label">
            <HardDrive size={15} /> 과거 필름 아카이브
          </div>
          <div className="stat-value">
            {scans.filter((s) => s.is_legacy_archive).length} 롤
          </div>
          <div className="stat-desc">과거 현상 필름</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' } as React.CSSProperties}>
          <div className="stat-label">
            <CheckCircle size={15} /> 주력 스캔 방식
          </div>
          <div className="stat-value">
            {scans.filter((s) => s.scan_method === 'dslr').length > scans.filter((s) => s.scan_method === 'flatbed').length ? 'DSLR 캡처' : '평판 스캔'}
          </div>
          <div className="stat-desc">가장 많이 사용한 방식</div>
        </div>
      </div>

      {/* Info notice about JPG file policy */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HardDrive size={16} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
        <span>
          💡 <strong>안내:</strong> 본 시스템은 대용량 이미지 파일 자체를 업로드하는 대신, 어떤 필름을 어떤 방식으로 스캔하여 총 몇컷이 나왔는지, 그리고 <strong>저장한 폴더명</strong>과 스토리지 경로를 체계적으로 관리하는 아카이브 장부입니다.
        </span>
      </div>

      {/* Apple-style Segmented Scan Method Navigation */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${methodFilter === 'all' ? 'active' : ''}`}
            onClick={() => setMethodFilter('all')}
          >
            전체 아카이브 <span className="segmented-badge">{scans.length}</span>
          </button>
          <button
            className={`segmented-item ${methodFilter === 'dslr' ? 'active' : ''}`}
            onClick={() => setMethodFilter('dslr')}
          >
            DSLR 캡처 <span className="segmented-badge">{scans.filter((s) => s.scan_method === 'dslr').length}</span>
          </button>
          <button
            className={`segmented-item ${methodFilter === 'flatbed' ? 'active' : ''}`}
            onClick={() => setMethodFilter('flatbed')}
          >
            평판 스캐너 <span className="segmented-badge">{scans.filter((s) => s.scan_method === 'flatbed').length}</span>
          </button>
          <button
            className={`segmented-item ${methodFilter === 'dedicated' ? 'active' : ''}`}
            onClick={() => setMethodFilter('dedicated')}
          >
            전용 필름 스캐너 <span className="segmented-badge">{scans.filter((s) => s.scan_method === 'dedicated').length}</span>
          </button>
          <button
            className={`segmented-item ${methodFilter === 'lab' ? 'active' : ''}`}
            onClick={() => setMethodFilter('lab')}
          >
            현상소 스캔 <span className="segmented-badge">{scans.filter((s) => s.scan_method === 'lab').length}</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="저장 폴더명, 필름 제목, 저장 경로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 스캔 기록 추가
          </button>
        </div>
      </div>

      {/* Scans Grid */}
      {filteredScans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Folder size={28} /></div>
          <h3>등록된 스캔 기록이 없습니다</h3>
          <p>현상 완료된 필름 또는 과거 아카이브 필름의 스캔 폴더와 컷수를 등록해보세요.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 첫 스캔 기록 등록
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredScans.map((scan) => {
            const methodCfg = SCAN_METHOD_CONFIG[scan.scan_method] || SCAN_METHOD_CONFIG.other;

            return (
              <div key={scan.id} className="item-card">
                <div className="card-top">
                  <div className="card-title-group">
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="notion-tag" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7' }}>
                        {methodCfg.icon} {methodCfg.label}
                      </span>

                      {scan.is_legacy_archive && (
                        <span className="notion-tag" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                          <Archive size={12} /> 과거 아카이브
                        </span>
                      )}
                    </div>

                    <h3 className="card-title" style={{ marginTop: '4px' }}>
                      {scan.film_title}
                    </h3>

                    {scan.camera_lens_info && (
                      <div className="card-subtitle">
                        <span>📷 {scan.camera_lens_info}</span>
                      </div>
                    )}
                  </div>

                  {/* 5-1. 총 나온 컷수 뱃지 */}
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
                      {scan.total_frames}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> 컷</span>
                    </div>
                  </div>
                </div>

                {/* 저장 폴더명 강조 Notion Callout */}
                <div className="notion-callout" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Folder size={13} color="var(--accent-amber)" /> 아카이브 폴더명:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', wordBreak: 'break-all' }}>
                    📁 {scan.folder_name}
                  </div>
                  {scan.storage_path && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px', wordBreak: 'break-all' }}>
                      경로: {scan.storage_path}
                    </div>
                  )}
                </div>

                {/* Notion Systematic Database Property Rows */}
                <div className="notion-prop-table">
                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📅 스캔 일시</span>
                    <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)' }}>
                      {scan.scan_date}
                    </span>
                  </div>

                  {scan.scanner_model && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">⚙️ 스캐너 기종</span>
                      <span className="notion-prop-val">
                        {scan.scanner_model}
                      </span>
                    </div>
                  )}

                  {scan.software_used && (
                    <div className="notion-prop-row">
                      <span className="notion-prop-key">💻 프로그램</span>
                      <span className="notion-prop-val">
                        {scan.software_used}
                      </span>
                    </div>
                  )}
                </div>

                {scan.notes && (
                  <div className="notion-callout">
                    <span>📝 {scan.notes}</span>
                  </div>
                )}

                <div className="card-bottom">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    등록: {scan.created_at?.split('T')[0] || '-'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(scan)}>
                      <Edit2 size={13} /> 수정
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`'${scan.film_title}' 스캔 기록을 삭제하시겠습니까?`)) {
                          onDeleteScan(scan.id);
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

      {/* 스캔 등록 / 수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingScan ? '스캔 아카이브 수정' : '새 필름 스캔 기록 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 과거 현상 필름 직접 입력 or 현상 완료된 필름 선택 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isLegacyArchive}
                      onChange={(e) => setIsLegacyArchive(e.target.checked)}
                    />
                    <span>
                      <strong>과거에 현상된 필름 직접 입력</strong> (기존 촬영 목록에 없음)
                    </span>
                  </label>

                  {!isLegacyArchive && (
                    <div className="form-group" style={{ marginTop: '6px' }}>
                      <label className="form-label">현상 완료된 필름 목록에서 선택</label>
                      <select
                        className="form-select"
                        value={selectedRollId}
                        onChange={(e) => handleSelectRoll(e.target.value)}
                      >
                        {developedRolls.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title} ({r.film_name_snapshot} - {r.camera_name_snapshot})
                          </option>
                        ))}
                        {developedRolls.length === 0 && (
                          <option value="">현상 완료된 롤이 없습니다 (과거 필름으로 직접 입력 가능)</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {/* 필름 제목 & 카메라 정보 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">스캔 필름 제목 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: 2026-03 제주 여행 포트라 400"
                      value={filmTitle}
                      onChange={(e) => setFilmTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">촬영 카메라 & 렌즈 정보</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Leica M6 + 35mm Summicron"
                      value={cameraLensInfo}
                      onChange={(e) => setCameraLensInfo(e.target.value)}
                    />
                  </div>
                </div>

                {/* 스캔 방식 & 총 나온 컷수 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">스캔 방식</label>
                    <select
                      className="form-select"
                      value={scanMethod}
                      onChange={(e) => setScanMethod(e.target.value as ScanMethod)}
                    >
                      <option value="dslr">📸 DSLR / 미러리스 디지타이징</option>
                      <option value="flatbed">🖨️ 평판 스캐너 (Epson V600/V850 등)</option>
                      <option value="dedicated">🎞️ 전용 필름 스캐너 (Plustek, Pakon 등)</option>
                      <option value="lab">🏬 현상소 스캔 (Noritsu/Frontier)</option>
                      <option value="other">기타 스캔 방식</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">총 나온 컷수 (컷수 관리) *</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 37"
                      value={totalFrames}
                      onChange={(e) => setTotalFrames(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* 저장 폴더명 */}
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--accent-amber-light)' }}>
                    저장한 폴더명 (Folder Name) *
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="예: 2026-04-Jeju_Portra400_M6"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    로컬 PC, Mac, 외장하드, 클라우드 등 실제 사진 파일들이 위치한 폴더명을 기록합니다.
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">저장 경로 / 외장 드라이브 (선택)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: 외장SSD T7 / Photo_Archive / 2026 / Roll_01"
                      value={storagePath}
                      onChange={(e) => setStoragePath(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">스캐너 기종 / 디지털 바디</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Sony A7R4 + 90mm Macro, Epson V850"
                      value={scannerModel}
                      onChange={(e) => setScannerModel(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">반전 소프트웨어</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Negative Lab Pro, SilverFast, VueScan 등"
                      value={softwareUsed}
                      onChange={(e) => setSoftwareUsed(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">스캔한 날짜</label>
                    <input
                      className="form-input"
                      type="date"
                      value={scanDate}
                      onChange={(e) => setScanDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">스캔 품질 및 색감 메모</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="색조 보정 메모, 먼지 제거 여부, 해상도 등"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">{editingScan ? '수정 완료' : '스캔 기록 저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
