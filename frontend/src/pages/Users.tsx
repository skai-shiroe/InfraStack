import { useEffect, useState } from 'react';
import { usersAPI, type User } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Mail,
  Lock,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  Calendar,
  Hash,
  User as UserIcon,
} from 'lucide-react';

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const { theme } = useTheme()!;

  const isDark = theme === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-800';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inputClass = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  const tableHeaderClass = isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500';
  const tableRowHover = isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';

  const load = async () => { setItems((await usersAPI.list()).data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const reset = () => { setShowForm(false); setEditingId(null); setForm({ name: '', email: '', password: '' }); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await usersAPI.update(editingId, form);
    else await usersAPI.create({ ...form });
    reset(); load();
  };

  const onEdit = (u: User) => { setEditingId(u.id); setForm({ name: u.name, email: u.email, password: '' }); setShowForm(true); };

  const onDelete = async (id: number) => {
    await usersAPI.delete(id);
    setShowDeleteConfirm(null);
    load();
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = items.filter((u) => u.is_active).length;
  const inactiveUsers = items.length - activeUsers;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-2xl animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-2xl animate-spin" />
            </div>
            <UserCog className="absolute inset-0 m-auto w-6 h-6 text-indigo-500" />
          </div>
          <p className={`text-lg font-medium ${mutedClass} animate-pulse`}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className={`text-3xl font-bold ${textClass}`}>User Management</h1>
        </div>
        <p className={`${mutedClass} ml-12`}>
          {items.length} user{items.length !== 1 ? 's' : ''} · {activeUsers} active · {inactiveUsers} inactive
        </p>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{items.length}</p>
              <p className={`text-xs ${mutedClass}`}>Total Users</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold text-emerald-600 dark:text-emerald-400`}>{activeUsers}</p>
              <p className={`text-xs ${mutedClass}`}>Active Users</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold text-red-600 dark:text-red-400`}>{inactiveUsers}</p>
              <p className={`text-xs ${mutedClass}`}>Inactive Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className={`w-4 h-4 ${mutedClass}`} />
            </button>
          )}
        </div>
        <button
          onClick={() => { reset(); setShowForm(!showForm); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            showForm
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New User'}
        </button>
      </div>

      {/* User Form */}
      {showForm && (
        <form onSubmit={onSubmit} className={`rounded-2xl border p-6 ${cardClass} animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
              <UserCog className={`w-5 h-5 ${editingId ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <h2 className={`text-lg font-semibold ${textClass}`}>
              {editingId ? 'Edit User' : 'Create New User'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
<UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Email Address *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder={editingId ? 'Leave blank to keep' : 'Password *'}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-500/25"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                <th className="text-left p-4 pl-6">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    ID
                  </div>
                </th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4 hidden md:table-cell">Email</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4 hidden lg:table-cell">Created</th>
                <th className="text-right p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                  <td className={`p-4 pl-6 ${mutedClass} text-sm font-mono`}>#{item.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${
                        item.is_active
                          ? isDark
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                          : isDark
                            ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className={`font-semibold ${textClass}`}>{item.name}</span>
                        {!item.is_active && (
                          <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                            <ShieldOff className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 ${mutedClass} text-sm hidden md:table-cell`}>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {item.email}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Shield className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                        <ShieldOff className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className={`p-4 ${mutedClass} text-sm hidden lg:table-cell`}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : '—'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCog className={`w-12 h-12 ${mutedClass} opacity-50`} />
                      <p className={`text-lg font-medium ${mutedClass}`}>No users found</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {searchTerm ? 'Try a different search term' : 'Create your first user!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className={`p-6 rounded-2xl shadow-2xl max-w-sm w-full ${cardClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-2xl mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={`text-lg font-bold ${textClass} mb-2`}>Delete User</h3>
              <p className={`text-sm ${mutedClass} mb-6`}>
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}