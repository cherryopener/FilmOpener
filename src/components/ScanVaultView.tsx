'use client';

import React, { useState, useMemo } from 'react';
import { ScanLog, ShootingRoll, ScanMethod, ScannerItem, ScannerCategory, LabScanResolution } from '@/types';
import { SCAN_METHOD_CONFIG, LAB_SCANNERS, LAB_SCAN_RESOLUTIONS } from '@/lib/constants';
import {
  Folder,
  HardDrive,
  Plus,
  Search,
  Filter,
  Camera,
  Aperture,
  Sparkles,
  Edit2,
  Trash2,
  Archive,
  CheckCircle,
  Cpu,
  Sliders,
  Layers,
  Wrench,
  Check,
} from 'lucide-react';

interface ScanVaultViewProps {
  scans: ScanLog[];
  developedRolls: ShootingRoll[];
  scanners?: ScannerItem[];
  onSaveScan: (scan: ScanLog) => Promise<void>;
  onDeleteScan: (id: string) => Promise<void>;
  onSaveScanner?: (scanner: ScannerItem) => Promise<void>;
  onDeleteScanner?: (id: string) => Promise<void>;
}

export default function ScanVaultView({
  scans,
  developedRolls,
  scanners = [],
  onSaveScan,
  onDeleteScan,
  onSaveScanner,
  onDeleteScanner,
}: ScanVaultViewProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanLog | null>(null);

  // Scanner Rig Management Modal
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [editingScanner, setEditingScanner] = useState<ScannerItem | null>(null);
  const [scannerName, setScannerName] = useState('');
  const [scannerCategory, setScannerCategory] = useState<ScannerCategory>('digitizing');
  const [scannerBrand, setScannerBrand] = useState('');
  const [scannerSensorOrLight, setScannerSensorOrLight] = useState('');
  const [scannerHolderType, setScannerHolderType] = useState('');
  const [scannerNotes, setScannerNotes] = useState('');
  const [showScannerSection, setShowScannerSection] = useState(true);

  // Form State for ScanLog
  const [isLegacyArchive, setIsLegacyArchive] = useState(false);
  const [selectedRollId, setSelectedRollId] = useState('');
  const [filmTitle, setFilmTitle] = useState('');
  const [cameraLensInfo, setCameraLensInfo] = useState('');
  const [scanMethod, setScanMethod] = useState<ScanMethod>('digitizing');
  const [selectedScannerId, setSelectedScannerId] = useState('');
  const [scannerModel, setScannerModel] = useState('');
  const [labScanner, setLabScanner] = useState<string>('noritsu');
  const [customLabScanner, setCustomLabScanner] = useState('');
  const [labResolution, setLabResolution] = useState<LabScanResolution>('standard');
  const [totalFrames, setTotalFrames] = useState<number | ''>(36);
  const [folderName, setFolderName] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('');
  const [scanDate, setScanDate] = useState('');
  const [notes, setNotes] = useState('');

  const pendingScanRolls = useMemo(() => {
    return developedRolls.filter((r) => r.status === 'developed');
  }, [developedRolls]);

  // Open Scanner Modal
  const openAddScannerModal = () => {
    setEditingScanner(null);
    setScannerName('');
    setScannerCategory('digitizing');
    setScannerBrand('');
    setScannerSensorOrLight('');
    setScannerHolderType('');
    setScannerNotes('');
    setIsScannerModalOpen(true);
  };

  const openEditScannerModal = (scanner: ScannerItem) => {
    setEditingScanner(scanner);
    setScannerName(scanner.name);
    setScannerCategory(scanner.category);
    setScannerBrand(scanner.brand || '');
    setScannerSensorOrLight(scanner.sensor_or_light || '');
    setScannerHolderType(scanner.holder_type || '');
    setScannerNotes(scanner.notes || '');
    setIsScannerModalOpen(true);
  };

  const handleSaveScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerName.trim()) {
      alert('스캐너 또는 디지타이징 장비명을 입력해주세요.');
      return;
    }

    if (onSaveScanner) {
      const item: ScannerItem = {
        id: editingScanner ? editingScanner.id : `scanner-${Date.now()}`,
        name: scannerName.trim(),
        category: scannerCategory,
        brand: scannerBrand.trim() || undefined,
        sensor_or_light: scannerSensorOrLight.trim() || undefined,
        holder_type: scannerHolderType.trim() || undefined,
        notes: scannerNotes.trim() || undefined,
        created_at: editingScanner ? editingScanner.created_at : new Date().toISOString(),
      };
      await onSaveScanner(item);
    }
    setIsScannerModalOpen(false);
  };

  const handleDeleteScannerClick = async (id: string, name: string) => {
    if (confirm(`'${name}' 장비를 삭제하시겠습니까?`)) {
      if (onDeleteScanner) await onDeleteScanner(id);
    }
  };

  const openAddModal = () => {
    setEditingScan(null);
    setIsLegacyArchive(false);
    const today = new Date().toISOString().split('T')[0];
    setScanDate(today);

    if (developedRolls.length > 0) {
      const firstRoll = pendingScanRolls[0] || developedRolls[0];
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

    setScanMethod('digitizing');
    const firstDigitizing = scanners.find((s) => s.category === 'digitizing');
    if (firstDigitizing) {
      setSelectedScannerId(firstDigitizing.id);
      setScannerModel(firstDigitizing.name);
    } else {
      setSelectedScannerId('');
      setScannerModel('');
    }
    setLabScanner('noritsu');
    setCustomLabScanner('');
    setLabResolution('standard');
    setStoragePath('');
    setSoftwareUsed('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openAddModalForRoll = (roll: ShootingRoll) => {
    setEditingScan(null);
    setIsLegacyArchive(false);
    const today = new Date().toISOString().split('T')[0];
    setScanDate(today);

    setSelectedRollId(roll.id);
    setFilmTitle(`${roll.title} - ${roll.film_name_snapshot}`);
    setCameraLensInfo(`${roll.camera_name_snapshot}${roll.lens_name_snapshot ? ` + ${roll.lens_name_snapshot}` : ''}`);
    setTotalFrames(roll.total_shots || 36);
    const safeDate = roll.loaded_date || today;
    setFolderName(`${safeDate}_${roll.film_name_snapshot.split(' ')[0]}_${roll.camera_name_snapshot.split(' ')[0]}`);

    setScanMethod('digitizing');
    const firstDigitizing = scanners.find((s) => s.category === 'digitizing');
    if (firstDigitizing) {
      setSelectedScannerId(firstDigitizing.id);
      setScannerModel(firstDigitizing.name);
    } else {
      setSelectedScannerId('');
      setScannerModel('');
    }
    setLabScanner('noritsu');
    setCustomLabScanner('');
    setLabResolution('standard');
    setStoragePath('');
    setSoftwareUsed('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (scan: ScanLog) => {
    setEditingScan(scan);
    setIsLegacyArchive(scan.is_legacy_archive);
    setSelectedRollId(scan.roll_id || '');
    setFilmTitle(scan.film_title);
    setCameraLensInfo(scan.camera_lens_info || '');
    setScanMethod(scan.scan_method === 'dslr' ? 'digitizing' : scan.scan_method);
    setSelectedScannerId(scan.scanner_id || '');
    setScannerModel(scan.scanner_model || '');
    setLabScanner(scan.lab_scanner || 'noritsu');
    setCustomLabScanner('');
    setLabResolution(scan.lab_resolution || 'standard');
    setTotalFrames(scan.total_frames);
    setFolderName(scan.folder_name);
    setStoragePath(scan.storage_path || '');
    setSoftwareUsed(scan.software_used || '');
    setScanDate(scan.scan_date);
    setNotes(scan.notes || '');
    setIsModalOpen(true);
  };

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

  // Match owned scanners based on method
  const matchingOwnedScanners = useMemo(() => {
    if (scanMethod === 'digitizing' || scanMethod === 'dslr') {
      return scanners.filter((s) => s.category === 'digitizing');
    }
    if (scanMethod === 'flatbed') {
      return scanners.filter((s) => s.category === 'flatbed');
    }
    if (scanMethod === 'dedicated') {
      return scanners.filter((s) => s.category === 'dedicated');
    }
    return scanners;
  }, [scanners, scanMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmTitle.trim() || !folderName.trim()) {
      alert('필름 제목과 저장 폴더명을 입력해주세요.');
      return;
    }

    let finalScannerModel = scannerModel.trim();
    if (scanMethod === 'lab') {
      const labPreset = LAB_SCANNERS.find((ls) => ls.id === labScanner);
      const resText = labResolution === 'high' ? '고화질' : '일반화질';
      if (labScanner === 'other' && customLabScanner.trim()) {
        finalScannerModel = `${customLabScanner.trim()} (${resText})`;
      } else if (labPreset) {
        finalScannerModel = `${labPreset.name} (${resText})`;
      }
    }

    const newScan: ScanLog = {
      id: editingScan ? editingScan.id : `scan-${Date.now()}`,
      roll_id: !isLegacyArchive && selectedRollId ? selectedRollId : undefined,
      is_legacy_archive: isLegacyArchive,
      film_title: filmTitle.trim(),
      camera_lens_info: cameraLensInfo.trim() || undefined,
      scan_method: scanMethod,
      scanner_id: scanMethod !== 'lab' && selectedScannerId ? selectedScannerId : undefined,
      scanner_model: finalScannerModel || undefined,
      lab_scanner: scanMethod === 'lab' ? (labScanner === 'other' ? customLabScanner.trim() || '기타' : labScanner) : undefined,
      lab_resolution: scanMethod === 'lab' ? labResolution : undefined,
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
        (s.camera_lens_info && s.camera_lens_info.toLowerCase().includes(q)) ||
        (s.scanner_model && s.scanner_model.toLowerCase().includes(q));

      if (!matchQ) return false;
      if (methodFilter !== 'all') {
        if (methodFilter === 'digitizing' && (s.scan_method === 'digitizing' || s.scan_method === 'dslr')) return true;
        if (s.scan_method !== methodFilter) return false;
      }
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
            <Cpu size={15} /> 보유 스캐너/디지타이징
          </div>
          <div className="stat-value">{scanners.length} 대</div>
          <div className="stat-desc">등록된 보유 장비</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' } as React.CSSProperties}>
          <div className="stat-label">
            <CheckCircle size={15} /> 주력 스캔 방식
          </div>
          <div className="stat-value">
            {scans.filter((s) => s.scan_method === 'dslr' || s.scan_method === 'digitizing').length >= scans.filter((s) => s.scan_method === 'lab').length
              ? '디지타이징'
              : '현상소 스캔'}
          </div>
          <div className="stat-desc">가장 많이 사용한 방식</div>
        </div>
      </div>

      {/* 🛠️ 보유 스캐너 & 디지타이징 장비함 (Scanner Rig Vault) */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showScannerSection ? '14px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              보유 스캐너 & 디지타이징 장비함 ({scanners.length}대)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              평판, 전용 스캐너, 미러리스 디지타이징 리그 관리
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={openAddScannerModal}
              style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}
            >
              <Plus size={13} /> 새 스캐너/장비 등록
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowScannerSection(!showScannerSection)}
              style={{ fontSize: '0.75rem' }}
            >
              {showScannerSection ? '접기' : '장비함 펼치기'}
            </button>
          </div>
        </div>

        {showScannerSection && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {scanners.map((sc) => {
              const catLabel =
                sc.category === 'digitizing'
                  ? '📷 디지타이징'
                  : sc.category === 'flatbed'
                  ? '🖨️ 평판 스캐너'
                  : sc.category === 'dedicated'
                  ? '🎞️ 전용 스캐너'
                  : '⚙️ 기타';

              return (
                <div
                  key={sc.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        className="notion-tag"
                        style={{
                          background:
                            sc.category === 'digitizing'
                              ? 'rgba(56, 189, 248, 0.12)'
                              : sc.category === 'flatbed'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'rgba(245, 158, 11, 0.12)',
                          color:
                            sc.category === 'digitizing'
                              ? '#0284c7'
                              : sc.category === 'flatbed'
                              ? '#059669'
                              : '#d97706',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {catLabel}
                      </span>
                      {sc.brand && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                          {sc.brand}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                      {sc.name}
                    </h4>

                    {sc.sensor_or_light && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        💡 광원/센서: <strong style={{ color: 'var(--text-main)' }}>{sc.sensor_or_light}</strong>
                      </div>
                    )}
                    {sc.holder_type && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        📐 필름 홀더: <strong style={{ color: 'var(--text-main)' }}>{sc.holder_type}</strong>
                      </div>
                    )}
                    {sc.notes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
                        {sc.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={() => openEditScannerModal(sc)}
                    >
                      <Edit2 size={11} /> 수정
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={() => handleDeleteScannerClick(sc.id, sc.name)}
                    >
                      <Trash2 size={11} /> 삭제
                    </button>
                  </div>
                </div>
              );
            })}

            {scanners.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                등록된 보유 스캐너/디지타이징 장비가 없습니다. 위의 버튼을 눌러 장비를 등록해보세요.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎞️ 현상 완료 후 스캔 대기 중인 필름 목록 배너 */}
      {pendingScanRolls.length > 0 && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#10b981" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>
                현상 완료 / 스캔 대기 중인 필름 ({pendingScanRolls.length}롤)
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
              디지타이징 준비 완료
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {pendingScanRolls.map((roll) => (
              <div
                key={roll.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {roll.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🎞️ {roll.film_name_snapshot} ({roll.developed_date || '현상 완료'})
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', background: '#10b981', borderColor: '#10b981', flexShrink: 0 }}
                  onClick={() => openAddModalForRoll(roll)}
                >
                  스캔 등록
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segmented Filter Navigation */}
      <div className="segmented-control" style={{ maxWidth: '680px' }}>
        <button
          className={`segment-btn ${methodFilter === 'all' ? 'active' : ''}`}
          onClick={() => setMethodFilter('all')}
        >
          전체 보기 ({scans.length})
        </button>
        <button
          className={`segment-btn ${methodFilter === 'digitizing' ? 'active' : ''}`}
          onClick={() => setMethodFilter('digitizing')}
        >
          📸 디지타이징 ({scans.filter((s) => s.scan_method === 'dslr' || s.scan_method === 'digitizing').length})
        </button>
        <button
          className={`segment-btn ${methodFilter === 'flatbed' ? 'active' : ''}`}
          onClick={() => setMethodFilter('flatbed')}
        >
          🖨️ 평판 스캔 ({scans.filter((s) => s.scan_method === 'flatbed').length})
        </button>
        <button
          className={`segment-btn ${methodFilter === 'dedicated' ? 'active' : ''}`}
          onClick={() => setMethodFilter('dedicated')}
        >
          🎞️ 필름 전용 ({scans.filter((s) => s.scan_method === 'dedicated').length})
        </button>
        <button
          className={`segment-btn ${methodFilter === 'lab' ? 'active' : ''}`}
          onClick={() => setMethodFilter('lab')}
        >
          🏬 현상소 스캔 ({scans.filter((s) => s.scan_method === 'lab').length})
        </button>
      </div>

      {/* Control Bar */}
      <div className="control-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="필름 제목, 폴더명, 카메라, 스캐너 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> 새 스캔 아카이브 등록
        </button>
      </div>

      {/* Scans Grid List */}
      <div className="card-grid">
        {filteredScans.map((scan) => {
          const isDigitizing = scan.scan_method === 'digitizing' || scan.scan_method === 'dslr';
          const methodCfg = isDigitizing
            ? SCAN_METHOD_CONFIG.digitizing
            : SCAN_METHOD_CONFIG[scan.scan_method] || SCAN_METHOD_CONFIG.other;

          return (
            <div key={scan.id} className="item-card">
              <div className="card-top">
                <div className="card-title-group">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="notion-tag" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7' }}>
                      {methodCfg.icon} {methodCfg.label}
                    </span>

                    {scan.scan_method === 'lab' && (
                      <span
                        className="notion-tag"
                        style={{
                          background: scan.lab_resolution === 'high' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                          color: scan.lab_resolution === 'high' ? '#d97706' : '#059669',
                          fontWeight: 700,
                        }}
                      >
                        {scan.lab_resolution === 'high' ? '⚡ 고화질' : '✨ 일반화질'}
                      </span>
                    )}

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

                {/* 총 나온 컷수 뱃지 */}
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
                    <span className="notion-prop-val" style={{ fontWeight: 600 }}>
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

        {filteredScans.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">📁</div>
            <h3>등록된 스캔 아카이브가 없습니다</h3>
            <p>상단의 &apos;새 스캔 아카이브 등록&apos;을 눌러 현상된 필름의 디지털화 기록을 남겨보세요.</p>
          </div>
        )}
      </div>

      {/* 🛠️ Scanner / Digitizing Rig Modal */}
      {isScannerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingScanner ? '스캐너 / 디지타이징 장비 수정' : '새 스캐너 / 디지타이징 장비 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsScannerModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveScannerSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">장비명 / 세트 명칭 *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="예: Sony A7R IV + 90mm Macro 또는 Epson V850 Pro"
                    value={scannerName}
                    onChange={(e) => setScannerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">장비 분류</label>
                    <select
                      className="form-select"
                      value={scannerCategory}
                      onChange={(e) => setScannerCategory(e.target.value as ScannerCategory)}
                    >
                      <option value="digitizing">📷 디지타이징 (카메라/미러리스 센서)</option>
                      <option value="flatbed">🖨️ 평판 스캐너 (Flatbed)</option>
                      <option value="dedicated">🎞️ 필름 전용 스캐너 (Dedicated 35mm/120)</option>
                      <option value="other">⚙️ 기타 장비</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">제조사 / 브랜드 (선택)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Sony, Epson, Plustek, Nikon"
                      value={scannerBrand}
                      onChange={(e) => setScannerBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">광원 / 백라이트 규격</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Cinestill CS-LITE (95+ CRI), Raleno LED, 내장 광원"
                      value={scannerSensorOrLight}
                      onChange={(e) => setScannerSensorOrLight(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">필름 캐리어 / 홀더 종류</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Valoi 360, Essential Film Holder, 정품 홀더"
                      value={scannerHolderType}
                      onChange={(e) => setScannerHolderType(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">특이사항 및 권장 설정 메모</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="예: 6100만 화소 16bit 무압축 RAW 캡처, 조리개 f/8 최적, 유효 해상도 4800 DPI 등"
                    value={scannerNotes}
                    onChange={(e) => setScannerNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsScannerModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  장비 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📁 Scan Archive Modal */}
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
                      onChange={(e) => {
                        const nextMethod = e.target.value as ScanMethod;
                        setScanMethod(nextMethod);
                        if (nextMethod !== 'lab') {
                          const matched = scanners.find((s) =>
                            nextMethod === 'digitizing' || nextMethod === 'dslr'
                              ? s.category === 'digitizing'
                              : s.category === nextMethod
                          );
                          if (matched) {
                            setSelectedScannerId(matched.id);
                            setScannerModel(matched.name);
                          }
                        }
                      }}
                    >
                      <option value="digitizing">📸 디지타이징 (카메라/미러리스 센서)</option>
                      <option value="flatbed">🖨️ 평판 스캐너 (Epson V600/V850 등)</option>
                      <option value="dedicated">🎞️ 필름 전용 스캐너 (Plustek, Pakon 등)</option>
                      <option value="lab">🏬 현상소 스캔 (노리츠 / 후지 프론티어 / 코닥 / 이마콘)</option>
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

                {/* 🌟 현상소 스캔일 때: 현상소 스캐너 기종 선택 & 화질(일반/고화질) 선택 */}
                {scanMethod === 'lab' ? (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                        현상소 스캐너 기종 선택
                      </label>
                      <select
                        className="form-select"
                        value={labScanner}
                        onChange={(e) => setLabScanner(e.target.value)}
                      >
                        {LAB_SCANNERS.map((ls) => (
                          <option key={ls.id} value={ls.id}>
                            {ls.name} - {ls.desc}
                          </option>
                        ))}
                      </select>

                      {labScanner === 'other' && (
                        <input
                          className="form-input"
                          type="text"
                          style={{ marginTop: '8px' }}
                          placeholder="현상소 스캐너 기종 직접 입력"
                          value={customLabScanner}
                          onChange={(e) => setCustomLabScanner(e.target.value)}
                        />
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                        현상소 스캔 화질 등급
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          className={`btn ${labResolution === 'standard' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '10px 12px',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '2px',
                            height: 'auto',
                            borderColor: labResolution === 'standard' ? '#10b981' : undefined,
                            background: labResolution === 'standard' ? '#10b981' : undefined,
                          }}
                          onClick={() => setLabResolution('standard')}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>✨ 일반화질</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>약 2000~3000px (SNS/웹용)</span>
                        </button>

                        <button
                          type="button"
                          className={`btn ${labResolution === 'high' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '10px 12px',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '2px',
                            height: 'auto',
                            borderColor: labResolution === 'high' ? '#f59e0b' : undefined,
                            background: labResolution === 'high' ? '#f59e0b' : undefined,
                          }}
                          onClick={() => setLabResolution('high')}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>⚡ 고화질 (High-Res)</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>약 5000~6000px+ (정밀/인화용)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 🌟 디지타이징 / 평판 / 전용 스캐너일 때: 내 보유 장비 연동 드롭다운 */
                  <div className="form-row">
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">보유 장비에서 선택</label>
                        <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
                          {matchingOwnedScanners.length}개 보유 중
                        </span>
                      </div>
                      <select
                        className="form-select"
                        value={selectedScannerId}
                        onChange={(e) => {
                          const sid = e.target.value;
                          setSelectedScannerId(sid);
                          const found = scanners.find((s) => s.id === sid);
                          if (found) setScannerModel(found.name);
                        }}
                      >
                        <option value="">-- 보유 장비 목록에서 선택 --</option>
                        {matchingOwnedScanners.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">스캐너 기종 / 디지타이징 세부 모델명</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="예: Sony A7R IV + 90mm Macro (CS-LITE 광원)"
                        value={scannerModel}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setScannerModel(e.target.value)}
                      />
                    </div>
                  </div>
                )}

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
                    onFocus={(e) => e.target.select()}
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
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setStoragePath(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">반전/보정 프로그램 (선택)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Negative Lab Pro v3.0, SilverFast 9"
                      value={softwareUsed}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setSoftwareUsed(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">스캔 날짜</label>
                    <input
                      className="form-input"
                      type="date"
                      value={scanDate}
                      onChange={(e) => setScanDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">색감 / 샤프니스 / 메모</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Frontier 톤 프로필 적용, 하이라이트 복원 우수"
                      value={notes}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingScan ? '수정 완료' : '스캔 기록 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
