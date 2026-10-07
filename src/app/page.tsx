'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FilmItem,
  CameraItem,
  LensItem,
  DeveloperChemical,
  ShootingRoll,
  ScanLog,
} from '@/types';
import {
  getFilms,
  saveFilm,
  deleteFilm,
  getCameras,
  saveCamera,
  deleteCamera,
  getLenses,
  saveLens,
  deleteLens,
  getDevelopers,
  saveDeveloper,
  deleteDeveloper,
  getShootingRolls,
  saveShootingRoll,
  deleteShootingRoll,
  getScans,
  saveScan,
  deleteScan,
  initLocalStorageIfEmpty,
} from '@/lib/storageService';

import FilmVaultView from '@/components/FilmVaultView';
import GearView from '@/components/GearView';
import ShootingView from '@/components/ShootingView';
import DeveloperView from '@/components/DeveloperView';
import ScanVaultView from '@/components/ScanVaultView';
import DashboardOverview from '@/components/DashboardOverview';
import SettingsModal from '@/components/SettingsModal';

import {
  Film,
  Camera,
  Layers,
  FlaskConical,
  Folder,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

type TabType = 'dashboard' | 'films' | 'gear' | 'shooting' | 'developers' | 'scans';
type ThemeMode = 'system' | 'light' | 'dark';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Theme Management (Light / Dark / System Auto)
  const [theme, setTheme] = useState<ThemeMode>('system');

  // Core Data States
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [lenses, setLenses] = useState<LensItem[]>([]);
  const [developers, setDevelopers] = useState<DeveloperChemical[]>([]);
  const [rolls, setRolls] = useState<ShootingRoll[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);

  // Apply Theme Function
  const applyTheme = (selectedTheme: ThemeMode) => {
    setTheme(selectedTheme);
    if (typeof window === 'undefined') return;

    localStorage.setItem('filmopener_theme', selectedTheme);

    const root = document.documentElement;
    if (selectedTheme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', selectedTheme);
    }
  };

  // Toggle Theme between Light and Dark quickly
  const toggleTheme = () => {
    if (theme === 'dark') {
      applyTheme('light');
    } else if (theme === 'light') {
      applyTheme('system');
    } else {
      // If currently system, check system preference and switch to opposite
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isSystemDark ? 'light' : 'dark');
    }
  };

  // Initialize Theme on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('filmopener_theme') as ThemeMode) || 'system';
      applyTheme(savedTheme);

      // Listen for OS theme changes when in system mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        const currentSaved = localStorage.getItem('filmopener_theme');
        if (!currentSaved || currentSaved === 'system') {
          document.documentElement.removeAttribute('data-theme');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      initLocalStorageIfEmpty();
      const [f, c, l, d, r, s] = await Promise.all([
        getFilms(),
        getCameras(),
        getLenses(),
        getDevelopers(),
        getShootingRolls(),
        getScans(),
      ]);
      setFilms(f);
      setCameras(c);
      setLenses(l);
      setDevelopers(d);
      setRolls(r);
      setScans(s);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Films
  const handleSaveFilm = async (film: FilmItem) => {
    const updated = await saveFilm(film);
    setFilms(updated);
  };
  const handleDeleteFilm = async (id: string) => {
    const updated = await deleteFilm(id);
    setFilms(updated);
  };

  // Handlers for Gear (Cameras & Lenses)
  const handleSaveCamera = async (camera: CameraItem) => {
    const updated = await saveCamera(camera);
    setCameras(updated);
  };
  const handleDeleteCamera = async (id: string) => {
    const updated = await deleteCamera(id);
    setCameras(updated);
  };
  const handleSaveLens = async (lens: LensItem) => {
    const updated = await saveLens(lens);
    setLenses(updated);
  };
  const handleDeleteLens = async (id: string) => {
    const updated = await deleteLens(id);
    setLenses(updated);
  };

  // Handlers for Developers
  const handleSaveDeveloper = async (dev: DeveloperChemical) => {
    const updated = await saveDeveloper(dev);
    setDevelopers(updated);
  };
  const handleDeleteDeveloper = async (id: string) => {
    const updated = await deleteDeveloper(id);
    setDevelopers(updated);
  };

  // Handlers for Shooting Rolls
  const handleSaveRoll = async (roll: ShootingRoll, prev?: ShootingRoll) => {
    const result = await saveShootingRoll(roll, prev);
    setRolls(result.rolls);
    setDevelopers(result.developers);
  };
  const handleDeleteRoll = async (id: string) => {
    const updated = await deleteShootingRoll(id);
    setRolls(updated);
  };

  // Handlers for Scans
  const handleSaveScan = async (scan: ScanLog) => {
    const updated = await saveScan(scan);
    setScans(updated);
    const updatedRolls = await getShootingRolls();
    setRolls(updatedRolls);
  };
  const handleDeleteScan = async (id: string) => {
    const updated = await deleteScan(id);
    setScans(updated);
  };

  const developedRolls = rolls.filter((r) => r.status === 'developed' || r.status === 'scanned');

  // Page titles without task number prefixes
  const pageTitles: Record<TabType, string> = {
    dashboard: '대시보드 (Studio Hub)',
    films: '보유 필름 보관소 (Film Inventory)',
    gear: '카메라 & 렌즈 장비함 (Gear Vault)',
    shooting: '촬영 & 현상 관리 (Shooting Logs)',
    developers: '현상액 라이브러리 (Developer Chemistry)',
    scans: '필름 스캔 관리 (Scan Archive)',
  };

  return (
    <div className="app-container">
      {/* Sidebar for Mac & Desktop PC */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <Film size={22} />
          </div>
          <div className="brand-text">
            <h1>FilmOpener</h1>
            <p>Analog Studio</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>대시보드</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'films' ? 'active' : ''}`}
            onClick={() => setActiveTab('films')}
          >
            <Film size={18} />
            <span>보유 필름 목록</span>
            <span className="badge">{films.reduce((acc, f) => acc + (f.quantity || 0), 0)}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'gear' ? 'active' : ''}`}
            onClick={() => setActiveTab('gear')}
          >
            <Camera size={18} />
            <span>카메라 & 렌즈</span>
            <span className="badge">{cameras.length + lenses.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'shooting' ? 'active' : ''}`}
            onClick={() => setActiveTab('shooting')}
          >
            <Layers size={18} />
            <span>촬영 관리</span>
            <span className="badge">{rolls.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'developers' ? 'active' : ''}`}
            onClick={() => setActiveTab('developers')}
          >
            <FlaskConical size={18} />
            <span>현상액 관리</span>
            <span className="badge">{developers.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'scans' ? 'active' : ''}`}
            onClick={() => setActiveTab('scans')}
          >
            <Folder size={18} />
            <span>필름 스캔 관리</span>
            <span className="badge">{scans.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={15} /> 환경설정
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Sticky Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">{pageTitles[activeTab]}</h1>
          </div>

          <div className="header-right">
            {/* Quick Theme Switcher Button */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`현재 테마: ${theme === 'system' ? '시스템 자동' : theme === 'light' ? '라이트 모드' : '다크 모드'} (클릭 시 전환)`}
            >
              {theme === 'light' ? (
                <>
                  <Sun size={15} color="#d97706" /> <span>라이트</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <Moon size={15} color="#fbbf24" /> <span>다크</span>
                </>
              ) : (
                <>
                  <Monitor size={15} /> <span>자동</span>
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsSettingsOpen(true)}
              title="환경 설정"
            >
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        {isLoading ? (
          <div className="empty-state" style={{ minHeight: '300px' }}>
            <div className="empty-icon"><Film size={28} /></div>
            <h3>데이터 불러오는 중...</h3>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                films={films}
                cameras={cameras}
                lenses={lenses}
                developers={developers}
                rolls={rolls}
                scans={scans}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'films' && (
              <FilmVaultView
                films={films}
                onSaveFilm={handleSaveFilm}
                onDeleteFilm={handleDeleteFilm}
              />
            )}

            {activeTab === 'gear' && (
              <GearView
                cameras={cameras}
                lenses={lenses}
                onSaveCamera={handleSaveCamera}
                onDeleteCamera={handleDeleteCamera}
                onSaveLens={handleSaveLens}
                onDeleteLens={handleDeleteLens}
              />
            )}

            {activeTab === 'shooting' && (
              <ShootingView
                rolls={rolls}
                films={films}
                cameras={cameras}
                lenses={lenses}
                developers={developers}
                onSaveRoll={handleSaveRoll}
                onDeleteRoll={handleDeleteRoll}
              />
            )}

            {activeTab === 'developers' && (
              <DeveloperView
                developers={developers}
                onSaveDeveloper={handleSaveDeveloper}
                onDeleteDeveloper={handleDeleteDeveloper}
              />
            )}

            {activeTab === 'scans' && (
              <ScanVaultView
                scans={scans}
                developedRolls={developedRolls}
                onSaveScan={handleSaveScan}
                onDeleteScan={handleDeleteScan}
              />
            )}
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (iPhone & Mobile Touch Optimized) */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>홈</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'films' ? 'active' : ''}`}
          onClick={() => setActiveTab('films')}
        >
          <Film size={20} />
          <span>필름</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'gear' ? 'active' : ''}`}
          onClick={() => setActiveTab('gear')}
        >
          <Camera size={20} />
          <span>장비</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'shooting' ? 'active' : ''}`}
          onClick={() => setActiveTab('shooting')}
        >
          <Layers size={20} />
          <span>촬영</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'developers' ? 'active' : ''}`}
          onClick={() => setActiveTab('developers')}
        >
          <FlaskConical size={20} />
          <span>현상액</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'scans' ? 'active' : ''}`}
          onClick={() => setActiveTab('scans')}
        >
          <Folder size={20} />
          <span>스캔</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={loadData}
        currentTheme={theme}
        onThemeChange={applyTheme}
      />
    </div>
  );
}
