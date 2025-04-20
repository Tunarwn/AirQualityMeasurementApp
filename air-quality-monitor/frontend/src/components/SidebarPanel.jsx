import { useEffect, useState } from "react";

export default function SidebarPanel({ selectedLocation }) {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    if (!selectedLocation) return;

    const [lat, lon] = selectedLocation;

    fetch(`http://localhost:8000/api/anomalies/by-location/?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => setAnomalies(data))
      .catch((err) => console.error("Anomali verisi alınamadı:", err));
  }, [selectedLocation]);

  return (
    <aside className="w-[350px] bg-gray-900 text-white p-4 shadow-lg overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">📍 Anomali Detayları</h2>

      {!selectedLocation ? (
        <p className="text-sm text-gray-400">Bir marker seçin...</p>
      ) : anomalies.length === 0 ? (
        <p className="text-sm text-gray-400">Bu konumda anomaly yok.</p>
      ) : (
        <div className="space-y-4">
          {anomalies.map((a, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700"
            >
              <p className="font-semibold">{a.parameter}</p>
              <p className="text-sm text-red-400 font-bold">{a.value}</p>
              <p className="text-xs text-gray-400">
                {new Date(a.detected_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
