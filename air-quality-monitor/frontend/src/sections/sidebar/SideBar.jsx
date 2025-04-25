import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SideBar.css';

export default function SideBar({ selectedLocation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [chartData, setChartData] = useState({
    pm25: [], pm10: [], no2: [], so2: [], o3: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/anomalies/list/';
        const params = new URLSearchParams();

        if (selectedLocation) {
          params.append('lat', selectedLocation.lat);
          params.append('lon', selectedLocation.lon);
        }
        
        if (dateRange.start) {
          params.append('start_date', dateRange.start);
        }
        
        if (dateRange.end) {
          params.append('end_date', dateRange.end);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        const json = await response.json();

        if (selectedLocation) {
          // Seçili konum için chart verilerini hazırla
          const newChartData = {
            pm25: [], pm10: [], no2: [], so2: [], o3: []
          };

          json.forEach(item => {
            if (newChartData[item.parameter]) {
              newChartData[item.parameter].push({
                time: new Date(item.detected_at).toLocaleTimeString(),
                value: item.value
              });
            }
          });

          Object.keys(newChartData).forEach(key => {
            newChartData[key].sort((a, b) => new Date(a.time) - new Date(b.time));
          });

          setChartData(newChartData);
        } else {
          // Konuma göre anomalileri grupla
          const groupedByLocation = json.reduce((acc, curr) => {
            const locationKey = `${curr.latitude},${curr.longitude}`;
            if (!acc[locationKey]) {
              acc[locationKey] = {
                latitude: curr.latitude,
                longitude: curr.longitude,
                lastUpdate: curr.detected_at,
                parameters: {},
                allData: []
              };
            }
            
            // Her parametre için son değeri tut
            acc[locationKey].parameters[curr.parameter] = curr.value;
            // Tüm verileri sakla
            acc[locationKey].allData.push(curr);
            // En son güncelleme zamanını kontrol et
            if (new Date(curr.detected_at) > new Date(acc[locationKey].lastUpdate)) {
              acc[locationKey].lastUpdate = curr.detected_at;
            }
            
            return acc;
          }, {});

          // Gruplanmış verileri diziye çevir ve tarihe göre sırala
          const sortedData = Object.values(groupedByLocation)
            .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

          setData(sortedData);
        }
      } catch (err) {
        console.error('Veri alınamadı:', err);
      }
      setLoading(false);
    };

    fetchData();
    setExpandedLocation(null);
  }, [selectedLocation, dateRange]);

  const getParameterColor = (value) => {
    if (value > 75) return '#ff4d4d';
    if (value > 50) return '#ffa64d';
    return '#ffff4d';
  };

  const renderParameterBox = (title, data) => {
    const lastValue = data[data.length - 1]?.value;

    return (
      <div className="parameter-box">
        <div className="parameter-header">
          <h3>{title}</h3>
          {lastValue && <span style={{ color: getParameterColor(lastValue) }}>{lastValue}</span>}
        </div>
        <div className="parameter-chart">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data}>
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
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        {selectedLocation ? 'Seçili Konum Değerleri' : 'Son Anomaliler'}
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
              placeholder="Başlangıç tarihi seçin"
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
              placeholder="Bitiş tarihi seçin"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : selectedLocation ? (
        <div className="parameters-grid">
          {renderParameterBox('PM2.5', chartData.pm25)}
          {renderParameterBox('PM10', chartData.pm10)}
          {renderParameterBox('NO2', chartData.no2)}
          {renderParameterBox('SO2', chartData.so2)}
          {renderParameterBox('O3', chartData.o3)}
        </div>
      ) : (
        <ul className="anomaly-list">
          {data.map((location, i) => (
            <li 
              key={i} 
              className={`anomaly-item ${expandedLocation === i ? 'expanded' : ''}`}
              onClick={() => setExpandedLocation(expandedLocation === i ? null : i)}
            >
              <div className="anomaly-header">
                <div className="anomaly-info">
                  <span className="date">
                    {new Date(location.lastUpdate).toLocaleString()}
                  </span>
                  <span className="location">
                    Konum: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="parameter-count">
                  {Object.keys(location.parameters).length} parametre
                </div>
              </div>

              {expandedLocation === i && (
                <div className="anomaly-details">
                  <div className="parameters-grid">
                    {Object.entries(location.parameters).map(([param, value]) => (
                      <div 
                        key={param} 
                        className="parameter-box"
                      >
                        <div className="parameter-header">
                          <h3>{param.toUpperCase()}</h3>
                          <span style={{ color: getParameterColor(value) }}>
                            {value}
                          </span>
                        </div>
                        <div className="parameter-chart">
                          <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={location.allData.filter(d => d.parameter === param)
                              .map(d => ({
                                time: new Date(d.detected_at).toLocaleTimeString(),
                                value: d.value
                              }))}>
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
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}