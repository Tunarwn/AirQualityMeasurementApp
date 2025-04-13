import { MapContainer, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';
import HeatLayer from './HeatLayer';

export default function MapView() {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/anomalies/list/")
      .then((res) => res.json())
      .then((data) => setAnomalies(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

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
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Isı katmanı */}
        <HeatLayer data={heatPoints} />
      </MapContainer>
    </div>
  );
}