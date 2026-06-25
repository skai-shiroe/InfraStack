import { useEffect, useState } from 'react';
import { stockAPI, type Supplier } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  User,
} from 'lucide-react';

export default function Suppliers() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', address: '' });
  const [searchTerm, setSearchTerm] = useState('');
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

  const load = async () => { setItems((await stockAPI.suppliers.list()).data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const reset = () => { setShowForm(false); setEditingId(null); setForm({ name: '', contact: '', email: '', phone: '', address: '' }); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await stockAPI.suppliers.update(editingId, form);
    else await stockAPI.suppliers.create(form);
    reset(); load();
  };

  const onEdit = (s: Supplier) => { setEditingId(s.id); setForm({ name: s.name, contact: s.contact || '', email: s.email || '', phone: s.phone || '', address: s.address || '' }); setShowForm(true); };
  const onDelete = async (id: number) => { if (!confirm('Delete this supplier?')) return; await stockAPI.suppliers.delete(id); load(); };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contact && item.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <p className={`text-lg font-medium ${mutedClass} animate-pulse`}>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className={`text-3xl font-bold ${textClass}`}>Suppliers</h1>
        </div>
        <p className={`${mutedClass} ml-12`}>
          {items.length} supplier{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
          <input
            type="text"
            placeholder="Search suppliers..."
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
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Supplier'}
        </button>
      </div>

      {/* Supplier Form */}
      {showForm && (
        <form onSubmit={onSubmit} className={`rounded-2xl border p-6 ${cardClass} animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className={`text-lg font-semibold ${textClass}`}>
              {editingId ? 'Edit Supplier' : 'New Supplier'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Supplier Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Contact Person"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="relative md:col-span-2">
              <MapPin className={`absolute left-3 top-3 w-4 h-4 ${mutedClass}`} />
              <textarea
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 resize-none ${inputClass}`}
                placeholder="Full Address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editingId ? 'Update' : 'Save'}
          </button>
        </form>
      )}

      {/* Suppliers Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                <th className="text-left p-4 pl-6">#</th>
                <th className="text-left p-4">Supplier</th>
                <th className="text-left p-4 hidden md:table-cell">Contact</th>
                <th className="text-left p-4 hidden sm:table-cell">Phone</th>
                <th className="text-right p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                  <td className={`p-4 pl-6 ${mutedClass} text-sm`}>#{item.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-orange-500/10' : 'bg-orange-50'
                      }`}>
                        <Truck className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <span className={`font-semibold ${textClass}`}>{item.name}</span>
                        {item.email && (
                          <div className={`text-xs ${mutedClass} flex items-center gap-1 mt-0.5`}>
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 ${mutedClass} text-sm hidden md:table-cell`}>
                    {item.contact || '—'}
                  </td>
                  <td className={`p-4 ${mutedClass} text-sm hidden sm:table-cell`}>
                    {item.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {item.phone}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className={`w-12 h-12 ${mutedClass} opacity-50`} />
                      <p className={`text-lg font-medium ${mutedClass}`}>No suppliers found</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {searchTerm ? 'Try a different search term' : 'Add your first supplier!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}