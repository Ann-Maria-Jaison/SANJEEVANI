import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { useOfflineMode } from "../hooks/useOfflineMode";

export default function UnsyncedWarning({ isOnline }) {
  const { unsyncedSearches, clearUnsyncedSearches } = useOfflineMode();

  // Only show when back online and there are unsynced searches
  if (!isOnline || unsyncedSearches.length === 0) return null;

  return (
    <div className="mx-6 mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 animate-fade-up">
      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-400">
          {unsyncedSearches.length} search{unsyncedSearches.length > 1 ? "es" : ""} attempted while offline
        </p>
        <p className="text-xs text-slate-400 mt-1">
          The following plates were searched offline and may need to be re-queried:
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {unsyncedSearches.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-mono text-[11px] text-amber-300 tracking-widest"
            >
              {s.plate}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
        <button
          onClick={clearUnsyncedSearches}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}