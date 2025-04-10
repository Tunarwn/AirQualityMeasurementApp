import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet.heat';

export default function HeatLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const heatLayer = window.L.heatLayer(data, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
}
