'use client';

import React, { useState, useMemo } from 'react';
import { FilmItem, FilmType, FilmFormat, StorageMethod } from '@/types';
import { FILM_TYPE_CONFIG, FILM_FORMAT_CONFIG, STORAGE_METHOD_CONFIG } from '@/lib/constants';
import { getBrandTheme } from '@/lib/brandConfig';
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
  const [sortBy, setSortBy] = useState<'brand' | 'type' | 'iso_asc' | 'iso_desc' | 'expiry_soon' | 'qty_desc'>('expiry_soon');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<FilmItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState<FilmType>('color_negative');
  const [format, setFormat] = useState<FilmFormat>('135');
  const [iso, setIso] = useState<number>(400);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [storageMethod, setStorageMethod] = useState<StorageMethod>('room_temp');
  const [isBulkRolled, setIsBulkRolled] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isRebranded, setIsRebranded] = useState(false);
  const [originalFilmInfo, setOriginalFilmInfo] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [framesPerRoll, setFramesPerRoll] = useState<number>(36);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingFilm(null);
    setName('');
    setBrand('');
    setType('color_negative');
    setFormat('135');
    setIso(400);
    setExpiryDate(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setStorageMethod('room_temp');
    setIsBulkRolled(false);
    setIsExpired(false);
    setIsRebranded(false);
    setOriginalFilmInfo('');
    setQuantity(1);
    setFramesPerRoll(36);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (film: FilmItem) => {
    setEditingFilm(film);
    setName(film.name);
    setBrand(film.brand);
    setType(film.type);
    setFormat(film.format);
    setIso(film.iso);
    setExpiryDate(film.expiry_date);
    setStorageMethod(film.storage_method);
    setIsBulkRolled(film.is_bulk_rolled);
    setIsExpired(film.is_expired);
    setIsRebranded(film.is_rebranded);
    setOriginalFilmInfo(film.original_film_info || '');
    setQuantity(film.quantity);
    setFramesPerRoll(film.frames_per_roll);
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
    const autoExpired = isExpired || (expiryDate ? expiryDate < todayStr : false);

    const newFilm: FilmItem = {
      id: editingFilm ? editingFilm.id : `film-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      type,
      format,
      iso: Number(iso) || 400,
      expiry_date: expiryDate,
      storage_method: storageMethod,
      is_bulk_rolled: isBulkRolled,
      is_expired: autoExpired,
      is_rebranded: isRebranded,
      original_film_info: isRebranded ? originalFilmInfo.trim() : undefined,
      quantity: Number(quantity) || 1,
      frames_per_roll: Number(framesPerRoll) || 36,
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
        f.brand.toLowerCase().includes(searchLower) ||
        (f.original_film_info && f.original_film_info.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      if (filterType !== 'all' && f.type !== filterType) return false;
      if (filterFormat !== 'all' && f.format !== filterFormat) return false;
      if (filterStorage !== 'all' && f.storage_method !== filterStorage) return false;

      if (filterSpecial === 'expired' && !f.is_expired) return false;
      if (filterSpecial === 'bulk' && !f.is_bulk_rolled) return false;
      if (filterSpecial === 'rebranded' && !f.is_rebranded) return false;

      return true;
    });
  }, [films, search, filterType, filterFormat, filterStorage, filterSpecial]);

  const sortedFilms = useMemo(() => {
    return [...filteredFilms].sort((a, b) => {
      if (sortBy === 'brand') {
        return a.brand.localeCompare(b.brand, 'ko-KR');
      }
      if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      if (sortBy === 'iso_asc') {
        return a.iso - b.iso;
      }
      if (sortBy === 'iso_desc') {
        return b.iso - a.iso;
      }
      if (sortBy === 'expiry_soon') {
        return a.expiry_date.localeCompare(b.expiry_date);
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

      {/* Filter & Action Bar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="필름명, 제조사, 원본 껍데기 검색..."
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
            <option value="expiry_soon">⏱️ 유통기한 임박순</option>
            <option value="brand">🏢 회사(제조사)별</option>
            <option value="type">🎞️ 필름 종류별</option>
            <option value="iso_asc">⚡ ISO 낮은순</option>
            <option value="iso_desc">⚡ ISO 높은순</option>
            <option value="qty_desc">📦 보유 수량순</option>
          </select>

          <select
            className="select-custom"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">모든 종류</option>
            <option value="bw_negative">흑백 네가</option>
            <option value="color_negative">컬러 네가</option>
            <option value="cinema">영화용 (ECN-2)</option>
            <option value="cinema_ahu">영화용 AHU</option>
            <option value="color_slide">컬러 슬라이드</option>
            <option value="bw_slide">흑백 슬라이드</option>
            <option value="other">기타</option>
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
            value={filterSpecial}
            onChange={(e) => setFilterSpecial(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="bulk">🎞️ 감은필름 (벌크)</option>
            <option value="expired">⚠️ 썩필 (만료필름)</option>
            <option value="rebranded">🏷️ 껍데기만 바꾼 필름</option>
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

            const isExpiredDate = film.expiry_date && film.expiry_date < new Date().toISOString().split('T')[0];

            return (
              <div
                key={film.id}
                className="item-card"
                style={{
                  borderTop: `4px solid ${brandTheme.primaryColor}`,
                }}
              >
                {/* Brand Top Header with Logo & Brand Colors */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: brandTheme.accentBg,
                    border: `1px solid ${brandTheme.borderColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Brand Logo Image with Error Fallback */}
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
                        fontSize: '0.76rem',
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
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: brandTheme.primaryColor,
                      color: brandTheme.textColor,
                    }}
                  >
                    ISO {film.iso}
                  </span>
                </div>

                <div className="card-top">
                  <div className="card-title-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        className="badge-tag"
                        style={{
                          background: typeConfig.bg,
                          color: typeConfig.color,
                          borderColor: typeConfig.border,
                        }}
                      >
                        {typeConfig.label}
                      </span>
                      <span className="spec-pill">
                        <strong>{formatConfig.badge}</strong>
                      </span>
                    </div>

                    <h3 className="card-title" style={{ marginTop: '4px' }}>
                      {film.name}
                    </h3>
                    <div className="card-subtitle">
                      <span>{film.frames_per_roll}컷</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--accent-amber-light)',
                      }}
                    >
                      {film.quantity}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> 롤</span>
                    </div>
                  </div>
                </div>

                {/* 껍데기만 바꾼 필름 (리브랜딩/OEM) 정보 배너 */}
                {film.is_rebranded && (
                  <div className="rebranded-banner">
                    <Sparkles size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                    <div>
                      <strong>리브랜딩(껍데기 바뀜) 정보:</strong>
                      <div>{film.original_film_info || '원본 필름 정보 미기재'}</div>
                    </div>
                  </div>
                )}

                {/* Spec Pills & Tags */}
                <div className="specs-pills">
                  <span className="spec-pill" style={{ color: storageConfig.color }}>
                    {storageConfig.icon} {storageConfig.label}
                  </span>

                  <span className={`spec-pill ${isExpiredDate || film.is_expired ? 'badge-tag expired' : ''}`}>
                    📅 유통기한: <strong>{film.expiry_date}</strong>
                    {(isExpiredDate || film.is_expired) && ' (만료)'}
                  </span>

                  {film.is_bulk_rolled && (
                    <span className="badge-tag bulk">
                      🎞️ 감은필름 (벌크)
                    </span>
                  )}
                  {film.is_expired && (
                    <span className="badge-tag expired">
                      ⚠️ 썩필
                    </span>
                  )}
                </div>

                {film.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: '6px' }}>
                    {film.notes}
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
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: Fujifilm, Kodak, Agfa, Ilford, Foma"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                    />
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
                      <option value="bw_negative">흑백네가</option>
                      <option value="bw_slide">흑백슬라이드</option>
                      <option value="color_negative">컬러네가</option>
                      <option value="color_slide">컬러슬라이드</option>
                      <option value="cinema">영화용 (ECN-2 렘젯)</option>
                      <option value="cinema_ahu">영화용AHU (렘젯제거/씨네스틸)</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">포맷 (판형)</label>
                    <select
                      className="form-select"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as FilmFormat)}
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

                {/* ISO, 수량, 컷수 */}
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">감도 (ISO)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="예: 400"
                      value={iso}
                      onChange={(e) => setIso(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">보유 수량 (롤/매)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">롤당 컷수</label>
                    <input
                      className="form-input"
                      type="number"
                      value={framesPerRoll}
                      onChange={(e) => setFramesPerRoll(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* 유통기한 & 보관방법 */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">유통기한 (Expiry Date)</label>
                    <input
                      className="form-input"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
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

                {/* 감은필름, 썩필, 리브랜딩 체크박스 */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '6px 0' }}>
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isBulkRolled}
                      onChange={(e) => setIsBulkRolled(e.target.checked)}
                    />
                    <span>🎞️ 감은 필름 (벌크 로딩)</span>
                  </label>

                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isExpired}
                      onChange={(e) => setIsExpired(e.target.checked)}
                    />
                    <span>⚠️ 썩필 (유통기한 만료 필름)</span>
                  </label>

                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isRebranded}
                      onChange={(e) => setIsRebranded(e.target.checked)}
                    />
                    <span>🏷️ 껍데기만 바꾼 필름 (리브랜딩/OEM)</span>
                  </label>
                </div>

                {/* 껍데기만 바꾼 필름 정보 입력란 */}
                {isRebranded && (
                  <div className="form-group" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <label className="form-label" style={{ color: 'var(--text-highlight)' }}>
                      ✨ 원본 필름 정보 및 내막 (예: 코닥 컬러플러스 200 껍데기)
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="예: 아마존 후지 200은 사실 코닥 컬러플러스 200의 껍데기만 바꾼 것"
                      value={originalFilmInfo}
                      onChange={(e) => setOriginalFilmInfo(e.target.value)}
                    />
                  </div>
                )}

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
