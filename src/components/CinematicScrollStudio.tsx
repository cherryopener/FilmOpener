'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FilmItem,
  CameraItem,
  LensItem,
  DeveloperChemical,
  ShootingRoll,
  ScanLog,
  ScannerItem,
  ScannerCategory,
  LabScanResolution,
  WeatherType,
  AgitationMethod,
  ScanMethod,
  DevType,
  FilmType,
  FilmFormat,
  StorageMethod,
  CameraFormat,
  EquipmentStatus,
  FreshnessStatus,
} from '@/types';
import { RECIPE_DILUTIONS, LAB_SCANNERS, LAB_SCAN_RESOLUTIONS } from '@/lib/constants';
import { PHOTOGRAPHY_QUOTES } from '@/data/photographyQuotes';
import FilmCanister3D from './FilmCanister3D';
import {
  Camera,
  Layers,
  FlaskConical,
  FolderArchive,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Sunset,
  Moon,
  Lightbulb,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Sliders,
  Compass,
  ArrowUp,
  Settings,
  LogOut,
  Clock,
  Droplets,
  HardDrive,
  Copy,
  Check,
  Film,
  X,
  Upload,
  Image as ImageIcon,
  Folder,
  ExternalLink,
  RefreshCw,
  Aperture,
  Link as LinkIcon,
  Info,
} from 'lucide-react';

export type MacFolderColorKey =
  | 'mac_sky_blue'
  | 'mac_gray'
  | 'mac_glossy_black'
  | 'mac_green'
  | 'mac_yellow'
  | 'mac_purple'
  | 'mac_orange';

export const MAC_FOLDER_COLORS: Record<
  MacFolderColorKey,
  {
    key: MacFolderColorKey;
    label: string;
    sublabel: string;
    frontGrad: string;
    tabGrad: string;
    backColor: string;
    dotColor: string;
    isGlossy?: boolean;
  }
> = {
  mac_sky_blue: {
    key: 'mac_sky_blue',
    label: '하늘색 (기본)',
    sublabel: '컬러네거티브',
    frontGrad: 'linear-gradient(180deg, #4ea5ff 0%, #0077e6 65%, #005bb5 100%)',
    tabGrad: 'linear-gradient(180deg, #6bb3ff 0%, #0077e6 100%)',
    backColor: '#005bb5',
    dotColor: '#0077e6',
  },
  mac_gray: {
    key: 'mac_gray',
    label: '회색',
    sublabel: '흑백네거티브',
    frontGrad: 'linear-gradient(180deg, #a8a8ad 0%, #7d7d82 65%, #59595e 100%)',
    tabGrad: 'linear-gradient(180deg, #bcbcc0 0%, #7d7d82 100%)',
    backColor: '#59595e',
    dotColor: '#8e8e93',
  },
  mac_glossy_black: {
    key: 'mac_glossy_black',
    label: '유광 블랙',
    sublabel: '흑백슬라이드',
    frontGrad: 'linear-gradient(180deg, #3a3a3e 0%, #1c1c1f 50%, #09090b 100%)',
    tabGrad: 'linear-gradient(180deg, #4a4a50 0%, #1c1c1f 100%)',
    backColor: '#0a0a0c',
    dotColor: '#2c2c2e',
    isGlossy: true,
  },
  mac_green: {
    key: 'mac_green',
    label: '초록색',
    sublabel: '슬라이드 (E-6)',
    frontGrad: 'linear-gradient(180deg, #4edb67 0%, #28cd41 65%, #1ba630 100%)',
    tabGrad: 'linear-gradient(180deg, #6be280 0%, #28cd41 100%)',
    backColor: '#1ba630',
    dotColor: '#30d158',
  },
  mac_yellow: {
    key: 'mac_yellow',
    label: '노란색',
    sublabel: '영화용 (ECN-2)',
    frontGrad: 'linear-gradient(180deg, #ffe033 0%, #ffcc00 65%, #cca300 100%)',
    tabGrad: 'linear-gradient(180deg, #ffe75c 0%, #ffcc00 100%)',
    backColor: '#cca300',
    dotColor: '#ffd60a',
  },
  mac_purple: {
    key: 'mac_purple',
    label: '보라색',
    sublabel: '스페셜/아카이브',
    frontGrad: 'linear-gradient(180deg, #cd7cfc 0%, #af52de 65%, #8a36b5 100%)',
    tabGrad: 'linear-gradient(180deg, #d896ff 0%, #af52de 100%)',
    backColor: '#8a36b5',
    dotColor: '#bf5af2',
  },
  mac_orange: {
    key: 'mac_orange',
    label: '오렌지색',
    sublabel: '골든아워/풍경',
    frontGrad: 'linear-gradient(180deg, #ffb547 0%, #ff9500 65%, #cc7700 100%)',
    tabGrad: 'linear-gradient(180deg, #ffc56e 0%, #ff9500 100%)',
    backColor: '#cc7700',
    dotColor: '#ff9f0a',
  },
};

export type FilmSortMode = 'expiry' | 'brand' | 'type' | 'iso' | 'quantity' | 'name';

export const FILM_SORT_MODES: { mode: FilmSortMode; label: string; icon: string; desc: string }[] = [
  { mode: 'expiry', label: '유통기한 임박순', icon: '⏳', desc: '만료/임박 썩필 우선 정렬' },
  { mode: 'brand', label: '브랜드 제조사순', icon: '🏷️', desc: 'Kodak, Fuji, Ilford 알파벳순' },
  { mode: 'type', label: '필름 종류별 분류순', icon: '🎞️', desc: '컬러 ➔ 흑백 ➔ 슬라 ➔ 영화용' },
  { mode: 'iso', label: 'ISO 감도순', icon: '⚡', desc: 'ISO 50 ~ ISO 3200' },
  { mode: 'quantity', label: '보유 수량 많은순', icon: '📦', desc: '재고 롤 수 많은 순' },
  { mode: 'name', label: '필름 이름순', icon: '🔤', desc: '가나다 및 이름순' },
];

