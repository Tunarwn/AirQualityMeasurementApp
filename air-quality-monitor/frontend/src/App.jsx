import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import MapView from './components/MapView';
import PM25Chart from './components/PM25Chart';
import AnomalyAlertPanel from './components/AnomalyAlertPanel';
import MetricCard from './components/MetricCard';
import Header from './components/Header';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      <Header /> {}
      <h1 className="text-3xl font-bold text-gray-800">🌍 Air Quality Dashboard</h1>

      {/* METRİK KARTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="PM2.5" value={93} unit="µg/m³" color="text-red-500" />
        <MetricCard label="PM10" value={55} unit="µg/m³" color="text-orange-500" />
        <MetricCard label="NO2" value={50} unit="µg/m³" color="text-yellow-500" />
      </div>

      {/* HARİTA ve GRAFİK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="bg-white rounded-xl shadow-md p-4 h-full">
          <MapView onSelectLocation={setSelectedLocation} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 h-full">
          <PM25Chart coordinates={selectedLocation} />
        </div>
      </div>

      {/* ANOMALY PANEL */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <AnomalyAlertPanel />
      </div>
    </div>
  );
}

export default App;
