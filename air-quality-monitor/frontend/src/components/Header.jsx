export default function Header() {
    return (
      <header className="bg-white shadow p-4 mb-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">🌍 Air Quality Dashboard</h1>
        <select className="border border-gray-300 rounded-lg p-2 bg-gray-50">
          <option>İstanbul</option>
          <option>Ankara</option>
          <option>İzmir</option>
        </select>
      </header>
    );
  }
  