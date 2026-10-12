// FilmOpener Client-Side Master PIN Security Utility
// Allows single-user private instances to lock their application with a secret PIN

const PIN_STORAGE_KEY = 'filmopener_master_pin_hash';
const UNLOCKED_SESSION_KEY = 'filmopener_unlocked_session';

// Web Crypto SHA-256 Hasher
export const hashPin = async (pin: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      hash = (hash << 5) - hash + pin.charCodeAt(i);
      hash |= 0;
    }
    return `simple_${hash}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`filmopener_salt_v1_${pin}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const isPinSet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(PIN_STORAGE_KEY));
};

export const isAppUnlocked = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (!isPinSet()) return true; // If no PIN is configured, allow access
  return sessionStorage.getItem(UNLOCKED_SESSION_KEY) === 'true';
};

export const setMasterPin = async (pin: string): Promise<void> => {
  if (!pin.trim()) {
    localStorage.removeItem(PIN_STORAGE_KEY);
    sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
    return;
  }
  const hash = await hashPin(pin.trim());
  localStorage.setItem(PIN_STORAGE_KEY, hash);
  sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true');
};

export const removeMasterPin = (): void => {
  localStorage.removeItem(PIN_STORAGE_KEY);
  sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
};

export const verifyAndUnlockPin = async (inputPin: string): Promise<boolean> => {
  const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
  if (!storedHash) return true;

  const inputHash = await hashPin(inputPin.trim());
  if (inputHash === storedHash) {
    sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true');
    return true;
  }
  return false;
};

export const lockAppNow = (): void => {
  sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
};
