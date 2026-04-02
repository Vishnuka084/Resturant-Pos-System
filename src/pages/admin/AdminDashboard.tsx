import React, { useState } from 'react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useOrders } from '../../hooks/useOrders';
import { TrendingUp, Plus, Edit2, Trash2, X, Image as ImageIcon, Tag } from 'lucide-react';
import { MenuItem, PromoCode } from '../../types';
import { usePromoCodes } from '../../hooks/usePromoCodes';

export const AdminDashboard = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const { orders } = useOrders();
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = usePromoCodes();
  
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'reports' | 'promos'>('reports');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    isAvailable: true,
    type: 'food' as 'food' | 'rental' | 'tour' | 'service',
    duration: '',
    capacity: ''
  });

  const [promoFormData, setPromoFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    isActive: true
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Stats Logic
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const dailySales = completedOrders.filter(o => now - o.createdAt < dayMs).reduce((sum, o) => sum + o.total, 0);
  const weeklySales = completedOrders.filter(o => now - o.createdAt < 7 * dayMs).reduce((sum, o) => sum + o.total, 0);
  const monthlySales = completedOrders.filter(o => now - o.createdAt < 30 * dayMs).reduce((sum, o) => sum + o.total, 0);

  const itemMap = new Map<string, {name: string, count: number, revenue: number}>();
  completedOrders.forEach(o => o.items.forEach(item => {
    const existing = itemMap.get(item.id) || {name: item.name, count: 0, revenue: 0};
    existing.count += item.quantity;
    existing.revenue += item.price * item.quantity;
    itemMap.set(item.id, existing);
  }));
  const topItems = Array.from(itemMap.values()).sort((a,b) => b.count - a.count).slice(0, 5);

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      description: item.description || '',
      isAvailable: item.isAvailable,
      type: item.type || 'food',
      duration: item.duration || '',
      capacity: item.capacity?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category: categories[0] || 'Main Course',
      image: '',
      description: '',
      isAvailable: true,
      type: 'food',
      duration: '',
      capacity: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenPromoAdd = () => {
    setEditingPromo(null);
    setPromoFormData({ code: '', type: 'percentage', value: '', isActive: true });
    setIsPromoModalOpen(true);
  };

  const handleOpenPromoEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value.toString(),
      isActive: promo.isActive
    });
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: promoFormData.code.toUpperCase(),
      type: promoFormData.type,
      value: parseFloat(promoFormData.value),
      isActive: promoFormData.isActive
    };

    if (editingPromo) {
      await updatePromoCode(editingPromo.id, data);
    } else {
      await addPromoCode(data);
    }
    setIsPromoModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Omit<MenuItem, 'id'> = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      description: formData.description,
      isAvailable: formData.isAvailable,
      type: formData.type,
      duration: formData.duration,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id, data);
    } else {
      await addMenuItem(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your restaurant operations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'menu' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            Menu & Services
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'reports' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'promos' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            Promos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Items/Services</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{menuItems.filter(i => i.isAvailable).length}</p>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">Offerings Management</h2>
            <button
              onClick={handleOpenAdd}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Item/Service
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Category / Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {menuItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><ImageIcon className="h-4 w-4 text-gray-400" /></div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">
                        {item.type || 'food'}
                        {item.duration && ` • ${item.duration}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No menu items found. Add one to get started!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">Order History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer/Table</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{order.customerName || 'Walk-in'}</div>
                      {order.phoneNumber && <div className="text-xs text-gray-500">{order.phoneNumber}</div>}
                      {order.tableNumber && <div className="text-xs font-bold text-primary-600">Table: {order.tableNumber}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-bold">{item.quantity}x</span> {item.name}
                            {(item.spiceLevel || item.specialInstructions || item.selectedAddons) && (
                              <span className="text-gray-400 italic"> *customized</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 2 && <div className="text-xs text-gray-400">+{order.items.length - 2} more...</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-right">${order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Daily Sales (24h)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${dailySales.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Weekly Sales (7d)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${weeklySales.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Monthly Sales (30d)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${monthlySales.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">Top 5 Best-Selling Items/Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Rank</th>
                    <th className="pb-3 font-medium">Item Name</th>
                    <th className="pb-3 font-medium text-right">Units Sold</th>
                    <th className="pb-3 font-medium text-right">Total Revenue generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {topItems.map((item, index) => (
                    <tr key={item.name}>
                      <td className="py-3 font-bold text-gray-400">#{index + 1}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="py-3 text-right">{item.count}</td>
                      <td className="py-3 text-right font-medium text-green-600">${item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {topItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">No items sold yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promos' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">Promo Codes</h2>
            <button
              onClick={handleOpenPromoAdd}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Promo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {promoCodes.map(promo => (
                  <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{promo.code}</td>
                    <td className="px-6 py-4">
                      {promo.type === 'percentage' ? `${promo.value}% Off` : `$${promo.value} Off`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenPromoEdit(promo)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deletePromoCode(promo.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promoCodes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No promo codes created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Promo Codes */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPromoModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold">{editingPromo ? 'Edit Promo' : 'New Promo Code'}</h2>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handlePromoSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 uppercase tracking-wider text-gray-500">Promo Code</label>
                <input required type="text" value={promoFormData.code} onChange={e => setPromoFormData({...promoFormData, code: e.target.value})} className="w-full px-4 py-3 border font-bold text-center text-xl rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500" placeholder="E.G. SUPER10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select value={promoFormData.type} onChange={e => setPromoFormData({...promoFormData, type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input required type="number" step="0.01" value={promoFormData.value} onChange={e => setPromoFormData({...promoFormData, value: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="promoActive" checked={promoFormData.isActive} onChange={e => setPromoFormData({...promoFormData, isActive: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="promoActive" className="text-sm font-medium">Activate this code</label>
              </div>
              <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg mt-6">
                {editingPromo ? 'Update Promo Code' : 'Save Promo Code'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} list="categories" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                  <datalist id="categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <option value="food">🍽️ Food/Drink</option>
                    <option value="rental">🚲 Rental</option>
                    <option value="tour">🌴 Tour</option>
                    <option value="service">🏄 Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Optional)</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 2 hrs/day" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity / Max People (Optional)</label>
                <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isAvailable" className="text-sm font-medium">Available for order</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm">{editingItem ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
