import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">TaskManager</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">
            {user?.name}
            <span className="ml-2 bg-blue-600 text-xs px-2 py-1 rounded-full">
              {user?.role}
            </span>
          </span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-4xl font-bold text-blue-400 mt-1">{stats.total_projects}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-4xl font-bold text-green-400 mt-1">{stats.total_tasks}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Overdue Tasks</p>
              <p className="text-4xl font-bold text-red-400 mt-1">{stats.overdue_tasks}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Tasks by Status</p>
              <div className="mt-1 space-y-1">
                {stats.tasks_by_status.map(s => (
                  <div key={s.status} className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{s.status.replace('_', ' ')}</span>
                    <span className="text-white font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            View Projects
          </button>
        </div>
      </div>
    </div>
  );
}