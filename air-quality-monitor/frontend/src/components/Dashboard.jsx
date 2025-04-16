import Header from './Header';
import MetricCard from './MetricCard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <MetricCard label="PM2.5" value={93} unit="µg/m³" color="text-red-500" />
        <MetricCard label="PM10" value={55} unit="µg/m³" color="text-orange-500" />
        <MetricCard label="NO2" value={50} unit="µg/m³" color="text-yellow-500" />
      </div>
      <div className="rounded-2xl overflow-hidden shadow h-[400px] m-4 bg-white">
        {/* Leaflet map component buraya entegre edilecek */}
      </div>
      <div className="bg-white rounded-2xl shadow p-4 m-4">
        <h2 className="text-lg font-semibold mb-2">24 Saatlik Değişim</h2>
        {/* Recharts zaman serisi grafiği buraya gelecek */}
      </div>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-4">
        <p><strong>Uyarı:</strong> PM2.5 değeri kritik seviyede!</p>
      </div>
    </div>
  );
}