import { useEffect, useState } from "react";

const AnomalyPanel = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const source = new EventSource("http://localhost:8000/api/anomalies/stream/");

    source.onmessage = (event) => {
      const newAlert = {
        message: event.data,
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    };

    source.onerror = (err) => {
      console.error("SSE Error:", err);
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  return (
    <div className="p-4 bg-red-50 border border-red-400 rounded-xl shadow max-w-lg mx-auto mt-6">
      <h2 className="text-lg font-bold text-red-800">⚠️ Anomaly Alerts</h2>
      <ul className="mt-2 space-y-1">
        {alerts.map((alert, index) => (
          <li key={index} className="text-sm text-red-700">
            <strong>{alert.timestamp}</strong>: {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnomalyPanel;
