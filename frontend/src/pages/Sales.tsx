import { useEffect, useState } from 'react';
import { stockAPI, type Sale, type Client, type Product } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  Receipt,
  Plus,
  Search,
  X,
  Save,
  Printer,
  DollarSign,
  User,
  CreditCard,
  FileText,
  Package,
  ShoppingCart,
  Minus,
} from 'lucide-react';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState<number | ''>('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ product_id: number; quantity: number; unit_price: number }[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
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

  const loadAll = async () => {
    const [salesRes, clientsRes, productsRes] = await Promise.all([
      stockAPI.sales.list(),
      stockAPI.clients.list(),
      stockAPI.products.list(),
    ]);
    setSales(salesRes.data);
    setClients(clientsRes.data);
    setProducts(productsRes.data);
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const reset = () => { setShowForm(false); setClientId(''); setPayment(''); setNotes(''); setItems([]); setSelectedSale(null); };

  const addItem = () => {
    setItems([...items, { product_id: 0, quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: string, value: number | string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length || !clientId) return;
    await stockAPI.sales.create({
      client_id: Number(clientId),
      payment_method: payment || undefined,
      notes: notes || undefined,
      items,
    });
    reset();
    loadAll();
  };

  const viewReceipt = (sale: Sale) => setSelectedSale(sale);
  const closeReceipt = () => setSelectedSale(null);

  const printReceipt = () => {
    if (!selectedSale) return;
    const client = clients.find((c) => c.id === selectedSale.client_id);
    const date = new Date(selectedSale.created_at).toLocaleString();
    const lines = [
      'INVENTRA - RECEIPT',
      '----------------------------',
      `Receipt #${selectedSale.id}`,
      `Date: ${date}`,
      client ? `Client: ${client.name}` : 'Client: -',
      '----------------------------',
      ...(selectedSale.items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return `${product?.name || 'Item #' + item.product_id} x${item.quantity} @ ${item.unit_price} = ${item.subtotal}`;
      })),
      '----------------------------',
      `TOTAL: ${selectedSale.total}`,
      selectedSale.payment_method ? `Payment: ${selectedSale.payment_method}` : '',
      selectedSale.notes ? `Notes: ${selectedSale.notes}` : '',
      '----------------------------',
      'Thank you for your purchase!',
    ].filter((l) => l !== '');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<pre style="font-family: monospace; padding: 20px;">${lines.join('\n')}</pre>`);
    win.document.close();
    win.print();
  };

  const filteredSales = sales.filter((sale) => {
    if (!searchTerm) return true;
    const client = clients.find((c) => c.id === sale.client_id);
    return (
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(sale.id).includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <p className={`text-lg font-medium ${mutedClass} animate-pulse`}>Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <ShoppingCart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className={`text-3xl font-bold ${textClass}`}>Sales</h1>
        </div>
        <p className={`${mutedClass} ml-12`}>
          {sales.length} sale{sales.length !== 1 ? 's' : ''} · Total: ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
          <input
            type="text"
            placeholder="Search sales..."
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
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Sale'}
        </button>
      </div>

      {/* New Sale Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 ${cardClass} animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className={`text-lg font-semibold ${textClass}`}>New Sale</h2>
          </div>

          {/* Client & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <select
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 appearance-none ${inputClass}`}
                value={clientId}
                onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">Select Client *</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="relative">
              <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                placeholder="Payment Method"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              />
            </div>
            <div className="relative md:col-span-1">
              <FileText className={`absolute left-3 top-3 w-4 h-4 ${mutedClass}`} />
              <textarea
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 resize-none ${inputClass}`}
                placeholder="Notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${textClass} flex items-center gap-2`}>
                <Package className="w-4 h-4" />
                Items ({items.length})
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {items.length > 0 && (
              <div className={`rounded-xl border ${borderClass} overflow-hidden mb-3`}>
                <div className={`text-xs font-semibold uppercase tracking-wider grid grid-cols-12 gap-2 p-3 ${tableHeaderClass}`}>
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-3">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map((item, index) => (
                  <div key={index} className={`grid grid-cols-12 gap-2 p-3 items-center border-t ${borderClass}`}>
                    <div className="col-span-4">
                      <select
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs transition-all duration-200 ${inputClass}`}
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', Number(e.target.value))}
                        required
                      >
                        <option value="">Select</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs transition-all duration-200 ${inputClass}`}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs transition-all duration-200 ${inputClass}`}
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className={`col-span-3 font-semibold text-sm ${textClass}`}>
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className={`flex justify-end items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <span className={`text-sm ${mutedClass}`}>Total:</span>
                <span className={`text-2xl font-bold ${textClass} flex items-center gap-1`}>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  {total.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!items.length || !clientId}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Save className="w-4 h-4" />
            Create Sale
          </button>
        </form>
      )}

      {/* Sales Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                <th className="text-left p-4 pl-6">#</th>
                <th className="text-left p-4">Client</th>
                <th className="text-left p-4 hidden sm:table-cell">Payment</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4 hidden lg:table-cell">Date</th>
                <th className="text-right p-4 pr-6">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                const client = clients.find((c) => c.id === sale.client_id);
                return (
                  <tr key={sale.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                    <td className={`p-4 pl-6 ${mutedClass} text-sm`}>#{sale.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          isDark ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-emerald-400 to-green-500'
                        }`}>
                          {client?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className={`font-semibold ${textClass}`}>{client?.name || '—'}</span>
                      </div>
                    </td>
                    <td className={`p-4 ${mutedClass} text-sm hidden sm:table-cell`}>
                      {sale.payment_method || '—'}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1`}>
                        <DollarSign className="w-3.5 h-3.5" />
                        {sale.total.toFixed(2)}
                      </span>
                    </td>
                    <td className={`p-4 ${mutedClass} text-sm hidden lg:table-cell`}>
                      {new Date(sale.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => viewReceipt(sale)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className={`w-12 h-12 ${mutedClass} opacity-50`} />
                      <p className={`text-lg font-medium ${mutedClass}`}>No sales found</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {searchTerm ? 'Try a different search term' : 'Create your first sale!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeReceipt}
        >
          <div
            className={`p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto ${cardClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className={`text-xl font-bold ${textClass}`}>Receipt #{selectedSale.id}</h2>
              </div>
              <button onClick={closeReceipt} className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}>
                <X className={`w-5 h-5 ${mutedClass}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className={`flex justify-between py-2 border-b ${borderClass}`}>
                <span className={mutedClass}>Date</span>
                <span className={`font-medium ${textClass}`}>{new Date(selectedSale.created_at).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between py-2 border-b ${borderClass}`}>
                <span className={mutedClass}>Client</span>
                <span className={`font-medium ${textClass}`}>
                  {clients.find((c) => c.id === selectedSale.client_id)?.name || '—'}
                </span>
              </div>
              <div className={`flex justify-between py-2 border-b ${borderClass}`}>
                <span className={mutedClass}>Payment</span>
                <span className={`font-medium ${textClass}`}>{selectedSale.payment_method || '—'}</span>
              </div>
              {selectedSale.notes && (
                <div className={`flex justify-between py-2 border-b ${borderClass}`}>
                  <span className={mutedClass}>Notes</span>
                  <span className={`font-medium ${textClass}`}>{selectedSale.notes}</span>
                </div>
              )}

              <div className="pt-3">
                <h3 className={`text-sm font-semibold ${mutedClass} uppercase tracking-wider mb-2`}>Items</h3>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => {
                    const product = products.find((p) => p.id === item.product_id);
                    return (
                      <div key={item.id} className="flex justify-between items-center py-1.5">
                        <div>
                          <span className={`font-medium ${textClass}`}>{product?.name || 'Item #' + item.product_id}</span>
                          <span className={`text-xs ${mutedClass} ml-2`}>x{item.quantity}</span>
                        </div>
                        <span className={`font-semibold ${textClass}`}>${item.subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`flex justify-between items-center pt-4 border-t ${borderClass}`}>
                <span className={`text-lg font-bold ${textClass}`}>Total</span>
                <span className={`text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1`}>
                  <DollarSign className="w-5 h-5" />
                  {selectedSale.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={printReceipt}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={closeReceipt}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}