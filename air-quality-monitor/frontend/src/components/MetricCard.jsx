export default function MetricCard({ label, value, unit, color }) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 text-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value} {unit}</p>
      </div>
    );
  }