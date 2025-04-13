import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function PM25Chart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/measurements/history/")
      .then((res) => res.json())
      .then((json) => {
        const cleaned = json
          .filter((item) => item.pm25 !== null)
          .map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
        setData(cleaned);
      });
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">🕓 PM2.5 Değeri (Son 24 Saat)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="pm25" stroke="#ff4d4f" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
