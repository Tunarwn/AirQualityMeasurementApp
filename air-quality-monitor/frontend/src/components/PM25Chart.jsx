import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PM25Chart({ coordinates }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!coordinates) return;

    const fetchChartData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/measurements/pm25-by-location/?lat=${coordinates.lat}&lon=${coordinates.lon}`);
        const json = await res.json();
        const formatted = json.map(d => ({
          timestamp: new Date(d.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          value: d.pm25
        }));
        setData(formatted);
      } catch (err) {
        console.error("Chart verisi alinamadi:", err);
      }
    };

    fetchChartData();
  }, [coordinates]);

  if (data.length === 0) return <p className="text-sm text-gray-400">Grafik verisi bulunamadı.</p>;

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-white mb-2">PM2.5 Geçmişi</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="timestamp" tick={{ fill: 'white', fontSize: 10 }} />
          <YAxis tick={{ fill: 'white', fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#ff4d4f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
