import { useState } from 'react';
import Map from './sections/map/Map';
import SideBar from './sections/sidebar/SideBar';
import Notifications from './sections/notifications/Notifications';
import WeatherWidget from './sections/weather/WeatherWidget'; // Yeni widget bileşeni eklendi
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    console.log("Selected location:", location); // Debug için
    setSelectedLocation(location);
  };

  return (
    <div className="app-container">
      <Notifications />
      <SideBar selectedLocation={selectedLocation} />
      <Map onLocationSelect={handleLocationSelect} />
      <WeatherWidget selectedLocation={selectedLocation} /> {/* Hava durumu widget'ı eklendi */}
    </div>
  );
}

export default App;