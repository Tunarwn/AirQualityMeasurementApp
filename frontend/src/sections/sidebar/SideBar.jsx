import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCalendarAlt } from 'react-icons/fa';
import './SideBar.css';

export default function SideBar({ selectedLocation, setSelectedLocation }) {
  const [measurements, setMeasurements] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Seçili konumun ölçümlerini fetch et
  const fetchMeasurements = () => {
    if (!selectedLocation) {
      setMeasurements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    params.append('lat', selectedLocation.lat);
    params.append('lon', selectedLocation.lon);
    if (dateRange.start) params.append('from', dateRange.start);
    if (dateRange.end) params.append('to', dateRange.end);

    fetch(`http://localhost:8000/api/measurements/by-location/?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setMeasurements(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Tüm konumlardaki son ölçümleri fetch et
  const fetchAllLocations = () => {
    fetch('http://localhost:8000/api/measurements/')
    .then(res => res.json())
    .then(json => {
      // Her konumun son ölçümünü bul
      const grouped = {};
      json.forEach(m => {
        const key = `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`;
        if (!grouped[key] || new Date(m.timestamp) > new Date(grouped[key].timestamp)) {
          grouped[key] = m;
        }
      });
      setAllLocations(Object.values(grouped));
    });
  };

  // Seçili konum veya tarih aralığı değişince fetch et
  useEffect(() => {
    fetchMeasurements();
    // eslint-disable-next-line
  }, [selectedLocation, dateRange]);

  // İlk açılışta ve seçili konum yoksa tüm konumları fetch et
  useEffect(() => {
    if (!selectedLocation) {
      fetchAllLocations();
    }
  }, [selectedLocation]);

  // SSE ile otomatik güncelleme
  useEffect(() => {
    if (!selectedLocation) return;
    const eventSource = new EventSource('http://localhost:8000/api/anomalies/stream/');

    eventSource.onmessage = (event) => {
      if (event.data && event.data.trim()) {
        try {
          const anomalyData = JSON.parse(event.data);
          // Sadece seçili konumla ilgiliyse güncelle
          if (
            Math.abs(anomalyData.latitude - selectedLocation.lat) < 0.01 &&
            Math.abs(anomalyData.longitude - selectedLocation.lon) < 0.01
          ) {
            fetchMeasurements();
          }
        } catch (e) {
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line
  }, [selectedLocation, dateRange]);

  // Chart için yardımcı fonksiyonlar
  const getChartData = (param) => {
    return measurements
      .filter(m => m[param] !== null && m[param] !== undefined)
      .map(m => ({
        time: new Date(m.timestamp).toLocaleTimeString(),
        value: m[param]
      }));
  };

  const getAverageValue = (param) => {
    const filtered = measurements.filter(m => m[param] !== null && m[param] !== undefined);
    if (filtered.length === 0) return null;
    const total = filtered.reduce((sum, m) => sum + m[param], 0);
    return (total / filtered.length).toFixed(2);
  };

  const getParameterColor = (value) => {
    if (value > 75) return '#ff4d4d';
    if (value > 50) return '#ffa64d';
    return '#ffff4d';
  };

  // --- Render ---
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        {selectedLocation
          ? `Konum: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`
          : 'Tüm Konumlar'}
      </h2>

      {/* Tarih filtresi */}
      <div className="date-filter">
        <div className="date-field">
          <div className="date-label">Başlangıç Tarihi</div>
          <div className="date-input-wrapper">
            <FaCalendarAlt className="date-icon" />
            <input
              type="datetime-local"
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>
        <div className="date-field">
          <div className="date-label">Bitiş Tarihi</div>
          <div className="date-input-wrapper">
            <FaCalendarAlt className="date-icon" />
            <input
              type="datetime-local"
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {/* Seçili konum yoksa: Tüm konumları kutucuk olarak göster */}
      {!selectedLocation ? (
        <div className="all-locations-list">
          {allLocations.length === 0 ? (
            <p>Veri bulunamadı.</p>
          ) : (
            allLocations.map((loc, i) => (
              <div
                key={i}
                className="location-mini-box"
                onClick={() => setSelectedLocation({ lat: loc.latitude, lon: loc.longitude })}
              >
                <div className="location-coords">
                  {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                </div>
                <div className="location-params">
                  {['pm25', 'pm10', 'no2', 'so2', 'o3'].map(param =>
                    loc[param] !== null && loc[param] !== undefined ? (
                      <span key={param} className="mini-param">
                        <b>{param.toUpperCase()}:</b> {loc[param]}
                      </span>
                    ) : null
                  )}
                </div>
                <div className="location-time">
                  {new Date(loc.timestamp).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Seçili konum varsa: Detay ve chart göster
        measurements.length === 0 ? (
          <p>Bu konumda ölçüm bulunamadı.</p>
        ) : (
          <div className="parameters-grid">
            {['pm25', 'pm10', 'no2', 'so2', 'o3'].map(param => {
              const chartData = getChartData(param);
              const averageValue = getAverageValue(param);
              return (
                <div className="parameter-box" key={param}>
                  <div className="parameter-header">
                    <h3>{param.toUpperCase()}</h3>
                    {averageValue !== null && (
                      <span style={{ color: getParameterColor(averageValue) }}>
                        {averageValue}
                      </span>
                    )}
                  </div>
                  <div className="parameter-chart">
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="time" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff'
                          }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}