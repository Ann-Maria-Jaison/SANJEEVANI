export default function OfflineBanner({ isOnline }) {
  const lastSynced = localStorage.getItem("lastSynced");
  if (isOnline !== false) return null;

  return (
    <div className="w-full bg-yellow-500 text-black py-2 px-4 font-semibold text-sm flex justify-between items-center">
      <span>⚠️ Offline Mode Active — Showing cached data</span>
      {lastSynced && (
        <span className="text-xs font-normal opacity-70">
          Last synced: {lastSynced}
        </span>
      )}
    </div>
  );
}