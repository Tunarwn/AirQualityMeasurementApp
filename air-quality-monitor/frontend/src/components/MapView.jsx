import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import HeatLayer from './HeatLayer';

export default function MapView({ onSelectLocation }) {
  const [anomalies, setAnomalies] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationData, setLocationData] = useState([]);
  const [mapReady, setMapReady] = useState(false); // 🔧

  useEffect(() => {
    fetch("http://localhost:8000/api/anomalies/list/")
      .then((res) => res.json())
      .then((data) => setAnomalies(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleMarkerClick = (lat, lon) => {
    setSelectedPosition([lat, lon]);
    onSelectLocation && onSelectLocation({ lat, lon });

    fetch(`http://localhost:8000/api/anomalies/by-location/?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => setLocationData(data))
      .catch((err) => console.error("By-location fetch error:", err));
  };

  const heatPoints = anomalies.map((a) => [
    a.latitude,
    a.longitude,
    Math.min(a.value / 200, 1)
  ]);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={[41, 29]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)} // 🔧
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sadece hazırsa ısı katmanını ekle */}
        {mapReady && <HeatLayer data={heatPoints} />}

        {anomalies.map((a, i) => (
          <Marker
            key={i}
            position={[a.latitude, a.longitude]}
            eventHandlers={{ click: () => handleMarkerClick(a.latitude, a.longitude) }}
          />
        ))}

        {selectedPosition && (
          <Popup
            position={selectedPosition}
            onClose={() => {
              setSelectedPosition(null);
              setLocationData([]);
            }}
          >
            <div className="text-sm space-y-1">
              <p className="font-semibold">Last 24h Anomalies:</p>
              {locationData.length === 0 ? (
                <p className="text-gray-500">No data found.</p>
              ) : (
                locationData.map((item, idx) => (
                  <div key={idx}>
                    <p><strong>{item.parameter}</strong>: {item.value}</p>
                    <p className="text-xs text-gray-500">{new Date(item.detected_at).toLocaleString()}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
