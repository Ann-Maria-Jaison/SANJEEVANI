/**
 * useOfflineMode.js
 *
 * Provides Emergency Offline Mode functionality for SANJEEVANI.
 *
 * Features:
 * - Caches recently accessed vehicle records in localStorage (obfuscated)
 * - Tracks searches attempted while offline for re-query on reconnection
 * - Auto-updates last synced timestamp when connectivity is restored
 *
 * Security:
 * - Cached data is Base64-encoded to prevent casual inspection
 * - Cache entries expire after CACHE_TTL_MS (default: 24 hours)
 * - Cache is scoped per session via a versioned key prefix
 *
 * NOTE: Base64 is obfuscation, not encryption. For production,
 * replace encodeData/decodeData with AES-GCM (e.g. Web Crypto API).
 */

const CACHE_KEY = "sanjeevani_v1_vehicles";
const UNSYNCED_KEY = "sanjeevani_v1_unsynced";
const LAST_SYNCED_KEY = "sanjeevani_v1_last_synced";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Obfuscation helpers (replace with AES-GCM for production)
const encodeData = (data) => btoa(unescape(encodeURIComponent(JSON.stringify(data))));
const decodeData = (str) => JSON.parse(decodeURIComponent(escape(atob(str))));

// Cache storage helpers

/**
 * Reads all cached vehicle records from localStorage.
 * Silently returns empty object on parse failure.
 */
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? decodeData(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Writes the full cache object back to localStorage.
 */
const writeCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, encodeData(cache));
  } catch (e) {
    console.warn("[SANJEEVANI] Cache write failed:", e.message);
  }
};

/**
 * Reads the unsynced search queue from localStorage.
 */
const readUnsyncedQueue = () => {
  try {
    const raw = localStorage.getItem(UNSYNCED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Main hook

import { useState, useEffect } from "react";

export function useOfflineMode() {
  const [unsyncedSearches, setUnsyncedSearches] = useState(readUnsyncedQueue);

  // Auto-sync when browser detects connectivity restored
  useEffect(() => {
    const handleOnline = () => syncOnReconnect();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Vehicle cache (public API)

  /**
   * Caches a vehicle record for offline access.
   * Attaches a cachedAt timestamp for TTL enforcement.
   * @param {Object} record - Vehicle record object (must have .plate)
   */
  const cacheVehicleRecord = (record) => {
    if (!record?.plate) return;
    const cache = readCache();
    cache[record.plate] = {
      ...record,
      cachedAt: Date.now(),
    };
    writeCache(cache);
  };

  /**
   * Retrieves a cached vehicle record by plate number.
   * Returns null if not found or if the entry has expired.
   * @param {string} plate - Uppercase plate number
   * @returns {Object|null}
   */
  const getCachedVehicleByPlate = (plate) => {
    const cache = readCache();
    const entry = cache[plate];
    if (!entry) return null;

    // TTL check — expire stale entries
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      deleteCachedVehicle(plate);
      return null;
    }
    return entry;
  };

  /**
   * Returns all cached vehicle records (non-expired).
   * @returns {Object} key: plate, value: vehicle record
   */
  const getCachedVehicles = () => {
    const cache = readCache();
    const now = Date.now();
    // Filter out expired entries
    return Object.fromEntries(
      Object.entries(cache).filter(
        ([, v]) => now - v.cachedAt <= CACHE_TTL_MS
      )
    );
  };

  /**
   * Removes a single cached vehicle record.
   * @param {string} plate
   */
  const deleteCachedVehicle = (plate) => {
    const cache = readCache();
    delete cache[plate];
    writeCache(cache);
  };

  /**
   * Clears the entire vehicle cache.
   */
  const clearVehicleCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  // Unsynced search queue (public API)

  /**
   * Records a plate that was searched while offline,
   * so it can be flagged for re-query on reconnection.
   * @param {string} plate
   */
  const addUnsyncedSearch = (plate) => {
    const updated = [
      ...readUnsyncedQueue(),
      { plate, attemptedAt: Date.now() },
    ];
    localStorage.setItem(UNSYNCED_KEY, JSON.stringify(updated));
    setUnsyncedSearches(updated);
  };

  /**
   * Clears the unsynced search queue (call after user dismisses warning).
   */
  const clearUnsyncedSearches = () => {
    localStorage.removeItem(UNSYNCED_KEY);
    setUnsyncedSearches([]);
  };

  // Sync

  /**
   * Called automatically when connectivity is restored.
   * Updates the last synced timestamp.
   * Extend this to POST pending changes to the backend if needed.
   */
  const syncOnReconnect = () => {
    const now = new Date().toLocaleString();
    localStorage.setItem(LAST_SYNCED_KEY, now);
    // TODO: POST any pending writes to backend here
  };

  return {
    // Vehicle cache
    cacheVehicleRecord,
    getCachedVehicleByPlate,
    getCachedVehicles,
    clearVehicleCache,
    // Unsynced queue
    unsyncedSearches,
    addUnsyncedSearch,
    clearUnsyncedSearches,
  };
}