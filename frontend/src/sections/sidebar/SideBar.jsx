import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SideBar.css';

export default function SideBar({ selectedLocation }) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Ölçümleri fetch eden fonksiyon
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

  // İlk yükleme ve konum/tarih değişiminde fetch
  useEffect(() => {
    fetchMeasurements();
    // eslint-disable-next-line
  }, [selectedLocation, dateRange]);

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
          // JSON parse hatası olabilir, görmezden gel
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

  // Ölçümleri parametrelere göre grupla
  const getChartData = (param) => {
    return measurements
      .filter(m => m[param] !== null && m[param] !== undefined)
      .map(m => ({
        time: new Date(m.timestamp).toLocaleTimeString(),
        value: m[param]
      }));
  };

  const getLastValue = (param) => {
    const filtered = measurements.filter(m => m[param] !== null && m[param] !== undefined);
    return filtered.length > 0 ? filtered[filtered.length - 1][param] : null;
  };

  const getAverageValue = (param) => {
    const filtered = measurements.filter(m => m[param] !== null && m[param] !== undefined);
    if (filtered.length === 0) return null;
    const total = filtered.reduce((sum, m) => sum + m[param], 0);
    return (total / filtered.length).toFixed(2); // Ortalama hesaplama
  };

  const getParameterColor = (value) => {
    if (value > 75) return '#ff4d4d';
    if (value > 50) return '#ffa64d';
    return '#ffff4d';
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        {selectedLocation
          ? `Konum: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`
          : 'Bir konum seçin'}
      </h2>

      <div className="date-filter">
        <div className="date-field">
          <div className="date-label">Başlangıç Tarihi</div>
          <div className="date-input-wrapper">
            <svg className="date-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
            </svg>
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
            <svg className="date-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
            </svg>
            <input
              type="datetime-local"
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : !selectedLocation ? (
        <p>Haritadan bir konum seçin.</p>
      ) : measurements.length === 0 ? (
        <p>Bu konumda ölçüm bulunamadı.</p>
      ) : (
        <div className="parameters-grid">
          {['pm25', 'pm10', 'no2', 'so2', 'o3'].map(param => {
            const chartData = getChartData(param);
            const averageValue = getAverageValue(param); // Ortalama değeri al
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
      )}
    </div>
  );
}