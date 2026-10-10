import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Package,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Check,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: 'Food' | 'Water' | 'Medicine' | 'Blankets' | 'Clothing' | 'Hygiene kits' | 'Baby supplies' | 'Tents' | 'Emergency equipment';
  quantity: number;
  unit: string;
  warehouseLocation: string;
  minimumStock: number;
  organization?: string;
  organizationName?: string;
  createdAt: string;
}

interface NgoStats {
  totalItemTypes: number;
  totalStock: number;
  lowStockCount: number;
  sheltersCount: number;
  distributionTasksCount: number;
  orgName: string;
}

const NgoDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [resources, setResources] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<NgoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal for creating / updating item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemForm, setItemForm] = useState({
    itemName: '',
    category: 'Food',
    quantity: 100,
    unit: 'packets',
    warehouseLocation: '',
    minimumStock: 20
  });

  const fetchNgoData = async () => {
    try {
      setRefreshing(true);
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const [resRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/ngo/resources`, { headers }),
        fetch(`${baseUrl}/ngo/stats`, { headers })
      ]);

      const [resData, statsData] = await Promise.all([
        resRes.json(),
        statsRes.json()
      ]);

      if (resData.success) setResources(resData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load NGO inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNgoData();
    }
  }, [token]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setItemForm({
      itemName: '',
      category: 'Food',
      quantity: 100,
      unit: 'packets',
      warehouseLocation: 'Central Relief Cache',
      minimumStock: 20
    });
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      warehouseLocation: item.warehouseLocation,
      minimumStock: item.minimumStock
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      let res;
      if (editingItem) {
        res = await fetch(`${baseUrl}/ngo/resources/${editingItem._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(itemForm)
        });
      } else {
        res = await fetch(`${baseUrl}/ngo/resources`, {
          method: 'POST',
          headers,
          body: JSON.stringify(itemForm)
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Inventory updated!');
        setShowItemModal(false);
        fetchNgoData();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (e) {
      toast.error('Network error updating inventory');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this item from your inventory?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/ngo/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Resource removed');
        fetchNgoData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error removing resource');
    }
  };

  return (
    <DashboardLayout
      title="NGO Relief Logistics & Inventory"
      subtitle={`Organization: ${user?.organization || 'Partner Relief NGO'} | Supply Chain Management`}
      actionButton={
        <div className="flex gap-2">
          <button
            onClick={fetchNgoData}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Stock</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      }
    >
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Stock Items</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{stats?.totalStock ?? 0}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{stats?.totalItemTypes ?? 0} distinct SKUs</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-amber-950/60">
          <div className="text-[11px] font-mono uppercase text-amber-400 flex items-center justify-between">
            <span>Low Stock Alerts</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{stats?.lowStockCount ?? 0}</div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Below reorder buffer</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono uppercase text-slate-400">Active Relief Shelters</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{stats?.sheltersCount ?? 0}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Across emergency zone</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono uppercase text-slate-400">Distribution Tasks</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{stats?.distributionTasksCount ?? 0}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Active food &amp; aid lines</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Dedicated Resource Inventory</span>
            </h2>
            <p className="text-xs text-slate-400">
              Only your organization can modify and manage the stock quantities listed here.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Available Quantity</th>
                <th className="py-3 px-3">Storage Depot</th>
                <th className="py-3 px-3">Buffer Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No resources logged yet. Click "Add Stock Item" to register relief supplies.
                  </td>
                </tr>
              ) : (
                resources.map((item) => {
                  const isLow = item.quantity <= item.minimumStock;
                  return (
                    <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        {item.itemName}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-base text-cyan-300">{item.quantity}</span>{' '}
                        <span className="text-slate-400 text-[11px]">{item.unit}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {item.warehouseLocation}
                      </td>

                      <td className="py-3 px-3">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" />
                            LOW STOCK (Min: {item.minimumStock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-max">
                            ADEQUATE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Update Stock Item' : 'Add New Relief Resource'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.itemName}
                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                  placeholder="e.g. Purified Drinking Water (20L Cans)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Water">Water</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Blankets">Blankets</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Hygiene kits">Hygiene kits</option>
                    <option value="Baby supplies">Baby supplies</option>
                    <option value="Tents">Tents</option>
                    <option value="Emergency equipment">Emergency equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="packets, cans, boxes"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={isNaN(itemForm.quantity) ? '' : itemForm.quantity}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      setItemForm({ ...itemForm, quantity: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Min Buffer Alert</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={isNaN(itemForm.minimumStock) ? '' : itemForm.minimumStock}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      setItemForm({ ...itemForm, minimumStock: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Warehouse / Depot Location</label>
                <input
                  type="text"
                  required
                  value={itemForm.warehouseLocation}
                  onChange={(e) => setItemForm({ ...itemForm, warehouseLocation: e.target.value })}
                  placeholder="e.g. Beltola Red Cross Depot 1"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NgoDashboard;
