import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLORS = {
  todo: 'bg-gray-600',
  in_progress: 'bg-yellow-600',
  done: 'bg-green-600',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', assigned_to: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  };

  const fetchTasks = async () => {
    const res = await api.get(`/projects/${id}/tasks`);
    setTasks(res.data);
  };

  useEffect(() => {
  const fetchProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  };

  const fetchTasks = async () => {
    const res = await api.get(`/projects/${id}/tasks`);
    setTasks(res.data);
  };

  fetchProject();
  fetchTasks();
}, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.post(`/projects/${id}/tasks`, taskForm);
    setTaskForm({ title: '', description: '', due_date: '', assigned_to: '' });
    setShowTaskForm(false);
    fetchTasks();
    setLoading(false);
  };

  const handleStatusChange = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchTasks();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setShowMemberForm(false);
      fetchProject();
      alert('Member added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
    setLoading(false);
  };

  if (!project) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading...</p>
    </div>
  );

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
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button onClick={() => navigate('/projects')} className="text-gray-400 hover:text-white text-sm mb-2 block">
              ← Back to Projects
            </button>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-gray-400 mt-1">{project.description}</p>
          </div>
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowMemberForm(!showMemberForm)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition"
              >
                + Add Member
              </button>
            )}
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {project.members?.map(m => (
            <span key={m.id} className="bg-gray-700 text-sm px-3 py-1 rounded-full text-gray-300">
              {m.name} ({m.role})
            </span>
          ))}
        </div>

        {/* Add Member Form */}
        {showMemberForm && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
            <form onSubmit={handleAddMember} className="flex gap-3">
              <input
                type="email"
                placeholder="Member email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Create Task Form */}
        {showTaskForm && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Assign To</label>
                  <select
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select member</option>
                    {project.members?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['todo', 'in_progress', 'done'].map(status => (
            <div key={status} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="font-semibold mb-4 capitalize text-center">
                <span className={`${STATUS_COLORS[status]} px-3 py-1 rounded-full text-sm`}>
                  {status.replace('_', ' ')}
                </span>
              </h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <p className="font-medium mb-1">{task.title}</p>
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                    )}
                    {task.assigned_to_name && (
                      <p className="text-blue-400 text-xs mb-2">👤 {task.assigned_to_name}</p>
                    )}
                    {task.due_date && (
                      <p className="text-gray-400 text-xs mb-3">
                        📅 {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {status !== 'todo' && (
                        <button
                          onClick={() => handleStatusChange(task.id, status === 'in_progress' ? 'todo' : 'in_progress')}
                          className="bg-gray-600 hover:bg-gray-500 text-xs px-2 py-1 rounded transition"
                        >
                          ← Back
                        </button>
                      )}
                      {status !== 'done' && (
                        <button
                          onClick={() => handleStatusChange(task.id, status === 'todo' ? 'in_progress' : 'done')}
                          className="bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded transition"
                        >
                          Next →
                        </button>
                      )}
                      {(user?.role === 'admin' || task.created_by === user?.id) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-700 hover:bg-red-600 text-xs px-2 py-1 rounded transition ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}