import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PM25Chart({ coordinates }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!coordinates) return;

    console.log("📍 Chart request for:", coordinates);

    fetch(`http://localhost:8000/api/measurements/pm25/?lat=${coordinates.lat}&lon=${coordinates.lon}`)
      .then(res => res.json())
      .then(data => {
        console.log("📈 Chart data received:", data);
        setChartData(data);
      })
      .catch(err => console.error("Chart fetch error:", err));
  }, [coordinates]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {chartData.length === 0 ? (
        <p className="text-gray-500 text-sm">📭 No data for this location.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="pm25" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
