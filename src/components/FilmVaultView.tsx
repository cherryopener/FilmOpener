'use client';

import React, { useState, useMemo } from 'react';
import { FilmItem, FilmType, FilmFormat, StorageMethod, FreshnessStatus } from '@/types';
import { FILM_TYPE_CONFIG, FILM_FORMAT_CONFIG, STORAGE_METHOD_CONFIG, FILM_BRAND_PRESETS } from '@/lib/constants';
import { getBrandTheme } from '@/lib/brandConfig';
import { formatExpiryYYMM, sanitizeExpiryDate, parseYearAndMonth, getFilmFreshness, compareFilmExpiry, compareFilmFreshness } from '@/lib/dateUtils';
import { Plus, Search, Layers, Snowflake, AlertTriangle, Tag, Sparkles, Edit2, Trash2 } from 'lucide-react';

interface FilmVaultViewProps {
  films: FilmItem[];
  onSaveFilm: (film: FilmItem) => Promise<void>;
  onDeleteFilm: (id: string) => Promise<void>;
}

export default function FilmVaultView({ films, onSaveFilm, onDeleteFilm }: FilmVaultViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterStorage, setFilterStorage] = useState<string>('all');
  const [filterSpecial, setFilterSpecial] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'brand' | 'type' | 'iso_asc' | 'iso_desc' | 'expiry_soon' | 'qty_desc' | 'freshness' | 'freshness_desc'>('expiry_soon');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<FilmItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [brandSelectMode, setBrandSelectMode] = useState<string>('');
  const [type, setType] = useState<FilmType>('color_negative');
  const [format, setFormat] = useState<FilmFormat>('135');
  const [iso, setIso] = useState<number | ''>(400);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [freshnessStatus, setFreshnessStatus] = useState<FreshnessStatus>('fresh');
  const [storageMethod, setStorageMethod] = useState<StorageMethod>('room_temp');
  const [isBulkRolled, setIsBulkRolled] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [framesPerRoll, setFramesPerRoll] = useState<number | ''>(36);
  const [framesOption, setFramesOption] = useState<'36' | '24' | 'custom'>('36');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingFilm(null);
    setName('');
    setBrand('');
    setBrandSelectMode('');
    setType('color_negative');
    setFormat('135');
    setIso(400);
    setExpiryDate('');
    setExpiryYear('');
    setExpiryMonth('');
    setFreshnessStatus('fresh');
    setStorageMethod('room_temp');
    setIsBulkRolled(false);
    setIsExpired(false);
    setQuantity(1);
    setFramesPerRoll(36);
    setFramesOption('36');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleFormatChange = (newFormat: FilmFormat) => {
    setFormat(newFormat);
    if (newFormat === '120') {
      setFramesPerRoll(12);
    } else if (newFormat === '220') {
      setFramesPerRoll(24);
    } else if (newFormat === 'large_sheet') {
      setFramesPerRoll(1);
    } else if (newFormat === '110') {
      if (framesOption === '36') {
        setFramesOption('24');
        setFramesPerRoll(24);
      }
    } else {
      if (framesOption === '36') {
        setFramesPerRoll(36);
      } else if (framesOption === '24') {
        setFramesPerRoll(24);
      }
    }
  };

  const openEditModal = (film: FilmItem) => {
    setEditingFilm(film);
    setName(film.name);

    const rawBrand = (film.brand || '').trim();
    const matchedPreset = FILM_BRAND_PRESETS.find(
      (p) =>
        p.name.toLowerCase() === rawBrand.toLowerCase() ||
        p.id === rawBrand.toLowerCase()
    );
    if (matchedPreset) {
      setBrandSelectMode(matchedPreset.name);
      setBrand(matchedPreset.name);
    } else {
      setBrandSelectMode('__custom__');
      setBrand(rawBrand);
    }

    setType(film.type);
    setFormat(film.format);
    setIso(film.iso);
    const cleanExpiry = sanitizeExpiryDate(film.expiry_date || '');
    setExpiryDate(cleanExpiry);
    const { year: parsedY, month: parsedM } = parseYearAndMonth(cleanExpiry);
    setExpiryYear(parsedY);
    setExpiryMonth(parsedM);
    setFreshnessStatus(
      film.freshness_status ||
      (film.expiry_date?.includes('틀딱') ? 'deep_expired' : film.is_expired ? 'expired' : 'fresh')
    );
    setStorageMethod(film.storage_method);
    setIsBulkRolled(film.is_bulk_rolled);
    setIsExpired(film.is_expired);
    setQuantity(film.quantity);

    const isMedOrLarge = film.format === '120' || film.format === '220' || film.format === 'large_sheet';
    if (isMedOrLarge) {
      setFramesPerRoll(film.frames_per_roll || (film.format === '120' ? 12 : film.format === '220' ? 24 : 1));
    } else if (film.format === '110') {
      setFramesPerRoll(film.frames_per_roll || 24);
      if (film.frames_per_roll === 24) {
        setFramesOption('24');
      } else {
        setFramesOption('custom');
      }
    } else {
      setFramesPerRoll(film.frames_per_roll || 36);
      if (film.frames_per_roll === 36) {
        setFramesOption('36');
      } else if (film.frames_per_roll === 24) {
        setFramesOption('24');
      } else {
        setFramesOption('custom');
      }
    }

    setNotes(film.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) {
      alert('필름 이름과 제조사를 입력해주세요.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const autoExpired =
      freshnessStatus === 'fresh'
        ? false
        : freshnessStatus === 'deep_expired' || freshnessStatus === 'expired'
        ? true
        : isExpired || (expiryDate ? expiryDate < todayStr : false);

    let finalExpiry = sanitizeExpiryDate(
      (expiryYear && expiryMonth ? `${expiryYear}-${expiryMonth}` : expiryDate).trim()
    );
    if (!finalExpiry) {
      if (freshnessStatus === 'fresh') finalExpiry = '유통기한 미상 (로리/싱싱)';
      else if (freshnessStatus === 'deep_expired') finalExpiry = '유통기한 미상 (틀딱/푹썩필)';
      else finalExpiry = '유통기한 미상 (노괴/썩필)';
    }

    const isMediumOrLarge = format === '120' || format === '220' || format === 'large_sheet';
    const computedFrames = isMediumOrLarge
      ? (format === '120' ? 12 : format === '220' ? 24 : 1)
      : (Number(framesPerRoll) || (format === '110' ? 24 : 36));

    const newFilm: FilmItem = {
      id: editingFilm ? editingFilm.id : `film-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      type,
      format,
      iso: Number(iso) || 400,
      expiry_date: finalExpiry,
      storage_method: storageMethod,
      is_bulk_rolled: isBulkRolled,
      is_expired: autoExpired,
      freshness_status: freshnessStatus,
      is_rebranded: false,
      original_film_info: undefined,
      quantity: Number(quantity) || 1,
      frames_per_roll: computedFrames,
      notes: notes.trim(),
      created_at: editingFilm ? editingFilm.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveFilm(newFilm);
    setIsModalOpen(false);
  };

  // Filter & Sort Logic
  const filteredFilms = useMemo(() => {
    return films.filter((f) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        f.name.toLowerCase().includes(searchLower) ||
        f.brand.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      if (filterType !== 'all' && f.type !== filterType) return false;
      if (filterFormat !== 'all' && f.format !== filterFormat) return false;
      if (filterStorage !== 'all' && f.storage_method !== filterStorage) return false;

      if (filterSpecial === 'fresh' && getFilmFreshness(f) !== 'fresh') return false;
      if (filterSpecial === 'expired' && getFilmFreshness(f) !== 'expired') return false;
      if (filterSpecial === 'deep_expired' && getFilmFreshness(f) !== 'deep_expired') return false;
      if (filterSpecial === 'bulk' && !f.is_bulk_rolled) return false;

      return true;
    });
  }, [films, search, filterType, filterFormat, filterStorage, filterSpecial]);

  const sortedFilms = useMemo(() => {
    return [...filteredFilms].sort((a, b) => {
      // 0. 소진된 필름 (보유 수량 0 이하)은 어떠한 정렬 기준에도 상관없이 항상 맨 뒤로 배치
      const aExhausted = (a.quantity ?? 0) <= 0;
      const bExhausted = (b.quantity ?? 0) <= 0;
      if (aExhausted !== bExhausted) {
        return aExhausted ? 1 : -1;
      }

      // 1. 유통기한 임박순 (틀딱 -> 노괴 -> 로리, 가장 오래된 필름 우선 소진, 로리 미상이 맨 뒤)
      if (sortBy === 'expiry_soon') {
        return compareFilmExpiry(a, b);
      }
      // 2. 신선도순 (로리 -> 노괴 -> 틀딱) 및 신선도 역순 (틀딱 -> 노괴 -> 로리)
      if (sortBy === 'freshness') {
        return compareFilmFreshness(a, b, false);
      }
      if (sortBy === 'freshness_desc') {
        return compareFilmFreshness(a, b, true);
      }
      if (sortBy === 'brand') {
        return a.brand.localeCompare(b.brand, 'ko-KR');
      }
      if (sortBy === 'type') {
        const typeOrder: Record<FilmType, number> = {
          color_negative: 1,
          bw_negative: 2,
          color_slide: 3,
          bw_slide: 4,
          cinema: 5,
          cinestill: 6,
          cinema_ahu: 7,
          other: 8,
        };
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99) || a.name.localeCompare(b.name, 'ko-KR');
      }
      if (sortBy === 'iso_asc') {
        return a.iso - b.iso;
      }
      if (sortBy === 'iso_desc') {
        return b.iso - a.iso;
      }
      if (sortBy === 'qty_desc') {
        return b.quantity - a.quantity;
      }
      return 0;
    });
  }, [filteredFilms, sortBy]);

  // Statistics
  const totalRolls = films.reduce((acc, f) => acc + (f.quantity || 0), 0);
  const coldStoredRolls = films.filter((f) => f.storage_method === 'refrigerated' || f.storage_method === 'frozen').reduce((acc, f) => acc + f.quantity, 0);
  const expiredCount = films.filter((f) => f.is_expired).reduce((acc, f) => acc + f.quantity, 0);
  const bulkRolledCount = films.filter((f) => f.is_bulk_rolled).reduce((acc, f) => acc + f.quantity, 0);

  return (
    <div className="content-body">
      {/* Top Banner / Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-label">
            <Layers size={15} /> 총 보유 필름
          </div>
          <div className="stat-value">{totalRolls} 롤</div>
          <div className="stat-desc">{films.length}종 등록됨</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#38bdf8' } as React.CSSProperties}>
          <div className="stat-label">
            <Snowflake size={15} /> 냉장 / 냉동 보관
          </div>
          <div className="stat-value">{coldStoredRolls} 롤</div>
          <div className="stat-desc">신선 보관 관리 중</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#ef4444' } as React.CSSProperties}>
          <div className="stat-label">
            <AlertTriangle size={15} /> 썩필 (만료 필름)
          </div>
          <div className="stat-value">{expiredCount} 롤</div>
          <div className="stat-desc">유통기한 경과분</div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#10b981' } as React.CSSProperties}>
          <div className="stat-label">
            <Tag size={15} /> 감은 필름 (벌크)
          </div>
          <div className="stat-value">{bulkRolledCount} 롤</div>
          <div className="stat-desc">직접 로딩한 필름</div>
        </div>
      </div>

      {/* Apple-style Segmented Category Control (Notion Categories) */}
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="segmented-control">
          <button
            className={`segmented-item ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            전체 필름 <span className="segmented-badge">{films.reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'color_negative' ? 'active' : ''}`}
            onClick={() => setFilterType('color_negative')}
          >
            컬러 네가 <span className="segmented-badge">{films.filter((f) => f.type === 'color_negative').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'bw_negative' ? 'active' : ''}`}
            onClick={() => setFilterType('bw_negative')}
          >
            흑백 네가 <span className="segmented-badge">{films.filter((f) => f.type === 'bw_negative').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'cinema' ? 'active' : ''}`}
            onClick={() => setFilterType('cinema')}
          >
            영화용 ECN-2 (렘젯) <span className="segmented-badge">{films.filter((f) => f.type === 'cinema').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'cinestill' ? 'active' : ''}`}
            onClick={() => setFilterType('cinestill')}
          >
            시네스틸 (렘젯 제거) <span className="segmented-badge">{films.filter((f) => f.type === 'cinestill').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'cinema_ahu' ? 'active' : ''}`}
            onClick={() => setFilterType('cinema_ahu')}
          >
            영화용 AHU (렘젯 없음) <span className="segmented-badge">{films.filter((f) => f.type === 'cinema_ahu').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'color_slide' ? 'active' : ''}`}
            onClick={() => setFilterType('color_slide')}
          >
            컬러 슬라이드 <span className="segmented-badge">{films.filter((f) => f.type === 'color_slide').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
          <button
            className={`segmented-item ${filterType === 'bw_slide' ? 'active' : ''}`}
            onClick={() => setFilterType('bw_slide')}
          >
            흑백 슬라이드 <span className="segmented-badge">{films.filter((f) => f.type === 'bw_slide').reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="필름명, 제조사 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-custom"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            title="정렬 기준"
          >
            <option value="expiry_soon">⏱️ 유통기한 임박순 (틀딱 → 노괴 → 로리)</option>
            <option value="freshness">🌸 신선도순 (로리 → 노괴 → 틀딱)</option>
            <option value="freshness_desc">💀 신선도 역순 (틀딱 → 노괴 → 로리)</option>
            <option value="brand">🏢 회사(제조사)별</option>
            <option value="type">🎞️ 필름 종류별</option>
            <option value="iso_asc">⚡ ISO 낮은순</option>
            <option value="iso_desc">⚡ ISO 높은순</option>
            <option value="qty_desc">📦 보유 수량순</option>
          </select>

          <select
            className="select-custom"
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
          >
            <option value="all">모든 포맷</option>
            <option value="135">135 (35mm)</option>
            <option value="120">120 (중형)</option>
            <option value="220">220 (중형)</option>
            <option value="large_sheet">대형 시트</option>
            <option value="110">110</option>
          </select>

          <select
            className="select-custom"
            value={filterStorage}
            onChange={(e) => setFilterStorage(e.target.value)}
          >
            <option value="all">모든 보관방법</option>
            <option value="room_temp">🌡️ 실온 / 상온</option>
            <option value="refrigerated">❄️ 냉장 보관</option>
            <option value="frozen">🧊 냉동 보관</option>
          </select>

          <select
            className="select-custom"
            value={filterSpecial}
            onChange={(e) => setFilterSpecial(e.target.value)}
            title="상태 필터"
          >
            <option value="all">전체 상태</option>
            <option value="fresh">🌸 로리 (싱싱)</option>
            <option value="expired">⚠️ 노괴 (만료)</option>
            <option value="deep_expired">💀 틀딱 (썩필)</option>
            <option value="bulk">🎞️ 감은 필름 (벌크)</option>
          </select>

          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 새 필름 등록
          </button>
        </div>
      </div>

      {/* Films Cards Grid */}
      {sortedFilms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Layers size={28} />
          </div>
          <h3>등록된 필름이 없습니다</h3>
          <p>새 필름 등록 버튼을 눌러 보유 중인 필름을 추가해보세요.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> 첫 필름 등록하기
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {sortedFilms.map((film) => {
            const typeConfig = FILM_TYPE_CONFIG[film.type] || FILM_TYPE_CONFIG.other;
            const formatConfig = FILM_FORMAT_CONFIG[film.format] || FILM_FORMAT_CONFIG.other;
            const storageConfig = STORAGE_METHOD_CONFIG[film.storage_method] || STORAGE_METHOD_CONFIG.room_temp;
            const brandTheme = getBrandTheme(film.brand, film.name);

            const isDeepExpired =
              film.freshness_status === 'deep_expired' ||
              (film.expiry_date ? film.expiry_date.includes('틀딱') : false);
            const isRotten =
              !isDeepExpired &&
              (film.freshness_status === 'expired' ||
                (film.expiry_date ? film.expiry_date.includes('노괴') : false) ||
                film.is_expired ||
                (Boolean(film.expiry_date) &&
                  /^\d{4}-\d{2}-\d{2}$/.test(film.expiry_date) &&
                  film.expiry_date < new Date().toISOString().split('T')[0]));
            const isFresh = !isDeepExpired && !isRotten;

            const isExhausted = (film.quantity ?? 0) <= 0;

            return (
              <div
                key={film.id}
                className={`item-card ${isExhausted ? 'exhausted-card' : ''}`}
                style={{
                  borderTop: `3px solid ${isExhausted ? 'var(--border-subtle)' : brandTheme.primaryColor}`,
                  opacity: isExhausted ? 0.65 : 1,
                }}
              >
                {/* Brand Top Header with Logo & Brand Colors */}
                <div
                  className="brand-top-pill"
                  style={{
                    background: brandTheme.accentBg,
                    border: `1px solid ${brandTheme.borderColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={brandTheme.logoUrl}
                      alt={brandTheme.name}
                      className="brand-logo-img"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: brandTheme.primaryColor === '#1A1A1A' ? 'var(--text-main)' : brandTheme.primaryColor,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {film.brand}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: brandTheme.primaryColor,
                      color: brandTheme.textColor,
                    }}
                  >
                    ISO {film.iso}
                  </span>
                </div>

                {/* Card Title & Quantity Pill */}
                <div className="card-top">
                  <div className="card-title-group">
                    <h3 className="card-title">{film.name}</h3>
                    <div className="card-subtitle">
                      <span>{film.frames_per_roll}컷 표준 롤</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: isExhausted ? 'var(--text-dim)' : 'var(--accent-amber-light)',
                        lineHeight: 1,
                      }}
                    >
                      {film.quantity}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> 롤</span>
                    </div>
                    {isExhausted && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                        }}
                      >
                        소진됨
                      </span>
                    )}
                  </div>
                </div>

                {/* Notion Systematic Database Property Rows */}
                <div className="notion-prop-table">
                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🏷️ 필름 종류</span>
                    <span className="notion-prop-val">
                      <span
                        className="notion-tag"
                        style={{
                          background: typeConfig.bg,
                          color: typeConfig.color,
                          borderColor: typeConfig.border,
                        }}
                      >
                        {typeConfig.label}
                      </span>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📐 판형 포맷</span>
                    <span className="notion-prop-val">
                      <span className="spec-pill">
                        <strong>{formatConfig.badge}</strong>
                      </span>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">❄️ 보관 환경</span>
                    <span className="notion-prop-val">
                      <span
                        className="notion-tag"
                        style={{
                          background: storageConfig.bg,
                          color: storageConfig.color,
                        }}
                      >
                        {storageConfig.icon} {storageConfig.label}
                      </span>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">📅 신선도 / 유통기한</span>
                    <span className="notion-prop-val">
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {isDeepExpired ? (
                          <span
                            className="notion-tag"
                            style={{
                              background: 'rgba(239, 68, 68, 0.16)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontWeight: 700,
                            }}
                          >
                            💀 틀딱 (푹썩필)
                          </span>
                        ) : isRotten ? (
                          <span
                            className="notion-tag"
                            style={{
                              background: 'rgba(245, 158, 11, 0.16)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              fontWeight: 700,
                            }}
                          >
                            ⚠️ 노괴 (썩필)
                          </span>
                        ) : (
                          <span
                            className="notion-tag"
                            style={{
                              background: 'rgba(16, 185, 129, 0.16)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontWeight: 700,
                            }}
                          >
                            🌸 로리 (싱싱)
                          </span>
                        )}
                        <span
                          style={{
                            color: isDeepExpired ? '#f87171' : isRotten ? '#fbbf24' : 'var(--text-main)',
                            fontWeight: isDeepExpired || isRotten ? 600 : 500,
                          }}
                          title={film.expiry_date || '유통기한 미기재'}
                        >
                          {formatExpiryYYMM(film.expiry_date)}
                        </span>
                      </span>
                    </span>
                  </div>

                  <div className="notion-prop-row">
                    <span className="notion-prop-key">🎞️ 포장 형태</span>
                    <span className="notion-prop-val">
                      {film.is_bulk_rolled ? (
                        <span className="notion-tag" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                          직접 감은 벌크
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>정규 카트리지</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 껍데기만 바꾼 필름 (리브랜딩/OEM) Notion Callout */}
                {film.is_rebranded && (
                  <div className="notion-callout warning">
                    <Sparkles size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--accent-amber-light)' }}>
                        리브랜딩 (껍데기 바뀜):
                      </strong>
                      <span>{film.original_film_info || '원본 필름 정보 미기재'}</span>
                    </div>
                  </div>
                )}

                {/* Notes Notion Callout */}
                {film.notes && (
                  <div className="notion-callout">
                    <span>📝 {film.notes}</span>
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="card-bottom">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    등록: {film.created_at?.split('T')[0] || '-'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(film)}
                      title="수정"
                    >
                      <Edit2 size={13} /> 수정
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`'${film.name}' 필름을 목록에서 삭제하시겠습니까?`)) {
                          onDeleteFilm(film.id);
                        }
                      }}
                      title="삭제"
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

      {/* 필름 등록/수정 모달 - Protected: 클릭 실수로 창 꺼짐 방지 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingFilm ? '필름 정보 수정' : '새 필름 등록'}</h2>
              <button
                type="button"
                className="btn btn-subtle btn-icon"
                onClick={() => setIsModalOpen(false)}
                title="닫기"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 필름명 & 제조사 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">필름 이름 *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: 후지 200, 포트라 400, HP5 Plus"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">제조사 (회사) *</label>
                    <select
                      className="form-select"
                      value={brandSelectMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrandSelectMode(val);
                        if (val !== '__custom__') {
                          setBrand(val);
                        } else {
                          setBrand('');
                        }
                      }}
                      required
                    >
                      <option value="" disabled>제조사 선택...</option>
                      {FILM_BRAND_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.name}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="__custom__">✏️ + 직접 입력 (목록에 없음)</option>
                    </select>

                    {brandSelectMode === '__custom__' && (
                      <input
                        className="form-input"
                        style={{ marginTop: '8px' }}
                        type="text"
                        placeholder="제조사명 직접 입력 (예: ORWO, Lucky, Polaroid)"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        autoFocus
                        required
                      />
                    )}

                    {brandSelectMode && brandSelectMode !== '__custom__' && (() => {
                      const matched = FILM_BRAND_PRESETS.find((p) => p.name === brandSelectMode);
                      if (!matched?.logoUrl) return null;
                      return (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#8e8e93' }}>
                          <div style={{ height: '22px', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                            <img src={matched.logoUrl} alt={matched.name} style={{ maxHeight: '16px', maxWidth: '52px', objectFit: 'contain' }} />
                          </div>
                          <span>공식 로고 및 브랜드 테마 자동 연동</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 종류 & 포맷 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">필름 종류</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value as FilmType)}
                    >
                      <option value="color_negative">컬러네가 (Color Negative)</option>
                      <option value="bw_negative">흑백네가 (B&W Negative)</option>
                      <option value="cinema">영화용 ECN-2 (렘젯)</option>
                      <option value="cinestill">시네스틸 (렘젯 제거)</option>
                      <option value="cinema_ahu">영화용 AHU (렘젯 없음)</option>
                      <option value="color_slide">컬러슬라이드 (Color Slide)</option>
                      <option value="bw_slide">흑백슬라이드 (B&W Slide)</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">포맷 (판형)</label>
                    <select
                      className="form-select"
                      value={format}
                      onChange={(e) => handleFormatChange(e.target.value as FilmFormat)}
                    >
                      <option value="135">135 (35mm)</option>
                      <option value="120">120 (중형)</option>
                      <option value="220">220 (중형)</option>
                      <option value="large_sheet">대형 (4x5, 8x10 시트)</option>
                      <option value="110">110</option>
                      <option value="other">기타 포맷</option>
                    </select>
                  </div>
                </div>

                {/* ISO, 수량, 컷수 (중형/대형은 컷수 선택 숨김, 110은 24컷/직접입력) */}
                {(() => {
                  const isMediumOrLarge = format === '120' || format === '220' || format === 'large_sheet';
                  const is110 = format === '110';

                  return (
                    <div className={isMediumOrLarge ? 'form-row' : 'form-row-3'}>
                      <div className="form-group">
                        <label className="form-label">감도 (ISO)</label>
                        <input
                          className="form-input"
                          type="number"
                          placeholder="예: 400"
                          value={iso}
                          onChange={(e) => setIso(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          {format === 'large_sheet' ? '보유 수량 (매/시트)' : '보유 수량 (롤)'}
                        </label>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>

                      {!isMediumOrLarge && (
                        <div className="form-group">
                          <label className="form-label">롤당 컷수 *</label>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: is110 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                              gap: '6px',
                            }}
                          >
                            {!is110 && (
                              <button
                                type="button"
                                className={`btn btn-sm ${framesOption === '36' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '7px 4px', fontSize: '0.8rem', justifyContent: 'center' }}
                                onClick={() => {
                                  setFramesOption('36');
                                  setFramesPerRoll(36);
                                }}
                              >
                                36컷
                              </button>
                            )}
                            <button
                              type="button"
                              className={`btn btn-sm ${framesOption === '24' ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '7px 4px', fontSize: '0.8rem', justifyContent: 'center' }}
                              onClick={() => {
                                setFramesOption('24');
                                setFramesPerRoll(24);
                              }}
                            >
                              24컷
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${framesOption === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '7px 4px', fontSize: '0.8rem', justifyContent: 'center' }}
                              onClick={() => {
                                setFramesOption('custom');
                                if (framesPerRoll === 36 || framesPerRoll === 24) {
                                  setFramesPerRoll(12);
                                }
                              }}
                            >
                              ✏️ 직접입력
                            </button>
                          </div>

                          {framesOption === 'custom' && (
                            <input
                              className="form-input"
                              style={{ marginTop: '8px' }}
                              type="number"
                              min="1"
                              placeholder={is110 ? '컷수 직접 입력 (예: 12, 18, 24)' : '컷수 직접 입력 (예: 12, 10, 72, 27)'}
                              value={framesPerRoll || ''}
                              onChange={(e) => setFramesPerRoll(e.target.value === '' ? ('' as any) : Number(e.target.value))}
                              autoFocus
                              required
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 신선도 / 유통기한 옵션 (로리, 노괴, 틀딱) */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      ⚡ 신선도 상태 (유통기한 모를 때 선택)
                    </label>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      날짜를 몰라도 버튼만 누르면 자동 간주됩니다
                    </span>
                  </div>

                  {/* 3단 선택 버튼: 로리 / 노괴 / 틀딱 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {/* 1. 로리 버튼 (싱싱한 경우) */}
                    <button
                      type="button"
                      className={`dilution-btn ${freshnessStatus === 'fresh' ? 'active' : ''}`}
                      style={{
                        padding: '10px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        height: 'auto',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: freshnessStatus === 'fresh' ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                        background: freshnessStatus === 'fresh' ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg-secondary)',
                        color: freshnessStatus === 'fresh' ? '#10b981' : 'var(--text-muted)',
                      }}
                      onClick={() => {
                        setFreshnessStatus('fresh');
                        setIsExpired(false);
                        if (!expiryDate || expiryDate.includes('유통기한 미상')) {
                          setExpiryDate('유통기한 미상 (로리/싱싱)');
                        }
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>🌸 로리</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>싱싱함 (정상 만료 전)</span>
                    </button>

                    {/* 2. 노괴 버튼 (썩었을 경우) */}
                    <button
                      type="button"
                      className={`dilution-btn ${freshnessStatus === 'expired' ? 'active' : ''}`}
                      style={{
                        padding: '10px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        height: 'auto',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: freshnessStatus === 'expired' ? '1.5px solid #f59e0b' : '1px solid var(--border-color)',
                        background: freshnessStatus === 'expired' ? 'rgba(245, 158, 11, 0.16)' : 'var(--bg-secondary)',
                        color: freshnessStatus === 'expired' ? '#f59e0b' : 'var(--text-muted)',
                      }}
                      onClick={() => {
                        setFreshnessStatus('expired');
                        setIsExpired(true);
                        if (!expiryDate || expiryDate.includes('유통기한 미상')) {
                          setExpiryDate('유통기한 미상 (노괴/썩필)');
                        }
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>⚠️ 노괴</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>썩필 (유통기한 만료)</span>
                    </button>

                    {/* 3. 틀딱 버튼 (몹시 썩어서 상이 거의 안맺힐 경우) */}
                    <button
                      type="button"
                      className={`dilution-btn ${freshnessStatus === 'deep_expired' ? 'active' : ''}`}
                      style={{
                        padding: '10px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        height: 'auto',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: freshnessStatus === 'deep_expired' ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                        background: freshnessStatus === 'deep_expired' ? 'rgba(239, 68, 68, 0.18)' : 'var(--bg-secondary)',
                        color: freshnessStatus === 'deep_expired' ? '#ef4444' : 'var(--text-muted)',
                      }}
                      onClick={() => {
                        setFreshnessStatus('deep_expired');
                        setIsExpired(true);
                        if (!expiryDate || expiryDate.includes('유통기한 미상')) {
                          setExpiryDate('유통기한 미상 (틀딱/푹썩필)');
                        }
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>💀 틀딱</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>푹썩필 (상 거의 안맺힘)</span>
                    </button>
                  </div>

                  {/* 상태 해설 문구 */}
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '0.78rem',
                      lineHeight: 1.4,
                      color:
                        freshnessStatus === 'fresh'
                          ? '#10b981'
                          : freshnessStatus === 'deep_expired'
                          ? '#ef4444'
                          : '#f59e0b',
                      background: 'rgba(0,0,0,0.15)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${
                        freshnessStatus === 'fresh'
                          ? '#10b981'
                          : freshnessStatus === 'deep_expired'
                          ? '#ef4444'
                          : '#f59e0b'
                      }`,
                    }}
                  >
                    {freshnessStatus === 'fresh' && '✨ 싱싱한 상태로 간주합니다. (기준 감도로 촬영)'}
                    {freshnessStatus === 'expired' && '⚠️ 썩필(노괴)로 간주합니다. (+1스탑 오버노출 촬영 권장)'}
                    {freshnessStatus === 'deep_expired' && '💀 몹시 썩어 상이 거의 안 맺힐 수 있는 푹썩필(틀딱)로 간주합니다. (+2~3스탑 이상 듬뿍 노출 권장)'}
                  </div>
                </div>

                {/* 유통기한 & 보관방법 */}
                <div className="form-row">
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>유통기한 (년/월) *선택사항</label>
                      {(expiryYear || expiryMonth || expiryDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpiryDate('');
                            setExpiryYear('');
                            setExpiryMonth('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          초기화
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          className="form-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="YYYY 년도 (예: 2026)"
                          value={expiryYear}
                          onChange={(e) => {
                            let y = e.target.value.replace(/\D/g, '');
                            if (y.length > 4) y = y.slice(0, 4); // 6자리 방지!
                            setExpiryYear(y);
                            if (y && expiryMonth) {
                              const ym = `${y}-${expiryMonth}`;
                              setExpiryDate(ym);
                              const currentYM = new Date().toISOString().slice(0, 7);
                              if (ym < currentYM) {
                                if (freshnessStatus === 'fresh') setFreshnessStatus('expired');
                                setIsExpired(true);
                              } else {
                                if (freshnessStatus === 'expired') setFreshnessStatus('fresh');
                                setIsExpired(false);
                              }
                            } else if (!y && !expiryMonth) {
                              if (!expiryDate.startsWith('유통기한')) setExpiryDate('');
                            }
                          }}
                        />
                      </div>
                      <div style={{ width: '120px' }}>
                        <select
                          className="form-select"
                          value={expiryMonth}
                          onChange={(e) => {
                            const m = e.target.value;
                            setExpiryMonth(m);
                            if (expiryYear && m) {
                              const ym = `${expiryYear}-${m}`;
                              setExpiryDate(ym);
                              const currentYM = new Date().toISOString().slice(0, 7);
                              if (ym < currentYM) {
                                if (freshnessStatus === 'fresh') setFreshnessStatus('expired');
                                setIsExpired(true);
                              } else {
                                if (freshnessStatus === 'expired') setFreshnessStatus('fresh');
                                setIsExpired(false);
                              }
                            } else if (!expiryYear && !m) {
                              if (!expiryDate.startsWith('유통기한')) setExpiryDate('');
                            }
                          }}
                        >
                          <option value="">월 선택 (MM)</option>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                            <option key={m} value={m}>{m}월</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.45 }}>
                      * 일자 없이 <strong>년도(YYYY)와 월(MM)</strong>만 순서대로 기록됩니다.<br />
                      날짜를 모르면 위의 [로리/노괴/틀딱]을 누르세요.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">보관 방법</label>
                    <select
                      className="form-select"
                      value={storageMethod}
                      onChange={(e) => setStorageMethod(e.target.value as StorageMethod)}
                    >
                      <option value="room_temp">🌡️ 실온 / 상온 보관</option>
                      <option value="refrigerated">❄️ 냉장 보관</option>
                      <option value="frozen">🧊 냉동 보관</option>
                    </select>
                  </div>
                </div>

                {/* 감은 필름 체크박스 */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '6px 0' }}>
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isBulkRolled}
                      onChange={(e) => setIsBulkRolled(e.target.checked)}
                    />
                    <span>🎞️ 감은 필름 (벌크 로딩 / 소분 롤)</span>
                  </label>
                </div>

                {/* 메모 */}
                <div className="form-group">
                  <label className="form-label">메모 / 특징</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="구매처, 에멀전 번호, 색감 특이사항 등"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFilm ? '수정 완료' : '필름 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
