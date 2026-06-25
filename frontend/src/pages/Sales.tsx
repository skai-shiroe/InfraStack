import { useState, useEffect, useMemo } from 'react';
import { stockAPI, type Product, type Client, type Sale } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  Printer,
  X,
  Save,
  User,
  CreditCard,
  FileText,
  Package,
  DollarSign,
  Search,
  Hash,
  Calendar,
} from 'lucide-react';

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<{ product_id: number; name: string; quantity: number; unit_price: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
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

  async function load() {
    try {
      const [prodRes, cliRes, salesRes] = await Promise.all([
        stockAPI.products.list(),
        stockAPI.clients.list(),
        stockAPI.sales.list(),
      ]);
      setProducts(prodRes.data);
      setClients(cliRes.data);
      setSales(salesRes.data);
    } catch {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function addToCart() {
    if (!selectedProduct || qty < 1 || price <= 0) return;
    const exists = cart.find(i => i.product_id === selectedProduct);
    if (exists) { alert('Product already in cart'); return; }
    const p = products.find(pr => pr.id === selectedProduct);
    setCart([...cart, { product_id: selectedProduct, name: p?.name || 'Product', quantity: qty, unit_price: price }]);
    setSelectedProduct(null); setQty(1); setPrice(0);
  }

  function removeFromCart(idx: number) { setCart(cart.filter((_, i) => i !== idx)); }
  const total = useMemo(() => cart.reduce((s, i) => s + i.quantity * i.unit_price, 0), [cart]);

  async function handleSubmit() {
    if (!cart.length) return;
    try {
      const { data } = await stockAPI.sales.create({
        client_id: selectedClient ?? undefined,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
      });
      setSales([data, ...sales]);
      setShowForm(false); setCart([]); setSelectedClient(null); setPaymentMethod(''); setNotes('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create sale');
    }
  }

  function printReceipt(sale: Sale) {
    const lines: string[] = [];
    lines.push('================================');
    lines.push('           INVENTRA');
    lines.push('   Inventory & Sales Receipt');
    lines.push('================================');
    lines.push('');
    lines.push(`Sale #: ${sale.id}`);
    lines.push(`Date: ${new Date(sale.created_at).toLocaleString()}`);
    if (sale.client_id) {
      const c = clients.find(cl => cl.id === sale.client_id);
      lines.push(`Client: ${c?.name || 'N/A'}`);
    }
    if (sale.payment_method) lines.push(`Payment: ${sale.payment_method}`);
    lines.push('');
    lines.push('Items:');
    lines.push('--------------------------------');
    sale.items.forEach(item => {
      const p = products.find(pr => pr.id === item.product_id);
      lines.push(`${p?.name || 'Product ' + item.product_id}`);
      lines.push(`  ${item.quantity} x ${item.unit_price.toFixed(2)} = ${item.subtotal.toFixed(2)}`);
    });
    lines.push('--------------------------------');
    lines.push(`TOTAL: ${sale.total.toFixed(2)}`);
    lines.push('');
    if (sale.notes) lines.push(`Notes: ${sale.notes}`);
    lines.push('================================');
    lines.push('   Thank you for your purchase!');
    lines.push('================================');
    const w = window.open('', '_blank');
    w?.document.write('<pre style="font-family: monospace; padding: 20px;">' + lines.join('\n') + '</pre>');
    w?.document.close(); w?.print();
  }

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    const client = clients.find(c => c.id === sale.client_id);
    return (
      String(sale.id).includes(searchTerm) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className={`text-3xl font-bold ${textClass}`}>Sales & Receipts</h1>
        </div>
        <p className={`${mutedClass} ml-12`}>
          {sales.length} sale{sales.length !== 1 ? 's' : ''} · Total: ${sales.reduce((s, sa) => s + sa.total, 0).toFixed(2)}
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
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${inputClass}`}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className={`w-4 h-4 ${mutedClass}`} />
            </button>
          )}
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setCart([]); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            showForm
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Sale'}
        </button>
      </div>

      {/* Sale Form */}
      {showForm && (
        <div className={`rounded-2xl border p-6 ${cardClass} space-y-6`}>
          {/* Client / Payment / Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <User className="w-3.5 h-3.5 inline mr-1" />
                Client
              </label>
              <select
                value={selectedClient ?? ''}
                onChange={e => setSelectedClient(e.target.value ? Number(e.target.value) : null)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
              >
                <option value="">Walk-in Customer</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                Payment
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
              >
                <option value="">Select method...</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                Notes
              </label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Add Item */}
          <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textClass}`}>
              <Package className="w-4 h-4" />
              Add Product
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select
                value={selectedProduct ?? ''}
                onChange={e => setSelectedProduct(e.target.value ? Number(e.target.value) : null)}
                className={`md:col-span-2 px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                ))}
              </select>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                min="1"
                placeholder="Qty"
                className={`px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
              />
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                placeholder="Unit price"
                className={`px-4 py-2.5 rounded-xl border text-sm ${inputClass}`}
              />
              <button
                onClick={addToCart}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className={`rounded-xl border overflow-hidden ${borderClass}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider grid grid-cols-12 gap-2 p-3 ${tableHeaderClass}`}>
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              {cart.map((item, idx) => (
                <div key={idx} className={`grid grid-cols-12 gap-2 p-3 items-center border-t ${borderClass}`}>
                  <span className={`col-span-4 text-sm font-medium ${textClass}`}>{item.name}</span>
                  <span className={`col-span-2 text-sm text-center ${mutedClass}`}>{item.quantity}</span>
                  <span className={`col-span-2 text-sm text-right ${mutedClass}`}>${item.unit_price.toFixed(2)}</span>
                  <span className={`col-span-3 text-sm text-right font-semibold ${textClass}`}>
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="col-span-1 p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className={`flex justify-end items-center gap-3 p-4 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                <span className={`text-sm ${mutedClass}`}>Total:</span>
                <span className={`text-xl font-bold ${textClass} flex items-center gap-1`}>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!cart.length}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Save className="w-4 h-4" />
            Confirm Sale
          </button>
        </div>
      )}

      {/* Sales Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                <th className="text-left p-4 pl-6"><Hash className="w-3 h-3 inline mr-1" />#</th>
                <th className="text-left p-4">Client</th>
                <th className="text-left p-4 hidden sm:table-cell">Payment</th>
                <th className="text-right p-4">Total</th>
                <th className="text-left p-4 hidden lg:table-cell"><Calendar className="w-3 h-3 inline mr-1" />Date</th>
                <th className="text-right p-4 pr-6">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                  <td className={`p-4 pl-6 text-sm ${mutedClass}`}>#{sale.id}</td>
                  <td className={`p-4 font-medium ${textClass}`}>
                    {sale.client_id ? (clients.find(c => c.id === sale.client_id)?.name || '—') : 'Walk-in'}
                  </td>
                  <td className={`p-4 text-sm hidden sm:table-cell ${mutedClass}`}>
                    {sale.payment_method || '—'}
                  </td>
                  <td className={`p-4 text-right font-bold text-emerald-600 dark:text-emerald-400`}>
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className={`p-4 text-sm hidden lg:table-cell ${mutedClass}`}>
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => printReceipt(sale)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className={`w-12 h-12 ${mutedClass} opacity-50`} />
                      <p className={`text-lg font-medium ${mutedClass}`}>No sales found</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {searchTerm ? 'Try a different search' : 'Create your first sale!'}
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