import React, { useEffect, useState } from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ selectedLocation }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLocation) return;

    const { lat, lon } = selectedLocation;
    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then((response) => response.json())
      .then((data) => {
        setWeather(data.current_weather);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Hava durumu verisi alınamadı:', error);
        setLoading(false);
      });
  }, [selectedLocation]);

  if (!selectedLocation) {
    return <div className="weather-widget">Bir konum seçin.</div>;
  }

  if (loading) {
    return <div className="weather-widget">Yükleniyor...</div>;
  }

  if (!weather) {
    return <div className="weather-widget">Hava durumu bilgisi alınamadı.</div>;
  }

  return (
    <div className="weather-widget">
      <div className="weather-header">Hava Durumu</div>
      <div className="weather-info">
        <div className="weather-temp">{weather.temperature}°C</div>
        <div className="weather-wind">Rüzgar: {weather.windspeed} km/sa</div>
        <div className="weather-location">
          Konum: {selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;