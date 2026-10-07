import { FilmItem, CameraItem, LensItem, DeveloperChemical, ShootingRoll, ScanLog } from '@/types';
import { INITIAL_FILMS, INITIAL_CAMERAS, INITIAL_LENSES, INITIAL_DEVELOPERS, INITIAL_SHOOTING_ROLLS, INITIAL_SCANS } from '@/data/seedData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  FILMS: 'filmopener_films',
  CAMERAS: 'filmopener_cameras',
  LENSES: 'filmopener_lenses',
  DEVELOPERS: 'filmopener_developers',
  SHOOTING_ROLLS: 'filmopener_shooting_rolls',
  SCANS: 'filmopener_scans',
  INITIALIZED: 'filmopener_initialized_v3',
};

// Check and seed initial data if running locally
export const initLocalStorageIfEmpty = () => {
  if (typeof window === 'undefined') return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    if (!localStorage.getItem(STORAGE_KEYS.FILMS)) {
      localStorage.setItem(STORAGE_KEYS.FILMS, JSON.stringify(INITIAL_FILMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAMERAS)) {
      localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(INITIAL_CAMERAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LENSES)) {
      localStorage.setItem(STORAGE_KEYS.LENSES, JSON.stringify(INITIAL_LENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEVELOPERS)) {
      localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(INITIAL_DEVELOPERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS)) {
      localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(INITIAL_SHOOTING_ROLLS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCANS)) {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(INITIAL_SCANS));
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

export const resetToInitialData = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FILMS, JSON.stringify(INITIAL_FILMS));
  localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(INITIAL_CAMERAS));
  localStorage.setItem(STORAGE_KEYS.LENSES, JSON.stringify(INITIAL_LENSES));
  localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(INITIAL_DEVELOPERS));
  localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(INITIAL_SHOOTING_ROLLS));
  localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(INITIAL_SCANS));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
};

// ==========================================
// FILMS
// ==========================================
export const getFilms = async (): Promise<FilmItem[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('films').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as FilmItem[];
      } catch (err) {
        console.warn('Supabase fetch films failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.FILMS);
  return raw ? JSON.parse(raw) : INITIAL_FILMS;
};

export const saveFilm = async (film: FilmItem): Promise<FilmItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.FILMS);
  let list: FilmItem[] = raw ? JSON.parse(raw) : [...INITIAL_FILMS];

  const index = list.findIndex((f) => f.id === film.id);
  if (index >= 0) {
    list[index] = { ...film, updated_at: new Date().toISOString() };
  } else {
    list.unshift({ ...film, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.FILMS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('films').upsert(film);
      } catch (e) {
        console.error('Supabase save film error:', e);
      }
    }
  }

  return list;
};

export const deleteFilm = async (id: string): Promise<FilmItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.FILMS);
  let list: FilmItem[] = raw ? JSON.parse(raw) : [];
  list = list.filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEYS.FILMS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('films').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete film error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// CAMERAS
// ==========================================
export const getCameras = async (): Promise<CameraItem[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cameras').select('*').order('brand', { ascending: true });
        if (!error && data && data.length > 0) return data as CameraItem[];
      } catch (err) {
        console.warn('Supabase fetch cameras failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.CAMERAS);
  return raw ? JSON.parse(raw) : INITIAL_CAMERAS;
};

export const saveCamera = async (camera: CameraItem): Promise<CameraItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.CAMERAS);
  let list: CameraItem[] = raw ? JSON.parse(raw) : [...INITIAL_CAMERAS];

  const index = list.findIndex((c) => c.id === camera.id);
  if (index >= 0) {
    list[index] = camera;
  } else {
    list.unshift({ ...camera, created_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('cameras').upsert(camera);
      } catch (e) {
        console.error('Supabase save camera error:', e);
      }
    }
  }

  return list;
};

export const deleteCamera = async (id: string): Promise<CameraItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.CAMERAS);
  let list: CameraItem[] = raw ? JSON.parse(raw) : [];
  list = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('cameras').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete camera error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// LENSES
