import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { useEffect, useState } from 'react';

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
      .then((data) => setAnomalies(data));
  }, []);

  return (
    <div className="h-[500px] w-full">
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onViewportChange={(next) => setViewport(next)}
      >
        {anomalies.map((a, i) => (
          <Marker
            key={i}
            longitude={a.longitude}
            latitude={a.latitude}
            offsetTop={-10}
            offsetLeft={-5}
          >
            <div
              onClick={() => setPopupInfo(a)}
              className="bg-red-500 w-3 h-3 rounded-full cursor-pointer"
            ></div>
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
            <div className="text-sm">
              <strong>{popupInfo.parameter}</strong>: {popupInfo.value}<br />
              {new Date(popupInfo.detected_at).toLocaleString()}
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  );
}
