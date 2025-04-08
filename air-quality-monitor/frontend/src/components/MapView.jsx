import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
  const [viewport, setViewport] = useState({
    latitude: 41.0,
    longitude: 29.0,
    zoom: 6
  });

  const [anomalies, setAnomalies] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/anomalies/list/")
      .then((res) => res.json())
      .then((data) => setAnomalies(data))
      .catch((err) => console.error("Anomaly fetch error:", err));
  }, []);

  return (
    <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onViewportChange={(next) => setViewport(next)}
        getCursor={() => 'default'}
      >
        {anomalies.map((a, i) => (
          <Marker
            key={i}
            longitude={a.longitude}
            latitude={a.latitude}
          >
            <div
              onClick={() => setPopupInfo(a)}
              style={{
                background: 'red',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                cursor: 'pointer'
              }}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div style={{ fontSize: '12px' }}>
              <strong>{popupInfo.parameter}</strong>: {popupInfo.value}<br />
              {new Date(popupInfo.detected_at).toLocaleString()}
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  );
}
