'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FilmItem,
  CameraItem,
  LensItem,
  DeveloperChemical,
  ShootingRoll,
  ScanLog,
  ScannerItem,
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
  getScanners,
  saveScanner,
  deleteScanner,
  initLocalStorageIfEmpty,
} from '@/lib/storageService';

import FilmVaultView from '@/components/FilmVaultView';
import GearView from '@/components/GearView';
import ShootingView from '@/components/ShootingView';
import DevelopmentView from '@/components/DevelopmentView';
import DeveloperView from '@/components/DeveloperView';
import ScanVaultView from '@/components/ScanVaultView';
import DashboardOverview from '@/components/DashboardOverview';
import SettingsModal from '@/components/SettingsModal';
import AuthView from '@/components/AuthView';
import CinematicScrollStudio from '@/components/CinematicScrollStudio';
import MasterPinLockModal from '@/components/MasterPinLockModal';
import { isSupabaseConfigured, getSupabaseClient, signOutUser } from '@/lib/supabase';
import { isAppUnlocked, lockAppNow } from '@/lib/securityService';
import { User } from '@supabase/supabase-js';

import {
  Film,
  Camera,
  Layers,
  FlaskConical,
  Droplets,
  Folder,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

type TabType = 'dashboard' | 'films' | 'gear' | 'shooting' | 'development' | 'developers' | 'scans';
type ThemeMode = 'system' | 'light' | 'dark';
type ViewMode = 'cinematic_flow' | 'table_inventory';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('cinematic_flow');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedDevRollId, setSelectedDevRollId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  // Master PIN Screen Lock State
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsScreenLocked(!isAppUnlocked());
    }
  }, []);

  // Theme Management (Light / Dark / System Auto)
  const [theme, setTheme] = useState<ThemeMode>('system');

  // Core Data States
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [lenses, setLenses] = useState<LensItem[]>([]);
  const [developers, setDevelopers] = useState<DeveloperChemical[]>([]);
  const [rolls, setRolls] = useState<ShootingRoll[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [scanners, setScanners] = useState<ScannerItem[]>([]);

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
      const [f, c, l, d, r, s, sc] = await Promise.all([
        getFilms(),
        getCameras(),
        getLenses(),
        getDevelopers(),
        getShootingRolls(),
        getScans(),
        getScanners(),
      ]);
      setFilms(f);
      setCameras(c);
      setLenses(l);
      setDevelopers(d);
      setRolls(r);
      setScans(s);
      setScanners(sc);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Auth Session listener
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user || null);
          setIsAuthChecking(false);
        });

        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
          setIsAuthChecking(false);
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            loadData();
          }
        });

        return () => subscription.unsubscribe();
      }
    } else {
      setIsAuthChecking(false);
      setIsGuestMode(true);
    }
  }, [loadData]);

  // Handlers for Films
  const handleSaveFilm = async (film: FilmItem) => {
    setFilms((prev) => {
      const idx = prev.findIndex((f) => f.id === film.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = film;
        return next;
      }
      return [film, ...prev];
    });
    const updated = await saveFilm(film);
    setFilms(updated);
  };
  const handleDeleteFilm = async (id: string) => {
    setFilms((prev) => prev.filter((f) => f.id !== id));
    const updated = await deleteFilm(id);
    setFilms(updated);
  };

  // Handlers for Gear (Cameras & Lenses)
  const handleSaveCamera = async (camera: CameraItem) => {
    setCameras((prev) => {
      const idx = prev.findIndex((c) => c.id === camera.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = camera;
        return next;
      }
      return [camera, ...prev];
    });
    const updated = await saveCamera(camera);
    setCameras(updated);
  };
  const handleDeleteCamera = async (id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
    const updated = await deleteCamera(id);
    setCameras(updated);
  };
  const handleSaveLens = async (lens: LensItem) => {
    setLenses((prev) => {
      const idx = prev.findIndex((l) => l.id === lens.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = lens;
        return next;
      }
      return [lens, ...prev];
    });
    const updated = await saveLens(lens);
    setLenses(updated);
  };
  const handleDeleteLens = async (id: string) => {
    setLenses((prev) => prev.filter((l) => l.id !== id));
    const updated = await deleteLens(id);
    setLenses(updated);
  };

  // Handlers for Developers
  const handleSaveDeveloper = async (dev: DeveloperChemical) => {
    setDevelopers((prev) => {
      const idx = prev.findIndex((d) => d.id === dev.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = dev;
        return next;
      }
      return [dev, ...prev];
    });
    const updated = await saveDeveloper(dev);
    setDevelopers(updated);
  };
  const handleDeleteDeveloper = async (id: string) => {
    setDevelopers((prev) => prev.filter((d) => d.id !== id));
    const updated = await deleteDeveloper(id);
    setDevelopers(updated);
  };

  // Handlers for Shooting Rolls
  const handleSaveRoll = async (roll: ShootingRoll, prev?: ShootingRoll) => {
    setRolls((prevList) => {
      const idx = prevList.findIndex((r) => r.id === roll.id);
      if (idx >= 0) {
        const next = [...prevList];
        next[idx] = roll;
        return next;
      }
      return [roll, ...prevList];
    });
    const result = await saveShootingRoll(roll, prev);
    setRolls(result.rolls);
    setDevelopers(result.developers);
    if (result.films) {
      setFilms(result.films);
    }
  };
  const handleDeleteRoll = async (id: string) => {
    setRolls((prevList) => prevList.filter((r) => r.id !== id));
    const result = await deleteShootingRoll(id);
    setRolls(result.rolls);
    if (result.films) {
      setFilms(result.films);
    }
  };

  // Handlers for Scans
  const handleSaveScan = async (scan: ScanLog) => {
    setScans((prev) => {
      const idx = prev.findIndex((s) => s.id === scan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = scan;
        return next;
      }
      return [scan, ...prev];
    });
    const updated = await saveScan(scan);
    setScans(updated);
    const updatedRolls = await getShootingRolls();
    setRolls(updatedRolls);
  };
  const handleDeleteScan = async (id: string) => {
    setScans((prev) => prev.filter((s) => s.id !== id));
    const updated = await deleteScan(id);
    setScans(updated);
  };

  // Handlers for Scanners
  const handleSaveScanner = async (scanner: ScannerItem) => {
    setScanners((prev) => {
      const idx = prev.findIndex((s) => s.id === scanner.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = scanner;
        return next;
      }
      return [scanner, ...prev];
    });
    const updated = await saveScanner(scanner);
    setScanners(updated);
  };
  const handleDeleteScanner = async (id: string) => {
    setScanners((prev) => prev.filter((s) => s.id !== id));
    const updated = await deleteScanner(id);
    setScanners(updated);
  };

  const developedRolls = rolls.filter((r) => r.status === 'developed' || r.status === 'scanned');
  const pendingDevRollsCount = rolls.filter((r) => r.status === 'unloaded').length;

  // Page titles with separate title and subtitle for responsive design
  const pageTitles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: { title: '대시보드', subtitle: 'Studio Hub' },
    films: { title: '필름 보관함', subtitle: 'Film Inventory' },
    gear: { title: '장비함', subtitle: 'Gear Vault' },
    shooting: { title: '촬영 로그', subtitle: 'Shooting Logs' },
    development: { title: '현상 관리', subtitle: 'Development & Lab' },
    developers: { title: '현상액', subtitle: 'Developer Chemistry' },
    scans: { title: '스캔 아카이브', subtitle: 'Scan Archive' },
  };

  // 0. Master PIN Screen Lock Guard (Private Instance Lock)
  if (isScreenLocked) {
    return <MasterPinLockModal onUnlocked={() => setIsScreenLocked(false)} />;
  }

  // 1. Supabase Auth Session Checking
  if (isSupabaseConfigured() && isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="empty-state">
          <div className="empty-icon"><Film size={28} /></div>
          <h3>보안 세션 확인 중...</h3>
        </div>
      </div>
    );
  }

  // 2. Auth Required Guard (Only authenticated user can access)
  if (isSupabaseConfigured() && !user && !isGuestMode) {
    return (
      <AuthView
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          loadData();
        }}
        onContinueOffline={() => {
          setIsGuestMode(true);
        }}
      />
    );
  }

  // 3. Cinematic Scroll Mode (Default flagship experience)
  if (viewMode === 'cinematic_flow') {
    return (
      <>
        <CinematicScrollStudio
          films={films}
          cameras={cameras}
          lenses={lenses}
          developers={developers}
          rolls={rolls}
          scans={scans}
          scanners={scanners}
          onSaveFilm={handleSaveFilm}
          onSaveCamera={handleSaveCamera}
          onSaveLens={handleSaveLens}
          onSaveDeveloper={handleSaveDeveloper}
          onSaveRoll={handleSaveRoll}
          onSaveScan={handleSaveScan}
          onSaveScanner={handleSaveScanner}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSwitchToTableView={() => setViewMode('table_inventory')}
          userEmail={user?.email}
          onLogout={async () => {
            await signOutUser();
            setUser(null);
            await loadData();
          }}
        />

        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onRefreshData={loadData}
            currentTheme={theme}
            onThemeChange={applyTheme}
          />
        )}
      </>
    );
  }

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

        {/* Switch back to Cinematic Flow Button */}
        <div style={{ padding: '0 16px 12px' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={() => setViewMode('cinematic_flow')}
          >
            <Sparkles size={14} /> 시네마틱 스크롤
          </button>
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
            className={`nav-item ${activeTab === 'development' ? 'active' : ''}`}
            onClick={() => setActiveTab('development')}
          >
            <FlaskConical size={18} />
            <span>현상 관리</span>
            {pendingDevRollsCount > 0 && (
              <span className="badge" style={{ background: 'var(--accent-purple)', color: '#fff' }}>
                {pendingDevRollsCount}
              </span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'developers' ? 'active' : ''}`}
            onClick={() => setActiveTab('developers')}
          >
            <Droplets size={18} />
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

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={15} /> 환경설정
          </button>

          {user && (
            <button
              className="btn btn-subtle btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-dim)', fontSize: '0.78rem' }}
              onClick={async () => {
                await signOutUser();
                setUser(null);
                await loadData();
              }}
              title="로그아웃"
            >
              <LogOut size={13} /> 로그아웃 ({user.email?.split('@')[0]})
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Sticky Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">
              <span className="page-title-main">{pageTitles[activeTab].title}</span>
              <span className="page-title-sub">({pageTitles[activeTab].subtitle})</span>
            </h1>
          </div>

          <div className="header-right">
            {user && (
              <div className="header-user-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className="notion-tag header-user-pill"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title={user.email}
                >
                  <UserIcon size={12} />
                  <span className="header-user-email">{user.email?.split('@')[0]}</span>
                </span>
                <button
                  className="btn btn-secondary btn-sm header-logout-btn"
                  onClick={async () => {
                    await signOutUser();
                    setUser(null);
                    await loadData();
                  }}
                  title="로그아웃"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Switch to Cinematic Scroll */}
            <button
              className="btn btn-secondary btn-sm header-mode-btn"
              onClick={() => setViewMode('cinematic_flow')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="시네마틱 스크롤 모드로 전환"
            >
              <Sparkles size={14} color="#f59e0b" />
              <span className="btn-label-desktop">시네마틱</span>
            </button>

            {/* Quick Theme Switcher Button */}
            <button
              className="theme-toggle-btn header-theme-btn"
              onClick={toggleTheme}
              title={`현재 테마: ${theme === 'system' ? '시스템 자동' : theme === 'light' ? '라이트 모드' : '다크 모드'} (클릭 시 전환)`}
            >
              {theme === 'light' ? (
                <>
                  <Sun size={15} color="#d97706" /> <span className="btn-label-desktop">라이트</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <Moon size={15} color="#fbbf24" /> <span className="btn-label-desktop">다크</span>
                </>
              ) : (
                <>
                  <Monitor size={15} /> <span className="btn-label-desktop">자동</span>
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm header-settings-btn"
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
                onNavigateToDev={(rollId) => {
                  setSelectedDevRollId(rollId || null);
                  setActiveTab('development');
                }}
              />
            )}

            {activeTab === 'development' && (
              <DevelopmentView
                rolls={rolls}
                films={films}
                developers={developers}
                onSaveRoll={handleSaveRoll}
                onDeleteRoll={handleDeleteRoll}
                onNavigateToScan={(rollId) => setActiveTab('scans')}
                initialRollId={selectedDevRollId}
                onClearInitialRollId={() => setSelectedDevRollId(null)}
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
                scanners={scanners}
                onSaveScan={handleSaveScan}
                onDeleteScan={handleDeleteScan}
                onSaveScanner={handleSaveScanner}
                onDeleteScanner={handleDeleteScanner}
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
          className={`mobile-nav-btn ${activeTab === 'development' ? 'active' : ''}`}
          onClick={() => setActiveTab('development')}
          style={{ position: 'relative' }}
        >
          <FlaskConical size={20} />
          <span>현상</span>
          {pendingDevRollsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '12px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--accent-purple)',
              }}
            />
          )}
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'developers' ? 'active' : ''}`}
          onClick={() => setActiveTab('developers')}
        >
          <Droplets size={20} />
          <span>약품</span>
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
