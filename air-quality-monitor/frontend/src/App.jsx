import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import MapView from './components/MapView';
import PM25Chart from './components/PM25Chart';
import AnomalyAlertPanel from './components/AnomalyAlertPanel';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🌍 Air Quality Dashboard</h1>

      {/* Daha geniş alanlar için yüksekliği artır */}
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
