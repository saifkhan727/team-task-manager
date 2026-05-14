import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
/* eslint-disable */

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.post('/projects', form);
    setForm({ name: '', description: '' });
    setShowForm(false);
    fetchProjects();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/dashboard')}>
          TaskManager
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">
            {user?.name}
            <span className="ml-2 bg-blue-600 text-xs px-2 py-1 rounded-full">{user?.role}</span>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            + New Project
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Project name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-xl">No projects yet</p>
            <p className="mt-2">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className="text-lg font-semibold hover:text-blue-400 transition"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {project.name}
                  </h3>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-400 hover:text-red-300 text-sm ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {project.description || 'No description'}
                </p>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="text-blue-400 text-sm hover:underline"
                >
                  View Tasks →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}