import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import './Map.css';

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 8,
      minOpacity: 0.5,
      max: 1.0,
      gradient: {
        0.2: '#00e400',
        0.4: '#ffff00',
        0.6: '#ff7e00',
        0.8: '#ff0000',
        0.9: '#8f3f97',
        1.0: '#7e0023'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

function AQILegend() {
  return (
    <div className="aqi-legend">
      <div className="legend-title">Hava Kalitesi İndeksi</div>
      <div className="legend-bars">
        <div className="legend-item"><div className="legend-bar good"></div><span>İyi</span></div>
        <div className="legend-item"><div className="legend-bar moderate"></div><span>Orta</span></div>
        <div className="legend-item"><div className="legend-bar sensitive"></div><span>Normal</span></div>
        <div className="legend-item"><div className="legend-bar unhealthy"></div><span>Hassas</span></div>
        <div className="legend-item"><div className="legend-bar very-unhealthy"></div><span>Sağlıksız</span></div>
        <div className="legend-item"><div className="legend-bar hazardous"></div><span>Tehlikeli</span></div>
      </div>
    </div>
  );
}

// Modern marker ikonu
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="marker-pin">
      <div class="marker-pulse"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20] // Adjusted anchor to align marker properly
});

export default function Map({ onLocationSelect }) {
  const [groupedAnomalies, setGroupedAnomalies] = useState([]);

  // Fetch fonksiyonu
  const fetchAnomalies = () => {
    fetch('http://localhost:8000/api/anomalies/list/')
      .then(res => res.json())
      .then(data => {
        // Aynı konuma sahip anomalileri grupla
        const groupedData = data.reduce((acc, curr) => {
          const locationKey = `${curr.latitude},${curr.longitude}`;
          if (!acc[locationKey]) {
            acc[locationKey] = {
              latitude: curr.latitude,
              longitude: curr.longitude,
              parameters: {},
              lastUpdate: curr.detected_at,
              maxValue: 0
            };
          }
          acc[locationKey].parameters[curr.parameter] = curr.value;
          acc[locationKey].maxValue = Math.max(acc[locationKey].maxValue, curr.value);
          if (new Date(curr.detected_at) > new Date(acc[locationKey].lastUpdate)) {
            acc[locationKey].lastUpdate = curr.detected_at;
          }
          return acc;
        }, {});

        setGroupedAnomalies(Object.values(groupedData));
      })
      .catch(err => console.error('Fetch error:', err));
  };

  // İlk yüklemede ve SSE ile otomatik güncelleme
  useEffect(() => {
    fetchAnomalies();

    const eventSource = new EventSource('http://localhost:8000/api/anomalies/stream/');
    eventSource.onmessage = (event) => {
      if (event.data && event.data.trim()) {
        // Her yeni veri geldiğinde haritayı güncelle
        fetchAnomalies();
      }
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const handleMarkerClick = (anomaly) => {
    onLocationSelect({
      lat: anomaly.latitude,
      lon: anomaly.longitude
    });
  };

  const getValueColor = (value) => {
    if (value > 300) return '#7e0023'; // Tehlikeli
    if (value > 200) return '#8f3f97'; // Çok Sağlıksız
    if (value > 150) return '#ff0000'; // Sağlıksız
    if (value > 100) return '#ff7e00'; // Hassas Gruplar
    if (value > 50) return '#ffff00';  // Orta
    return '#00e400';                  // İyi
  };

  // Isı haritası için veri hazırlama
  const heatData = groupedAnomalies.map(location => [
    location.latitude,
    location.longitude,
    Math.min(location.maxValue / 300, 1)
  ]);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[41.0082, 28.9784]}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <HeatmapLayer points={heatData} />

        {groupedAnomalies.map((location, i) => (
          <Marker
            key={i}
            position={[location.latitude, location.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-time">
                  {new Date(location.lastUpdate).toLocaleString()}
                </div>
                <div className="popup-parameters">
                  {Object.entries(location.parameters).map(([param, value]) => (
                    <div key={param} className="popup-value">
                      <strong>{param.toUpperCase()}</strong>
                      <span style={{ color: getValueColor(value) }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <AQILegend />
    </div>
  );
}