import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import MapView from './components/MapView';
import PM25Chart from './components/PM25Chart';
import AnomalyAlertPanel from './components/AnomalyAlertPanel';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [metrics, setMetrics] = useState({ pm25: 0, pm10: 0, no2: 0 });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('http://localhost:5001/metrics?id=istanbul');
        const data = await res.json();
        setMetrics(data[0]);
      } catch (err) {
        console.error("Veri alınamadı:", err);
      }
    }

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="PM2.5" value={metrics.pm25} unit="µg/m³" color="text-red-500" />
        <MetricCard label="PM10" value={metrics.pm10} unit="µg/m³" color="text-orange-500" />
        <MetricCard label="NO2" value={metrics.no2} unit="µg/m³" color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="bg-white rounded-xl shadow-md p-4 h-full">
          <MapView onSelectLocation={setSelectedLocation} />
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 h-full">
          <PM25Chart coordinates={selectedLocation} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <AnomalyAlertPanel />
      </div>
    </div>
  );
}

export default App;
