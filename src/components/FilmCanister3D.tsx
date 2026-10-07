'use client';

import React from 'react';
import { FilmItem } from '@/types';
import { getBrandTheme } from '@/lib/brandConfig';

interface FilmCanister3DProps {
  film: FilmItem;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showShelfPlaque?: boolean;
  actionLabel?: string;
}

export default function FilmCanister3D({
  film,
  isSelected = false,
  onClick,
  size = 'md',
  showShelfPlaque = true,
  actionLabel,
}: FilmCanister3DProps) {
  const brandTheme = getBrandTheme(film.brand, film.name);
  const isBw = film.type === 'bw_negative' || film.type === 'bw_slide';
  const isCinema = film.type === 'cinema' || film.type === 'cinema_ahu';
  const isSlide = film.type === 'color_slide' || film.type === 'bw_slide';

  // Format expiration date to clean dots (e.g. 2026.11.30)
  const formattedExpiry = film.expiry_date.replace(/-/g, '.');

  // Canister dimensions by size
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.2 : 1;
  const width = Math.round(92 * scale);
  const height = Math.round(152 * scale);

  // Storage icon
  const storageIcon =
    film.storage_method === 'frozen'
      ? '❄️ 냉동'
      : film.storage_method === 'refrigerated'
      ? '🧊 냉장'
      : '🌡️ 상온';

  // Format badge
  const formatText = film.format === '135' ? '35mm' : film.format === '120' ? '120 중형' : film.format;

  return (
    <div
      className={`canister-slot-container ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* 3D Film Canister Graphic */}
      <div
        className="canister-wrapper"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Top Spool Knob (중앙 회전축 돌기) */}
        <div className="canister-spool-top">
          <div className="spool-core" />
        </div>

        {/* Top Metallic Crimped Cap (상단 금속 캡) */}
        <div className="canister-metal-cap top" />

        {/* Canister Body (원통형 본체 + 브랜드별 고유 리버리) */}
        <div
          className="canister-body"
          style={{
            background: getCanisterGradient(film, brandTheme.primaryColor, brandTheme.secondaryColor),
            boxShadow: isSelected
              ? `0 0 24px ${brandTheme.primaryColor}88, inset 0 0 12px rgba(255,255,255,0.25)`
              : undefined,
          }}
        >
          {/* Cylindrical Metallic Sheen Overlays */}
          <div className="cylinder-lighting-left" />
          <div className="cylinder-specular-stripe" />
          <div className="cylinder-shadow-right" />

          {/* Film Tongue (필름 혀 - 135 포맷일 때 튀어나오는 디테일) */}
          {film.format === '135' && (
            <div className="film-tongue">
              <div className="tongue-sprocket" />
              <div className="tongue-sprocket" />
            </div>
          )}

          {/* Printed Canister Label */}
          <div className="canister-label-content">
            {/* Brand Header */}
            <div className="label-brand-row">
              <span className="brand-wordmark">{film.brand.toUpperCase()}</span>
              {film.is_bulk_rolled && <span className="bulk-badge">BULK</span>}
            </div>

            {/* Film Name & Typo */}
            <div className="label-film-title">
              {getDisplayFilmName(film.name)}
            </div>

            {/* ISO & Spec Badge */}
            <div className="label-specs-row">
              <span className="iso-badge">ISO {film.iso}</span>
              <span className="exp-count">{film.frames_per_roll} EXP</span>
            </div>

            {/* Film Type Stripe */}
            <div
              className="label-type-stripe"
              style={{
                background: isBw
                  ? '#111111'
                  : isCinema
                  ? '#0a192f'
                  : isSlide
                  ? '#5b1285'
                  : brandTheme.secondaryColor,
                color: '#ffffff',
              }}
            >
              <span>
                {isBw
                  ? 'BLACK & WHITE'
                  : isCinema
                  ? 'CINEMA ECN-2'
                  : isSlide
                  ? 'COLOR SLIDE'
                  : 'COLOR PRINT'}
              </span>
            </div>

            {/* Barcode / DX Code Graphic Simulation */}
            <div className="label-dx-code">
              <div className="dx-bar" />
              <div className="dx-bar thin" />
              <div className="dx-bar wide" />
              <div className="dx-bar" />
              <div className="dx-bar thin" />
              <div className="dx-bar wide" />
            </div>
          </div>
        </div>

        {/* Bottom Metallic Crimped Cap (하단 금속 캡) */}
        <div className="canister-metal-cap bottom" />

        {/* Bottom Shadow on Shelf */}
        <div className="canister-drop-shadow" />
      </div>

      {/* Under-Canister Shelf Metal Plaque (책장 선반 금속 네임택) */}
      {showShelfPlaque && (
        <div className={`shelf-plaque ${isSelected ? 'active' : ''}`}>
          <div className="plaque-top-row">
            <span className="plaque-qty">
              {film.quantity > 0 ? `${film.quantity}롤 보유` : '품절 (0롤)'}
            </span>
            <span className="plaque-format">{formatText}</span>
          </div>

          <div className="plaque-title" title={film.name}>
            {film.name}
          </div>

          <div className="plaque-bottom-row">
            <span className={`plaque-expiry ${film.is_expired ? 'expired' : ''}`}>
              EXP {formattedExpiry}
            </span>
            <span className="plaque-storage">{storageIcon}</span>
          </div>

          {film.is_rebranded && (
            <div className="plaque-rebrand-note" title={film.original_film_info}>
              🔄 리브랜딩 필름
            </div>
          )}

          {actionLabel && (
            <div className="plaque-action-btn">
              {isSelected ? '✓ 장전 준비됨' : actionLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helpers for Canister Appearance
function getDisplayFilmName(rawName: string): string {
  // Extract concise clean name for small canister cylinder
  return rawName
    .replace(/\(.*?\)/g, '')
    .replace(/Fujifilm|Kodak|Ilford|CineStill|Fomapan/gi, '')
    .trim()
    .slice(0, 16);
}

function getCanisterGradient(film: FilmItem, primary: string, secondary: string): string {
  const name = film.name.toLowerCase();
  const brand = film.brand.toLowerCase();

  if (name.includes('gold') || name.includes('골드')) {
    return 'linear-gradient(135deg, #FFB700 0%, #E5A000 45%, #C21807 85%, #8B0000 100%)';
  }
  if (name.includes('portra') || name.includes('포트라')) {
    return 'linear-gradient(135deg, #E6C875 0%, #D4AF37 30%, #1A1A1A 75%, #0A0A0A 100%)';
  }
  if (name.includes('hp5') || name.includes('tri-x') || film.type === 'bw_negative') {
    return 'linear-gradient(135deg, #2B2B2B 0%, #171717 40%, #000000 80%, #202020 100%)';
  }
  if (name.includes('velvia') || name.includes('provia')) {
    return 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 40%, #00796B 80%, #004D40 100%)';
  }
  if (name.includes('800t') || name.includes('vision') || film.type === 'cinema' || film.type === 'cinema_ahu') {
    return 'linear-gradient(135deg, #00838F 0%, #004D40 45%, #B71C1C 85%, #880E4F 100%)';
  }
  if (brand.includes('fuji') || brand.includes('후지')) {
    return 'linear-gradient(135deg, #00897B 0%, #00695C 45%, #C62828 85%, #B71C1C 100%)';
  }

  return `linear-gradient(135deg, ${primary} 0%, ${primary}cc 50%, ${secondary} 100%)`;
}