// ==========================================
export const getLenses = async (): Promise<LensItem[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lenses').select('*').order('focal_length_min', { ascending: true });
        if (!error && data && data.length > 0) return data as LensItem[];
      } catch (err) {
        console.warn('Supabase fetch lenses failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.LENSES);
  return raw ? JSON.parse(raw) : INITIAL_LENSES;
};

export const saveLens = async (lens: LensItem): Promise<LensItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.LENSES);
  let list: LensItem[] = raw ? JSON.parse(raw) : [...INITIAL_LENSES];

  const index = list.findIndex((l) => l.id === lens.id);
  if (index >= 0) {
    list[index] = lens;
  } else {
    list.unshift({ ...lens, created_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.LENSES, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('lenses').upsert(lens);
      } catch (e) {
        console.error('Supabase save lens error:', e);
      }
    }
  }

  return list;
};

export const deleteLens = async (id: string): Promise<LensItem[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.LENSES);
  let list: LensItem[] = raw ? JSON.parse(raw) : [];
  list = list.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LENSES, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('lenses').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete lens error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// DEVELOPERS (현상액 관리)
// ==========================================
export const getDevelopers = async (): Promise<DeveloperChemical[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('developer_chemicals').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as DeveloperChemical[];
      } catch (err) {
        console.warn('Supabase fetch developers failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
  return raw ? JSON.parse(raw) : INITIAL_DEVELOPERS;
};

export const saveDeveloper = async (dev: DeveloperChemical): Promise<DeveloperChemical[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
  let list: DeveloperChemical[] = raw ? JSON.parse(raw) : [...INITIAL_DEVELOPERS];

  const index = list.findIndex((d) => d.id === dev.id);
  if (index >= 0) {
    list[index] = dev;
  } else {
    list.unshift({ ...dev, created_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('developer_chemicals').upsert(dev);
      } catch (e) {
        console.error('Supabase save developer error:', e);
      }
    }
  }

  return list;
};

export const deleteDeveloper = async (id: string): Promise<DeveloperChemical[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
  let list: DeveloperChemical[] = raw ? JSON.parse(raw) : [];
  list = list.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('developer_chemicals').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete developer error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// SHOOTING ROLLS (촬영 관리 + 현상방법 연동)
// ==========================================
export const getShootingRolls = async (): Promise<ShootingRoll[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('shooting_rolls').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as ShootingRoll[];
      } catch (err) {
        console.warn('Supabase fetch rolls failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS);
  return raw ? JSON.parse(raw) : INITIAL_SHOOTING_ROLLS;
};

export const saveShootingRoll = async (
  roll: ShootingRoll,
  previousRollState?: ShootingRoll
): Promise<{ rolls: ShootingRoll[]; developers: DeveloperChemical[] }> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS);
  let list: ShootingRoll[] = raw ? JSON.parse(raw) : [...INITIAL_SHOOTING_ROLLS];

  const isNew = !list.some((r) => r.id === roll.id);
  const index = list.findIndex((r) => r.id === roll.id);
  if (index >= 0) {
    list[index] = { ...roll, updated_at: new Date().toISOString() };
  } else {
    list.unshift({ ...roll, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(list));

  // 3-6 & 4-3: 자가현상 시 현상액 사용 횟수, 롤 수, 희석비율 누적 연동 처리
  const devRaw = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
  let devList: DeveloperChemical[] = devRaw ? JSON.parse(devRaw) : [...INITIAL_DEVELOPERS];

  // If this roll has self dev with a developer selected:
  const shouldAccumulate =
    roll.dev_type === 'self' &&
    roll.developer_id &&
    (!previousRollState ||
      previousRollState.dev_type !== 'self' ||
      previousRollState.developer_id !== roll.developer_id ||
      previousRollState.dev_quantity_rolls !== roll.dev_quantity_rolls ||
      previousRollState.dilution_ratio !== roll.dilution_ratio);

  if (shouldAccumulate) {
    const devIndex = devList.findIndex((d) => d.id === roll.developer_id);
    if (devIndex >= 0) {
      const dev = devList[devIndex];
      const rollsToAdd = roll.dev_quantity_rolls || 1;
      const ratioKey = roll.dilution_ratio || '미지정';

      const prevUsage = { ...(dev.dilution_usage || {}) };
      prevUsage[ratioKey] = (prevUsage[ratioKey] || 0) + 1;

      devList[devIndex] = {
        ...dev,
        total_rolls_processed: (dev.total_rolls_processed || 0) + rollsToAdd,
        total_batches: (dev.total_batches || 0) + 1,
        dilution_usage: prevUsage,
        last_used_date: roll.developed_date || new Date().toISOString().split('T')[0],
      };

      localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(devList));

      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from('developer_chemicals').upsert(devList[devIndex]);
          } catch (e) {
            console.error('Supabase update developer usage error:', e);
          }
        }
      }
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('shooting_rolls').upsert(roll);
      } catch (e) {
        console.error('Supabase save shooting roll error:', e);
      }
    }
  }

  return { rolls: list, developers: devList };
};

