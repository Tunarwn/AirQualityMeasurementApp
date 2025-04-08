import { useEffect, useState } from "react";

export default function AnomalyPanel() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const source = new EventSource("http://localhost:8000/api/anomalies/stream/");
    
    source.onmessage = function (event) {
      if (event.data.trim()) {
        setMessages((prev) => [event.data, ...prev]);
      }
    };

    return () => source.close();
  }, []);

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white max-h-64 overflow-auto">
      <h2 className="text-lg font-bold text-red-600 mb-2">⚠️ Anomaly Alerts</h2>
      <ul className="space-y-1 text-sm">
        {messages.length === 0 && <li className="text-gray-400">No alerts yet</li>}
        {messages.map((msg, i) => (
          <li key={i} className="text-red-700">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
