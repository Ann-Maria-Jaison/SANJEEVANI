import { useState, useEffect } from "react";

export function useOfflineMode() {
  const [lastSynced, setLastSynced] = useState(
    localStorage.getItem("lastSynced") || null
  );
  const [unsyncedSearches, setUnsyncedSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("unsyncedSearches") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const goOnline = () => syncOfflineData();
    window.addEventListener("online", goOnline);
    return () => window.removeEventListener("online", goOnline);
  }, []);

  // Vehicle cache
  const cacheVehicleRecord = (record) => {
    const cached = getCachedVehicles();
    const plate = record.plate || record.id;
    cached[plate] = { ...record, cachedAt: Date.now() };
    localStorage.setItem("cachedVehicles", JSON.stringify(cached));
  };

  const getCachedVehicles = () => {
    try {
      return JSON.parse(localStorage.getItem("cachedVehicles") || "{}");
    } catch {
      return {};
    }
  };

  const getCachedVehicleByPlate = (plate) => {
    const cached = getCachedVehicles();
    return cached[plate] || null;
  };

  // Unsynced queue (searches attempted while offline)
  const addUnsyncedSearch = (plate) => {
    const updated = [...unsyncedSearches, { plate, attemptedAt: Date.now() }];
    setUnsyncedSearches(updated);
    localStorage.setItem("unsyncedSearches", JSON.stringify(updated));
  };

  const clearUnsyncedSearches = () => {
    setUnsyncedSearches([]);
    localStorage.removeItem("unsyncedSearches");
  };

  // Sync when back online
  const syncOfflineData = () => {
    const now = new Date().toLocaleString();
    localStorage.setItem("lastSynced", now);
    setLastSynced(now);
    // unsynced searches stay visible until user dismisses
  };

  return {
    lastSynced,
    unsyncedSearches,
    cacheVehicleRecord,
    getCachedVehicleByPlate,
    getCachedVehicles,
    addUnsyncedSearch,
    clearUnsyncedSearches,
  };
}