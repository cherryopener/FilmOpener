'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FilmItem,
  CameraItem,
  LensItem,
  DeveloperChemical,
  ShootingRoll,
  ScanLog,
  WeatherType,
  AgitationMethod,
  ScanMethod,
  DevType,
  FilmType,
  FilmFormat,
  StorageMethod,
  CameraFormat,
  EquipmentStatus,
} from '@/types';
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
} from 'lucide-react';

interface AppleScrollStudioProps {
  films: FilmItem[];
  cameras: CameraItem[];
  lenses: LensItem[];
  developers: DeveloperChemical[];
  rolls: ShootingRoll[];
  scans: ScanLog[];
  onSaveFilm: (film: FilmItem) => Promise<void>;
  onSaveCamera: (camera: CameraItem) => Promise<void>;
  onSaveLens: (lens: LensItem) => Promise<void>;
  onSaveDeveloper: (dev: DeveloperChemical) => Promise<void>;
  onSaveRoll: (roll: ShootingRoll, prev?: ShootingRoll) => Promise<void>;
  onSaveScan: (scan: ScanLog) => Promise<void>;
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

export default function AppleScrollStudio({
  films,
  cameras,
  lenses,
  developers,
  rolls,
  scans,
  onSaveFilm,
  onSaveCamera,
  onSaveLens,
  onSaveDeveloper,
  onSaveRoll,
  onSaveScan,
  onOpenSettings,
  onSwitchToTableView,
  userEmail,
  onLogout,
}: AppleScrollStudioProps) {
  // Active Chapter for Floating Dock Spy
  const [activeChapter, setActiveChapter] = useState<string>('section-films');

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
      location: '서울 경복궁 서촌 골목길',
      shots: 18,
      notes: '오후 3시 자연광 인물 및 스냅',
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

  // Quick Add Camera Modal State (with Real Photo Upload)
  const [isAddCameraOpen, setIsAddCameraOpen] = useState<boolean>(false);
  const [newCamBrand, setNewCamBrand] = useState<string>('Leica');
  const [newCamModel, setNewCamModel] = useState<string>('M6 Classic');
  const [newCamFormat, setNewCamFormat] = useState<CameraFormat>('135_full');
  const [newCamLensType, setNewCamLensType] = useState<'interchangeable' | 'fixed'>('interchangeable');
  const [newCamFixedName, setNewCamFixedName] = useState<string>('');
  const [newCamFixedFocal, setNewCamFixedFocal] = useState<string>('');
  const [newCamFixedAperture, setNewCamFixedAperture] = useState<string>('');
  const [newCamStatus, setNewCamStatus] = useState<EquipmentStatus>('active');
  const [newCamSerial, setNewCamSerial] = useState<string>('');
  const [newCamImage, setNewCamImage] = useState<string>('');
  const [newCamNotes, setNewCamNotes] = useState<string>('');

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
  const [labName, setLabName] = useState<string>('고래사진관 충무로점');
  const [dilutionRatio, setDilutionRatio] = useState<string>('1:1');
  const [devTemp, setDevTemp] = useState<number>(20.0);
  const [devTime, setDevTime] = useState<string>('9분 30초');
  const [agitationMethod, setAgitationMethod] = useState<AgitationMethod>('rotary');
  const [agitationNotes, setAgitationNotes] = useState<string>(
    'Jobo 연속 회전 30초 정역반전'
  );

  // Active Scan State
  const [scanSelectedRollId, setScanSelectedRollId] = useState<string>('');
  const [scanMethod, setScanMethod] = useState<ScanMethod>('dslr');
  const [scannerModel, setScannerModel] = useState<string>(
    'Sony A7R IV + 90mm Macro (Cinestill CS-LITE)'
  );
  const [folderName, setFolderName] = useState<string>('');
  const [scanFrames, setScanFrames] = useState<number>(36);
  const [scanSoftware, setScanSoftware] = useState<string>('Negative Lab Pro v3.0');
  const [scanNotes, setScanNotes] = useState<string>('16bit DNG 캡처, 뉴트럴 톤 반전');
  const [isCopiedFolder, setIsCopiedFolder] = useState<boolean>(false);

  // Quick Add Film Batch Modal State (Demonstrating separate lots for same film name)
  const [isAddFilmOpen, setIsAddFilmOpen] = useState<boolean>(false);
  const [newFilmName, setNewFilmName] = useState<string>('코닥 골드 200 (Kodak Gold 200)');
  const [newFilmBrand, setNewFilmBrand] = useState<string>('Kodak');
  const [newFilmType, setNewFilmType] = useState<FilmType>('color_negative');
  const [newFilmFormat, setNewFilmFormat] = useState<FilmFormat>('135');
  const [newFilmIso, setNewFilmIso] = useState<number>(200);
  const [newFilmExpiry, setNewFilmExpiry] = useState<string>('2018-05-31');
  const [newFilmStorage, setNewFilmStorage] = useState<StorageMethod>('frozen');
  const [newFilmExpired, setNewFilmExpired] = useState<boolean>(true);
  const [newFilmQuantity, setNewFilmQuantity] = useState<number>(2);
  const [newFilmNotes, setNewFilmNotes] = useState<string>('서랍 안에서 발견된 빈티지 썩필 (냉동 보관)');

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

    // Match mount by brand/model rules
    const camModel = selectedCamera.model.toLowerCase();
    const camBrand = selectedCamera.brand.toLowerCase();

    return lenses.filter((lens) => {
      const mount = (lens.mount || '').toLowerCase();
      if (camBrand.includes('leica') || camModel.includes('m6') || camModel.includes('m3')) {
        return mount.includes('leica m') || mount.includes('m mount');
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

  // Smooth Scroll Jump
  const scrollToChapter = (sectionId: string) => {
    setActiveChapter(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll Spy for Chapter Indicator
  useEffect(() => {
    const handleScroll = () => {
      const chapters = [
        'section-films',
        'section-gear',
        'section-shooting',
        'section-development',
        'section-scans',
      ];
      const scrollY = window.scrollY + 200;

      for (const chId of chapters) {
        const el = document.getElementById(chId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveChapter(chId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Quick Add Film Batch (Supports adding multiple batches of same film with different expiry / expired status)
  const handleQuickAddFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilmName.trim() || !newFilmBrand.trim()) {
      alert('필름 이름과 제조사를 입력해주세요.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isAutoExpired = newFilmExpired || (newFilmExpiry ? newFilmExpiry < todayStr : false);

    const newFilm: FilmItem = {
      id: `film-${Date.now()}`,
      name: newFilmName.trim(),
      brand: newFilmBrand.trim(),
      type: newFilmType,
      format: newFilmFormat,
      iso: Number(newFilmIso) || 200,
      expiry_date: newFilmExpiry,
      storage_method: newFilmStorage,
      is_bulk_rolled: false,
      is_expired: isAutoExpired,
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
    alert(`✨ [${newFilm.name}] (유통기한: ${newFilm.expiry_date}, ${newFilm.quantity}롤)이 보관함에 새 배치로 등록되었습니다!`);
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
    alert(`📷 [${newCam.brand} ${newCam.model}] 카메라가 성공적으로 등록되었습니다!`);
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
      dev_time: devType === 'self' ? devTime : undefined,
      dev_method: devType === 'self' ? agitationMethod : undefined,
      agitation_details: devType === 'self' ? agitationNotes : undefined,
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
    const scanRoll = rolls.find((r) => r.id === scanSelectedRollId);

    const newScan: ScanLog = {
      id: `scan-${Date.now()}`,
      roll_id: scanRoll?.id,
      is_legacy_archive: !scanRoll,
      film_title: scanRoll
        ? `${scanRoll.film_name_snapshot} (${scanRoll.title})`
        : folderName,
      camera_lens_info: scanRoll
        ? `${scanRoll.camera_name_snapshot}${
            scanRoll.lens_name_snapshot ? ` + ${scanRoll.lens_name_snapshot}` : ''
          }`
        : '자유 기재 아카이브',
      scan_method: scanMethod,
      scanner_model: scannerModel,
      total_frames: Number(scanFrames) || 36,
      folder_name: folderName,
      storage_path: '로컬 스튜디오 아카이브 / 클라우드 볼트',
      software_used: scanSoftware,
      scan_date: new Date().toISOString().split('T')[0],
      notes: scanNotes,
      created_at: new Date().toISOString(),
    };

    await onSaveScan(newScan);
    alert(`✨ [${folderName}] 스캔 아카이브가 안전하게 보관소에 등록되었습니다!`);
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
          <h1 className="hero-headline hero-reveal-2">
            빛을 담고, 암실에서 깨워,<br />
            영원으로 스캔하다.
          </h1>
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
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">보유 필름 보관소 (The Film Shelf)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            책장에 꽂힌 실제 필름 캐니스터를 고르듯 선택하세요. 같은 필름이라도 유통기한, 보관 방식,
            썩은 필름(만료) 여부에 따라 각각 개별 캐니스터로 정밀 분리되어 보관됩니다.
          </p>

        </div>

        {/* 3D Realistic Wooden / Anodized Shelf Rack */}
        <div className="film-shelf-rack reveal-on-scroll reveal-scale reveal-delay-1">
          <div className="shelf-top-backplate" />

          <div className="shelf-grid">
            {films.map((film, fIndex) => (
              <div
                key={film.id}
                className="reveal-on-scroll"
                style={{ transitionDelay: `${Math.min(0.06 * fIndex, 0.42)}s` }}
              >
                <FilmCanister3D
                  film={film}
                  isSelected={selectedFilmId === film.id}
                  onClick={() => setSelectedFilmId(film.id)}
                  actionLabel="카메라에 장전"
                />
              </div>
            ))}

            {/* + Add New Batch Slot on the Shelf */}
            <div
              className="reveal-on-scroll"
              style={{ transitionDelay: `${Math.min(0.06 * films.length, 0.48)}s` }}
            >
              <div
                className="add-film-shelf-slot"
                onClick={() => setIsAddFilmOpen(true)}
                title="새 필름 배치 등록 (같은 이름이라도 유통기한/썩필/보관법 개별 등록)"
              >
                <div className="add-slot-plus">
                  <Plus size={22} />
                </div>
                <span className="add-slot-text">+ 새 필름 등록</span>
                <span className="add-slot-sub">유통기한/썩필 분리</span>
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
          <h2 className="chapter-title reveal-on-scroll reveal-title reveal-delay-1">기재실 & 렌즈 마운트 결합 (The Gear Rig)</h2>
          <p className="chapter-desc reveal-on-scroll reveal-delay-2">
            선택한 카메라의 기계식 셔터와 뷰파인더를 확인하세요. 카메라 마운트에 완벽하게 결합되는
            호환 렌즈가 자동으로 매칭됩니다.
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
                <span>+ 새 카메라 추가</span>
              </button>
            </div>
            <div className="camera-cards-list">
              {cameras.map((camera, cIndex) => {
                const isSelected = selectedCameraId === camera.id;
                const isBroken = camera.status !== 'active';

                return (
                  <div
                    key={camera.id}
                    className={`camera-visual-card reveal-on-scroll ${isSelected ? 'selected' : ''} ${
                      isBroken ? 'disabled' : ''
                    }`}
                    style={{ transitionDelay: `${Math.min(0.08 * cIndex, 0.4)}s` }}
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
                                  {camera.lens_type === 'fixed' ? 'FIXED' : 'BAYONET'}
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
            <h3 className="column-title">
              2. 마운트 호환 렌즈 매칭{' '}
              {selectedCamera?.lens_type === 'fixed' ? (
                <span className="fixed-notice">(일체형 렌즈 고정)</span>
              ) : (
                <span className="mount-notice">
                  ({compatibleLenses.length}개 렌즈 호환 가능)
                </span>
              )}
            </h3>

            {selectedCamera?.lens_type === 'fixed' ? (
              <div className="fixed-lens-spotlight-card reveal-on-scroll reveal-delay-1">
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
                {compatibleLenses.map((lens, lIndex) => {
                  const isMounted = selectedLensId === lens.id;

                  return (
                    <div
                      key={lens.id}
                      className={`lens-visual-card reveal-on-scroll ${isMounted ? 'mounted' : ''}`}
                      style={{ transitionDelay: `${Math.min(0.08 * lIndex, 0.4)}s` }}
                      onClick={() => setSelectedLensId(lens.id)}
                    >
                      <div className="lens-graphic-barrel">
                        <div className="lens-front-element">
                          <div className="lens-glass-reflection" />
                        </div>
                        <div className="lens-aperture-scale">
                          <span>1: {lens.max_aperture}</span>
                        </div>
                      </div>

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
                    <span>현재 카메라에 장전 중인 롤 ({currentlyLoadedRolls.length})</span>
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
                    title="새로운 필름 롤을 새로 장전합니다."
                  >
                    <span>+ 새로운 롤 장전하기</span>
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
                    ? '현재 선택된 장전 롤:'
                    : '장전될 장비 세트:'}
                </span>
              </div>
              <div className="rig-bar-content">
                <span className="rig-item-pill film" title="선택된 필름">
                  🎞️ <strong>{selectedFilm?.name || '필름 미선택'}</strong>
                  {selectedFilm?.is_expired ? ' (썩필)' : ''}
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
                  placeholder="예: #2026-04 제주 성산일출봉과 서촌 골목"
                  className="apple-input large"
                />
              </div>

              <div className="loaded-date-group">
                <label>필름 장전일 (Loaded Date)</label>
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
                    className="outing-session-item reveal-on-scroll"
                    style={{ transitionDelay: `${Math.min(0.08 * index, 0.3)}s` }}
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
                            placeholder="예: 을지로 세운상가 옥상"
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
                            className="apple-input"
                          />
                        </div>
                      </div>

                      {/* Weather Selector Pills (Staggered Icon Revealing) */}
                      <div className="session-row-2">
                        <label>날씨 선택:</label>
                        <div className="weather-pills-group">
                          {WEATHER_OPTIONS.map((w, wIdx) => (
                            <button
                              key={w.type}
                              type="button"
                              className={`weather-pill reveal-on-scroll reveal-delay-${wIdx + 1} ${
                                session.weather === w.type ? 'active' : ''
                              }`}
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
                      className={`chem-bottle-card reveal-on-scroll ${isSelected ? 'selected' : ''}`}
                      style={{ transitionDelay: `${Math.min(0.08 * bIndex, 0.35)}s` }}
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
                <label>위탁 현상소 이름</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="예: 고래사진관 충무로점, 망우삼림, 필름로그"
                  className="apple-input large"
                />
                <div className="lab-presets-row">
                  {['고래사진관 충무로점', '을지로 망우삼림', '동대문 필름로그', '중앙칼라', '포토마루'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="preset-pill"
                        onClick={() => setLabName(preset)}
                      >
                        {preset}
                      </button>
                    )
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
                  {['Stock (원액)', '1:1', '1:9', '1:25', '1:50', '1:100'].map((d) => (
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
                    className="apple-input"
                  />
                </div>

                <div className="field-group flex-1">
                  <label>현상 시간 (분:초)</label>
                  <input
                    type="text"
                    value={devTime}
                    onChange={(e) => setDevTime(e.target.value)}
                    placeholder="예: 9분 45초"
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
                  placeholder="예: 초기 30초 연속 교반 후 매 30초마다 2회 반전, 물정지 1분, 픽서 5분"
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
            <h4 className="column-title">1. 스캔 방식 및 장비 선택</h4>
            <div className="scanner-presets-grid">
              {[
                {
                  method: 'dslr',
                  title: 'DSLR / 미러리스 디지타이징',
                  desc: 'Sony A7R IV + 90mm Macro (CS-LITE 광원)',
                },
                {
                  method: 'flatbed',
                  title: '평판 필름 스캐너',
                  desc: 'Epson Perfection V850 Pro (SilverFast)',
                },
                {
                  method: 'dedicated',
                  title: '35mm 전용 필름 스캐너',
                  desc: 'Plustek OpticFilm 8200i (QuickScan)',
                },
                {
                  method: 'lab',
                  title: '현상소 하이엔드 스캐너',
                  desc: 'Noritsu HS-1800 / Fuji Frontier SP-3000',
                },
              ].map((s, sIdx) => {
                const isSelected = scanMethod === s.method;
                return (
                  <div
                    key={s.method}
                    className={`scanner-card reveal-on-scroll reveal-delay-${sIdx + 1} ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setScanMethod(s.method as ScanMethod);
                      setScannerModel(s.desc);
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

            <div className="scan-options-row">
              <div className="field-group flex-1">
                <label>총 컷수 (Frames)</label>
                <input
                  type="number"
                  value={scanFrames}
                  onChange={(e) => setScanFrames(Number(e.target.value))}
                  className="apple-input"
                />
              </div>

              <div className="field-group flex-1">
                <label>반전/후처리 소프트웨어</label>
                <input
                  type="text"
                  value={scanSoftware}
                  onChange={(e) => setScanSoftware(e.target.value)}
                  className="apple-input"
                />
              </div>
            </div>

            <div className="field-group">
              <label>색감 / 보정 / 아카이브 메모</label>
              <textarea
                value={scanNotes}
                onChange={(e) => setScanNotes(e.target.value)}
                placeholder="예: DNG 16bit 캡처, Frontier Tone 프로필 적용, 하이라이트 복원 우수"
                rows={3}
                className="apple-textarea"
              />
            </div>

            <button
              type="button"
              className="apple-primary-btn emerald-glow"
              onClick={handleSaveScanRecord}
            >
              <FolderArchive size={16} />
              <span>마스터 아카이브 보관소에 영구 등록</span>
            </button>
          </div>
        </div>
      </section>

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

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="field-group flex-1">
                  <label>유통기한 (EXP Date)</label>
                  <input
                    type="date"
                    value={newFilmExpiry}
                    onChange={(e) => setNewFilmExpiry(e.target.value)}
                    className="apple-input"
                  />
                </div>
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
                <div className="field-group" style={{ width: '100px' }}>
                  <label>보유 수량</label>
                  <input
                    type="number"
                    min="1"
                    value={newFilmQuantity}
                    onChange={(e) => setNewFilmQuantity(Number(e.target.value))}
                    className="apple-input"
                  />
                </div>
              </div>

              {/* Expired Checkbox & Notes */}
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={newFilmExpired}
                    onChange={(e) => setNewFilmExpired(e.target.checked)}
                    style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }}
                  />
                  <span>⚠️ 썩은 필름 (유통기한 만료 썩필) 설정</span>
                </label>
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

              {/* Fixed Lens Details if fixed */}
              {newCamLensType === 'fixed' && (
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
                  <div className="field-group flex-1">
                    <label>일체형 렌즈명</label>
                    <input
                      type="text"
                      value={newCamFixedName}
                      onChange={(e) => setNewCamFixedName(e.target.value)}
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
    </div>
  );
}
