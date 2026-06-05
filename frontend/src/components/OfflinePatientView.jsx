import { useOfflineMode } from "../hooks/useOfflineMode";

export default function OfflinePatientView({ patientId }) {
  const { getCachedRecords } = useOfflineMode();
  const records = getCachedRecords();
  const patient = records[patientId];

  if (!patient) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <p className="text-yellow-400 font-semibold">📵 Offline</p>
        <p className="text-sm text-gray-400 mt-1">
          No cached data for this patient. Data is only cached after first online access.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white border border-yellow-500">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{patient.name}</h2>
        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-semibold">
          OFFLINE CACHE
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="text-gray-400">Allergies:</span> {patient.allergies || "None recorded"}</p>
        <p><span className="text-gray-400">Emergency Contact:</span> {patient.emergencyContact || "N/A"}</p>
        <p><span className="text-gray-400">Diagnosis:</span> {patient.diagnosis || "N/A"}</p>
        <p><span className="text-gray-400">Prescriptions:</span> {patient.prescriptions || "N/A"}</p>
        <p className="text-xs text-gray-500 mt-3">
          Cached at: {new Date(patient.cachedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}