import AnomalyPanel from "./components/AnomalyPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">🌍 Air Quality Dashboard</h1>
      <AnomalyPanel />
    </div>
  );
}

export default App;
