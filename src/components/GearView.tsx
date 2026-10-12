'use client';

import React, { useState, useMemo } from 'react';
import { CameraItem, LensItem, CameraFormat, EquipmentStatus, LensCategory } from '@/types';
import { CAMERA_FORMAT_CONFIG, EQUIPMENT_STATUS_CONFIG } from '@/lib/constants';
import { Camera, Aperture, Plus, Search, AlertCircle, Wrench, CheckCircle2, ShoppingBag, Bookmark, Edit2, Trash2, Upload } from 'lucide-react';

interface GearViewProps {
  cameras: CameraItem[];
  lenses: LensItem[];
  onSaveCamera: (camera: CameraItem) => Promise<void>;
  onDeleteCamera: (id: string) => Promise<void>;
  onSaveLens: (lens: LensItem) => Promise<void>;
  onDeleteLens: (id: string) => Promise<void>;
}

export default function GearView({
  cameras,
  lenses,
  onSaveCamera,
  onDeleteCamera,
  onSaveLens,
  onDeleteLens,
}: GearViewProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'lens'>('camera');
  const [search, setSearch] = useState('');

  // Camera Filters & Sorting
  const [cameraFormatFilter, setCameraFormatFilter] = useState<string>('all');
  const [cameraStatusFilter, setCameraStatusFilter] = useState<string>('all');
  const [cameraSort, setCameraSort] = useState<'brand' | 'format' | 'status'>('brand');

  // Lens Filters & Sorting (2-1. 판형별, 초점거리 별, 줌렌즈/단렌즈 별, f값 정렬)
  const [lensFormatFilter, setLensFormatFilter] = useState<string>('all');
  const [lensCategoryFilter, setLensCategoryFilter] = useState<string>('all'); // prime | zoom
  const [lensSort, setLensSort] = useState<'focal_asc' | 'focal_desc' | 'aperture_bright' | 'category' | 'brand'>('focal_asc');

  // Camera Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CameraItem | null>(null);
  const [camBrand, setCamBrand] = useState('');
  const [camModel, setCamModel] = useState('');
  const [camImage, setCamImage] = useState('');
  const [camFormat, setCamFormat] = useState<CameraFormat>('135_full');
  const [camLensType, setCamLensType] = useState<'interchangeable' | 'fixed'>('interchangeable');
  const [camFixedLensName, setCamFixedLensName] = useState('');
  const [camFixedFocalLength, setCamFixedFocalLength] = useState<number | ''>('');
  const [camFixedMaxAperture, setCamFixedMaxAperture] = useState<number | ''>('');
  const [camStatus, setCamStatus] = useState<EquipmentStatus>('active');
  const [camSerial, setCamSerial] = useState('');
  const [camMount, setCamMount] = useState('Leica M');
  const [camNotes, setCamNotes] = useState('');

  // Mounts of all owned interchangeable cameras
  const availableCameraMounts = useMemo(() => {
    const mountSet = new Set<string>();
    cameras.forEach((c) => {
      if (c.lens_type !== 'fixed' && c.mount && c.mount.trim()) {
        mountSet.add(c.mount.trim());
      }
    });
    return Array.from(mountSet);
  }, [cameras]);

  // Lens Modal State
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [editingLens, setEditingLens] = useState<LensItem | null>(null);
  const [lensBrand, setLensBrand] = useState('');
  const [lensName, setLensName] = useState('');
  const [lensImage, setLensImage] = useState('');
  const [lensFormatCompat, setLensFormatCompat] = useState('135');
  const [lensCategory, setLensCategory] = useState<LensCategory>('prime');
  const [lensFocalMin, setLensFocalMin] = useState<number | ''>(50);
  const [lensFocalMax, setLensFocalMax] = useState<number | ''>(50);
  const [lensMaxAperture, setLensMaxAperture] = useState<number | ''>(1.4);
  const [lensMount, setLensMount] = useState('');
  const [lensStatus, setLensStatus] = useState<EquipmentStatus>('active');
  const [lensSerial, setLensSerial] = useState('');
  const [lensNotes, setLensNotes] = useState('');

  // Photo Upload Handlers
  const handleCameraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('카메라 사진 파일 크기는 5MB 이하로 업로드해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCamImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLensPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('렌즈 사진 파일 크기는 5MB 이하로 업로드해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLensImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera Modal Handlers
  const openAddCamera = () => {
    setEditingCamera(null);
    setCamBrand('');
    setCamModel('');
    setCamImage('');
    setCamFormat('135_full');
    setCamLensType('interchangeable');
    setCamMount('Leica M');
    setCamFixedLensName('');
    setCamFixedFocalLength('');
    setCamFixedMaxAperture('');
    setCamStatus('active');
    setCamSerial('');
    setCamNotes('');
    setIsCameraModalOpen(true);
  };

  const openEditCamera = (cam: CameraItem) => {
    setEditingCamera(cam);
    setCamBrand(cam.brand);
    setCamModel(cam.model);
    setCamImage(cam.image_url || '');
    setCamFormat(cam.format);
    setCamLensType(cam.lens_type);
    setCamMount(cam.mount || '');
    setCamFixedLensName(cam.fixed_lens_name || '');
    setCamFixedFocalLength(cam.fixed_focal_length ?? '');
    setCamFixedMaxAperture(cam.fixed_max_aperture ?? '');
    setCamStatus(cam.status);
    setCamSerial(cam.serial_number || '');
    setCamNotes(cam.notes || '');
    setIsCameraModalOpen(true);
  };

  const handleCameraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camBrand.trim() || !camModel.trim()) {
      alert('카메라 제조사와 모델명을 입력해주세요.');
      return;
    }

    const newCam: CameraItem = {
      id: editingCamera ? editingCamera.id : `cam-${Date.now()}`,
      brand: camBrand.trim(),
      model: camModel.trim(),
      format: camFormat,
      lens_type: camLensType,
      mount: camLensType === 'interchangeable' && camMount.trim() ? camMount.trim() : undefined,
      fixed_lens_name: camLensType === 'fixed' ? camFixedLensName.trim() : undefined,
      fixed_focal_length: camLensType === 'fixed' && camFixedFocalLength !== '' ? Number(camFixedFocalLength) : undefined,
      fixed_max_aperture: camLensType === 'fixed' && camFixedMaxAperture !== '' ? Number(camFixedMaxAperture) : undefined,
      status: camStatus,
      serial_number: camSerial.trim() || undefined,
      image_url: camImage || undefined,
      notes: camNotes.trim() || undefined,
      created_at: editingCamera ? editingCamera.created_at : new Date().toISOString(),
    };

    await onSaveCamera(newCam);
    setIsCameraModalOpen(false);
  };

  // Lens Modal Handlers
  const openAddLens = () => {
    setEditingLens(null);
    setLensBrand('');
    setLensName('');
    setLensImage('');
    setLensFormatCompat('135');
    setLensMount(availableCameraMounts.length > 0 ? availableCameraMounts[0] : '');
    setLensCategory('prime');
    setLensFocalMin(50);
    setLensFocalMax(50);
    setLensMaxAperture(1.4);
    setLensStatus('active');
    setLensSerial('');
    setLensNotes('');
    setIsLensModalOpen(true);
  };

  const openEditLens = (lens: LensItem) => {
    setEditingLens(lens);
    setLensBrand(lens.brand);
    setLensName(lens.name);
    setLensImage(lens.image_url || '');
    setLensFormatCompat(lens.format_compatibility);
    setLensCategory(lens.lens_category);
    setLensFocalMin(lens.focal_length_min);
    setLensFocalMax(lens.focal_length_max);
    setLensMaxAperture(lens.max_aperture);
    setLensMount(lens.mount || '');
    setLensStatus(lens.status);
    setLensSerial(lens.serial_number || '');
    setLensNotes(lens.notes || '');
    setIsLensModalOpen(true);
  };

  const handleLensSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lensBrand.trim() || !lensName.trim()) {
      alert('렌즈 브랜드와 렌즈명을 입력해주세요.');
      return;
    }

    const minFocal = lensFocalMin !== '' ? Number(lensFocalMin) : 50;
    const maxFocal = lensCategory === 'prime' ? minFocal : (lensFocalMax !== '' ? Number(lensFocalMax) : minFocal);

    const newLens: LensItem = {
      id: editingLens ? editingLens.id : `lens-${Date.now()}`,
      brand: lensBrand.trim(),
      name: lensName.trim(),
      format_compatibility: lensFormatCompat.trim() || '135',
      lens_category: lensCategory,
      focal_length_min: minFocal,
      focal_length_max: maxFocal,
      max_aperture: lensMaxAperture !== '' ? Number(lensMaxAperture) : 2.8,
      mount: lensMount.trim() || undefined,
      status: lensStatus,
      serial_number: lensSerial.trim() || undefined,
      image_url: lensImage || undefined,
      notes: lensNotes.trim() || undefined,
      created_at: editingLens ? editingLens.created_at : new Date().toISOString(),
    };

    await onSaveLens(newLens);
    setIsLensModalOpen(false);
  };

  // Filter & Sort Cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((c) => {
      const q = search.toLowerCase();
      const matchQ = c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || (c.fixed_lens_name && c.fixed_lens_name.toLowerCase().includes(q));
      if (!matchQ) return false;

      if (cameraFormatFilter !== 'all' && c.format !== cameraFormatFilter) return false;
      if (cameraStatusFilter !== 'all' && c.status !== cameraStatusFilter) return false;

      return true;
    });
  }, [cameras, search, cameraFormatFilter, cameraStatusFilter]);

  const sortedCameras = useMemo(() => {
    return [...filteredCameras].sort((a, b) => {
      if (cameraSort === 'brand') {
        return a.brand.localeCompare(b.brand, 'ko-KR');
      }
      if (cameraSort === 'format') {
        return a.format.localeCompare(b.format);
      }
      if (cameraSort === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [filteredCameras, cameraSort]);

  // Filter & Sort Lenses (2-1 요구사항: 판형별, 초점거리별, 줌/단렌즈별, f값 정렬)
  const filteredLenses = useMemo(() => {
    return lenses.filter((l) => {
      const q = search.toLowerCase();
      const matchQ = l.brand.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || (l.mount && l.mount.toLowerCase().includes(q));
      if (!matchQ) return false;

      if (lensFormatFilter !== 'all' && l.format_compatibility !== lensFormatFilter) return false;
      if (lensCategoryFilter !== 'all' && l.lens_category !== lensCategoryFilter) return false;

      return true;
    });
  }, [lenses, search, lensFormatFilter, lensCategoryFilter]);

  const sortedLenses = useMemo(() => {
    return [...filteredLenses].sort((a, b) => {
      if (lensSort === 'focal_asc') {
        return a.focal_length_min - b.focal_length_min;
      }
      if (lensSort === 'focal_desc') {
        return b.focal_length_min - a.focal_length_min;
      }
      if (lensSort === 'aperture_bright') {
        return a.max_aperture - b.max_aperture; // lower f-stop is brighter (f/1.4 before f/2.8)
      }
      if (lensSort === 'category') {
        return a.lens_category.localeCompare(b.lens_category);
      }
      if (lensSort === 'brand') {
        return a.brand.localeCompare(b.brand, 'ko-KR');
      }
      return 0;
    });
  }, [filteredLenses, lensSort]);

  // Stats
  const activeCamerasCount = cameras.filter((c) => c.status === 'active').length;
  const inRepairCamerasCount = cameras.filter((c) => c.status === 'needs_repair' || c.status === 'in_repair').length;

  return (
    <div className="content-body">
      {/* Top Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Camera size={15} /> 보유 카메라
          </div>
          <div className="stat-value">{cameras.length} 대</div>
          <div className="stat-desc">정상 작동: {activeCamerasCount}대</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#38bdf8' } as React.CSSProperties}>
          <div className="stat-label">
            <Aperture size={15} /> 보유 렌즈
          </div>
          <div className="stat-value">{lenses.length} 개</div>
          <div className="stat-desc">단렌즈 {lenses.filter((l) => l.lens_category === 'prime').length}개 / 줌렌즈 {lenses.filter((l) => l.lens_category === 'zoom').length}개</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': inRepairCamerasCount > 0 ? '#ef4444' : '#10b981' } as React.CSSProperties}>
          <div className="stat-label">
            <Wrench size={15} /> 수리 필요 / 수리 중
          </div>
          <div className="stat-value">{inRepairCamerasCount} 대</div>
          <div className="stat-desc">⚠️ 촬영 시 선택 목록에서 제외됨</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' } as React.CSSProperties}>
          <div className="stat-label">
            <CheckCircle2 size={15} /> 현재 즉시 촬영 가능
          </div>
          <div className="stat-value">{activeCamerasCount} 대</div>
          <div className="stat-desc">촬영 롤 등록 가능 바디</div>
        </div>
      </div>

      {/* Apple-style Segmented Navigation for Gear Types */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={15} /> 카메라 보관함 <span className="segmented-badge">{cameras.length}</span>
          </button>
          <button
            className={`segmented-item ${activeTab === 'lens' ? 'active' : ''}`}
            onClick={() => setActiveTab('lens')}
          >
            <Aperture size={15} /> 렌즈 보관함 <span className="segmented-badge">{lenses.length}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder={activeTab === 'camera' ? '카메라 브랜드, 모델명 검색...' : '렌즈 브랜드, 이름, 마운트 검색...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === 'camera' ? (
          <div className="filter-group">
            {/* 카메라 정렬 */}
            <select
              className="select-custom"
              value={cameraSort}
              onChange={(e) => setCameraSort(e.target.value as any)}
            >
              <option value="brand">🏢 제조사(브랜드)순</option>
              <option value="format">📐 판형별</option>
              <option value="status">🔧 상태별</option>
            </select>

            {/* 카메라 판형 필터 */}
            <select
              className="select-custom"
              value={cameraFormatFilter}
              onChange={(e) => setCameraFormatFilter(e.target.value)}
            >
              <option value="all">모든 판형</option>
              <option value="135_full">35mm 풀프레임</option>
              <option value="135_half">35mm 하프프레임</option>
              <option value="120_645">중형 6x4.5</option>
              <option value="120_66">중형 6x6</option>
              <option value="120_67">중형 6x7</option>
              <option value="120_69">중형 6x9</option>
              <option value="large_4x5">대형 4x5</option>
            </select>

            {/* 2-2. 상태 필터 */}
            <select
              className="select-custom"
              value={cameraStatusFilter}
              onChange={(e) => setCameraStatusFilter(e.target.value)}
            >
              <option value="all">모든 상태</option>
              <option value="active">정상 작동 (사용가능)</option>
              <option value="needs_repair">수리 필요 (고장)</option>
              <option value="in_repair">수리 중</option>
              <option value="for_sale">판매 예정</option>
              <option value="collection">소장 / 보관</option>
            </select>

            <button className="btn btn-primary" onClick={openAddCamera}>
              <Plus size={16} /> 카메라 추가
            </button>
          </div>
        ) : (
          <div className="filter-group">
            {/* 2-1. 렌즈 정렬: 초점거리별, f값(밝은순), 단/줌별, 브랜드 */}
            <select
              className="select-custom"
              value={lensSort}
              onChange={(e) => setLensSort(e.target.value as any)}
            >
              <option value="focal_asc">📏 초점거리 (광각 → 망원)</option>
              <option value="focal_desc">📏 초점거리 (망원 → 광각)</option>
              <option value="aperture_bright">✨ 조리개 f값 (밝은 순)</option>
              <option value="category">🔍 단렌즈 / 줌렌즈 별</option>
              <option value="brand">🏢 브랜드별</option>
            </select>

            {/* 렌즈 구분 필터 */}
            <select
              className="select-custom"
              value={lensCategoryFilter}
              onChange={(e) => setLensCategoryFilter(e.target.value)}
            >
              <option value="all">단/줌 전체</option>
              <option value="prime">단렌즈 (Prime)</option>
              <option value="zoom">줌렌즈 (Zoom)</option>
            </select>

            {/* 지원 판형 필터 */}
            <select
              className="select-custom"
              value={lensFormatFilter}
              onChange={(e) => setLensFormatFilter(e.target.value)}
            >
              <option value="all">모든 지원판형</option>
              <option value="135">135 (35mm)</option>
              <option value="120">120 (중형)</option>
              <option value="large">대형</option>
            </select>

            <button className="btn btn-primary" onClick={openAddLens}>
              <Plus size={16} /> 렌즈 추가
            </button>
          </div>
        )}
      </div>

      {/* Cameras Tab List */}
      {activeTab === 'camera' && (
        <>
          {sortedCameras.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Camera size={28} /></div>
              <h3>등록된 카메라가 없습니다</h3>
              <p>필름 카메라 바디를 추가하여 촬영 관리와 연동하세요.</p>
              <button className="btn btn-primary" onClick={openAddCamera}>
                <Plus size={16} /> 카메라 추가하기
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {sortedCameras.map((cam) => {
                const statusCfg = EQUIPMENT_STATUS_CONFIG[cam.status] || EQUIPMENT_STATUS_CONFIG.active;
                const isUnavailable = !statusCfg.usable;

                return (
                  <div key={cam.id} className="item-card" style={isUnavailable ? { borderLeft: '3px solid var(--accent-red)' } : {}}>
                    <div className="card-top">
                      <div className="card-title-group">
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span
                            className="notion-tag"
                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                          <span className="spec-pill">
                            <strong>{CAMERA_FORMAT_CONFIG[cam.format] || cam.format}</strong>
                          </span>
                          <span className="spec-pill">
                            {cam.lens_type === 'fixed' ? '일체형' : '교환식'}
                          </span>
                        </div>

                        <h3 className="card-title" style={{ marginTop: '4px' }}>
                          {cam.brand} {cam.model}
                        </h3>

                        {cam.serial_number && (
                          <div className="card-subtitle">
                            S/N: <code style={{ fontFamily: 'var(--font-mono)' }}>{cam.serial_number}</code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 실물 사진 썸네일 */}
                    {cam.image_url && (
                      <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', margin: '8px 0 12px 0', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-subtle)' }}>
                        <img src={cam.image_url} alt={`${cam.brand} ${cam.model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* Notion Database Property Rows */}
                    <div className="notion-prop-table">
                      <div className="notion-prop-row">
                        <span className="notion-prop-key">📐 판형 규격</span>
                        <span className="notion-prop-val">
                          <strong>{CAMERA_FORMAT_CONFIG[cam.format] || cam.format}</strong>
                        </span>
                      </div>

                      <div className="notion-prop-row">
                        <span className="notion-prop-key">🔍 렌즈 체계</span>
                        <span className="notion-prop-val">
                          {cam.lens_type === 'fixed' ? '렌즈 일체형 바디' : '교환식 렌즈 마운트'}
                        </span>
                      </div>

                      {cam.lens_type === 'fixed' && (
                        <div className="notion-prop-row">
                          <span className="notion-prop-key">📸 내장 렌즈</span>
                          <span className="notion-prop-val" style={{ color: 'var(--accent-amber-light)' }}>
                            {cam.fixed_lens_name || `${cam.fixed_focal_length}mm f/${cam.fixed_max_aperture}`}
                          </span>
                        </div>
                      )}

                      <div className="notion-prop-row">
                        <span className="notion-prop-key">🔧 기기 상태</span>
                        <span className="notion-prop-val">
                          <span className="notion-tag" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                            {statusCfg.label}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 2-2. 수리 필요/수리중 경고 배너 */}
                    {isUnavailable && (
                      <div className="notion-callout danger">
                        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>촬영 불가:</strong> 현재 수리/고장 상태이므로 촬영 등록 시 카메라 선택 목록에서 제외됩니다.</span>
                      </div>
                    )}

                    {cam.notes && (
                      <div className="notion-callout">
                        <span>📝 {cam.notes}</span>
                      </div>
                    )}

                    <div className="card-bottom">
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        등록: {cam.created_at?.split('T')[0] || '-'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditCamera(cam)}>
                          <Edit2 size={13} /> 수정
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (confirm(`'${cam.brand} ${cam.model}' 카메라를 삭제하시겠습니까?`)) {
                              onDeleteCamera(cam.id);
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
        </>
      )}

      {/* Lenses Tab List */}
      {activeTab === 'lens' && (
        <>
          {sortedLenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Aperture size={28} /></div>
              <h3>등록된 렌즈가 없습니다</h3>
              <p>카메라와 마운트할 렌즈를 등록해보세요.</p>
              <button className="btn btn-primary" onClick={openAddLens}>
                <Plus size={16} /> 렌즈 추가하기
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {sortedLenses.map((lens) => {
                const statusCfg = EQUIPMENT_STATUS_CONFIG[lens.status] || EQUIPMENT_STATUS_CONFIG.active;
                const isPrime = lens.lens_category === 'prime';

                return (
                  <div key={lens.id} className="item-card">
                    <div className="card-top">
                      <div className="card-title-group">
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span
                            className="notion-tag"
                            style={{
                              background: isPrime ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: isPrime ? '#0284c7' : '#d97706',
                            }}
                          >
                            {isPrime ? '단렌즈 (Prime)' : '줌렌즈 (Zoom)'}
                          </span>

                          <span className="spec-pill">
                            포맷 <strong>{lens.format_compatibility}</strong>
                          </span>

                          <span
                            className="notion-tag"
                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                        </div>

                        <h3 className="card-title" style={{ marginTop: '4px' }}>
                          {lens.name}
                        </h3>

                        <div className="card-subtitle">
                          <span>제조사: <strong>{lens.brand}</strong></span>
                          {lens.mount && (
                            <>
                              <span>•</span>
                              <span>마운트: {lens.mount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 실물 사진 썸네일 */}
                    {lens.image_url && (
                      <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', margin: '8px 0 12px 0', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-subtle)' }}>
                        <img src={lens.image_url} alt={`${lens.brand} ${lens.name}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* Notion Database Property Rows */}
                    <div className="notion-prop-table">
                      <div className="notion-prop-row">
                        <span className="notion-prop-key">📏 초점거리</span>
                        <span className="notion-prop-val">
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>
                            {isPrime
                              ? `${lens.focal_length_min}mm`
                              : `${lens.focal_length_min}–${lens.focal_length_max}mm`}
                          </strong>
                        </span>
                      </div>

                      <div className="notion-prop-row">
                        <span className="notion-prop-key">✨ 최대 조리개</span>
                        <span className="notion-prop-val">
                          <strong style={{ color: 'var(--accent-amber-light)', fontFamily: 'var(--font-mono)' }}>
                            f/{lens.max_aperture}
                          </strong>
                        </span>
                      </div>

                      <div className="notion-prop-row">
                        <span className="notion-prop-key">🔩 체결 마운트</span>
                        <span className="notion-prop-val">
                          {lens.mount || '범용 / 기타'}
                        </span>
                      </div>

                      <div className="notion-prop-row">
                        <span className="notion-prop-key">📐 지원 판형</span>
                        <span className="notion-prop-val">
                          {lens.format_compatibility}
                        </span>
                      </div>

                      {lens.serial_number && (
                        <div className="notion-prop-row">
                          <span className="notion-prop-key">🔢 시리얼 번호</span>
                          <span className="notion-prop-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                            {lens.serial_number}
                          </span>
                        </div>
                      )}
                    </div>

                    {lens.notes && (
                      <div className="notion-callout">
                        <span>📝 {lens.notes}</span>
                      </div>
                    )}

                    <div className="card-bottom">
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        등록: {lens.created_at?.split('T')[0] || '-'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditLens(lens)}>
                          <Edit2 size={13} /> 수정
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (confirm(`'${lens.brand} ${lens.name}' 렌즈를 삭제하시겠습니까?`)) {
                              onDeleteLens(lens.id);
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
        </>
      )}

      {/* 카메라 등록/수정 모달 */}
      {isCameraModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingCamera ? '카메라 정보 수정' : '새 카메라 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsCameraModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCameraSubmit}>
              <div className="modal-body">
                {/* 카메라 실물 사진 업로드 */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">카메라 실물 사진 (내 기기 사진 업로드)</label>
                  {camImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#0a0b0e', border: '1px solid var(--border-normal)' }}>
                      <img src={camImage} alt="카메라 미리보기" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px' }}
                        onClick={() => setCamImage('')}
                      >
                        <Trash2 size={13} /> 사진 삭제
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '18px',
                        border: '1.5px dashed var(--border-normal)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Camera size={24} color="var(--accent-amber)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>클릭하여 카메라 사진 파일 선택</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>JPG, PNG, WEBP 등 지원 (최대 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleCameraPhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">제조사 (브랜드) *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Leica, Nikon, Hasselblad, Contax"
                      value={camBrand}
                      onChange={(e) => setCamBrand(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">모델명 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: M6 Classic, F3 HP, 500C/M"
                      value={camModel}
                      onChange={(e) => setCamModel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">카메라 판형</label>
                    <select
                      className="form-select"
                      value={camFormat}
                      onChange={(e) => setCamFormat(e.target.value as CameraFormat)}
                    >
                      <option value="135_full">35mm 풀프레임 (24x36)</option>
                      <option value="135_half">35mm 하프프레임 (18x24)</option>
                      <option value="120_645">중형 6x4.5</option>
                      <option value="120_66">중형 6x6</option>
                      <option value="120_67">중형 6x7</option>
                      <option value="120_69">중형 6x9</option>
                      <option value="large_4x5">대형 4x5</option>
                      <option value="large_8x10">대형 8x10</option>
                      <option value="panorama">파노라마 (XPan 등)</option>
                      <option value="other">기타 판형</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">렌즈 타입</label>
                    <select
                      className="form-select"
                      value={camLensType}
                      onChange={(e) => setCamLensType(e.target.value as 'interchangeable' | 'fixed')}
                    >
                      <option value="interchangeable">렌즈 교환식 바디</option>
                      <option value="fixed">렌즈 일체형 (똑딱이/P&S)</option>
                    </select>
                  </div>
                </div>

                {/* 교환식일 때 마운트 정보 */}
                {camLensType === 'interchangeable' && (
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>카메라 렌즈 마운트 (자유 입력)</span>
                      <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>★ 렌즈 추가 드롭다운과 자동 연동</span>
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: M 또는 Leica M, Nikon F, M42, Hasselblad V 등"
                      value={camMount}
                      onChange={(e) => setCamMount(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px', display: 'block' }}>
                      💡 라이카의 경우 M 한 글자만 적거나 Leica M 처럼 원하는 방식으로 적으세요. 렌즈 등록 시 이 마운트가 드롭다운에 뜹니다.
                    </span>
                  </div>
                )}

                {/* 일체형일 때 렌즈 정보 */}
                {camLensType === 'fixed' && (
                  <div className="form-row-3" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div className="form-group">
                      <label className="form-label">일체형 렌즈명</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="예: Sonnar 38mm f/2.8"
                        value={camFixedLensName}
                        onChange={(e) => setCamFixedLensName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">초점거리 (mm)</label>
                      <input
                        className="form-input"
                        type="number"
                        placeholder="38"
                        value={camFixedFocalLength}
                        onChange={(e) => setCamFixedFocalLength(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">최대 f값</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.1"
                        placeholder="2.8"
                        value={camFixedMaxAperture}
                        onChange={(e) => setCamFixedMaxAperture(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {/* 2-2. 상태 관리 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">장비 상태 *</label>
                    <select
                      className="form-select"
                      value={camStatus}
                      onChange={(e) => setCamStatus(e.target.value as EquipmentStatus)}
                    >
                      <option value="active">정상 작동 (촬영 가능)</option>
                      <option value="needs_repair">⚠️ 수리 필요 (고장 - 촬영 선택 불가)</option>
                      <option value="in_repair">⚠️ 수리 중 (촬영 선택 불가)</option>
                      <option value="for_sale">판매 예정</option>
                      <option value="collection">소장 / 보관</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">시리얼 번호</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="S/N (선택사항)"
                      value={camSerial}
                      onChange={(e) => setCamSerial(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">메모 (고장 증상, 점검 이력 등)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="셔터막 점검, 차광 스펀지 상태 등"
                    value={camNotes}
                    onChange={(e) => setCamNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCameraModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">{editingCamera ? '수정 완료' : '카메라 등록'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 렌즈 등록/수정 모달 */}
      {isLensModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingLens ? '렌즈 정보 수정' : '새 렌즈 등록'}</h2>
              <button className="btn btn-subtle btn-icon" onClick={() => setIsLensModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleLensSubmit}>
              <div className="modal-body">
                {/* 렌즈 실물 사진 업로드 */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">렌즈 실물 사진 (내 렌즈 사진 업로드)</label>
                  {lensImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#0a0b0e', border: '1px solid var(--border-normal)' }}>
                      <img src={lensImage} alt="렌즈 미리보기" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px' }}
                        onClick={() => setLensImage('')}
                      >
                        <Trash2 size={13} /> 사진 삭제
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '18px',
                        border: '1.5px dashed var(--border-normal)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Aperture size={24} color="var(--accent-emerald)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>클릭하여 렌즈 사진 파일 선택</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>JPG, PNG, WEBP 등 지원 (최대 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleLensPhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">브랜드 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Carl Zeiss, Leica, Nikkor, Canon"
                      value={lensBrand}
                      onChange={(e) => setLensBrand(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">렌즈명 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Planar 50mm f/1.4 ZF.2"
                      value={lensName}
                      onChange={(e) => setLensName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">단렌즈 / 줌렌즈 구분</label>
                    <select
                      className="form-select"
                      value={lensCategory}
                      onChange={(e) => setLensCategory(e.target.value as LensCategory)}
                    >
                      <option value="prime">단렌즈 (Prime)</option>
                      <option value="zoom">줌렌즈 (Zoom)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">지원 판형</label>
                    <select
                      className="form-select"
                      value={lensFormatCompat}
                      onChange={(e) => setLensFormatCompat(e.target.value)}
                    >
                      <option value="135">35mm (135)</option>
                      <option value="120">중형 (120)</option>
                      <option value="large">대형</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>

                {/* 초점거리 & 최대개방 f값 */}
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">
                      {lensCategory === 'prime' ? '초점거리 (mm)' : '최소 초점거리 (mm)'}
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="50"
                      value={lensFocalMin}
                      onChange={(e) => setLensFocalMin(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                    />
                  </div>

                  {lensCategory === 'zoom' && (
                    <div className="form-group">
                      <label className="form-label">최대 초점거리 (mm)</label>
                      <input
                        className="form-input"
                        type="number"
                        placeholder="70"
                        value={lensFocalMax}
                        onChange={(e) => setLensFocalMax(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">최대 개방 f값 (조리개)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.1"
                      placeholder="1.4"
                      value={lensMaxAperture}
                      onChange={(e) => setLensMaxAperture(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>마운트</span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 500 }}>
                        보유 카메라 마운트 연동
                      </span>
                    </label>
                    {availableCameraMounts.length > 0 ? (
                      <select
                        className="form-select"
                        value={lensMount}
                        onChange={(e) => setLensMount(e.target.value)}
                        required
                      >
                        <option value="">-- 마운트 선택 ({availableCameraMounts.length}개 보유) --</option>
                        {availableCameraMounts.map((m) => (
                          <option key={m} value={m}>
                            {m} 마운트
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="예: Leica M 또는 M"
                          value={lensMount}
                          onChange={(e) => setLensMount(e.target.value)}
                          required
                        />
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                          ⚠️ 등록된 교환식 카메라가 없습니다. 카메라 바디에 마운트를 먼저 등록해주세요.
                        </span>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">상태</label>
                    <select
                      className="form-select"
                      value={lensStatus}
                      onChange={(e) => setLensStatus(e.target.value as EquipmentStatus)}
                    >
                      <option value="active">정상 작동</option>
                      <option value="needs_repair">수리 필요 (곰팡이, 헤이즈 등)</option>
                      <option value="in_repair">수리 중</option>
                      <option value="for_sale">판매 예정</option>
                      <option value="collection">소장 / 보관</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">시리얼 번호</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="S/N (선택사항)"
                    value={lensSerial}
                    onChange={(e) => setLensSerial(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">메모</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="조리개 클릭감, 렌즈 코팅 상태, 필터 구경 등"
                    value={lensNotes}
                    onChange={(e) => setLensNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLensModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">{editingLens ? '수정 완료' : '렌즈 등록'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