export const deleteShootingRoll = async (id: string): Promise<ShootingRoll[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS);
  let list: ShootingRoll[] = raw ? JSON.parse(raw) : [];
  list = list.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('shooting_rolls').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete shooting roll error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// SCANS (스캔 관리)
// ==========================================
export const getScans = async (): Promise<ScanLog[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('scan_logs').select('*').order('scan_date', { ascending: false });
        if (!error && data && data.length > 0) return data as ScanLog[];
      } catch (err) {
        console.warn('Supabase fetch scans failed, falling back to local storage', err);
      }
    }
  }

  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SCANS);
  return raw ? JSON.parse(raw) : INITIAL_SCANS;
};

export const saveScan = async (scan: ScanLog): Promise<ScanLog[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SCANS);
  let list: ScanLog[] = raw ? JSON.parse(raw) : [...INITIAL_SCANS];

  const index = list.findIndex((s) => s.id === scan.id);
  if (index >= 0) {
    list[index] = scan;
  } else {
    list.unshift({ ...scan, created_at: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(list));

  // If scan is linked to a shooting roll, optionally update roll status to 'scanned'
  if (scan.roll_id) {
    const rollsRaw = localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS);
    if (rollsRaw) {
      const rollsList: ShootingRoll[] = JSON.parse(rollsRaw);
      const rIdx = rollsList.findIndex((r) => r.id === scan.roll_id);
      if (rIdx >= 0 && rollsList[rIdx].status !== 'scanned') {
        rollsList[rIdx].status = 'scanned';
        localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(rollsList));
      }
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('scan_logs').upsert(scan);
      } catch (e) {
        console.error('Supabase save scan error:', e);
      }
    }
  }

  return list;
};

export const deleteScan = async (id: string): Promise<ScanLog[]> => {
  initLocalStorageIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEYS.SCANS);
  let list: ScanLog[] = raw ? JSON.parse(raw) : [];
  list = list.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('scan_logs').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete scan error:', e);
      }
    }
  }

  return list;
};

// ==========================================
// BACKUP / EXPORT / IMPORT
// ==========================================
export const exportFullBackup = () => {
  initLocalStorageIfEmpty();
  const backup = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    films: JSON.parse(localStorage.getItem(STORAGE_KEYS.FILMS) || '[]'),
    cameras: JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMERAS) || '[]'),
    lenses: JSON.parse(localStorage.getItem(STORAGE_KEYS.LENSES) || '[]'),
    developers: JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVELOPERS) || '[]'),
    shooting_rolls: JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOOTING_ROLLS) || '[]'),
    scans: JSON.parse(localStorage.getItem(STORAGE_KEYS.SCANS) || '[]'),
  };
  return JSON.stringify(backup, null, 2);
};

export const importFullBackup = (jsonStr: string): boolean => {
  try {
    const data = JSON.parse(jsonStr);
    if (data.films) localStorage.setItem(STORAGE_KEYS.FILMS, JSON.stringify(data.films));
    if (data.cameras) localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(data.cameras));
    if (data.lenses) localStorage.setItem(STORAGE_KEYS.LENSES, JSON.stringify(data.lenses));
    if (data.developers) localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(data.developers));
    if (data.shooting_rolls) localStorage.setItem(STORAGE_KEYS.SHOOTING_ROLLS, JSON.stringify(data.shooting_rolls));
    if (data.scans) localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(data.scans));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return true;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return false;
  }
};