interface CinematicScrollStudioProps {
  films: FilmItem[];
  cameras: CameraItem[];
  lenses: LensItem[];
  developers: DeveloperChemical[];
  rolls: ShootingRoll[];
  scans: ScanLog[];
  scanners?: ScannerItem[];
  onSaveFilm: (film: FilmItem) => Promise<void>;
  onSaveCamera: (camera: CameraItem) => Promise<void>;
  onSaveLens: (lens: LensItem) => Promise<void>;
  onSaveDeveloper: (dev: DeveloperChemical) => Promise<void>;
  onSaveRoll: (roll: ShootingRoll, prev?: ShootingRoll) => Promise<void>;
  onSaveScan: (scan: ScanLog) => Promise<void>;
  onSaveScanner?: (scanner: ScannerItem) => Promise<void>;
  onOpenSettings: () => void;
  onSwitchToTableView: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

const WEATHER_OPTIONS: { type: WeatherType; label: string; icon: React.ReactNode }[] = [
  { type: 'sunny', label: '맑음', icon: <Sun size={15} /> },
  { type: 'cloud', label: '약간 흐림', icon: <Cloud size={15} /> },
  { type: 'overcast', label: '흐림', icon: <Cloud size={15} /> },
  { type: 'rain_snow', label: '비/눈', icon: <CloudRain size={15} /> },
  { type: 'night', label: '야경', icon: <Moon size={15} /> },
  { type: 'indoor', label: '실내', icon: <Lightbulb size={15} /> },
];

export default function CinematicScrollStudio({
  films,
  cameras,
  lenses,
  developers,
  rolls,
  scans,
  scanners = [],
  onSaveFilm,
  onSaveCamera,
  onSaveLens,
  onSaveDeveloper,
  onSaveRoll,
  onSaveScan,
  onSaveScanner,
  onOpenSettings,
  onSwitchToTableView,
  userEmail,
  onLogout,
}: CinematicScrollStudioProps) {
  // Active Chapter for Floating Dock Spy
  const [activeChapter, setActiveChapter] = useState<string>('section-films');

  // Photography Quote State (해외 유명 사진작가 명언 랜덤 렌더링)
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [isQuoteFading, setIsQuoteFading] = useState<boolean>(false);

  // Client-side initial random quote (prevents SSR hydration mismatch)
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * PHOTOGRAPHY_QUOTES.length);
    setQuoteIndex(randomIdx);
  }, []);

  // Shuffle to another random quote with smooth fade animation
  const handleShuffleQuote = () => {
    setIsQuoteFading(true);
    setTimeout(() => {
      setQuoteIndex((prev) => {
        if (PHOTOGRAPHY_QUOTES.length <= 1) return 0;
        let next = Math.floor(Math.random() * PHOTOGRAPHY_QUOTES.length);
        while (next === prev) {
          next = Math.floor(Math.random() * PHOTOGRAPHY_QUOTES.length);
        }
        return next;
      });
      setIsQuoteFading(false);
    }, 180);
  };

  const currentQuote = PHOTOGRAPHY_QUOTES[quoteIndex] || PHOTOGRAPHY_QUOTES[0];

  // Workflow Rig State (Loaded & Ready to shoot)
  const [selectedFilmId, setSelectedFilmId] = useState<string>(films[0]?.id || '');
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || '');
  const [selectedLensId, setSelectedLensId] = useState<string>(lenses[0]?.id || '');

  // Outing session in-progress state
  const [rollTitle, setRollTitle] = useState<string>('');
  const [loadedDate, setLoadedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isoRated, setIsoRated] = useState<number>(200);
  const [outings, setOutings] = useState<
    { id: string; date: string; weather: WeatherType; location: string; shots: number; notes: string }[]
  >([
    {
      id: 'session-1',
      date: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      location: '',
      shots: 18,
      notes: '',
    },
  ]);
  const [isFinishingRoll, setIsFinishingRoll] = useState<boolean>(false);
  const [unloadedDate, setUnloadedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Active Loaded Shooting Rolls Queue (currently loaded in cameras)
  const [activeShootingRollId, setActiveShootingRollId] = useState<string | null>(null);
  const currentlyLoadedRolls = useMemo(
    () => rolls.filter((r) => r.status === 'loaded'),
    [rolls]
  );

  // Quick Add Camera Modal State (with Real Photo Upload & Mount Setting)
  const [isAddCameraOpen, setIsAddCameraOpen] = useState<boolean>(false);
  const [newCamBrand, setNewCamBrand] = useState<string>('');
  const [newCamModel, setNewCamModel] = useState<string>('');
  const [newCamFormat, setNewCamFormat] = useState<CameraFormat>('135_full');
  const [newCamLensType, setNewCamLensType] = useState<'interchangeable' | 'fixed'>('interchangeable');
  const [newCamMount, setNewCamMount] = useState<string>('Leica M'); // 마운트 이름 (M, Leica M 등 자유 입력)
  const [newCamFixedName, setNewCamFixedName] = useState<string>('');
  const [newCamFixedFocal, setNewCamFixedFocal] = useState<string>('');
  const [newCamFixedAperture, setNewCamFixedAperture] = useState<string>('');
  const [newCamStatus, setNewCamStatus] = useState<EquipmentStatus>('active');
  const [newCamSerial, setNewCamSerial] = useState<string>('');
  const [newCamImage, setNewCamImage] = useState<string>('');
  const [newCamNotes, setNewCamNotes] = useState<string>('');

  // Mounts of all currently owned cameras (used as the dropdown options when adding new lenses!)
  const availableCameraMounts = useMemo(() => {
    const mountSet = new Set<string>();
    cameras.forEach((cam) => {
      if (cam.lens_type !== 'fixed' && cam.mount && cam.mount.trim()) {
        mountSet.add(cam.mount.trim());
      }
    });
    return Array.from(mountSet);
  }, [cameras]);

  // Quick Add Lens Modal State (with Real Photo Upload & Camera Mount Dropdown)
  const [isAddLensOpen, setIsAddLensOpen] = useState<boolean>(false);
  const [newLensBrand, setNewLensBrand] = useState<string>('');
  const [newLensName, setNewLensName] = useState<string>('');
  const [newLensMount, setNewLensMount] = useState<string>('Leica M');
  const [newLensCategory, setNewLensCategory] = useState<'prime' | 'zoom'>('prime');
  const [newLensFocalMin, setNewLensFocalMin] = useState<number>(50);
  const [newLensFocalMax, setNewLensFocalMax] = useState<number>(50);
  const [newLensMaxAperture, setNewLensMaxAperture] = useState<number>(2.0);
  const [newLensFormat, setNewLensFormat] = useState<string>('135');
  const [newLensStatus, setNewLensStatus] = useState<EquipmentStatus>('active');
  const [newLensSerial, setNewLensSerial] = useState<string>('');
  const [newLensImage, setNewLensImage] = useState<string>('');
  const [newLensNotes, setNewLensNotes] = useState<string>('');

  // Film Shelf Sorting Modes (Cyclic Reorder with shuffle reload animation)
  const [filmSortIndex, setFilmSortIndex] = useState<number>(0);
  const [isShelfReloading, setIsShelfReloading] = useState<boolean>(false);
  const [sortCycleCount, setSortCycleCount] = useState<number>(0);
  const currentSortMode = FILM_SORT_MODES[filmSortIndex];

  // Active Dev Roll Selection
  const pendingDevRolls = useMemo(
    () => rolls.filter((r) => r.status === 'unloaded'),
    [rolls]
  );
  const pendingScanRolls = useMemo(
    () => rolls.filter((r) => r.status === 'developed'),
    [rolls]
  );

  const [devSelectedRollId, setDevSelectedRollId] = useState<string>('');
  const [devType, setDevType] = useState<DevType>('self');
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>('');

  // User-defined default lab presets & customizable lab list
  const DEFAULT_LAB_PRESETS = useMemo(
    () => ['고래사진관', '포토피아', '중앙칼라', '우성상사', '포토마루', '세하', '옥상', '토픽'],
    []
  );
  const [customLabList, setCustomLabList] = useState<string[]>([]);
  const [isAddingCustomLab, setIsAddingCustomLab] = useState<boolean>(false);
  const [newCustomLabInput, setNewCustomLabInput] = useState<string>('');
  const [labName, setLabName] = useState<string>('고래사진관');

  // Load custom labs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('filmopener_custom_labs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomLabList(parsed.filter((item) => typeof item === 'string' && item.trim()));
          }
        }
      } catch (err) {
        console.error('Failed to load custom lab presets:', err);
      }
    }
  }, []);

  const handleAddCustomLab = (nameToAdd?: string) => {
    const target = (nameToAdd || newCustomLabInput).trim();
    if (!target) return;
    if (DEFAULT_LAB_PRESETS.includes(target) || customLabList.includes(target)) {
      setLabName(target);
      setIsAddingCustomLab(false);
      setNewCustomLabInput('');
      return;
    }
    const updated = [...customLabList, target];
    setCustomLabList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('filmopener_custom_labs', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save custom lab to localStorage:', e);
      }
    }
    setLabName(target);
    setNewCustomLabInput('');
    setIsAddingCustomLab(false);
  };

  const handleRemoveCustomLab = (labToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customLabList.filter((l) => l !== labToRemove);
    setCustomLabList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('filmopener_custom_labs', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save custom lab to localStorage:', e);
      }
    }
    if (labName === labToRemove) {
      setLabName(DEFAULT_LAB_PRESETS[0] || '');
    }
  };
  const [dilutionRatio, setDilutionRatio] = useState<string>('1:1');
  const [devTemp, setDevTemp] = useState<number>(20.0);
  const [devTime, setDevTime] = useState<string>('');
  const [agitationMethod, setAgitationMethod] = useState<AgitationMethod>('rotary');
  const [agitationNotes, setAgitationNotes] = useState<string>('');

  // Active Scan State
  const [scanSelectedRollId, setScanSelectedRollId] = useState<string>('');
  const [scanMethod, setScanMethod] = useState<ScanMethod>('digitizing');
  const [selectedScannerId, setSelectedScannerId] = useState<string>('');
  const [scannerModel, setScannerModel] = useState<string>('');
  const [labScanner, setLabScanner] = useState<string>('noritsu');
  const [customLabScanner, setCustomLabScanner] = useState<string>('');
  const [labResolution, setLabResolution] = useState<LabScanResolution>('standard');

  // Quick Add Scanner Rig Modal State
  const [isAddScannerOpen, setIsAddScannerOpen] = useState<boolean>(false);
  const [newScannerName, setNewScannerName] = useState<string>('');
  const [newScannerCategory, setNewScannerCategory] = useState<ScannerCategory>('digitizing');
  const [newScannerBrand, setNewScannerBrand] = useState<string>('');
  const [newScannerLight, setNewScannerLight] = useState<string>('');
  const [newScannerHolder, setNewScannerHolder] = useState<string>('');
  const [newScannerNotes, setNewScannerNotes] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');
  const [folderUrl, setFolderUrl] = useState<string>('');
  const [folderColor, setFolderColor] = useState<MacFolderColorKey>('mac_sky_blue');
  const [scanFrames, setScanFrames] = useState<number>(36);
  const [scanSoftware, setScanSoftware] = useState<string>('');
  const [scanNotes, setScanNotes] = useState<string>('');
  const [isCopiedFolder, setIsCopiedFolder] = useState<boolean>(false);
  const [copiedFolderUrl, setCopiedFolderUrl] = useState<string | null>(null);
  const [newlyAddedScanId, setNewlyAddedScanId] = useState<string | null>(null);
  const [inspectingScan, setInspectingScan] = useState<ScanLog | null>(null);
  const [isCopiedInspectFolder, setIsCopiedInspectFolder] = useState<boolean>(false);
  const macFinderVaultRef = useRef<HTMLDivElement>(null);

  // Right Edge Precision Ruler Scrubber (ArtCraft style) State
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [needleY, setNeedleY] = useState<number>(20);
  const [rulerHoverY, setRulerHoverY] = useState<number | null>(null);
  const [isRulerHovered, setIsRulerHovered] = useState<boolean>(false);
  const rulerTrackRef = useRef<HTMLDivElement>(null);
  const rulerNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Quick Add Film Batch Modal State (Demonstrating separate lots for same film name)
  const [isAddFilmOpen, setIsAddFilmOpen] = useState<boolean>(false);
  const [newFilmName, setNewFilmName] = useState<string>('');
  const [newFilmBrand, setNewFilmBrand] = useState<string>('');
  const [newFilmType, setNewFilmType] = useState<FilmType>('color_negative');
  const [newFilmFormat, setNewFilmFormat] = useState<FilmFormat>('135');
  const [newFilmIso, setNewFilmIso] = useState<number>(200);
  const [newFilmExpiry, setNewFilmExpiry] = useState<string>('');
  const [newFilmFreshness, setNewFilmFreshness] = useState<FreshnessStatus>('fresh');
  const [newFilmStorage, setNewFilmStorage] = useState<StorageMethod>('room_temp');
  const [newFilmExpired, setNewFilmExpired] = useState<boolean>(false);
  const [newFilmQuantity, setNewFilmQuantity] = useState<number>(1);
  const [newFilmNotes, setNewFilmNotes] = useState<string>('');

  // Selected Objects
  const selectedFilm = useMemo(
    () => films.find((f) => f.id === selectedFilmId) || films[0],
    [films, selectedFilmId]
  );
  const selectedCamera = useMemo(
    () => cameras.find((c) => c.id === selectedCameraId) || cameras[0],
    [cameras, selectedCameraId]
  );

  // Compatible Lenses based on Camera Mount
  const compatibleLenses = useMemo(() => {
    if (!selectedCamera) return lenses;
    if (selectedCamera.lens_type === 'fixed') {
      return []; // Camera has fixed lens
    }

    // [Primary] Direct Mount Match: If camera has a defined mount, match with lens.mount!
    if (selectedCamera.mount && selectedCamera.mount.trim()) {
      const camMount = selectedCamera.mount.trim().toLowerCase();
      const matched = lenses.filter((lens) => {
        if (!lens.mount || !lens.mount.trim()) return false;
        const lensMount = lens.mount.trim().toLowerCase();
        return (
          lensMount === camMount ||
          lensMount.includes(camMount) ||
          camMount.includes(lensMount)
        );
      });
      // If matches found, return them.
      if (matched.length > 0) return matched;
    }

    // [Fallback] Match mount by brand/model rules
    const camModel = selectedCamera.model.toLowerCase();
    const camBrand = selectedCamera.brand.toLowerCase();

    return lenses.filter((lens) => {
      const mount = (lens.mount || '').toLowerCase();
      if (camBrand.includes('leica') || camModel.includes('m6') || camModel.includes('m3')) {
        return mount.includes('leica m') || mount.includes('m mount') || mount === 'm';
      }
      if (camBrand.includes('nikon') || camModel.includes('f3') || camModel.includes('fm')) {
        return mount.includes('nikon f') || mount.includes('f mount');
      }
      if (camBrand.includes('hasselblad') || camModel.includes('500c')) {
        return mount.includes('hasselblad') || mount.includes('v mount');
      }
      if (camBrand.includes('olympus') || camModel.includes('om')) {
        return mount.includes('olympus') || mount.includes('om');
      }
      if (camBrand.includes('pentax') || camModel.includes('67')) {
        return mount.includes('pentax');
      }
      return true;
    });
  }, [selectedCamera, lenses]);

  const selectedLens = useMemo(() => {
    if (!selectedCamera) return null;
    if (selectedCamera.lens_type === 'fixed') {
      return null;
    }
    return lenses.find((l) => l.id === selectedLensId) || compatibleLenses[0] || null;
  }, [selectedCamera, selectedLensId, lenses, compatibleLenses]);

  // Sync Default Film ISO
  useEffect(() => {
    if (selectedFilm) {
      setIsoRated(selectedFilm.iso);
      if (!rollTitle) {
        const today = new Date().toISOString().split('T')[0];
        setRollTitle(`#${today.slice(0, 7)} ${selectedFilm.name} 첫 롤`);
      }
    }
  }, [selectedFilm]);

  // Sync Mount selection when Camera changes
  useEffect(() => {
    if (selectedCamera && selectedCamera.lens_type === 'interchangeable') {
      if (compatibleLenses.length > 0 && !compatibleLenses.some((l) => l.id === selectedLensId)) {
        setSelectedLensId(compatibleLenses[0].id);
      }
    }
  }, [selectedCamera, compatibleLenses, selectedLensId]);

  // Dev Roll selection sync
  useEffect(() => {
    if (pendingDevRolls.length > 0 && !devSelectedRollId) {
      setDevSelectedRollId(pendingDevRolls[0].id);
    }
  }, [pendingDevRolls, devSelectedRollId]);

  // Scan Roll selection sync
  useEffect(() => {
    if (pendingScanRolls.length > 0 && !scanSelectedRollId) {
      setScanSelectedRollId(pendingScanRolls[0].id);
    }
  }, [pendingScanRolls, scanSelectedRollId]);

  // The active roll currently chosen for development
  const currentDevRoll = useMemo(
    () => rolls.find((r) => r.id === devSelectedRollId),
    [rolls, devSelectedRollId]
  );

  // The film corresponding to currentDevRoll
  const currentDevFilm = useMemo(() => {
    if (!currentDevRoll) return selectedFilm;
    return films.find((f) => f.id === currentDevRoll.film_id) || selectedFilm;
  }, [currentDevRoll, films, selectedFilm]);

  // Dynamic Developer Filter:
  // IF Film is B&W -> ONLY B&W Developers & B&W Labs! HIDE Color kits!
  const isDevFilmBw = useMemo(() => {
    if (!currentDevFilm) return false;
    return currentDevFilm.type === 'bw_negative' || currentDevFilm.type === 'bw_slide';
  }, [currentDevFilm]);

  const filteredDevelopers = useMemo(() => {
    if (isDevFilmBw) {
      // ONLY Black & White chemicals!
      return developers.filter((d) => d.type === 'bw');
    }
    if (currentDevFilm?.type === 'cinema' || currentDevFilm?.type === 'cinema_ahu') {
      return developers.filter((d) => d.type === 'cinema');
    }
    // Color negative / slide
    return developers.filter((d) => d.type === 'color' || d.type === 'slide');
  }, [developers, isDevFilmBw, currentDevFilm]);

  // Sync selected developer chemical
  useEffect(() => {
    if (filteredDevelopers.length > 0) {
      if (!filteredDevelopers.some((d) => d.id === selectedDeveloperId)) {
        setSelectedDeveloperId(filteredDevelopers[0].id);
      }
    } else {
      setSelectedDeveloperId('');
    }
  }, [filteredDevelopers, selectedDeveloperId]);

  // Auto-generate Scan Folder Name when roll or camera changes
  useEffect(() => {
    const scanRoll = rolls.find((r) => r.id === scanSelectedRollId);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (scanRoll) {
      const cleanFilm = scanRoll.film_name_snapshot.split('(')[0].trim().replace(/\s+/g, '');
      const cleanCam = scanRoll.camera_name_snapshot.split('(')[0].trim().replace(/\s+/g, '');
      const location = scanRoll.shooting_sessions[0]?.location
        ? scanRoll.shooting_sessions[0].location.slice(0, 6).replace(/\s+/g, '')
        : 'Outing';
      setFolderName(`${today}_${location}_${cleanFilm}_${cleanCam}`);
    } else {
      setFolderName(`${today}_AnalogRoll_Archive`);
    }
  }, [scanSelectedRollId, rolls]);

  // Auto-detect Default Folder Color based on Film Type
  // 기본값: 흑백네거필름 -> 회색(mac_gray), 흑백슬라 -> 유광 검은색(mac_glossy_black),
  // 컬러네거필름 -> 하늘색(mac_sky_blue 기본), 슬라이드 -> 초록색(mac_green), 영화용 -> 노란색(mac_yellow)
  useEffect(() => {
    const scanRoll = rolls.find((r) => r.id === scanSelectedRollId);
    let matchedType: FilmType | undefined;

    if (scanRoll?.film_id) {
      const f = films.find((item) => item.id === scanRoll.film_id);
      matchedType = f?.type;
    } else if (scanRoll?.film_name_snapshot) {
      const fn = scanRoll.film_name_snapshot.toLowerCase();
      if (fn.includes('trix') || fn.includes('tri-x') || fn.includes('hp5') || fn.includes('흑백') || fn.includes('b&w') || fn.includes('delta') || fn.includes('acros') || fn.includes('pan') || fn.includes('fp4')) {
        matchedType = 'bw_negative';
      } else if (fn.includes('scala') || fn.includes('흑백슬라')) {
        matchedType = 'bw_slide';
      } else if (fn.includes('ektachrome') || fn.includes('provia') || fn.includes('velvia') || fn.includes('slide') || fn.includes('슬라이드')) {
        matchedType = 'color_slide';
      } else if (fn.includes('500t') || fn.includes('250d') || fn.includes('50d') || fn.includes('cinestill') || fn.includes('시네') || fn.includes('영화')) {
        matchedType = 'cinema';
      } else {
        matchedType = 'color_negative';
      }
    }

    if (matchedType === 'bw_negative') {
      setFolderColor('mac_gray');
    } else if (matchedType === 'bw_slide') {
      setFolderColor('mac_glossy_black');
    } else if (matchedType === 'color_slide') {
      setFolderColor('mac_green');
    } else if (matchedType === 'cinema' || matchedType === 'cinema_ahu') {
      setFolderColor('mac_yellow');
    } else {
      setFolderColor('mac_sky_blue');
    }
  }, [scanSelectedRollId, rolls, films]);

  // Cyclic Shelf Sort Logic with reloading animation
  const sortedFilms = useMemo(() => {
    const list = [...films];
    const mode = currentSortMode.mode;

    switch (mode) {
      case 'expiry':
        return list.sort(
          (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
      case 'brand':
        return list.sort(
          (a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
        );
      case 'type': {
        const typePriority: Record<FilmType, number> = {
          color_negative: 1,
          bw_negative: 2,
          color_slide: 3,
          bw_slide: 4,
          cinema: 5,
          cinema_ahu: 6,
          other: 7,
        };
        return list.sort(
          (a, b) =>
            (typePriority[a.type] || 99) - (typePriority[b.type] || 99) ||
            a.name.localeCompare(b.name)
        );
      }
      case 'iso':
        return list.sort((a, b) => a.iso - b.iso || a.name.localeCompare(b.name));
      case 'quantity':
        return list.sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [films, currentSortMode.mode]);

  // Handle Cycle Sort Button Click
  const handleCycleSortMode = () => {
    setIsShelfReloading(true);
    setSortCycleCount((prev) => prev + 1);
    setFilmSortIndex((prev) => (prev + 1) % FILM_SORT_MODES.length);
    setTimeout(() => {
      setIsShelfReloading(false);
    }, 450);
  };

  // Sorted Scans (Newest scan date first -> top-left in Grid)
  const sortedScans = useMemo(() => {
    return [...scans].sort((a, b) => {
      const dateA = a.scan_date || a.created_at || '';
      const dateB = b.scan_date || b.created_at || '';
      return dateB.localeCompare(dateA);
    });
  }, [scans]);

  // Memoized roll & scanner matching for the currently inspected scan folder
  const inspectingRoll = useMemo(() => {
    if (!inspectingScan?.roll_id) return null;
    return rolls.find((r) => r.id === inspectingScan.roll_id) || null;
  }, [inspectingScan, rolls]);

  const inspectingScanner = useMemo(() => {
    if (!inspectingScan?.scanner_id) return null;
    return scanners.find((s) => s.id === inspectingScan.scanner_id) || null;
  }, [inspectingScan, scanners]);

  // Copy handler for folder inspector (path or summary text)
  const handleCopyInspectInfo = (scan: ScanLog, type: 'path' | 'summary') => {
    let textToCopy = '';
    if (type === 'path') {
      textToCopy = scan.storage_path?.trim() || scan.folder_name;
    } else {
      const roll = scan.roll_id ? rolls.find((r) => r.id === scan.roll_id) : null;
      const filmName = roll?.film_name_snapshot || scan.film_title;
      const cameraName = roll?.camera_name_snapshot || scan.camera_lens_info || '미지정 바디';
      const lensName = roll?.lens_name_snapshot || '미지정 렌즈';

      let devInfo = '과거 아카이브 (현상 완료 보관본)';
      if (roll) {
        if (roll.dev_type === 'self') {
          devInfo = `자가현상 (${roll.developer_name_snapshot || '현상액'}${roll.dilution_ratio ? ` ${roll.dilution_ratio}` : ''}${roll.dev_temp_celsius ? `, ${roll.dev_temp_celsius}°C` : ''}${roll.dev_time ? `, ${roll.dev_time}` : ''}${roll.dev_method ? `, ${roll.dev_method}` : ''})`;
        } else if (roll.dev_type === 'lab') {
          devInfo = `현상소 위탁 (${roll.lab_name || '전문 현상소'})`;
        }
      }

      let scanMethodDesc = '';
      if (scan.scan_method === 'digitizing' || scan.scan_method === 'dslr') {
        scanMethodDesc = `디지타이징 (${scan.scanner_model || '카메라 매크로 스캔'})`;
      } else if (scan.scan_method === 'lab') {
        scanMethodDesc = `현상소 스캔 (${scan.lab_scanner || '노리츠/후지'}${scan.lab_resolution === 'high' ? ' · 고화질' : ' · 일반화질'})`;
      } else if (scan.scan_method === 'flatbed') {
        scanMethodDesc = `평판 스캐너 (${scan.scanner_model || 'Epson 등'})`;
      } else if (scan.scan_method === 'dedicated') {
        scanMethodDesc = `필름 전용 스캐너 (${scan.scanner_model || 'Plustek 등'})`;
      } else {
        scanMethodDesc = `${scan.scan_method} (${scan.scanner_model || '기타 장비'})`;
      }

      textToCopy = [
        `📁 [폴더명] ${scan.folder_name}`,
        `🎞️ [필름] ${filmName}`,
        `📷 [바디] ${cameraName}`,
        `🔍 [렌즈] ${lensName}`,
        `🧪 [현상] ${devInfo}`,
        `🖨️ [스캔] ${scanMethodDesc} | ${scan.total_frames}컷 (${scan.software_used || 'Negative Lab Pro'})`,
        `📅 [일자] ${scan.scan_date}`,
        scan.storage_path ? `🌐 [경로] ${scan.storage_path}` : null,
        scan.notes ? `📝 [메모] ${scan.notes}` : null,
      ].filter(Boolean).join('\n');
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopiedInspectFolder(true);
      setTimeout(() => setIsCopiedInspectFolder(false), 2500);
    }
  };

  // Jump to Cloud or local storage from folder inspector
  const handleJumpToCloudStorage = (scan: ScanLog) => {
    const rawPath = scan.storage_path?.trim();
    if (!rawPath) {
      alert(
        `📁 [${scan.folder_name}]\n등록된 클라우드 링크나 저장 경로가 없습니다.\n정보창 하단의 [복사하기]를 이용하시거나 상단에서 스캔 등록 시 경로를 입력해주세요.`
      );
      return;
    }

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      window.open(rawPath, '_blank', 'noopener,noreferrer');
    } else if (rawPath.startsWith('file://')) {
      const cleanPath = rawPath.replace('file://', '');
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(cleanPath);
        setIsCopiedInspectFolder(true);
        setTimeout(() => setIsCopiedInspectFolder(false), 2500);
      }
      alert(`📂 로컬 경로가 복사되었습니다!\n\n경로: ${cleanPath}\n\n💡 Mac Finder에서 Cmd + Shift + G를 누른 후 붙여넣기(Cmd + V)하면 즉시 해당 폴더가 열립니다.`);
    } else {
      // Local computer path
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(rawPath);
        setIsCopiedInspectFolder(true);
        setTimeout(() => setIsCopiedInspectFolder(false), 2500);
      }
      alert(`📂 로컬 컴퓨터 경로가 클립보드에 복사되었습니다!\n\n경로: ${rawPath}\n\n💡 Mac Finder에서 [Cmd + Shift + G] (폴더로 이동)를 누르고 붙여넣기(Cmd + V)하면 해당 외장하드/로컬 폴더로 바로 이동합니다.`);
    }
  };

  // Ruler Chapters Configuration (ArtCraft / Studio style)
  const RULER_CHAPTERS = useMemo(
    () => [
      { id: 'section-films', num: '01', label: 'FILMS', title: '보유 필름 보관소', icon: '🎞️' },
      { id: 'section-gear', num: '02', label: 'GEAR', title: '카메라 & 렌즈', icon: '📷' },
      { id: 'section-shooting', num: '03', label: 'LOAD', title: '장전 & 출사 기록', icon: '☀️' },
      { id: 'section-development', num: '04', label: 'DEV', title: '암실 현상 레시피', icon: '🧪' },
      { id: 'section-scans', num: '05', label: 'SCAN', title: '디지타이징 & 스캔', icon: '🖨️' },
      { id: 'mac-finder-desktop-vault', num: '06', label: 'VAULT', title: '맥북 마스터 보관소', icon: '📁' },
    ],
    []
  );

  // Smooth Scroll Jump
  const scrollToChapter = (sectionId: string) => {
    setActiveChapter(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Right Edge Ruler Mouse Move & Leave Handlers (Fisheye Proximity Zoom)
  const handleRulerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerTrackRef.current) return;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setRulerHoverY(relativeY);
    setIsRulerHovered(true);
  };

  const handleRulerMouseLeave = () => {
    setRulerHoverY(null);
    setIsRulerHovered(false);
  };

  // Scroll Spy for Chapter Indicator & Exact Caliper Ruler Needle Alignment
  useEffect(() => {
    const updateRulerAndScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / totalHeight)));
      }

      const chapterIds = [
        'section-films',
        'section-gear',
        'section-shooting',
        'section-development',
        'section-scans',
        'mac-finder-desktop-vault',
      ];

      // Measure section page offsets
      const sectionTops: number[] = chapterIds.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });

      // Measure track node center Y positions in pixels
      const nodeYs: number[] = chapterIds.map((id) => {
        const el = rulerNodeRefs.current[id];
        if (el) {
          return el.offsetTop + el.offsetHeight / 2;
        }
        return 0;
      });

      // Focal offset: The pixel point below viewport top where section content enters primary view
      const focalOffset = 180;
      const currentScrollTarget = scrollY + focalOffset;

      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 60;

      // Find current section interval
      let currIdx = 0;
      if (isAtBottom) {
        currIdx = chapterIds.length - 1;
      } else {
        for (let i = 0; i < sectionTops.length; i++) {
          if (currentScrollTarget >= sectionTops[i]) {
            currIdx = i;
          } else {
            break;
          }
        }
      }

      setActiveChapter(chapterIds[currIdx]);

      // Calculate exact interpolated needle Y in pixels, perfectly matching active chapter tick!
      if (nodeYs.length > 0 && nodeYs[currIdx] !== undefined) {
        if (currIdx >= chapterIds.length - 1 || isAtBottom) {
          const lastY = nodeYs[chapterIds.length - 1];
          if (lastY > 0) setNeedleY(lastY);
        } else {
          const nextIdx = currIdx + 1;
          const startScroll = sectionTops[currIdx];
          const endScroll = sectionTops[nextIdx];
          const scrollSpan = Math.max(1, endScroll - startScroll);
          const ratio = Math.max(0, Math.min(1, (currentScrollTarget - startScroll) / scrollSpan));

          const startNodeY = nodeYs[currIdx];
          const endNodeY = nodeYs[nextIdx];
          if (startNodeY > 0 && endNodeY > 0) {
            const interpolatedY = startNodeY + ratio * (endNodeY - startNodeY);
            setNeedleY(interpolatedY);
          } else if (startNodeY > 0) {
            setNeedleY(startNodeY);
          }
        }
      }
    };

    updateRulerAndScroll();
    window.addEventListener('scroll', updateRulerAndScroll, { passive: true });
    window.addEventListener('resize', updateRulerAndScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateRulerAndScroll);
      window.removeEventListener('resize', updateRulerAndScroll);
    };
  }, []);

  // Continuous Bidirectional Scroll Reveal Observer (Apple-style enter & exit re-trigger)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            // When an element leaves the viewport, remove 'revealed'
            // so scrolling back into view smoothly animates again every time!
            entry.target.classList.remove('revealed');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.06,
      }
    );

    const observedElements = new WeakSet<Element>();

    const checkAndObserve = () => {
      const targets = document.querySelectorAll('.reveal-on-scroll');
      targets.forEach((target) => {
        if (!observedElements.has(target)) {
          observer.observe(target);
          observedElements.add(target);
          const rect = target.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            target.classList.add('revealed');
          }
        }
      });
    };

    checkAndObserve();

    const container = document.querySelector('.apple-studio-container');
    let mutationObserver: MutationObserver | null = null;
    if (container) {
      mutationObserver = new MutationObserver(() => {
        checkAndObserve();
      });
      mutationObserver.observe(container, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, []);

  // Handlers for Shooting Outings
  const handleAddOutingSession = () => {
    setOutings((prev) => [
      ...prev,
      {
        id: `session-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        weather: 'sunny',
        location: '',
        shots: 6,
        notes: '',
      },
    ]);
  };

  const handleUpdateOuting = (
    id: string,
    field: 'date' | 'weather' | 'location' | 'shots' | 'notes',
    value: any
  ) => {
    setOutings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveOuting = (id: string) => {
    if (outings.length === 1) return;
    setOutings((prev) => prev.filter((s) => s.id !== id));
  };

  // Quick Add Film Batch (Supports adding multiple batches with freshness options: 로리, 노괴, 틀딱)
  const handleQuickAddFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilmName.trim() || !newFilmBrand.trim()) {
      alert('필름 이름과 제조사를 입력해주세요.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isAutoExpired =
      newFilmFreshness === 'fresh'
        ? false
        : newFilmFreshness === 'deep_expired' || newFilmFreshness === 'expired'
        ? true
        : newFilmExpiry ? newFilmExpiry < todayStr : false;

    let finalExpiry = newFilmExpiry.trim();
    if (!finalExpiry) {
      if (newFilmFreshness === 'fresh') finalExpiry = '유통기한 미상 (로리/싱싱)';
      else if (newFilmFreshness === 'deep_expired') finalExpiry = '유통기한 미상 (틀딱/푹썩필)';
      else finalExpiry = '유통기한 미상 (노괴/썩필)';
    }

    const newFilm: FilmItem = {
      id: `film-${Date.now()}`,
      name: newFilmName.trim(),
      brand: newFilmBrand.trim(),
      type: newFilmType,
      format: newFilmFormat,
      iso: Number(newFilmIso) || 200,
      expiry_date: finalExpiry,
      storage_method: newFilmStorage,
      is_bulk_rolled: false,
      is_expired: isAutoExpired,
      freshness_status: newFilmFreshness,
      is_rebranded: false,
      quantity: Number(newFilmQuantity) || 1,
      frames_per_roll: newFilmFormat === '135' ? 36 : 12,
      notes: newFilmNotes.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveFilm(newFilm);
    setSelectedFilmId(newFilm.id);
    setIsAddFilmOpen(false);
    const freshnessLabel =
      newFilmFreshness === 'fresh'
        ? '🌸 로리 (싱싱)'
        : newFilmFreshness === 'deep_expired'
        ? '💀 틀딱 (푹썩필)'
        : '⚠️ 노괴 (썩필)';
    alert(`✨ [${newFilm.name}] (${freshnessLabel}, ${newFilm.quantity}롤)이 보관함에 새 배치로 등록되었습니다!`);
  };

  // Select an already loaded shooting roll to continue logging
  const handleSelectLoadedRoll = (roll: ShootingRoll) => {
    setActiveShootingRollId(roll.id);
    setRollTitle(roll.title);
    if (roll.film_id) setSelectedFilmId(roll.film_id);
    if (roll.camera_id) setSelectedCameraId(roll.camera_id);
    if (roll.lens_id) setSelectedLensId(roll.lens_id);
    if (roll.loaded_date) setLoadedDate(roll.loaded_date);
    if (roll.iso_rated) setIsoRated(roll.iso_rated);
    if (roll.unloaded_date) setUnloadedDate(roll.unloaded_date);

    if (roll.shooting_sessions && roll.shooting_sessions.length > 0) {
      setOutings(
        roll.shooting_sessions.map((s) => ({
          id: s.id,
          date: s.date,
          weather: s.weather,
          location: s.location || '',
          shots: Number(s.shots_taken) || 0,
          notes: s.notes || '',
        }))
      );
    } else {
      setOutings([
        {
          id: `session-${Date.now()}`,
          date: roll.loaded_date || new Date().toISOString().split('T')[0],
          weather: 'sunny',
          location: '',
          shots: roll.total_shots || 0,
          notes: roll.notes || '',
        },
      ]);
    }
  };

  // Start fresh with a new roll to load
  const handleStartNewRoll = () => {
    setActiveShootingRollId(null);
    const today = new Date().toISOString().split('T')[0];
    setLoadedDate(today);
    setUnloadedDate(today);
    if (selectedFilm) {
      setRollTitle(`#${today.slice(0, 7)} ${selectedFilm.name} 첫 롤`);
      setIsoRated(selectedFilm.iso);
    } else {
      setRollTitle('');
      setIsoRated(200);
    }
    setOutings([
      {
        id: `session-${Date.now()}`,
        date: today,
        weather: 'sunny',
        location: '',
        shots: 12,
        notes: '',
      },
    ]);
  };

  // Camera Photo Upload (FileReader -> Base64)
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
        setNewCamImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save New Camera
  const handleSaveNewCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamBrand.trim() || !newCamModel.trim()) {
      alert('제조사와 모델명을 입력해주세요.');
      return;
    }

    const newCam: CameraItem = {
      id: `cam-${Date.now()}`,
      brand: newCamBrand.trim(),
      model: newCamModel.trim(),
      format: newCamFormat,
      lens_type: newCamLensType,
      mount: newCamLensType === 'interchangeable' && newCamMount.trim() ? newCamMount.trim() : undefined,
      fixed_lens_name: newCamLensType === 'fixed' && newCamFixedName.trim() ? newCamFixedName.trim() : undefined,
      fixed_focal_length: newCamLensType === 'fixed' && newCamFixedFocal ? Number(newCamFixedFocal) : undefined,
      fixed_max_aperture: newCamLensType === 'fixed' && newCamFixedAperture ? Number(newCamFixedAperture) : undefined,
      status: newCamStatus,
      serial_number: newCamSerial.trim() || undefined,
      image_url: newCamImage || undefined,
      notes: newCamNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    await onSaveCamera(newCam);
    setSelectedCameraId(newCam.id);
    setIsAddCameraOpen(false);
    setNewCamImage('');
    setNewCamNotes('');
    setNewCamSerial('');
    setNewCamMount('Leica M');
    alert(`📷 [${newCam.brand} ${newCam.model}] 카메라가 성공적으로 등록되었습니다!`);
  };

  // Helper to open Add Lens modal with intelligent pre-selected camera mount
  const handleOpenAddLensModal = () => {
    if (selectedCamera?.mount && selectedCamera.lens_type !== 'fixed') {
      setNewLensMount(selectedCamera.mount);
    } else if (availableCameraMounts.length > 0) {
      setNewLensMount(availableCameraMounts[0]);
    } else {
      setNewLensMount('');
    }
    setIsAddLensOpen(true);
  };

  // Lens Photo Upload (FileReader -> Base64)
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
        setNewLensImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save New Lens
  const handleSaveNewLens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLensBrand.trim() || !newLensName.trim()) {
      alert('렌즈 제조사와 렌즈명을 입력해주세요.');
      return;
    }

    const minFocal = Number(newLensFocalMin) || 50;
    const maxFocal =
      newLensCategory === 'zoom'
        ? Number(newLensFocalMax) || minFocal
        : minFocal;

    const newLens: LensItem = {
      id: `lens-${Date.now()}`,
      brand: newLensBrand.trim(),
      name: newLensName.trim(),
      format_compatibility: newLensFormat || '135',
      lens_category: newLensCategory,
      focal_length_min: minFocal,
      focal_length_max: maxFocal,
      max_aperture: Number(newLensMaxAperture) || 2.0,
      mount: newLensMount.trim() || undefined,
      status: newLensStatus,
      serial_number: newLensSerial.trim() || undefined,
      image_url: newLensImage || undefined,
      notes: newLensNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    await onSaveLens(newLens);
    setSelectedLensId(newLens.id);
    setIsAddLensOpen(false);
    setNewLensImage('');
    setNewLensNotes('');
    setNewLensSerial('');
    alert(`🔍 [${newLens.brand} ${newLens.name}] 렌즈가 성공적으로 등록 및 자동 마운트되었습니다!`);
  };

  // 1. Submit Shooting Roll (Save as Loaded or Unloaded)
  const handleCreateShootingRoll = async (shouldUnload: boolean = false) => {
    if (!selectedFilm || !selectedCamera) return;

    const totalShotsCount = outings.reduce((acc, s) => acc + (Number(s.shots) || 0), 0);

    // [A] Case 1: Updating an already loaded roll
    if (activeShootingRollId) {
      const existingRoll = rolls.find((r) => r.id === activeShootingRollId);
      const updatedRoll: ShootingRoll = {
        ...(existingRoll || {}),
        id: activeShootingRollId,
        title: rollTitle || existingRoll?.title || `${selectedFilm.name} 출사롤`,
        film_id: selectedFilm.id,
        film_name_snapshot: selectedFilm.name,
        camera_id: selectedCamera.id,
        camera_name_snapshot: `${selectedCamera.brand} ${selectedCamera.model}`,
        lens_id: selectedLens?.id,
        lens_name_snapshot:
          selectedCamera.lens_type === 'fixed'
            ? selectedCamera.fixed_lens_name
            : selectedLens
              ? `${selectedLens.brand} ${selectedLens.name}`
              : undefined,
        loaded_date: loadedDate,
        unloaded_date: shouldUnload ? unloadedDate : undefined,
        status: shouldUnload ? 'unloaded' : 'loaded',
        shooting_sessions: outings.map((s) => ({
          id: s.id,
          date: s.date,
          weather: s.weather,
          location: s.location || '출사 장소 미입력',
          shots_taken: Number(s.shots) || 0,
          notes: s.notes,
        })),
        iso_rated: isoRated,
        total_shots: totalShotsCount,
        dev_type: existingRoll?.dev_type || 'none',
        dev_quantity_rolls: existingRoll?.dev_quantity_rolls || 1,
        notes: `장전 완료: ${loadedDate}${shouldUnload ? ` / 촬영 종료: ${unloadedDate}` : ''}`,
        created_at: existingRoll?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await onSaveRoll(updatedRoll, existingRoll);

      if (shouldUnload) {
        setActiveShootingRollId(null);
        setDevSelectedRollId(updatedRoll.id);
        setTimeout(() => {
          scrollToChapter('section-development');
        }, 300);
        alert(
          `🎉 [${updatedRoll.title}] 촬영을 종료하고 필름을 꺼냈습니다!\n(※ 이미 장전 시 1롤이 차감되었으므로 추가 차감되지 않습니다.)\n- 암실 현상 대기 목록으로 이동합니다.`
        );
      } else {
        alert(
          `💾 [${updatedRoll.title}] 장전된 롤의 출사 기록이 업데이트되었습니다!\n(계속해서 다음 출사일을 추가할 수 있습니다.)`
        );
      }
      return;
    }

    // [B] Case 2: Creating a brand new roll
    if (selectedFilm.quantity <= 0) {
      const proceed = confirm(
        `⚠️ [${selectedFilm.name}]은(는) 현재 보유 잔여 수량이 0롤입니다.\n재고 차감 없이 계속 장전하시겠습니까?`
      );
      if (!proceed) return;
    }

    const newRollId = `roll-${Date.now()}`;
    const newRoll: ShootingRoll = {
      id: newRollId,
      title: rollTitle || `${selectedFilm.name} 출사롤`,
      film_id: selectedFilm.id,
      film_name_snapshot: selectedFilm.name,
      camera_id: selectedCamera.id,
      camera_name_snapshot: `${selectedCamera.brand} ${selectedCamera.model}`,
      lens_id: selectedLens?.id,
      lens_name_snapshot:
        selectedCamera.lens_type === 'fixed'
          ? selectedCamera.fixed_lens_name
          : selectedLens
            ? `${selectedLens.brand} ${selectedLens.name}`
            : undefined,
      loaded_date: loadedDate,
      unloaded_date: shouldUnload ? unloadedDate : undefined,
      status: shouldUnload ? 'unloaded' : 'loaded',
      shooting_sessions: outings.map((s) => ({
        id: s.id,
        date: s.date,
        weather: s.weather,
        location: s.location || '출사 장소 미입력',
        shots_taken: Number(s.shots) || 0,
        notes: s.notes,
      })),
      iso_rated: isoRated,
      total_shots: totalShotsCount,
      dev_type: 'none',
      dev_quantity_rolls: 1,
      notes: `장전 완료: ${loadedDate}${shouldUnload ? ` / 촬영 종료: ${unloadedDate}` : ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveRoll(newRoll);

    if (shouldUnload) {
      setDevSelectedRollId(newRoll.id);
      setTimeout(() => {
        scrollToChapter('section-development');
      }, 300);
      alert(
        `🎉 [${newRoll.title}] 촬영이 완료되어 필름을 꺼냈습니다!\n- [${selectedFilm.name}] 잔여 재고: 1롤 차감 반영\n- 암실 현상 대기 목록으로 이동합니다.`
      );
    } else {
      setActiveShootingRollId(newRollId);
      alert(
        `🎉 [${newRoll.title}] 촬영 롤이 카메라에 성공적으로 장전되었습니다!\n- [${selectedFilm.name}] 잔여 재고: 1롤 차감 반영\n이제 상단 장전 롤 목록에서 언제든 불러와 출사 기록을 추가할 수 있습니다.`
      );
    }
  };

  // 2. Submit Development (Update roll to 'developed')
  const handleCompleteDevelopment = async () => {
    if (!currentDevRoll) {
      alert('현상할 필름 롤을 먼저 선택해 주세요.');
      return;
    }

    const selectedChem = developers.find((d) => d.id === selectedDeveloperId);

    const updatedRoll: ShootingRoll = {
      ...currentDevRoll,
      status: 'developed',
      developed_date: new Date().toISOString().split('T')[0],
      dev_type: devType,
      lab_name: devType === 'lab' ? labName : undefined,
      developer_id: devType === 'self' ? selectedDeveloperId : undefined,
      developer_name_snapshot:
        devType === 'self' && selectedChem
          ? `${selectedChem.manufacturer} ${selectedChem.name}`
          : undefined,
      dilution_ratio: devType === 'self' ? dilutionRatio : undefined,
      dev_temp_celsius: devType === 'self' ? devTemp : undefined,
      dev_time: devType === 'self' ? (devTime.trim() || '9분 30초') : undefined,
      dev_method: devType === 'self' ? agitationMethod : undefined,
      agitation_details: devType === 'self' ? (agitationNotes.trim() || undefined) : undefined,
      updated_at: new Date().toISOString(),
    };

    await onSaveRoll(updatedRoll, currentDevRoll);

    setScanSelectedRollId(updatedRoll.id);
    setTimeout(() => {
      scrollToChapter('section-scans');
    }, 300);
  };

  // 3. Submit Scan Record
  const handleSaveScanRecord = async () => {
    if (!folderName.trim()) {
      alert('저장 폴더명을 입력해 주세요.');
      return;
    }

    const scanRoll = rolls.find((r) => r.id === scanSelectedRollId);
    const newScanId = `scan-${Date.now()}`;

    let finalScannerModel = scannerModel.trim();
    if (scanMethod === 'lab') {
      const labPreset = LAB_SCANNERS.find((ls) => ls.id === labScanner);
      const resText = labResolution === 'high' ? '고화질' : '일반화질';
      if (labScanner === 'other' && customLabScanner.trim()) {
        finalScannerModel = `${customLabScanner.trim()} (${resText})`;
      } else if (labPreset) {
        finalScannerModel = `${labPreset.name} (${resText})`;
      }
    } else if (!finalScannerModel) {
      finalScannerModel = 'Sony A7R IV + 90mm Macro (Cinestill CS-LITE)';
    }

    const newScan: ScanLog = {
      id: newScanId,
      roll_id: scanRoll?.id,
      is_legacy_archive: !scanRoll,
      film_title: scanRoll
        ? `${scanRoll.film_name_snapshot} (${scanRoll.title})`
        : folderName,
      camera_lens_info: scanRoll
        ? `${scanRoll.camera_name_snapshot}${scanRoll.lens_name_snapshot ? ` + ${scanRoll.lens_name_snapshot}` : ''}`
        : '자유 기재 아카이브',
      scan_method: scanMethod,
      scanner_id: scanMethod !== 'lab' && selectedScannerId ? selectedScannerId : undefined,
      scanner_model: finalScannerModel,
      lab_scanner: scanMethod === 'lab' ? (labScanner === 'other' ? customLabScanner.trim() || '기타' : labScanner) : undefined,
      lab_resolution: scanMethod === 'lab' ? labResolution : undefined,
      total_frames: Number(scanFrames) || 36,
      folder_name: folderName.trim(),
      storage_path: folderUrl.trim() || undefined,
      folder_color: folderColor,
      software_used: scanSoftware.trim() || 'Negative Lab Pro v3.0',
      scan_date: new Date().toISOString().split('T')[0],
      notes: scanNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    await onSaveScan(newScan);
    setNewlyAddedScanId(newScanId);

    // Smooth scroll down to Mac Finder Folders view
    setTimeout(() => {
      macFinderVaultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);

    alert(`✨ [${folderName}] 스캔 폴더가 macOS 파인더 아카이브에 영구 등록되었습니다!`);
  };

  const handleSaveNewScanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScannerName.trim()) {
      alert('장비명을 입력해 주세요.');
      return;
    }

    const item: ScannerItem = {
      id: `scanner-${Date.now()}`,
      name: newScannerName.trim(),
      category: newScannerCategory,
      brand: newScannerBrand.trim() || undefined,
      sensor_or_light: newScannerLight.trim() || undefined,
      holder_type: newScannerHolder.trim() || undefined,
      notes: newScannerNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    if (onSaveScanner) {
      await onSaveScanner(item);
    }

    setSelectedScannerId(item.id);
    setScannerModel(item.name);
    setIsAddScannerOpen(false);
    setNewScannerName('');
    alert(`✨ [${item.name}] 장비가 보유 스캐너 장비함에 등록되었습니다!`);
  };

  // Copy folder name helper
  const handleCopyFolder = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(folderName);
      setIsCopiedFolder(true);
      setTimeout(() => setIsCopiedFolder(false), 2000);
    }
  };

  return (
    <div className="apple-studio-container">
      {/* ============================================================
          TOP FIXED GLASS HEADER HUD
          ============================================================ */}
      <header className="apple-top-hud">
        <div className="hud-left">
          <div className="hud-brand-pill">
            <span className="hud-logo-icon">🎞️</span>
            <span className="hud-brand-title">FilmOpener</span>
            <span className="hud-mode-tag">Studio Flow</span>
          </div>

          {/* Direct Stage Badges (Click to Jump Directly!) */}
          <div className="hud-stage-badges">
            <button
              className={`stage-jump-btn amber ${pendingDevRolls.length > 0 ? 'pulse' : ''}`}
              onClick={() => scrollToChapter('section-development')}
              title="현상 대기 중인 필름으로 스크롤 이동"
            >
              <FlaskConical size={14} />
              <span>현상 대기: <strong>{pendingDevRolls.length}롤</strong></span>
              <ArrowRight size={12} />
            </button>

            <button
              className={`stage-jump-btn emerald ${pendingScanRolls.length > 0 ? 'pulse' : ''}`}
              onClick={() => scrollToChapter('section-scans')}
              title="스캔 대기 중인 필름으로 스크롤 이동"
            >
              <FolderArchive size={14} />
              <span>스캔 대기: <strong>{pendingScanRolls.length}롤</strong></span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="hud-right">
          {/* Switch to Full Table View */}
          <button
            className="hud-mode-switch-btn"
            onClick={onSwitchToTableView}
            title="스튜디오 데이터 관리 테이블 모드로 전환"
          >
            <Sliders size={14} />
            <span>테이블 인벤토리 모드</span>
          </button>

          {/* Settings Modal Button */}
          <button className="hud-icon-btn" onClick={onOpenSettings} title="환경설정">
            <Settings size={16} />
          </button>

          {/* Auth Email & Logout */}
          {userEmail && (
            <div className="hud-user-pill">
              <span className="hud-user-dot" />
              <span className="hud-user-email">{userEmail}</span>
              {onLogout && (
                <button className="hud-logout-btn" onClick={onLogout} title="로그아웃">
                  <LogOut size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ============================================================
          APPLE HERO INTRO (Cinematic Title & Philosophy)
          ============================================================ */}
      <section className="apple-hero-section">
        <div className="hero-glow-orb" />
        <div className="hero-content">
          <div className="hero-kicker hero-reveal-1">
            <Sparkles size={16} /> The Art of Pure Analog Workflow
          </div>
          {/* Photography Master Quote Headline (해외 유명 사진작가 명언 랜덤 렌더링) */}
          <div className="hero-quote-wrapper hero-reveal-2">
            <div className="hero-quote-symbol">“</div>
            <h1 className={`hero-headline hero-quote-title ${isQuoteFading ? 'fading' : ''}`}>
              {currentQuote.quoteKo}
            </h1>
            <div className="hero-quote-meta">
              <div className="hero-quote-author">
                <span className="author-dash">—</span>
                <span className="author-ko">{currentQuote.authorKo}</span>
                <span className="author-en">({currentQuote.authorEn})</span>
              </div>
              {currentQuote.note && (
                <span className="hero-quote-note">{currentQuote.note}</span>
              )}
              <button
                type="button"
                className="hero-quote-shuffle-btn"
                onClick={handleShuffleQuote}
                title="다른 사진작가의 명언 보기"
              >
                <RefreshCw size={12} className={isQuoteFading ? 'spin-anim' : ''} />
                <span>명언 새로고침</span>
              </button>
            </div>
            {currentQuote.quoteEn && (
              <p className={`hero-quote-en ${isQuoteFading ? 'fading' : ''}`}>
                &ldquo;{currentQuote.quoteEn}&rdquo;
              </p>
            )}
          </div>
          <p className="hero-subline hero-reveal-3">
            필름 선택부터 카메라 결합, 출사 로깅, 정밀 암실 현상과 마스터 디지털 스캔까지.<br />
            아날로그 필름 사진의 모든 호흡을 하나의 인터랙티브 스토리로 기록합니다.
          </p>

          <div className="hero-action-row hero-reveal-4">
            <button
              className="apple-primary-btn"
              onClick={() => scrollToChapter('section-films')}
            >
              <span>필름 보관함 열기</span>
              <ChevronDown size={16} />
            </button>
            <div className="hero-stats-strip">
              <span>보유 필름 <strong>{films.reduce((a, b) => a + b.quantity, 0)}롤</strong></span>
              <span className="divider">•</span>
              <span>등록 바디 <strong>{cameras.length}대</strong></span>
              <span className="divider">•</span>
              <span>보유 렌즈 <strong>{lenses.length}개</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 1: THE FILM SHELF (보유 필름 책장 보관소)
          ============================================================ */}
      <section id="section-films" className="apple-chapter-section">
        <div className="chapter-header">
          <div className="chapter-index reveal-on-scroll">CHAPTER 01</div>
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">필름 진열대 (The Film Shelf)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            따먹을 필름을 초이스하세요.
          </p>

          {/* Film Shelf Reorder / Sort Mode Cycler Bar */}
          <div className="shelf-control-bar reveal-on-scroll reveal-delay-2">
            <div className="shelf-sort-badge-group">
              <span className="shelf-sort-label">정렬 기준</span>
              <div className="shelf-sort-current-pill">
                <span className="pill-icon">{currentSortMode.icon}</span>
                <span className="pill-text">{currentSortMode.label}</span>
                <span className="pill-desc">({currentSortMode.desc})</span>
              </div>
            </div>

            <div className="shelf-reorder-actions">
              <button
                type="button"
                className={`apple-reorder-btn ${isShelfReloading ? 'reloading' : ''}`}
                onClick={handleCycleSortMode}
                title="클릭할 때마다 정렬 방식이 순환 변경됩니다 (유통기한 ➔ 브랜드 ➔ 필름 종류 ➔ ISO ➔ 수량 ➔ 이름)"
              >
                <Sparkles size={15} className={`reorder-sparkle-icon ${isShelfReloading ? 'spin' : ''}`} />
                <span className="reorder-btn-text">재정렬</span>
                <span className="reorder-cycle-tag">
                  {filmSortIndex + 1}/{FILM_SORT_MODES.length} ↻
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Realistic Wooden / Anodized Shelf Rack */}
        <div className="film-shelf-rack reveal-on-scroll reveal-scale reveal-delay-1">
          <div className="shelf-top-backplate" />

          <div
            className={`shelf-grid ${isShelfReloading ? 'shelf-reloading' : ''}`}
            key={`shelf-cycle-${sortCycleCount}`}
          >
            {sortedFilms.map((film, fIndex) => (
              <div
                key={`${film.id}-${sortCycleCount}`}
                className="shelf-item-canister-anim"
                style={{
                  animationDelay: `${Math.min(0.04 * fIndex, 0.35)}s`,
                }}
              >
                <FilmCanister3D
                  film={film}
                  isSelected={selectedFilmId === film.id}
                  onClick={() => setSelectedFilmId(film.id)}
                  actionLabel="카메라에 삽입"
                />
              </div>
            ))}

            {/* + Add New Batch Slot on the Shelf */}
            <div>
              <div
                className="add-film-shelf-slot"
                onClick={() => setIsAddFilmOpen(true)}
                title="새 필름 배치 등록 (같은 이름이라도 유통기한/썩필/보관법 개별 등록)"
              >
                <div className="add-slot-plus">
                  <Plus size={22} />
                </div>
                <span className="add-slot-text">새 필름 등록</span>
              </div>
            </div>
          </div>

          <div className="shelf-wood-plank">
            <div className="shelf-grain-highlight" />
            <div className="shelf-shadow-groove" />
          </div>
        </div>

        {/* Selected Film Preview Tray */}
        {selectedFilm && (
          <div className="selection-tray-banner reveal-on-scroll reveal-delay-2">
            <div className="tray-info">
              <span className="tray-label">선택된 필름</span>
              <h3 className="tray-title">{selectedFilm.name}</h3>
              <p className="tray-sub">
                ISO {selectedFilm.iso} • {selectedFilm.format === '135' ? '35mm' : selectedFilm.format} •{' '}
                {selectedFilm.frames_per_roll}컷 • 유통기한 {selectedFilm.expiry_date}
              </p>
            </div>
            <button
              className="tray-next-btn"
              onClick={() => scrollToChapter('section-gear')}
            >
              <span>카메라와 결합하기</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ============================================================
          CHAPTER 2: GEAR VAULT & MOUNT MATCHING (기재실 & 마운트 매칭)
          ============================================================ */}
      <section id="section-gear" className="apple-chapter-section">
        <div className="chapter-header">
          <div className="chapter-index reveal-on-scroll">CHAPTER 02</div>
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">카메라 & 렌즈 선택 (The Gear Rig)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            선택한 카메라에 렌즈를 매칭하세요.
            곧 촬영이 시작됩니다.
          </p>
        </div>

        <div className="gear-rig-workspace">
          {/* Camera Showcase Cards */}
          <div className="cameras-showcase-column reveal-on-scroll reveal-delay-1">
            <div className="column-title-row">
              <h3 className="column-title">1. 카메라 바디 선택</h3>
              <button
                type="button"
                className="apple-mini-add-btn"
                onClick={() => setIsAddCameraOpen(true)}
              >
                <Plus size={14} />
                <span>새 카메라 추가</span>
              </button>
            </div>
            <div className="camera-cards-list">
              {cameras.map((camera, cIndex) => {
                const isSelected = selectedCameraId === camera.id;
                const isBroken = camera.status !== 'active';

                return (
                  <div
                    key={camera.id}
                    className={`camera-visual-card ${isSelected ? 'selected' : ''} ${isBroken ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!isBroken) setSelectedCameraId(camera.id);
                    }}
                  >
                    <div className="cam-card-top">
                      <div className="cam-brand-badge">{camera.brand.toUpperCase()}</div>
                      <span className={`cam-status-pill ${camera.status}`}>
                        {camera.status === 'active'
                          ? '정상 작동'
                          : camera.status === 'needs_repair'
                            ? '수리 필요 (선택 불가)'
                            : '수리 입고 중'}
                      </span>
                    </div>

                    <div className="cam-graphic-wrapper">
                      {camera.image_url ? (
                        <div className="camera-photo-wrapper">
                          <img
                            src={camera.image_url}
                            alt={camera.model}
                            className="camera-real-photo"
                          />
                          <div className="camera-photo-overlay" />
                        </div>
                      ) : (
                        /* Stylized Vector Camera Graphic */
                        <div className="camera-vector-body">
                          <div className="cam-top-plate">
                            <div className="cam-shutter-dial" />
                            <div className="cam-winder-lever" />
                            <div className="cam-viewfinder-window" />
                          </div>
                          <div className="cam-leatherette-grip">
                            <div className="cam-red-dot" />
                            <div className="cam-bayonet-mount">
                              <div className="mount-inner-throat">
                                <span className="mount-text">
                                  {camera.lens_type === 'fixed'
                                    ? 'FIXED'
                                    : camera.mount || 'BAYONET'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="cam-details">
                      <h4 className="cam-model-title">{camera.model}</h4>
                      <p className="cam-specs">
                        {camera.format === '135_full'
                          ? '35mm 풀프레임'
                          : camera.format === '120_66'
                            ? '중형 6x6'
                            : camera.format}{' '}
                        •{' '}
                        {camera.lens_type === 'fixed'
                          ? `일체형 (${camera.fixed_lens_name})`
                          : camera.mount
                            ? `마운트: ${camera.mount}`
                            : '렌즈 교환식'}
                      </p>
                      {camera.notes && <p className="cam-notes">{camera.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mount Matched Lenses Column */}
          <div className="lenses-showcase-column reveal-on-scroll reveal-delay-2">
            <div className="column-title-row">
              <h3 className="column-title">
                2. 마운트 호환 렌즈 매칭{' '}
                {selectedCamera?.lens_type === 'fixed' ? (
                  <span className="fixed-notice">(일체형 렌즈 고정)</span>
                ) : (
                  <span className="mount-notice">
                    ({selectedCamera?.mount ? `${selectedCamera.mount} 마운트 • ` : ''}
                    {compatibleLenses.length}개 호환)
                  </span>
                )}
              </h3>
              <button
                type="button"
                className="apple-mini-add-btn"
                onClick={handleOpenAddLensModal}
                title="보유 카메라 마운트 기반으로 새 렌즈 추가"
              >
                <Plus size={14} />
                <span>새 렌즈 추가</span>
              </button>
            </div>

            {selectedCamera?.lens_type === 'fixed' ? (
              <div className="fixed-lens-spotlight-card">
                <div className="spotlight-badge">바디 일체형 광학계</div>
                <h4>{selectedCamera.fixed_lens_name}</h4>
                <p>
                  초점거리: {selectedCamera.fixed_focal_length}mm • 최대개방 f/
                  {selectedCamera.fixed_max_aperture}
                </p>
                <div className="mounted-stamp">✓ 결합 완료 (Fixed Lens)</div>
              </div>
            ) : (
              <div className="lens-cards-list">
                {compatibleLenses.map((lens) => {
                  const isMounted = selectedLensId === lens.id;

                  return (
                    <div
                      key={lens.id}
                      className={`lens-visual-card ${isMounted ? 'mounted' : ''}`}
                      onClick={() => setSelectedLensId(lens.id)}
                    >
                      {lens.image_url ? (
                        <div className="lens-photo-wrapper">
                          <img
                            src={lens.image_url}
                            alt={lens.name}
                            className="lens-real-photo"
                          />
                          <div className="lens-photo-overlay" />
                        </div>
                      ) : (
                        <div className="lens-graphic-barrel">
                          <div className="lens-front-element">
                            <div className="lens-glass-reflection" />
                          </div>
                          <div className="lens-aperture-scale">
                            <span>1: {lens.max_aperture}</span>
                          </div>
                        </div>
                      )}

                      <div className="lens-info">
                        <div className="lens-brand-tag">{lens.brand}</div>
                        <h4 className="lens-name-text">{lens.name}</h4>
                        <div className="lens-spec-row">
                          <span className="spec-pill">
                            {lens.focal_length_min}mm {lens.lens_category === 'zoom' && `~ ${lens.focal_length_max}mm`}
                          </span>
                          <span className="spec-pill">f/{lens.max_aperture}</span>
                          <span className="spec-mount-pill">{lens.mount || '마운트'}</span>
                        </div>
                      </div>

                      <div className="lens-action-col">
                        {isMounted ? (
                          <span className="mounted-badge">✓ 마운트 결합됨</span>
                        ) : (
                          <button className="mount-btn">마운트 결합</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Assembled Rig Bar */}
        <div className="assembled-rig-footer reveal-on-scroll reveal-delay-2">
          <div className="rig-summary">
            <span className="rig-tag">출사 준비 완료 세트</span>
            <h4>
              [{selectedFilm?.name}] + [{selectedCamera?.brand} {selectedCamera?.model}] + [
              {selectedCamera?.lens_type === 'fixed'
                ? selectedCamera?.fixed_lens_name
                : selectedLens?.name || '렌즈 미선택'}
              ]
            </h4>
          </div>
          <button
            className="apple-primary-btn"
            onClick={() => scrollToChapter('section-shooting')}
          >
            <span>출사 일정 & 날씨 로깅하기</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 3: FIELD SHOOTING & WEATHER LOG (출사 기록 & 로딩)
          ============================================================ */}
      <section id="section-shooting" className="apple-chapter-section">
        <div className="chapter-header">
          <div className="chapter-index reveal-on-scroll">CHAPTER 03</div>
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">출사 일정 & 날씨 로깅 (Field Shooting Log)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            빛과 공기의 상태를 기록하세요. 달력에서 출사일을 고르고 날씨 아이콘을 누르면,
            여러 번의 출사 일정이 하나의 롤에 차곡차곡 축적됩니다.
          </p>
        </div>

        <div className="shooting-workbench-grid">
          {/* Left: Rig Info & Sessions */}
          <div className="sessions-builder-card reveal-on-scroll reveal-scale reveal-delay-1">
            {/* 🎞️ 현재 카메라에 장전되어 촬영 진행 중인 롤 목록 (계속 촬영 지원) */}
            {currentlyLoadedRolls.length > 0 && (
              <div className="loaded-rolls-selector-strip reveal-on-scroll reveal-delay-1">
                <div className="loaded-strip-header">
                  <div className="loaded-strip-title">
                    <span className="rig-pulse-dot" />
                    <span>현재 카메라에 삽입 중인 롤 ({currentlyLoadedRolls.length})</span>
                  </div>
                  <span className="loaded-strip-hint">
                    저장해 둔 롤을 클릭하면 저장했던 출사 정보와 장비 세트가 즉시 복원됩니다.
                  </span>
                </div>
                <div className="loaded-strip-pills">
                  {currentlyLoadedRolls.map((loadedRoll) => {
                    const isCurrent = activeShootingRollId === loadedRoll.id;
                    return (
                      <button
                        key={loadedRoll.id}
                        type="button"
                        className={`loaded-roll-pill ${isCurrent ? 'active' : ''}`}
                        onClick={() => handleSelectLoadedRoll(loadedRoll)}
                        title={`장전일: ${loadedRoll.loaded_date} / 총 ${loadedRoll.total_shots || 0}컷`}
                      >
                        <span className="pill-roll-title">{loadedRoll.title}</span>
                        <span className="pill-badge-info">
                          {loadedRoll.film_name_snapshot} • {loadedRoll.camera_name_snapshot}
                        </span>
                        {isCurrent && <span className="pill-live-tag">선택됨</span>}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={`loaded-roll-pill new-create ${!activeShootingRollId ? 'active' : ''}`}
                    onClick={handleStartNewRoll}
                    title="새로운 필름 롤을 새로 삽입합니다."
                  >
                    <span>+ 새로운 롤 삽입하기</span>
                  </button>
                </div>
              </div>
            )}

            {/* 🎯 현재 선택된 장전 세트 (필름 + 카메라 + 렌즈) 한 줄 표시 */}
            <div className="active-rig-summary-bar reveal-on-scroll reveal-delay-1">
              <div className="rig-bar-label">
                <span className="rig-pulse-dot" />
                <span>
                  {activeShootingRollId
                    ? '현재 선택된 필름 롤:'
                    : '선택될 장비 세트:'}
                </span>
              </div>
              <div className="rig-bar-content">
                <span className="rig-item-pill film" title="선택된 필름">
                  🎞️ <strong>{selectedFilm?.name || '필름 미선택'}</strong>
                  {selectedFilm?.freshness_status === 'deep_expired'
                    ? ' (💀틀딱 푹썩필)'
                    : selectedFilm?.is_expired
                    ? ' (⚠️노괴 썩필)'
                    : selectedFilm?.freshness_status === 'fresh'
                    ? ' (🌸로리)'
                    : ''}
                  <span className="tag-iso">ISO {selectedFilm?.iso}</span>
                </span>
                <span className="rig-plus">+</span>
                <span className="rig-item-pill camera" title="선택된 카메라">
                  📷 <strong>{selectedCamera?.brand} {selectedCamera?.model}</strong>
                  <span className="tag-format">
                    {selectedCamera?.format === '135_full' ? '35mm' : selectedCamera?.format}
                  </span>
                </span>
                <span className="rig-plus">+</span>
                <span className="rig-item-pill lens" title="결합된 렌즈">
                  🔭 <strong>
                    {selectedCamera?.lens_type === 'fixed'
                      ? `${selectedCamera.fixed_lens_name} (일체형)`
                      : selectedLens
                        ? `${selectedLens.brand} ${selectedLens.name}`
                        : '렌즈 미선택'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="card-top-row reveal-on-scroll reveal-delay-2">
              <div className="roll-name-input-group">
                <label>롤 식별명 (Title)</label>
                <input
                  type="text"
                  value={rollTitle}
                  onChange={(e) => setRollTitle(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: #2026-04 제주 성산일출봉과 서촌 골목"
                  className="apple-input large"
                />
              </div>

              <div className="loaded-date-group">
                <label>필름 삽입일 (Loaded Date)</label>
                <input
                  type="date"
                  value={loadedDate}
                  onChange={(e) => setLoadedDate(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div className="iso-rated-group">
                <label>실제 촬영 감도 (ISO)</label>
                <input
                  type="number"
                  value={isoRated}
                  onChange={(e) => setIsoRated(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="apple-input"
                  style={{ width: '100px' }}
                />
              </div>
            </div>

            {/* Outing Sessions List */}
            <div className="outings-section reveal-on-scroll reveal-delay-2">
              <div className="outings-header">
                <h4>출사 일정 기록 (복수 출사 지원)</h4>
                <button
                  type="button"
                  className="add-session-btn"
                  onClick={handleAddOutingSession}
                >
                  <Plus size={14} />
                  <span>출사일 추가</span>
                </button>
              </div>

              <div className="outings-list">
                {outings.map((session, index) => (
                  <div
                    key={session.id}
                    className="outing-session-item"
                  >
                    <div className="session-index-col">
                      <span className="session-number">#{index + 1}</span>
                      {outings.length > 1 && (
                        <button
                          type="button"
                          className="remove-session-btn"
                          onClick={() => handleRemoveOuting(session.id)}
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="session-fields-col">
                      <div className="session-row-1">
                        {/* Date */}
                        <div className="field-group">
                          <label>출사 날짜</label>
                          <input
                            type="date"
                            value={session.date}
                            onChange={(e) =>
                              handleUpdateOuting(session.id, 'date', e.target.value)
                            }
                            className="apple-input"
                          />
                        </div>

                        {/* Location */}
                        <div className="field-group flex-1">
                          <label>출사 장소</label>
                          <input
                            type="text"
                            value={session.location}
                            onChange={(e) =>
                              handleUpdateOuting(session.id, 'location', e.target.value)
                            }
                            onFocus={(e) => e.target.select()}
                            placeholder="예: 을지로 세운상가 옥상, 서촌 골목"
                            className="apple-input"
                          />
                        </div>

                        {/* Shots Taken */}
                        <div className="field-group" style={{ width: '110px' }}>
                          <label>촬영 컷수</label>
                          <input
                            type="number"
                            value={session.shots}
                            onChange={(e) =>
                              handleUpdateOuting(
                                session.id,
                                'shots',
                                Number(e.target.value)
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            className="apple-input"
                          />
                        </div>
                      </div>

                      {/* Weather Selector Pills (Staggered Icon Revealing) */}
                      <div className="session-row-2">
                        <label>날씨 선택:</label>
                        <div className="weather-pills-group">
                          {WEATHER_OPTIONS.map((w) => (
                            <button
                              key={w.type}
                              type="button"
                              className={`weather-pill ${session.weather === w.type ? 'active' : ''}`}
                              onClick={() =>
                                handleUpdateOuting(session.id, 'weather', w.type)
                              }
                            >
                              {w.icon}
                              <span>{w.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="session-row-3">
                        <input
                          type="text"
                          value={session.notes}
                          onChange={(e) =>
                            handleUpdateOuting(session.id, 'notes', e.target.value)
                          }
                          onFocus={(e) => e.target.select()}
                          placeholder="특이사항 메모 (조명, 피사체, 노출 등)"
                          className="apple-input small"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finish Film Unloading Section */}
            <div className="unload-film-box reveal-on-scroll reveal-delay-3">
              <div className="unload-toggle-row">
                <div>
                  <h4 className="unload-title">필름 촬영 완료 및 꺼내기 (Unload)</h4>
                  <p className="unload-desc">
                    필름을 다 찍고 리와인드하여 카메라에서 꺼냈다면, 필름 뺀 날짜를 선택하고
                    현상 대기함으로 즉시 이동시킵니다.
                  </p>
                </div>

                <div className="unload-action-inputs">
                  <div className="unload-date-input">
                    <label>필름 뺀 날짜:</label>
                    <input
                      type="date"
                      value={unloadedDate}
                      onChange={(e) => setUnloadedDate(e.target.value)}
                      className="apple-input"
                    />
                  </div>
                </div>
              </div>

              <div className="unload-btn-group">
                <button
                  type="button"
                  className="apple-secondary-btn"
                  onClick={() => handleCreateShootingRoll(false)}
                >
                  <Camera size={15} />
                  <span>
                    {activeShootingRollId
                      ? '현재 롤 출사 기록 저장 (계속 촬영 중)'
                      : '현재 상태로 장전 저장 (계속 촬영 중)'}
                  </span>
                </button>

                <button
                  type="button"
                  className="apple-primary-btn glow"
                  onClick={() => handleCreateShootingRoll(true)}
                >
                  <FlaskConical size={15} />
                  <span>촬영 종료 및 현상 대기로 보내기</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 4: DARKROOM DEVELOPMENT (암실 현상 관리)
          ============================================================ */}
      <section id="section-development" className="apple-chapter-section">
        <div className="chapter-header">
          <div className="chapter-index reveal-on-scroll">CHAPTER 04</div>
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">암실 현상 공정 (Darkroom Chemistry)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            선택한 필름의 화학 조성(흑백 vs 컬러 vs 영화용)에 따라 올바른 현상액만 정밀하게
            표시됩니다. 희석비, 교반 방식, 온도를 설정하고 필름을 깨워내세요.
          </p>
        </div>

        {/* Pending Dev Rolls Queue Bar */}
        <div className="pending-queue-bar reveal-on-scroll reveal-delay-1">
          <div className="queue-title-row">
            <h4>🧪 현상 대기 중인 필름 목록 ({pendingDevRolls.length}롤)</h4>
            <span className="queue-hint">
              {pendingDevRolls.length === 0
                ? '현재 현상 대기 중인 필름이 없습니다. (위에서 촬영 종료 시 자동 등록)'
                : '현상할 롤을 클릭하면 필름 특성에 맞는 약품이 자동으로 필터링됩니다.'}
            </span>
          </div>

          <div className="queue-chips-row">
            {pendingDevRolls.map((roll) => (
              <button
                key={roll.id}
                type="button"
                className={`queue-chip ${devSelectedRollId === roll.id ? 'active' : ''}`}
                onClick={() => setDevSelectedRollId(roll.id)}
              >
                <span className="chip-name">{roll.title}</span>
                <span className="chip-film">{roll.film_name_snapshot}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dev Film Warning & Smart Filter Notice */}
        <div className="chem-filter-banner reveal-on-scroll reveal-delay-2">
          <div className="banner-icon">
            {isDevFilmBw ? '🖤' : '🌈'}
          </div>
          <div className="banner-text">
            <strong>
              {isDevFilmBw
                ? '흑백 필름 감지: 흑백 전용 현상액만 활성화됨'
                : '컬러 / 영화용 필름 감지: C-41 / ECN-2 화학 공정 활성화'}
            </strong>
            <p>
              선택된 대상: <strong>{currentDevRoll?.title || selectedFilm?.name}</strong>{' '}
              ({currentDevFilm?.name || selectedFilm?.name}).{' '}
              {isDevFilmBw
                ? '오염 및 유제 손상을 방지하기 위해 컬러 현상액(C-41)은 목록에서 자동으로 제외되었습니다.'
                : '흑백 현상액은 제외되고 전용 컬러 화학 키트가 표시됩니다.'}
            </p>
          </div>
        </div>

        {/* Chemistry Workbench */}
        <div className="chem-workbench-grid">
          {/* Left: Chemical Bottles Showcase */}
          <div className="chem-bottles-column reveal-on-scroll reveal-delay-2">
            <div className="dev-type-segmented">
              <button
                type="button"
                className={`seg-btn ${devType === 'self' ? 'active' : ''}`}
                onClick={() => setDevType('self')}
              >
                자가 현상 (Darkroom Bench)
              </button>
              <button
                type="button"
                className={`seg-btn ${devType === 'lab' ? 'active' : ''}`}
                onClick={() => setDevType('lab')}
              >
                현상소 위탁 (Lab Drop-off)
              </button>
            </div>

            {devType === 'self' ? (
              <div className="bottles-grid">
                {filteredDevelopers.map((chem, bIndex) => {
                  const isSelected = selectedDeveloperId === chem.id;

                  return (
                    <div
                      key={chem.id}
                      className={`chem-bottle-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDeveloperId(chem.id)}
                    >
                      <div className="bottle-visual-wrapper">
                        {/* Amber Apothecary Bottle Graphic */}
                        <div className="amber-bottle-body">
                          <div className="bottle-cap" />
                          <div className="bottle-neck" />
                          <div className="bottle-glass">
                            <div className="bottle-liquid" />
                            <div className="bottle-printed-label">
                              <span className="chem-brand">{chem.manufacturer}</span>
                              <span className="chem-name">{chem.name}</span>
                              <span className="chem-type-tag">
                                {chem.type === 'bw'
                                  ? 'B&W DEV'
                                  : chem.type === 'color'
                                    ? 'C-41 KIT'
                                    : 'ECN-2'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="chem-details">
                        <h4 className="chem-title">{chem.name}</h4>
                        <div className="chem-meta">
                          <span>누적 {chem.total_rolls_processed}롤 사용</span>
                          <span className="sep">•</span>
                          <span>잔여 {chem.current_volume_ml || chem.volume_ml}ml</span>
                        </div>
                        {chem.notes && <p className="chem-note">{chem.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="lab-selection-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: '0.86rem' }}>위탁 현상소 이름</label>
                  <button
                    type="button"
                    className="apple-mini-add-btn"
                    onClick={() => setIsAddingCustomLab((prev) => !prev)}
                    title="새로운 현상소 목록에 추가"
                  >
                    <Plus size={13} />
                    <span>새 현상소 추가</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="현상소 이름 직접 입력 또는 아래 목록에서 선택"
                    className="apple-input large"
                    style={{ flex: 1 }}
                  />
                  {labName.trim() &&
                    !DEFAULT_LAB_PRESETS.includes(labName.trim()) &&
                    !customLabList.includes(labName.trim()) && (
                      <button
                        type="button"
                        className="preset-pill"
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          borderColor: 'rgba(245, 158, 11, 0.4)',
                          color: '#fbbf24',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          height: '42px',
                          padding: '0 12px',
                          fontWeight: 700,
                        }}
                        onClick={() => handleAddCustomLab(labName.trim())}
                        title="입력한 현상소를 아래 즐겨찾기 목록에 영구 등록"
                      >
                        <Plus size={14} />
                        <span>목록에 등록</span>
                      </button>
                    )}
                </div>

                {/* 새 현상소 추가 인라인 입력 폼 */}
                {isAddingCustomLab && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px dashed rgba(245, 158, 11, 0.45)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <input
                      type="text"
                      value={newCustomLabInput}
                      onChange={(e) => setNewCustomLabInput(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomLab();
                        }
                      }}
                      placeholder="추가할 현상소명 입력 (예: 망우삼림, 필름로그, 야시카)"
                      className="apple-input"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="apple-primary-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      onClick={() => handleAddCustomLab()}
                    >
                      <span>등록</span>
                    </button>
                    <button
                      type="button"
                      className="apple-secondary-btn"
                      style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      onClick={() => {
                        setIsAddingCustomLab(false);
                        setNewCustomLabInput('');
                      }}
                    >
                      <span>취소</span>
                    </button>
                  </div>
                )}

                {/* 현상소 프리셋 칩 목록 */}
                <div className="lab-presets-row" style={{ marginTop: '12px' }}>
                  {DEFAULT_LAB_PRESETS.map((preset) => {
                    const isSelected = labName === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setLabName(preset)}
                      >
                        {preset}
                      </button>
                    );
                  })}

                  {/* 사용자가 추가한 커스텀 현상소 칩 */}
                  {customLabList.map((customLab) => {
                    const isSelected = labName === customLab;
                    return (
                      <div
                        key={customLab}
                        className={`preset-pill ${isSelected ? 'active' : ''}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          paddingRight: '6px',
                          borderColor: isSelected ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.3)',
                        }}
                        onClick={() => setLabName(customLab)}
                      >
                        <span>{customLab}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '15px',
                            height: '15px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#a1a1aa',
                            fontSize: '11px',
                            lineHeight: 1,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={(e) => handleRemoveCustomLab(customLab, e)}
                          title={`'${customLab}' 목록에서 삭제`}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}

                  {/* 끝에 추가 칩 */}
                  {!isAddingCustomLab && (
                    <button
                      type="button"
                      className="preset-pill"
                      style={{
                        borderStyle: 'dashed',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        color: '#a1a1a6',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => setIsAddingCustomLab(true)}
                      title="새로운 위탁 현상소 목록에 추가"
                    >
                      <Plus size={12} />
                      <span>추가</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Recipe Configuration Panel */}
          {devType === 'self' && (
            <div className="chem-recipe-column reveal-on-scroll reveal-delay-3">
              <h4 className="recipe-title">현상 레시피 정밀 설정</h4>

              {/* Dilution Ratio */}
              <div className="recipe-group">
                <label>희석 비율 (Dilution)</label>
                <div className="dilution-pills">
                  {RECIPE_DILUTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`dilution-btn ${dilutionRatio === d ? 'active' : ''}`}
                      onClick={() => setDilutionRatio(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agitation Method */}
              <div className="recipe-group">
                <label>교반 방식 (Agitation)</label>
                <div className="agitation-grid">
                  {[
                    { id: 'rotary', name: '로터리 (Jobo 회전)' },
                    { id: 'inversion', name: '수교반 (Hand Inversion)' },
                    { id: 'stand', name: '스탠딩 (정치현상)' },
                    { id: 'semi_stand', name: '세미스탠딩' },
                  ].map((ag) => (
                    <button
                      key={ag.id}
                      type="button"
                      className={`ag-btn ${agitationMethod === ag.id ? 'active' : ''}`}
                      onClick={() => setAgitationMethod(ag.id as AgitationMethod)}
                    >
                      {ag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature & Time */}
              <div className="recipe-row">
                <div className="field-group flex-1">
                  <label>현상 온도 (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={devTemp}
                    onChange={(e) => setDevTemp(Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className="apple-input"
                  />
                </div>

                <div className="field-group flex-1">
                  <label>현상 시간 (분:초)</label>
                  <input
                    type="text"
                    value={devTime}
                    onChange={(e) => setDevTime(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: 9분 30초 (미입력 시 기본 9분 30초)"
                    className="apple-input"
                  />
                </div>
              </div>

              {/* Detailed Notes */}
              <div className="recipe-group">
                <label>교반 세부 설정 및 정지/정착 메모</label>
                <textarea
                  value={agitationNotes}
                  onChange={(e) => setAgitationNotes(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: Jobo 연속 회전 30초 정역반전, 또는 초기 30초 연속 교반 후 매 1분마다 10초 4회 반전"
                  rows={3}
                  className="apple-textarea"
                />
              </div>
            </div>
          )}
        </div>

        {/* Finish Development Action Bar */}
        <div className="assembled-rig-footer reveal-on-scroll reveal-delay-3">
          <div className="rig-summary">
            <span className="rig-tag">현상 완료 준비</span>
            <h4>
              [{currentDevRoll?.title || '선택된 롤'}] 현상 완료 시, 현상액 누적 롤 수가 자동
              카운트되고 스캔 대기함으로 이동합니다.
            </h4>
          </div>
          <button
            className="apple-primary-btn glow"
            onClick={handleCompleteDevelopment}
          >
            <span>현상 완료 & 스캔실로 이동하기</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 5: SCAN & MASTER ARCHIVE (스캔 & 디지털 보관소)
          ============================================================ */}
      <section id="section-scans" className="apple-chapter-section">
        <div className="chapter-header">
          <div className="chapter-index reveal-on-scroll">CHAPTER 05</div>
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">스캔 & 디지털 아카이브 (Scan Vault)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            현상이 끝난 네거티브를 디지털 마스터로 승화시킵니다. 스캐너 기종을 선택하고,
            체계적인 폴더명을 자동 생성하여 영구 보관소에 등록하세요.
          </p>
        </div>

        {/* Pending Scan Rolls Bar */}
        <div className="pending-queue-bar reveal-on-scroll reveal-delay-1">
          <div className="queue-title-row">
            <h4>💾 스캔 대기 중인 필름 목록 ({pendingScanRolls.length}롤)</h4>
            <span className="queue-hint">
              {pendingScanRolls.length === 0
                ? '스캔 대기 중인 롤이 없습니다. (위에서 현상 완료 시 자동 등록)'
                : '스캔할 필름을 선택하면 최적의 폴더명이 자동 조립됩니다.'}
            </span>
          </div>

          <div className="queue-chips-row">
            {pendingScanRolls.map((roll) => (
              <button
                key={roll.id}
                type="button"
                className={`queue-chip emerald ${scanSelectedRollId === roll.id ? 'active' : ''}`}
                onClick={() => setScanSelectedRollId(roll.id)}
              >
                <span className="chip-name">{roll.title}</span>
                <span className="chip-film">{roll.film_name_snapshot}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="scan-workbench-grid">
          {/* Scanner Equipment Showcase */}
          <div className="scanners-showcase-column reveal-on-scroll reveal-delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="column-title" style={{ marginBottom: 0 }}>1. 스캔 방식 및 장비 선택</h4>
              {scanMethod !== 'lab' && (
                <button
                  type="button"
                  className="apple-mini-add-btn"
                  onClick={() => setIsAddScannerOpen(true)}
                  title="내 보유 스캐너/디지타이징 장비 추가"
                >
                  <Plus size={14} />
                  <span>새 장비 등록</span>
                </button>
              )}
            </div>

            <div className="scanner-presets-grid">
              {[
                {
                  method: 'dslr',
                  title: '디지타이징',
                  desc: '미러리스/센서 + 매크로 렌즈 + 고연색 광원',
                },
                {
                  method: 'flatbed',
                  title: '평판 필름 스캐너',
                  desc: 'Epson V850 / V600 (중형 및 대형 필름)',
                },
                {
                  method: 'dedicated',
                  title: '필름 전용 스캐너',
                  desc: 'Plustek OpticFilm / Nikon Coolscan',
                },
                {
                  method: 'lab',
                  title: '현상소 스캔',
                  desc: '노리츠 / 후지 프론티어 / 코닥 HR / 이마콘',
                },
              ].map((s) => {
                const isSelected = scanMethod === s.method;
                return (
                  <div
                    key={s.method}
                    className={`scanner-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setScanMethod(s.method as ScanMethod);
                      if (s.method === 'lab') {
                        setScannerModel('노리츠 (Noritsu HS-1800) - 일반화질');
                      } else {
                        const matched = scanners.find((sc) =>
                          s.method === 'dslr' ? sc.category === 'digitizing' : sc.category === s.method
                        );
                        if (matched) {
                          setSelectedScannerId(matched.id);
                          setScannerModel(matched.name);
                        } else {
                          setSelectedScannerId('');
                          setScannerModel(s.desc);
                        }
                      }
                    }}
                  >
                    <div className="scanner-icon-bubble">
                      <HardDrive size={18} />
                    </div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                    {isSelected && <span className="scanner-active-pill">✓ 선택됨</span>}
                  </div>
                );
              })}
            </div>

            {/* 🌟 현상소 스캔 선택 시: 현상소 스캐너 & 화질 등급 정밀 선택 패널 */}
            {scanMethod === 'lab' ? (
              <div
                style={{
                  marginTop: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>
                      현상소 스캐너 기종 선택
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#86868b' }}>
                      국내외 전문 현상소 대표 스캐너
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                    {LAB_SCANNERS.map((ls) => {
                      const isActive = labScanner === ls.id;
                      return (
                        <button
                          key={ls.id}
                          type="button"
                          className={`dilution-btn ${isActive ? 'active' : ''}`}
                          style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            height: 'auto',
                            borderColor: isActive ? '#f59e0b' : undefined,
                          }}
                          onClick={() => {
                            setLabScanner(ls.id);
                            if (ls.id !== 'other') {
                              const resText = labResolution === 'high' ? '고화질' : '일반화질';
                              setScannerModel(`${ls.name} - ${resText}`);
                            }
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{ls.name}</span>
                          <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{ls.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {labScanner === 'other' && (
                    <input
                      type="text"
                      className="apple-input"
                      style={{ marginTop: '8px' }}
                      placeholder="현상소 스캐너 기종명을 직접 입력하세요"
                      value={customLabScanner}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        setCustomLabScanner(e.target.value);
                        const resText = labResolution === 'high' ? '고화질' : '일반화질';
                        setScannerModel(`${e.target.value || '기타 스캐너'} - ${resText}`);
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', display: 'block' }}>
                    현상소 스캔 화질 등급
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      className={`dilution-btn ${labResolution === 'standard' ? 'active' : ''}`}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        borderColor: labResolution === 'standard' ? '#10b981' : undefined,
                        background: labResolution === 'standard' ? '#10b981' : undefined,
                        color: labResolution === 'standard' ? '#000000' : undefined,
                      }}
                      onClick={() => {
                        setLabResolution('standard');
                        const labPreset = LAB_SCANNERS.find((ls) => ls.id === labScanner);
                        setScannerModel(`${labPreset ? labPreset.name : '현상소 스캐너'} - 일반화질`);
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>✨ 일반화질 (Standard)</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>약 2,000~3,000px • SNS/웹 업로드용</span>
                    </button>

                    <button
                      type="button"
                      className={`dilution-btn ${labResolution === 'high' ? 'active' : ''}`}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        borderColor: labResolution === 'high' ? '#f59e0b' : undefined,
                        background: labResolution === 'high' ? '#f59e0b' : undefined,
                        color: labResolution === 'high' ? '#000000' : undefined,
                      }}
                      onClick={() => {
                        setLabResolution('high');
                        const labPreset = LAB_SCANNERS.find((ls) => ls.id === labScanner);
                        setScannerModel(`${labPreset ? labPreset.name : '현상소 스캐너'} - 고화질`);
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>⚡ 고화질 (High-Resolution)</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>약 5,000~6,000px+ • 정밀 보정/대형 인화용</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* 🌟 디지타이징 / 평판 / 전용 스캐너일 때: 내 보유 장비 빠른 선택 */
              <div
                style={{
                  marginTop: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d1d1d6' }}>
                    내 보유 장비에서 바로 선택
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
                    {scanners.filter((sc) =>
                      scanMethod === 'dslr' ? sc.category === 'digitizing' : sc.category === scanMethod
                    ).length}개 매칭됨
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {scanners
                    .filter((sc) =>
                      scanMethod === 'dslr' ? sc.category === 'digitizing' : sc.category === scanMethod
                    )
                    .map((sc) => {
                      const isEquipActive = selectedScannerId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          className={`dilution-btn ${isEquipActive ? 'active' : ''}`}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onClick={() => {
                            setSelectedScannerId(sc.id);
                            setScannerModel(sc.name);
                          }}
                        >
                          <HardDrive size={13} />
                          <span>{sc.name}</span>
                          {isEquipActive && <span>✓</span>}
                        </button>
                      );
                    })}

                  {scanners.filter((sc) =>
                    scanMethod === 'dslr' ? sc.category === 'digitizing' : sc.category === scanMethod
                  ).length === 0 && (
                      <span style={{ fontSize: '0.76rem', color: '#86868b' }}>
                        등록된 해당 유형의 보유 장비가 없습니다. 위의 &apos;+ 새 장비 등록&apos;을 눌러 장비를 추가해 보세요.
                      </span>
                    )}
                </div>

                <div style={{ marginTop: '4px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#86868b', marginBottom: '4px', display: 'block' }}>
                    장비 세부 모델명 (직접 수정 가능)
                  </label>
                  <input
                    type="text"
                    className="apple-input"
                    value={scannerModel}
                    onChange={(e) => setScannerModel(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Sony A7R IV + 90mm Macro (Cinestill CS-LITE)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Folder Name & Archive Details */}
          <div className="folder-naming-column reveal-on-scroll reveal-delay-3">
            <h4 className="column-title">2. 아카이브 폴더명 & 디지타이징 옵션</h4>

            <div className="folder-name-box">
              <label>저장 폴더명 (Folder Name Generator)</label>
              <div className="folder-input-wrapper">
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="apple-input large mono"
                />
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyFolder}
                  title="폴더명 클립보드 복사"
                >
                  {isCopiedFolder ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="folder-helper">
                💡 날짜_출사장소_필름명_카메라 형식으로 조립되어 파일 관리가 용이합니다.
              </p>
            </div>

            {/* Folder Web/Cloud/Local Drive URL Input */}
            <div className="field-group" style={{ marginTop: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LinkIcon size={14} color="#0091ff" />
                <span>폴더 인터넷 주소 / 클라우드 URL / 로컬(외장하드) 경로</span>
              </label>
              <div className="folder-input-wrapper">
                <input
                  type="text"
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: https://drive.google.com/..., https://icloud.com/..., /Volumes/LaCie/Films/2026-03"
                  className="apple-input mono"
                />
              </div>
              <p className="folder-helper">
                🌐 구글 드라이브, Dropbox, iCloud 링크나 본인 외장하드 로컬 경로를 적어두면 폴더 클릭 시 즉시 하이퍼링크로 열립니다.
              </p>
            </div>

            {/* Folder Color Selector (Default matched to film type) */}
            <div className="field-group" style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ marginBottom: 0 }}>맥북 폴더 색상 지정</label>
                <span style={{ fontSize: '0.74rem', color: '#86868b' }}>
                  흑백(회색) • 흑백슬라(유광블랙) • 컬러네거(하늘색) • 슬라(초록) • 영화용(노랑)
                </span>
              </div>
              <div className="mac-color-selector-bar">
                {Object.values(MAC_FOLDER_COLORS).map((c) => {
                  const isSelected = folderColor === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      className={`color-swatch-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => setFolderColor(c.key)}
                      title={`${c.label} - ${c.sublabel}`}
                    >
                      <span
                        className="swatch-bubble"
                        style={{
                          background: c.frontGrad,
                          boxShadow: isSelected ? `0 0 8px ${c.dotColor}` : 'none',
                        }}
                      />
                      <span className="swatch-text">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="scan-options-row" style={{ marginTop: '14px' }}>
              <div className="field-group flex-1">
                <label>총 컷수 (Frames)</label>
                <input
                  type="number"
                  value={scanFrames}
                  onChange={(e) => setScanFrames(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="apple-input"
                />
              </div>

              <div className="field-group flex-1">
                <label>반전/후처리 소프트웨어</label>
                <input
                  type="text"
                  value={scanSoftware}
                  onChange={(e) => setScanSoftware(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: Negative Lab Pro v3.0, SilverFast 등"
                  className="apple-input"
                />
              </div>
            </div>

            <div className="field-group">
              <label>색감 / 보정 / 아카이브 메모</label>
              <textarea
                value={scanNotes}
                onChange={(e) => setScanNotes(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="예: 16bit DNG 캡처, 뉴트럴 톤 반전 등"
                rows={2}
                className="apple-textarea"
              />
            </div>

            <button
              type="button"
              className="apple-primary-btn emerald-glow"
              onClick={handleSaveScanRecord}
              style={{ marginTop: '6px' }}
            >
              <FolderArchive size={16} />
              <span>마스터 아카이브 보관소에 영구 등록</span>
            </button>
          </div>
        </div>

        {/* ============================================================
            macOS FINDER VAULT: 맥북 폴더 모양의 마스터 아카이브 갤러리
            날짜순 정렬 (최신 폴더가 가장 위, 왼쪽에 착착 정렬!)
            ============================================================ */}
        <div
          ref={macFinderVaultRef}
          className="mac-finder-vault-wrapper reveal-on-scroll reveal-delay-2"
          id="mac-finder-desktop-vault"
        >
          <div className="mac-finder-window">
            {/* macOS Window Top Bar */}
            <div className="mac-finder-topbar">
              <div className="mac-window-controls">
                <span className="window-dot dot-red" />
                <span className="window-dot dot-yellow" />
                <span className="window-dot dot-green" />
              </div>

              <div className="mac-path-crumb">
                <Folder size={14} className="crumb-folder-icon" />
                <span className="crumb-segment">Macintosh HD</span>
                <span className="crumb-sep">›</span>
                <span className="crumb-segment">FilmOpener</span>
                <span className="crumb-sep">›</span>
                <span className="crumb-segment active">Master_Scanned_Vault</span>
              </div>

              <div className="mac-finder-stats">
                <span className="stats-pill">
                  총 <strong>{sortedScans.length}개</strong> 아카이브 폴더
                </span>
                <span className="stats-sort-pill">
                  📅 최신 날짜순 정렬 (좌상단 우선)
                </span>
              </div>
            </div>

            {/* macOS Finder Toolbar */}
            <div className="mac-finder-subbar">
              <span className="subbar-hint">
                💡 맥북 폴더를 클릭하면 연결된 <strong>인터넷 클라우드(Google Drive/iCloud)</strong> 또는 <strong>로컬 외장하드</strong>로 바로 열립니다.
              </span>
              {copiedFolderUrl && (
                <span className="copied-toast-badge">
                  ✓ 로컬 경로 복사됨 ({copiedFolderUrl.slice(0, 28)}...)
                </span>
              )}
            </div>

            {/* macOS Folder Icons Grid */}
            <div className="mac-folders-desktop-grid">
              {sortedScans.length === 0 ? (
                <div className="mac-finder-empty">
                  <FolderArchive size={48} strokeWidth={1} color="#6e6e73" />
                  <h4>저장된 스캔 폴더가 없습니다</h4>
                  <p>위에서 스캔 정보를 작성하고 [영구 등록] 버튼을 누르면 맥북 폴더 모양으로 차곡차곡 정렬됩니다.</p>
                </div>
              ) : (
                sortedScans.map((scan, sIdx) => {
                  const colorKey = (scan.folder_color as MacFolderColorKey) || 'mac_sky_blue';
                  const cConfig = MAC_FOLDER_COLORS[colorKey] || MAC_FOLDER_COLORS.mac_sky_blue;
                  const isJustAdded = newlyAddedScanId === scan.id;
                  const itemRoll = scan.roll_id ? rolls.find((r) => r.id === scan.roll_id) : null;

                  return (
                    <div
                      key={scan.id}
                      className={`mac-folder-item ${isJustAdded ? 'just-added-highlight' : ''}`}
                      onClick={() => setInspectingScan(scan)}
                      title={`클릭하여 상세 정보창 열기 (${scan.film_title})`}
                    >
                      {/* Hover Quick Look Popover (Floats directly OVER the folder graphic) */}
                      <div className="mac-folder-hover-popover">
                        <div className="popover-film-line">
                          <Film size={12} className="text-amber" />
                          <span className="popover-title">{itemRoll?.film_name_snapshot || scan.film_title}</span>
                        </div>
                        <div className="popover-gear-line">
                          <Camera size={11} className="text-blue" />
                          <span>{itemRoll?.camera_name_snapshot || scan.camera_lens_info || '바디 미기록'}</span>
                          {itemRoll?.lens_name_snapshot && (
                            <span className="popover-lens-sub"> • {itemRoll.lens_name_snapshot}</span>
                          )}
                        </div>
                        <div className="popover-dev-line">
                          <FlaskConical size={11} className="text-green" />
                          <span>
                            {itemRoll?.dev_type === 'self'
                              ? `자가: ${itemRoll.developer_name_snapshot || '현상액'}${itemRoll.dilution_ratio ? ` (${itemRoll.dilution_ratio})` : ''}`
                              : itemRoll?.dev_type === 'lab'
                                ? `현상소: ${itemRoll.lab_name || '전문점'}`
                                : '현상 완료 아카이브'}
                          </span>
                        </div>
                        <div className="popover-scan-line">
                          <HardDrive size={11} className="text-cyan" />
                          <span>
                            {scan.scan_method === 'lab'
                              ? `현상소 (${scan.lab_scanner || '노리츠/후지'} · ${scan.lab_resolution === 'high' ? '고화질' : '일반'})`
                              : `디지타이징 (${scan.scanner_model || '장비'})`}
                            {' • '}
                            {scan.total_frames}컷
                          </span>
                        </div>
                        <div className="popover-hint">
                          <span>💡 클릭하여 전체 정보 & 클라우드 열기</span>
                        </div>
                      </div>
                      {/* 3D Realistic macOS Folder Graphic */}
                      <div className="mac-folder-art-canvas">
                        {/* Folder Back Tab */}
                        <div
                          className="mac-folder-backplate"
                          style={{ background: cConfig.backColor }}
                        >
                          <div
                            className="mac-folder-tab-ear"
                            style={{ background: cConfig.tabGrad }}
                          />
                        </div>

                        {/* Negative Film Sleeve poking out from inside */}
                        <div className="mac-folder-negative-sleeve">
                          <div className="sleeve-sprocket-row">
                            <span /><span /><span /><span /><span />
                          </div>
                          <div className="sleeve-film-chip">
                            <span className="sleeve-frame-tag">{scan.total_frames}F</span>
                            <span className="sleeve-label-text">
                              {scan.film_title.split(' ')[0] || 'FILM'}
                            </span>
                          </div>
                          <div className="sleeve-sprocket-row">
                            <span /><span /><span /><span /><span />
                          </div>
                        </div>

                        {/* Folder Front Cover with 3D Lip & Gloss */}
                        <div
                          className={`mac-folder-front-pocket ${cConfig.isGlossy ? 'glossy' : ''}`}
                          style={{ background: cConfig.frontGrad }}
                        >
                          {/* Glossy Sheen Highlight */}
                          <div className="front-sheen-line" />

                          {/* Curved Notch Top Lip */}
                          <div className="front-top-lip" />

                          {/* Center Emblem Stamp */}
                          <div className="front-emblem-badge">
                            <Film size={18} className="emblem-center-icon" />
                            <span className="emblem-frames-count">{scan.total_frames}컷</span>
                          </div>

                          {/* Link Indicator Badge on Folder */}
                          <div className="folder-link-hover-badge">
                            <span className="link-type-tag info">
                              <Info size={10} /> 정보 보기
                            </span>
                            {scan.storage_path && (
                              <span className={`link-type-tag ${scan.storage_path.startsWith('http') ? 'cloud' : 'local'}`}>
                                {scan.storage_path.startsWith('http') ? <ExternalLink size={9} /> : <HardDrive size={9} />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* macOS Finder Label Meta */}
                      <div className="mac-folder-text-block">
                        <div className="mac-folder-title-line" title={scan.folder_name}>
                          {scan.folder_name}
                        </div>
                        <div className="mac-folder-date-line">
                          {scan.scan_date || scan.created_at.slice(0, 10)} • {scan.total_frames}컷
                        </div>
                        <div className="mac-folder-film-sub" title={scan.film_title}>
                          {scan.film_title}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          RIGHT EDGE INTERACTIVE PRECISION RULER (ArtCraft Style)
          스크롤 시 캘리퍼 자 모양이 움직이고, 특정 화면 도달 시 글자 확대,
          마우스 오버 시 자석처럼 피쉬아이 돋보기 확대 인터랙션!
          ============================================================ */}
      <aside
        className={`art-ruler-hud ${isRulerHovered ? 'hovered' : ''}`}
        aria-label="화면 챕터 스크롤 눈금자"
      >
        {/* Ruler Head Dial Tag */}
        <div className="ruler-head-tag">
          <span className="ruler-iso-badge">RULER</span>
          <span className="ruler-pct-text">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Ruler Track Container */}
        <div
          ref={rulerTrackRef}
          className="ruler-track-spine"
          onMouseMove={handleRulerMouseMove}
          onMouseLeave={handleRulerMouseLeave}
        >
          {/* Caliper Slider Blade (Needle that moves smoothly with page scroll) */}
          <div
            className="ruler-caliper-needle"
            style={{ top: `${needleY}px` }}
          >
            <div className="caliper-pointer-head" />
            <div className="caliper-target-line" />
            <div className="caliper-readout">
              <span>{Math.round(scrollProgress * 100)}%</span>
            </div>
          </div>

          {/* Ruler Major Chapters & Sub Ticks */}
          {RULER_CHAPTERS.map((ch, idx) => {
            const isActive = activeChapter === ch.id;
            const total = RULER_CHAPTERS.length;
            const itemRatio = total > 1 ? idx / (total - 1) : 0;

            // Calculate proximity scale if hovered
            let proximityScale = isActive ? 1.25 : 1.0;
            let proximityTickLen = isActive ? 26 : 14;

            if (isRulerHovered && rulerHoverY !== null && rulerTrackRef.current) {
              const trackHeight = rulerTrackRef.current.offsetHeight || 600;
              const itemCenterY = itemRatio * trackHeight;
              const dist = Math.abs(rulerHoverY - itemCenterY);
              const maxDist = 140; // wider influence radius for large 88vh ruler
              if (dist < maxDist) {
                const factor = Math.cos((dist / maxDist) * (Math.PI / 2));
                proximityScale = 1.0 + factor * 0.42; // Up to 1.42x
                proximityTickLen = 14 + Math.round(factor * 22); // Up to 36px
              } else {
                proximityScale = isActive ? 1.2 : 1.0;
              }
            }

            return (
              <React.Fragment key={ch.id}>
                {/* Major Chapter Node */}
                <div
                  ref={(el) => {
                    rulerNodeRefs.current[ch.id] = el;
                  }}
                  className={`ruler-node-item ${isActive ? 'active' : ''}`}
                  onClick={() => scrollToChapter(ch.id)}
                  style={{
                    transform: `scale(${proximityScale.toFixed(2)})`,
                    transformOrigin: 'right center',
                  }}
                  title={`${ch.num} ${ch.label} - ${ch.title}`}
                >
                  {/* Tooltip flyout on hover/active */}
                  <div className="ruler-node-flyout">
                    <span className="flyout-icon">{ch.icon}</span>
                    <span className="flyout-num">{ch.num}</span>
                    <span className="flyout-label">{ch.label}</span>
                    <span className="flyout-title">{ch.title}</span>
                  </div>

                  {/* Node Label Text on ruler */}
                  <div className="ruler-node-text-wrap">
                    <span className="ruler-node-num">{ch.num}</span>
                    <span className="ruler-node-name">{ch.label}</span>
                  </div>

                  {/* Major Tick Mark */}
                  <div
                    className="ruler-major-tick"
                    style={{ width: `${proximityTickLen}px` }}
                  />
                </div>

                {/* Sub Ticks (Ruler divisions) between chapters - 9 precision tick marks */}
                {idx < total - 1 && (
                  <div className="ruler-subticks-group">
                    <span className="ruler-subtick short" />
                    <span className="ruler-subtick short" />
                    <span className="ruler-subtick medium" />
                    <span className="ruler-subtick short" />
                    <span className="ruler-subtick long" />
                    <span className="ruler-subtick short" />
                    <span className="ruler-subtick medium" />
                    <span className="ruler-subtick short" />
                    <span className="ruler-subtick short" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Ruler Bottom End Accent */}
        <div className="ruler-foot-tag">
          <span className="ruler-film-format">35mm</span>
        </div>
      </aside>

      {/* ============================================================
          FLOATING BOTTOM DOCK / CHAPTER SCRUBBER
          ============================================================ */}
      <nav className="apple-bottom-dock">
        <button
          className={`dock-item ${activeChapter === 'section-films' ? 'active' : ''}`}
          onClick={() => scrollToChapter('section-films')}
        >
          <Film size={16} />
          <span>01 필름 선반</span>
        </button>

        <button
          className={`dock-item ${activeChapter === 'section-gear' ? 'active' : ''}`}
          onClick={() => scrollToChapter('section-gear')}
        >
          <Camera size={16} />
          <span>02 기재실</span>
        </button>

        <button
          className={`dock-item ${activeChapter === 'section-shooting' ? 'active' : ''}`}
          onClick={() => scrollToChapter('section-shooting')}
        >
          <Sun size={16} />
          <span>03 출사 기록</span>
        </button>

        <button
          className={`dock-item ${activeChapter === 'section-development' ? 'active' : ''}`}
          onClick={() => scrollToChapter('section-development')}
        >
          <FlaskConical size={16} />
          <span>04 암실 현상</span>
        </button>

        <button
          className={`dock-item ${activeChapter === 'section-scans' ? 'active' : ''}`}
          onClick={() => scrollToChapter('section-scans')}
        >
          <FolderArchive size={16} />
          <span>05 스캔 보관</span>
        </button>

        <div className="dock-divider" />

        <button
          className="dock-item up"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="맨 위로 이동"
        >
          <ArrowUp size={16} />
        </button>
      </nav>

      {/* ============================================================
          QUICK ADD FILM BATCH MODAL (유통기한/썩필/보관법 개별 분리 등록)
          ============================================================ */}
      {isAddFilmOpen && (
        <div className="apple-modal-backdrop" onClick={() => setIsAddFilmOpen(false)}>
          <div className="apple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="apple-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={20} color="#f59e0b" />
                <h3>새 필름 배치 등록 (개별 유통기한/썩필 관리)</h3>
              </div>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setIsAddFilmOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#a1a1a6', marginBottom: '18px', lineHeight: 1.5 }}>
              💡 같은 필름 이름(예: 코닥 골드 200)이라도 <strong>유통기한, 보관방법, 썩은 필름(만료) 여부</strong>에 따라
              독립된 별도의 캐니스터로 선반에 자동 등록 및 관리됩니다.
            </p>

            <form onSubmit={handleQuickAddFilm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>필름 이름</label>
                  <input
                    type="text"
                    value={newFilmName}
                    onChange={(e) => setNewFilmName(e.target.value)}
                    placeholder="예: 코닥 골드 200"
                    className="apple-input"
                    required
                  />
                </div>
                <div className="field-group" style={{ width: '140px' }}>
                  <label>제조사 브랜드</label>
                  <input
                    type="text"
                    value={newFilmBrand}
                    onChange={(e) => setNewFilmBrand(e.target.value)}
                    placeholder="예: Kodak, Fujifilm"
                    className="apple-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>필름 종류</label>
                  <select
                    value={newFilmType}
                    onChange={(e) => setNewFilmType(e.target.value as FilmType)}
                    className="apple-input"
                  >
                    <option value="color_negative">컬러네가 (Color Negative)</option>
                    <option value="bw_negative">흑백네가 (B&W Negative)</option>
                    <option value="color_slide">컬러슬라이드 (E-6)</option>
                    <option value="cinema">영화용 (ECN-2)</option>
                    <option value="cinema_ahu">영화용 AHU (CineStill)</option>
                  </select>
                </div>
                <div className="field-group" style={{ width: '110px' }}>
                  <label>판형</label>
                  <select
                    value={newFilmFormat}
                    onChange={(e) => setNewFilmFormat(e.target.value as FilmFormat)}
                    className="apple-input"
                  >
                    <option value="135">135 (35mm)</option>
                    <option value="120">120 (중형)</option>
                    <option value="220">220</option>
                  </select>
                </div>
                <div className="field-group" style={{ width: '90px' }}>
                  <label>감도 (ISO)</label>
                  <input
                    type="number"
                    value={newFilmIso}
                    onChange={(e) => setNewFilmIso(Number(e.target.value))}
                    className="apple-input"
                  />
                </div>
              </div>

              {/* 🌟 유통기한 & 신선도/썩힘 상태 빠른 선택기 (로리 / 노괴 / 틀딱) */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: '0.86rem', color: '#f5f5f7' }}>
                    유통기한 & 필름 신선도 간주 설정 *
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#86868b' }}>
                    유통기한 미상 시 아래 버튼으로 즉시 선택
                  </span>
                </div>

                {/* 3단 선택 버튼: 로리 / 노괴 / 틀딱 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {/* 1. 로리 버튼 (싱싱한 경우) */}
                  <button
                    type="button"
                    className={`dilution-btn ${newFilmFreshness === 'fresh' ? 'active' : ''}`}
                    style={{
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      height: 'auto',
                      borderColor: newFilmFreshness === 'fresh' ? '#10b981' : undefined,
                      background: newFilmFreshness === 'fresh' ? 'rgba(16, 185, 129, 0.16)' : undefined,
                      color: newFilmFreshness === 'fresh' ? '#34d399' : '#d1d1d6',
                    }}
                    onClick={() => {
                      setNewFilmFreshness('fresh');
                      setNewFilmExpired(false);
                      if (!newFilmExpiry || newFilmExpiry.includes('유통기한 미상')) {
                        setNewFilmExpiry('유통기한 미상 (로리/싱싱)');
                      }
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>🌸 로리</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>싱싱함 (정상 만료 전)</span>
                  </button>

                  {/* 2. 노괴 버튼 (썩었을 경우) */}
                  <button
                    type="button"
                    className={`dilution-btn ${newFilmFreshness === 'expired' ? 'active' : ''}`}
                    style={{
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      height: 'auto',
                      borderColor: newFilmFreshness === 'expired' ? '#f59e0b' : undefined,
                      background: newFilmFreshness === 'expired' ? 'rgba(245, 158, 11, 0.16)' : undefined,
                      color: newFilmFreshness === 'expired' ? '#fbbf24' : '#d1d1d6',
                    }}
                    onClick={() => {
                      setNewFilmFreshness('expired');
                      setNewFilmExpired(true);
                      if (!newFilmExpiry || newFilmExpiry.includes('유통기한 미상')) {
                        setNewFilmExpiry('유통기한 미상 (노괴/썩필)');
                      }
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>⚠️ 노괴</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>썩필 (유통기한 만료)</span>
                  </button>

                  {/* 3. 틀딱 버튼 (몹시 썩어서 상이 거의 안맺힐 경우) */}
                  <button
                    type="button"
                    className={`dilution-btn ${newFilmFreshness === 'deep_expired' ? 'active' : ''}`}
                    style={{
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      height: 'auto',
                      borderColor: newFilmFreshness === 'deep_expired' ? '#ef4444' : undefined,
                      background: newFilmFreshness === 'deep_expired' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                      color: newFilmFreshness === 'deep_expired' ? '#f87171' : '#d1d1d6',
                    }}
                    onClick={() => {
                      setNewFilmFreshness('deep_expired');
                      setNewFilmExpired(true);
                      if (!newFilmExpiry || newFilmExpiry.includes('유통기한 미상')) {
                        setNewFilmExpiry('유통기한 미상 (틀딱/푹썩필)');
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
                    fontSize: '0.78rem',
                    lineHeight: 1.4,
                    color:
                      newFilmFreshness === 'fresh'
                        ? '#34d399'
                        : newFilmFreshness === 'deep_expired'
                        ? '#f87171'
                        : '#fbbf24',
                    background: 'rgba(0,0,0,0.25)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {newFilmFreshness === 'fresh' && '✨ 싱싱한 상태로 간주합니다. (기준 감도로 촬영)'}
                  {newFilmFreshness === 'expired' && '⚠️ 썩필(노괴)로 간주합니다. (+1스탑 오버노출 촬영 권장)'}
                  {newFilmFreshness === 'deep_expired' && '💀 몹시 썩어 상이 거의 안 맺힐 수 있는 푹썩필(틀딱)로 간주합니다. (+2~3스탑 이상 듬뿍 노출 권장)'}
                </div>

                {/* 정확한 날짜 입력 (선택) */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                  <label style={{ margin: 0, fontSize: '0.78rem', color: '#a1a1a6', whiteSpace: 'nowrap' }}>
                    정확한 날짜(선택):
                  </label>
                  <input
                    type="date"
                    value={newFilmExpiry.startsWith('유통기한') ? '' : newFilmExpiry}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewFilmExpiry(val);
                      if (val) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (val < todayStr) {
                          setNewFilmFreshness('expired');
                          setNewFilmExpired(true);
                        } else {
                          setNewFilmFreshness('fresh');
                          setNewFilmExpired(false);
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="apple-input"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                  />
                  {newFilmExpiry && !newFilmExpiry.startsWith('유통기한') && (
                    <button
                      type="button"
                      className="apple-mini-add-btn"
                      style={{ padding: '6px 10px', height: '34px', fontSize: '0.76rem' }}
                      onClick={() => {
                        if (newFilmFreshness === 'fresh') setNewFilmExpiry('유통기한 미상 (로리/싱싱)');
                        else if (newFilmFreshness === 'deep_expired') setNewFilmExpiry('유통기한 미상 (틀딱/푹썩필)');
                        else setNewFilmExpiry('유통기한 미상 (노괴/썩필)');
                      }}
                      title="입력한 날짜를 지우고 미상 상태 문구로 복원"
                    >
                      날짜 지우기
                    </button>
                  )}
                </div>
              </div>

              {/* 보관 방법 & 보유 수량 */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>보관 방법</label>
                  <select
                    value={newFilmStorage}
                    onChange={(e) => setNewFilmStorage(e.target.value as StorageMethod)}
                    className="apple-input"
                  >
                    <option value="room_temp">🌡️ 상온 보관</option>
                    <option value="refrigerated">🧊 냉장 보관</option>
                    <option value="frozen">❄️ 냉동 보관</option>
                  </select>
                </div>
                <div className="field-group" style={{ width: '110px' }}>
                  <label>보유 수량</label>
                  <input
                    type="number"
                    min="1"
                    value={newFilmQuantity}
                    onChange={(e) => setNewFilmQuantity(Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className="apple-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label>배치 메모 / 구입처</label>
                <input
                  type="text"
                  value={newFilmNotes}
                  onChange={(e) => setNewFilmNotes(e.target.value)}
                  placeholder="예: 서랍에서 발견된 썩필, 당근마켓 구매, 충무로 직구 등"
                  className="apple-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="apple-secondary-btn"
                  onClick={() => setIsAddFilmOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="apple-primary-btn glow"
                >
                  <span>선반에 캐니스터 등록</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          QUICK ADD CAMERA MODAL (카메라 실물 사진 업로드 & 기기 등록)
          ============================================================ */}
      {isAddCameraOpen && (
        <div className="apple-modal-backdrop" onClick={() => setIsAddCameraOpen(false)}>
          <div className="apple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="apple-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="#f59e0b" />
                <h3>새 카메라 바디 등록 (실물 사진 & 기기 스펙)</h3>
              </div>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setIsAddCameraOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewCamera} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Photo Upload Section */}
              <div className="field-group">
                <label>카메라 실물 사진 (내 기기 사진 업로드)</label>
                {newCamImage ? (
                  <div className="photo-preview-box">
                    <img src={newCamImage} alt="카메라 미리보기" className="camera-real-photo" />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => setNewCamImage('')}
                      title="사진 삭제"
                    >
                      <X size={14} />
                      <span>사진 삭제</span>
                    </button>
                  </div>
                ) : (
                  <label className="photo-uploader-area">
                    <Upload size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7' }}>
                      클릭하여 카메라 사진 파일 선택
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#86868b', marginTop: '4px' }}>
                      JPG, PNG, WEBP 등 지원 (최대 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCameraPhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* Brand & Model */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group" style={{ width: '150px' }}>
                  <label>제조사 (Brand)</label>
                  <input
                    type="text"
                    value={newCamBrand}
                    onChange={(e) => setNewCamBrand(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Leica, Nikon"
                    className="apple-input"
                    required
                  />
                </div>
                <div className="field-group flex-1">
                  <label>모델명 (Model)</label>
                  <input
                    type="text"
                    value={newCamModel}
                    onChange={(e) => setNewCamModel(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: M6 Classic, FM2"
                    className="apple-input"
                    required
                  />
                </div>
              </div>

              {/* Format & Lens Type & Status */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>판형 (Format)</label>
                  <select
                    value={newCamFormat}
                    onChange={(e) => setNewCamFormat(e.target.value as CameraFormat)}
                    className="apple-input"
                  >
                    <option value="135_full">35mm 풀프레임 (135)</option>
                    <option value="135_half">35mm 하프프레임</option>
                    <option value="120_66">중형 6x6 (Hasselblad 등)</option>
                    <option value="120_67">중형 6x7 (Pentax 67 등)</option>
                    <option value="120_645">중형 6x4.5</option>
                    <option value="panorama">파노라마 (XPan 등)</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div className="field-group flex-1">
                  <label>렌즈 유형</label>
                  <select
                    value={newCamLensType}
                    onChange={(e) => setNewCamLensType(e.target.value as 'interchangeable' | 'fixed')}
                    className="apple-input"
                  >
                    <option value="interchangeable">렌즈 교환식 (바요넷/스크류)</option>
                    <option value="fixed">일체형 렌즈 (P&S / RF)</option>
                  </select>
                </div>
                <div className="field-group flex-1">
                  <label>작동 상태</label>
                  <select
                    value={newCamStatus}
                    onChange={(e) => setNewCamStatus(e.target.value as EquipmentStatus)}
                    className="apple-input"
                  >
                    <option value="active">정상 작동</option>
                    <option value="needs_repair">수리 필요 (고장)</option>
                    <option value="in_repair">수리 입고 중</option>
                    <option value="collection">소장용</option>
                  </select>
                </div>
              </div>

              {/* Interchangeable Lens Mount Setting */}
              {newCamLensType === 'interchangeable' && (
                <div className="field-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ marginBottom: 0 }}>카메라 렌즈 마운트 (직접 자유 입력)</label>
                    <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
                      ★ 렌즈 추가 드롭다운과 자동 연동
                    </span>
                  </div>
                  <input
                    type="text"
                    value={newCamMount}
                    onChange={(e) => setNewCamMount(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: M 또는 Leica M, Nikon F, M42, Hasselblad V 등"
                    className="apple-input"
                    required
                  />
                  <p style={{ fontSize: '0.74rem', color: '#86868b', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    💡 라이카의 경우 <strong>M</strong> 한 글자만 적거나 <strong>Leica M</strong> 처럼 원하는 방식으로 적으세요.
                    이후 렌즈를 등록할 때 이 마운트가 <strong>드롭다운 선택 메뉴</strong>에 자동으로 생성됩니다.
                  </p>
                </div>
              )}

              {/* Fixed Lens Details if fixed */}
              {newCamLensType === 'fixed' && (
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
                  <div className="field-group flex-1">
                    <label>일체형 렌즈명</label>
                    <input
                      type="text"
                      value={newCamFixedName}
                      onChange={(e) => setNewCamFixedName(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="예: Summicron 40mm f/2"
                      className="apple-input"
                    />
                  </div>
                  <div className="field-group" style={{ width: '90px' }}>
                    <label>초점거리(mm)</label>
                    <input
                      type="number"
                      value={newCamFixedFocal}
                      onChange={(e) => setNewCamFixedFocal(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="40"
                      className="apple-input"
                    />
                  </div>
                  <div className="field-group" style={{ width: '90px' }}>
                    <label>최대조리개(f)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCamFixedAperture}
                      onChange={(e) => setNewCamFixedAperture(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="2.0"
                      className="apple-input"
                    />
                  </div>
                </div>
              )}

              {/* Serial & Notes */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>시리얼 번호 (선택사항)</label>
                  <input
                    type="text"
                    value={newCamSerial}
                    onChange={(e) => setNewCamSerial(e.target.value)}
                    placeholder="예: 2478910"
                    className="apple-input"
                  />
                </div>
                <div className="field-group flex-1">
                  <label>메모 (바디 상태, 특징 등)</label>
                  <input
                    type="text"
                    value={newCamNotes}
                    onChange={(e) => setNewCamNotes(e.target.value)}
                    placeholder="예: 뷰파인더 청소 완료, 셔터스피드 점검필"
                    className="apple-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="apple-secondary-btn"
                  onClick={() => setIsAddCameraOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="apple-primary-btn glow"
                >
                  <span>카메라 바디 등록</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          QUICK ADD LENS MODAL (렌즈 실물 사진 업로드 & 광학 스펙 등록)
          ============================================================ */}
      {isAddLensOpen && (
        <div className="apple-modal-backdrop" onClick={() => setIsAddLensOpen(false)}>
          <div className="apple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="apple-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Aperture size={20} color="#34d399" />
                <h3>새 렌즈 등록 (실물 사진 & 광학계 스펙)</h3>
              </div>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setIsAddLensOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewLens} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Photo Upload Section */}
              <div className="field-group">
                <label>렌즈 실물 사진 (내 렌즈 사진 업로드)</label>
                {newLensImage ? (
                  <div className="photo-preview-box">
                    <img src={newLensImage} alt="렌즈 미리보기" className="camera-real-photo" />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => setNewLensImage('')}
                      title="사진 삭제"
                    >
                      <X size={14} />
                      <span>사진 삭제</span>
                    </button>
                  </div>
                ) : (
                  <label className="photo-uploader-area">
                    <Upload size={24} color="#34d399" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7' }}>
                      클릭하여 렌즈 사진 파일 선택
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#86868b', marginTop: '4px' }}>
                      JPG, PNG, WEBP 등 지원 (최대 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLensPhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* Brand & Name */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group" style={{ width: '150px' }}>
                  <label>제조사 (Brand)</label>
                  <input
                    type="text"
                    value={newLensBrand}
                    onChange={(e) => setNewLensBrand(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Leica, Carl Zeiss"
                    className="apple-input"
                    required
                  />
                </div>
                <div className="field-group flex-1">
                  <label>렌즈명 (Lens Model)</label>
                  <input
                    type="text"
                    value={newLensName}
                    onChange={(e) => setNewLensName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Summicron 50mm f/2 Rigid, Nokton 35mm f/1.4"
                    className="apple-input"
                    required
                  />
                </div>
              </div>

              {/* Mount & Category & Aperture */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>렌즈 마운트 (보유 카메라 마운트)</span>
                    <span style={{ fontSize: '0.7rem', color: '#34d399' }}>
                      보유 카메라 연동 드롭다운
                    </span>
                  </label>
                  {availableCameraMounts.length > 0 ? (
                    <select
                      value={newLensMount}
                      onChange={(e) => setNewLensMount(e.target.value)}
                      className="apple-input"
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="text"
                        value={newLensMount}
                        onChange={(e) => setNewLensMount(e.target.value)}
                        placeholder="예: Leica M 또는 M"
                        className="apple-input"
                        required
                      />
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>
                        ⚠️ 등록된 교환식 카메라가 없습니다. 카메라 바디 등록 시 마운트를 적으면 드롭다운으로 자동 연동됩니다.
                      </span>
                    </div>
                  )}
                </div>
                <div className="field-group flex-1">
                  <label>렌즈 구분</label>
                  <select
                    value={newLensCategory}
                    onChange={(e) => setNewLensCategory(e.target.value as 'prime' | 'zoom')}
                    className="apple-input"
                  >
                    <option value="prime">단렌즈 (Prime)</option>
                    <option value="zoom">줌렌즈 (Zoom)</option>
                  </select>
                </div>
                <div className="field-group flex-1">
                  <label>최대개방 f값</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLensMaxAperture}
                    onChange={(e) => setNewLensMaxAperture(Number(e.target.value))}
                    placeholder="1.4"
                    className="apple-input"
                    required
                  />
                </div>
              </div>

              {/* Focal Lengths & Format */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>{newLensCategory === 'zoom' ? '최소 초점거리 (mm)' : '초점거리 (mm)'}</label>
                  <input
                    type="number"
                    value={newLensFocalMin}
                    onChange={(e) => setNewLensFocalMin(Number(e.target.value))}
                    placeholder="50"
                    className="apple-input"
                    required
                  />
                </div>
                {newLensCategory === 'zoom' && (
                  <div className="field-group flex-1">
                    <label>최대 초점거리 (mm)</label>
                    <input
                      type="number"
                      value={newLensFocalMax}
                      onChange={(e) => setNewLensFocalMax(Number(e.target.value))}
                      placeholder="85"
                      className="apple-input"
                      required
                    />
                  </div>
                )}
                <div className="field-group flex-1">
                  <label>호환 판형</label>
                  <select
                    value={newLensFormat}
                    onChange={(e) => setNewLensFormat(e.target.value)}
                    className="apple-input"
                  >
                    <option value="135">35mm (135)</option>
                    <option value="120">중형 (120)</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div className="field-group flex-1">
                  <label>작동 상태</label>
                  <select
                    value={newLensStatus}
                    onChange={(e) => setNewLensStatus(e.target.value as EquipmentStatus)}
                    className="apple-input"
                  >
                    <option value="active">정상 작동</option>
                    <option value="needs_repair">수리 필요</option>
                    <option value="collection">소장용</option>
                  </select>
                </div>
              </div>

              {/* Serial & Notes */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>시리얼 번호 (선택사항)</label>
                  <input
                    type="text"
                    value={newLensSerial}
                    onChange={(e) => setNewLensSerial(e.target.value)}
                    placeholder="예: 3124890"
                    className="apple-input"
                  />
                </div>
                <div className="field-group flex-1">
                  <label>메모 (렌즈 광학 상태, 코팅 특징 등)</label>
                  <input
                    type="text"
                    value={newLensNotes}
                    onChange={(e) => setNewLensNotes(e.target.value)}
                    placeholder="예: 유리 곰팡이 없음, 조리개 유격 점검 완료"
                    className="apple-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="apple-secondary-btn"
                  onClick={() => setIsAddLensOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="apple-primary-btn emerald-glow"
                >
                  <span>렌즈 등록 및 마운트</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          QUICK ADD SCANNER / DIGITIZING RIG MODAL
          ============================================================ */}
      {isAddScannerOpen && (
        <div className="apple-glass-modal-overlay">
          <div className="apple-glass-modal" style={{ maxWidth: '580px' }}>
            <div className="modal-top-bar">
              <div className="modal-title-box">
                <span className="modal-icon-bubble">
                  <HardDrive size={18} />
                </span>
                <div>
                  <h3>새 스캐너 / 디지타이징 장비 등록</h3>
                  <p>미러리스 디지타이징 리그, 평판, 필름 전용 스캐너를 등록합니다.</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setIsAddScannerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewScanner} className="apple-modal-form">
              <div className="field-group">
                <label>장비명 / 세트 명칭 *</label>
                <input
                  type="text"
                  value={newScannerName}
                  onChange={(e) => setNewScannerName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: Sony A7R IV + 90mm Macro 또는 Epson V850 Pro"
                  className="apple-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>장비 분류</label>
                  <select
                    value={newScannerCategory}
                    onChange={(e) => setNewScannerCategory(e.target.value as ScannerCategory)}
                    className="apple-input"
                  >
                    <option value="digitizing">📷 디지타이징 (카메라/센서)</option>
                    <option value="flatbed">🖨️ 평판 필름 스캐너</option>
                    <option value="dedicated">🎞️ 필름 전용 스캐너</option>
                    <option value="other">⚙️ 기타 장비</option>
                  </select>
                </div>

                <div className="field-group flex-1">
                  <label>제조사 / 브랜드 (선택)</label>
                  <input
                    type="text"
                    value={newScannerBrand}
                    onChange={(e) => setNewScannerBrand(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Sony, Epson, Plustek, Nikon"
                    className="apple-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>광원 / 백라이트 규격</label>
                  <input
                    type="text"
                    value={newScannerLight}
                    onChange={(e) => setNewScannerLight(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Cinestill CS-LITE (95+ CRI), 내장 광원"
                    className="apple-input"
                  />
                </div>

                <div className="field-group flex-1">
                  <label>필름 캐리어 / 홀더 종류</label>
                  <input
                    type="text"
                    value={newScannerHolder}
                    onChange={(e) => setNewScannerHolder(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="예: Valoi 360, 정품 홀더"
                    className="apple-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label>특이사항 및 권장 설정 메모</label>
                <input
                  type="text"
                  value={newScannerNotes}
                  onChange={(e) => setNewScannerNotes(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="예: 6100만 화소 16bit 무압축 RAW 캡처, 조리개 f/8 최적 등"
                  className="apple-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="apple-secondary-btn"
                  onClick={() => setIsAddScannerOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="apple-primary-btn amber-glow"
                >
                  <span>장비 등록 완료</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MACOS FINDER GET INFO / FOLDER INSPECTOR MODAL
          ============================================================ */}
      {inspectingScan && (() => {
        const colorKey = (inspectingScan.folder_color as MacFolderColorKey) || 'mac_sky_blue';
        const cConfig = MAC_FOLDER_COLORS[colorKey] || MAC_FOLDER_COLORS.mac_sky_blue;
        const roll = inspectingRoll;
        const matchedScanner = inspectingScanner;

        const filmTitle = roll?.film_name_snapshot || inspectingScan.film_title;
        const cameraTitle = roll?.camera_name_snapshot || inspectingScan.camera_lens_info || '미지정 바디';
        const lensTitle = roll?.lens_name_snapshot || '미지정 렌즈';

        const isCloudPath = Boolean(
          inspectingScan.storage_path &&
          (inspectingScan.storage_path.startsWith('http://') ||
            inspectingScan.storage_path.startsWith('https://'))
        );
        const isLocalPath = Boolean(
          inspectingScan.storage_path && !isCloudPath
        );

        return (
          <div
            className="apple-glass-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setInspectingScan(null);
            }}
          >
            <div className="mac-inspector-modal" style={{ maxWidth: '640px' }}>
              {/* macOS Window Titlebar */}
              <div className="mac-window-titlebar">
                <div className="mac-window-controls">
                  <button
                    type="button"
                    className="mac-dot mac-dot-close"
                    onClick={() => setInspectingScan(null)}
                    title="닫기"
                  />
                  <span className="mac-dot mac-dot-minimize" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <div className="mac-window-title-text">
                  <Folder size={14} />
                  <span>{inspectingScan.folder_name} — 정보 가져오기</span>
                </div>
                <button
                  type="button"
                  className="modal-close-x"
                  onClick={() => setInspectingScan(null)}
                  title="닫기"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Inspector Content Scrollable Body */}
              <div className="mac-inspector-body">
                {/* Header Banner: 3D Folder Thumbnail + Folder Name & Tags */}
                <div className="mac-inspector-hero">
                  <div className="mac-inspector-folder-preview">
                    {/* Compact Folder Preview */}
                    <div className="inspector-mini-folder">
                      <div
                        className="mini-folder-backplate"
                        style={{ background: cConfig.backColor }}
                      >
                        <div
                          className="mini-folder-tab"
                          style={{ background: cConfig.tabGrad }}
                        />
                      </div>
                      <div
                        className={`mini-folder-front ${cConfig.isGlossy ? 'glossy' : ''}`}
                        style={{ background: cConfig.frontGrad }}
                      >
                        <Film size={16} color="#fff" />
                        <span className="mini-folder-frames">{inspectingScan.total_frames}F</span>
                      </div>
                    </div>
                  </div>

                  <div className="mac-inspector-hero-info">
                    <div className="mac-inspector-tag-row">
                      <span className="inspector-pill blue">{inspectingScan.total_frames}컷 완료</span>
                      <span className="inspector-pill gray">{inspectingScan.scan_date || '날짜 미기록'}</span>
                      <span className="inspector-pill purple">{cConfig.label}</span>
                      {inspectingScan.is_legacy_archive ? (
                        <span className="inspector-pill amber">과거 아카이브</span>
                      ) : (
                        <span className="inspector-pill green">롤 연동 데이터</span>
                      )}
                    </div>
                    <h3 className="mac-inspector-folder-title" title={inspectingScan.folder_name}>
                      {inspectingScan.folder_name}
                    </h3>
                    <p className="mac-inspector-subtitle">
                      {filmTitle} {cameraTitle !== '미지정 바디' ? `• ${cameraTitle}` : ''}
                    </p>
                  </div>
                </div>

                {/* 2-Column Responsive Information Cards */}
                <div className="mac-inspector-grid">
                  {/* Card 1: Film */}
                  <div className="inspector-info-card">
                    <div className="inspector-card-header">
                      <Film size={15} className="card-icon text-amber" />
                      <h4>필름 정보</h4>
                    </div>
                    <div className="inspector-card-content">
                      <div className="inspector-field">
                        <span className="field-label">필름명</span>
                        <span className="field-value highlight">{filmTitle}</span>
                      </div>
                      {roll?.iso_rated ? (
                        <div className="inspector-field">
                          <span className="field-label">촬영 감도</span>
                          <span className="field-value">EI / ISO {roll.iso_rated}</span>
                        </div>
                      ) : null}
                      <div className="inspector-field">
                        <span className="field-label">롤 식별</span>
                        <span className="field-value text-muted">
                          {inspectingScan.is_legacy_archive
                            ? '옛날 보관 필름 (아카이브)'
                            : (roll?.title || '현상 완료 롤')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Camera & Lens */}
                  <div className="inspector-info-card">
                    <div className="inspector-card-header">
                      <Camera size={15} className="card-icon text-blue" />
                      <h4>카메라 & 렌즈</h4>
                    </div>
                    <div className="inspector-card-content">
                      <div className="inspector-field">
                        <span className="field-label">카메라 바디</span>
                        <span className="field-value highlight">{cameraTitle}</span>
                      </div>
                      <div className="inspector-field">
                        <span className="field-label">장착 렌즈</span>
                        <span className="field-value">{lensTitle}</span>
                      </div>
                      {roll?.shooting_sessions && roll.shooting_sessions.length > 0 && (
                        <div className="inspector-field">
                          <span className="field-label">출사 장소</span>
                          <span className="field-value text-muted">
                            {roll.shooting_sessions.map((s) => s.location).filter(Boolean).join(', ') || '출사 장소 미기록'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Development Process */}
                  <div className="inspector-info-card">
                    <div className="inspector-card-header">
                      <FlaskConical size={15} className="card-icon text-green" />
                      <h4>현상 프로세스</h4>
                    </div>
                    <div className="inspector-card-content">
                      {roll ? (
                        roll.dev_type === 'self' ? (
                          <>
                            <div className="inspector-field">
                              <span className="field-label">현상 방식</span>
                              <span className="field-value badge-self">🧪 자가현상</span>
                            </div>
                            <div className="inspector-field">
                              <span className="field-label">현상액</span>
                              <span className="field-value highlight">
                                {roll.developer_name_snapshot || '현상액'}
                                {roll.dilution_ratio ? ` (${roll.dilution_ratio})` : ''}
                              </span>
                            </div>
                            {(roll.dev_temp_celsius || roll.dev_time) && (
                              <div className="inspector-field">
                                <span className="field-label">온도 / 시간</span>
                                <span className="field-value">
                                  {roll.dev_temp_celsius ? `${roll.dev_temp_celsius}°C` : ''}{' '}
                                  {roll.dev_time ? `• ${roll.dev_time}` : ''}
                                </span>
                              </div>
                            )}
                            {roll.dev_method && (
                              <div className="inspector-field">
                                <span className="field-label">교반 방식</span>
                                <span className="field-value text-muted">
                                  {roll.dev_method === 'rotary'
                                    ? '로터리 (Jobo)'
                                    : roll.dev_method === 'inversion'
                                      ? '수교반 (Inversion)'
                                      : roll.dev_method === 'stand'
                                        ? '스탠딩 (정치현상)'
                                        : roll.dev_method}
                                  {roll.agitation_details ? ` (${roll.agitation_details})` : ''}
                                </span>
                              </div>
                            )}
                          </>
                        ) : roll.dev_type === 'lab' ? (
                          <>
                            <div className="inspector-field">
                              <span className="field-label">현상 방식</span>
                              <span className="field-value badge-lab">🏢 현상소 위탁</span>
                            </div>
                            <div className="inspector-field">
                              <span className="field-label">위탁 현상소</span>
                              <span className="field-value highlight">{roll.lab_name || '전문 현상소'}</span>
                            </div>
                            {roll.developed_date && (
                              <div className="inspector-field">
                                <span className="field-label">현상 완료일</span>
                                <span className="field-value">{roll.developed_date}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="inspector-field">
                            <span className="field-label">현상 구분</span>
                            <span className="field-value text-muted">현상 완료본</span>
                          </div>
                        )
                      ) : (
                        <>
                          <div className="inspector-field">
                            <span className="field-label">현상 구분</span>
                            <span className="field-value text-muted">과거 아카이브 완료본</span>
                          </div>
                          <div className="inspector-field">
                            <span className="field-label">현상 상태</span>
                            <span className="field-value">필름 현상 완료 후 스캔 등록됨</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Scan Setup */}
                  <div className="inspector-info-card">
                    <div className="inspector-card-header">
                      <HardDrive size={15} className="card-icon text-cyan" />
                      <h4>스캔 방식 & 장비</h4>
                    </div>
                    <div className="inspector-card-content">
                      <div className="inspector-field">
                        <span className="field-label">스캔 방식</span>
                        <span className="field-value highlight">
                          {inspectingScan.scan_method === 'digitizing' || inspectingScan.scan_method === 'dslr'
                            ? '📷 디지타이징 (카메라/센서)'
                            : inspectingScan.scan_method === 'flatbed'
                              ? '🖨️ 평판 필름 스캐너'
                              : inspectingScan.scan_method === 'dedicated'
                                ? '🎞️ 전용 필름 스캐너'
                                : inspectingScan.scan_method === 'lab'
                                  ? '🏢 현상소 스캔'
                                  : '⚙️ 기타 방식'}
                        </span>
                      </div>

                      {inspectingScan.scan_method === 'lab' ? (
                        <>
                          <div className="inspector-field">
                            <span className="field-label">현상소 스캐너</span>
                            <span className="field-value highlight">
                              {inspectingScan.lab_scanner || '노리츠 / 후지 스캐너'}
                            </span>
                          </div>
                          <div className="inspector-field">
                            <span className="field-label">스캔 화질</span>
                            <span className="field-value">
                              {inspectingScan.lab_resolution === 'high' ? (
                                <span className="text-amber font-semibold">고화질 (3000px+ 16bit)</span>
                              ) : (
                                '일반화질'
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="inspector-field">
                            <span className="field-label">사용 장비</span>
                            <span className="field-value highlight">
                              {matchedScanner?.name || inspectingScan.scanner_model || '디지타이징 장비'}
                            </span>
                          </div>
                          {matchedScanner?.sensor_or_light && (
                            <div className="inspector-field">
                              <span className="field-label">광원 / 센서</span>
                              <span className="field-value text-muted">{matchedScanner.sensor_or_light}</span>
                            </div>
                          )}
                          {matchedScanner?.holder_type && (
                            <div className="inspector-field">
                              <span className="field-label">필름 홀더</span>
                              <span className="field-value text-muted">{matchedScanner.holder_type}</span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="inspector-field">
                        <span className="field-label">소프트웨어</span>
                        <span className="field-value">{inspectingScan.software_used || 'Negative Lab Pro'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 5: Storage Path & Notes (Full Width) */}
                <div className="inspector-info-card full-width">
                  <div className="inspector-card-header">
                    <Folder size={15} className="card-icon text-indigo" />
                    <h4>저장 위치 및 세부 메모</h4>
                  </div>
                  <div className="inspector-card-content">
                    <div className="inspector-field">
                      <span className="field-label">저장 경로 / 링크</span>
                      <div className="field-path-box">
                        {inspectingScan.storage_path ? (
                          <div className="path-text-row">
                            <span className="path-code" title={inspectingScan.storage_path}>
                              {inspectingScan.storage_path}
                            </span>
                            {isCloudPath && (
                              <span className="badge-tag-cloud">
                                <ExternalLink size={11} /> 웹 클라우드
                              </span>
                            )}
                            {isLocalPath && (
                              <span className="badge-tag-local">
                                <HardDrive size={11} /> 로컬/외장하드
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">등록된 클라우드 링크나 로컬 경로가 없습니다.</span>
                        )}
                      </div>
                    </div>

                    {(inspectingScan.notes || roll?.notes) && (
                      <div className="inspector-field" style={{ marginTop: '8px' }}>
                        <span className="field-label">특이사항 / 메모</span>
                        <div className="notes-box">
                          {inspectingScan.notes && <div>{inspectingScan.notes}</div>}
                          {roll?.notes && (
                            <div className="text-muted" style={{ marginTop: '3px' }}>
                              롤 메모: {roll.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspector Footer Actions Bar */}
              <div className="mac-inspector-footer">
                <div className="inspector-footer-left">
                  {/* Copy buttons */}
                  <button
                    type="button"
                    className="inspector-action-btn secondary"
                    onClick={() => handleCopyInspectInfo(inspectingScan, 'path')}
                    title="저장 경로 또는 폴더명을 클립보드에 복사"
                  >
                    {isCopiedInspectFolder ? (
                      <>
                        <Check size={14} style={{ color: '#34d399' }} />
                        <span style={{ color: '#34d399' }}>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>경로/폴더명 복사</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="inspector-action-btn secondary"
                    onClick={() => handleCopyInspectInfo(inspectingScan, 'summary')}
                    title="필름, 바디, 렌즈, 현상, 스캔 전체 정보 텍스트 복사"
                  >
                    <Layers size={14} />
                    <span>전체 요약 복사</span>
                  </button>
                </div>

                <div className="inspector-footer-right">
                  <button
                    type="button"
                    className="inspector-action-btn primary"
                    onClick={() => handleJumpToCloudStorage(inspectingScan)}
                    title={
                      isCloudPath
                        ? '새 브라우저 탭에서 클라우드 폴더 열기'
                        : isLocalPath
                          ? '로컬 경로 복사 및 Finder 이동 안내'
                          : '클라우드 링크 열기'
                    }
                  >
                    {isCloudPath ? (
                      <>
                        <ExternalLink size={14} />
                        <span>클라우드로 이동하기</span>
                      </>
                    ) : (
                      <>
                        <HardDrive size={14} />
                        <span>클라우드/저장소 열기</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="inspector-action-btn close-btn"
                    onClick={() => setInspectingScan(null)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
