import { useEffect, useState } from "react";

export default function AnomalyAlertPanel() {
  const [alerts, setAlerts] = useState([]);
//Popup uyarı paneli için   
// Anomalileri dinlemek için EventSource kullanıyoruz

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/api/anomalies/stream/");

    eventSource.onmessage = (e) => {
      const text = e.data;
      setAlerts((prev) => [...prev.slice(-4), text]); // son 5 alert
    };

    eventSource.onerror = (e) => {
      console.error("SSE error:", e);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2 z-50">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded shadow"
        >
          ⚠️ {alert}
        </div>
      ))}
    </div>
  );
}
