import { useState, useEffect } from 'react';
import { stockAPI, type Product, type StockMovement } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  Package,
  ArrowDownUp,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  ArrowUpCircle,
  ArrowDownCircle,
  Box,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

export default function Stock() {
  const { theme } = useTheme()!;
  const isDark = theme === 'dark';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'movements'>('products');
  const [searchTerm, setSearchTerm] = useState('');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', quantity: 0, unit: 'unit' });

  // Movement form
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementForm, setMovementForm] = useState({ product_id: 0, movement_type: 'entry' as 'entry' | 'exit', quantity: 1, reason: '' });

  const bgClass = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const cardClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-800';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  const tableHeaderClass = isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500';
  const tableRowHover = isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';

  async function loadData() {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        stockAPI.products.list(),
        stockAPI.movements.list(),
      ]);
      setProducts(productsRes.data);
      setMovements(movementsRes.data);
    } catch (err) {
      console.error('Failed to load stock data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateProduct() {
    if (!productForm.name) return;
    try {
      const res = await stockAPI.products.create({
        name: productForm.name,
        description: productForm.description || undefined,
        quantity: productForm.quantity,
        unit: productForm.unit,
        price: 0,
      });
      setProducts([res.data, ...products]);
      setShowProductForm(false);
      setProductForm({ name: '', description: '', quantity: 0, unit: 'unit' });
    } catch (err) {
      console.error('Failed to create product', err);
    }
  }

  async function handleUpdateProduct(id: number) {
    try {
      const res = await stockAPI.products.update(id, {
        name: productForm.name,
        description: productForm.description || undefined,
        quantity: productForm.quantity,
        unit: productForm.unit,
      });
      setProducts(products.map((p) => (p.id === id ? res.data : p)));
      setEditingProduct(null);
      setProductForm({ name: '', description: '', quantity: 0, unit: 'unit' });
    } catch (err) {
      console.error('Failed to update product', err);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await stockAPI.products.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  }

  async function handleCreateMovement() {
    if (!movementForm.product_id || movementForm.quantity < 1) return;
    try {
      await stockAPI.movements.create({
        product_id: movementForm.product_id,
        movement_type: movementForm.movement_type,
        quantity: movementForm.quantity,
        reason: movementForm.reason || undefined,
      });
      setShowMovementForm(false);
      setMovementForm({ product_id: 0, movement_type: 'entry', quantity: 1, reason: '' });
      await loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      alert(error.response?.data?.detail || 'Failed to create movement');
    }
  }

  function getProductName(id: number): string {
    return products.find((p) => p.id === id)?.name || `Product #${id}`;
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <p className={`text-lg font-medium ${mutedClass} animate-pulse`}>Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className={`text-3xl font-bold ${textClass}`}>Stock Management</h1>
          </div>
          <p className={`${mutedClass} ml-12`}>
            {products.length} products · {movements.length} movements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Package className="w-4 h-4" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ArrowDownUp className="w-4 h-4" />
          Movements
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
              <input
                type="text"
                placeholder="Search products..."
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
              onClick={() => {
                setShowProductForm(!showProductForm);
                setEditingProduct(null);
                setProductForm({ name: '', description: '', quantity: 0, unit: 'unit' });
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                showProductForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              {showProductForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showProductForm ? 'Cancel' : 'New Product'}
            </button>
          </div>

          {/* Product Form */}
          {(showProductForm || editingProduct) && (
            <div className={`rounded-2xl border p-6 ${cardClass} animate-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className={`text-lg font-semibold ${textClass}`}>
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className={`lg:col-span-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-20 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingProduct ? () => handleUpdateProduct(editingProduct.id) : handleCreateProduct}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingProduct ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(false);
                      setProductForm({ name: '', description: '', quantity: 0, unit: 'unit' });
                    }}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-sm font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                    <th className="text-left p-4 pl-6">#</th>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4 hidden md:table-cell">Description</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="text-left p-4 hidden sm:table-cell">Unit</th>
                    <th className="text-left p-4 hidden lg:table-cell">Updated</th>
                    <th className="text-right p-4 pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                      <td className={`p-4 pl-6 ${mutedClass} text-sm`}>#{product.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                            <Package className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className={`font-semibold ${textClass}`}>{product.name}</span>
                        </div>
                      </td>
                      <td className={`p-4 ${mutedClass} text-sm hidden md:table-cell max-w-xs truncate`}>
                        {product.description || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${
                          product.quantity > 10
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : product.quantity > 0
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {product.quantity === 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                          {product.quantity}
                        </span>
                      </td>
                      <td className={`p-4 ${mutedClass} text-sm hidden sm:table-cell`}>{product.unit}</td>
                      <td className={`p-4 ${mutedClass} text-sm hidden lg:table-cell`}>
                        {product.updated_at
                          ? new Date(product.updated_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(false);
                              setProductForm({
                                name: product.name,
                                description: product.description || '',
                                quantity: product.quantity,
                                unit: product.unit,
                              });
                            }}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Package className={`w-12 h-12 ${mutedClass} opacity-50`} />
                          <p className={`text-lg font-medium ${mutedClass}`}>No products found</p>
                          <p className={`text-sm ${mutedClass}`}>
                            {searchTerm ? 'Try a different search term' : 'Create your first product!'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowMovementForm(!showMovementForm)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                showMovementForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              {showMovementForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showMovementForm ? 'Cancel' : 'New Movement'}
            </button>
          </div>

          {/* Movement Form */}
          {showMovementForm && (
            <div className={`rounded-2xl border p-6 ${cardClass} animate-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <ArrowDownUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className={`text-lg font-semibold ${textClass}`}>New Stock Movement</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  value={movementForm.product_id}
                  onChange={(e) => setMovementForm({ ...movementForm, product_id: parseInt(e.target.value) || 0 })}
                  className={`lg:col-span-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                >
                  <option value={0}>Select Product *</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
                <select
                  value={movementForm.movement_type}
                  onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value as 'entry' | 'exit' })}
                  className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                >
                  <option value="entry">📥 Entry (+)</option>
                  <option value="exit">📤 Exit (-)</option>
                </select>
                <input
                  type="number"
                  placeholder="Quantity *"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 0 })}
                  className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                  min="1"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Reason"
                    value={movementForm.reason}
                    onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${inputClass}`}
                  />
                  <button
                    onClick={handleCreateMovement}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Movements Table */}
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider ${tableHeaderClass}`}>
                    <th className="text-left p-4 pl-6">#</th>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Quantity</th>
                    <th className="text-left p-4 hidden md:table-cell">Reason</th>
                    <th className="text-left p-4 pr-6 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className={`border-t ${borderClass} ${tableRowHover} transition-colors`}>
                      <td className={`p-4 pl-6 ${mutedClass} text-sm`}>#{movement.id}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${textClass}`}>
                          {getProductName(movement.product_id)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          movement.movement_type === 'entry'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {movement.movement_type === 'entry' ? (
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                          )}
                          {movement.movement_type === 'entry' ? 'ENTRY' : 'EXIT'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold text-sm ${
                          movement.movement_type === 'entry'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {movement.movement_type === 'entry' ? '+' : '-'}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className={`p-4 ${mutedClass} text-sm hidden md:table-cell max-w-xs truncate`}>
                        {movement.reason || '—'}
                      </td>
                      <td className={`p-4 pr-6 ${mutedClass} text-sm hidden lg:table-cell`}>
                        <div className="flex items-center gap-2">
<CalendarDays className="w-3.5 h-3.5" />                          {new Date(movement.created_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <ArrowDownUp className={`w-12 h-12 ${mutedClass} opacity-50`} />
                          <p className={`text-lg font-medium ${mutedClass}`}>No movements yet</p>
                          <p className={`text-sm ${mutedClass}`}>Create your first stock movement!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}