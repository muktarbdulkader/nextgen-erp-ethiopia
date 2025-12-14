import React, { useState, useEffect } from 'react';
import { BarChart3, Package, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface SupplyChainModuleProps {
  language: LanguageCode;
}

export const SupplyChainModule: React.FC<SupplyChainModuleProps> = ({ language }) => {
  const [procurementOrders, setProcurementOrders] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [procurement, inventory, sales] = await Promise.all([
        api.procurement.getAll(),
        api.inventory.getAll(),
        api.sales.getAll()
      ]);
      setProcurementOrders(procurement);
      setInventoryItems(inventory);
      setSalesOrders(sales);
    } catch (error) {
      console.error('Failed to load supply chain data:', error);
    }
  };

  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorderLevel);
  const pendingProcurement = procurementOrders.filter(o => o.status === 'Pending').length;
  const pendingSales = salesOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="text-brand-600" size={32} />
          Supply Chain Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          End-to-end supply chain visibility
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Inventory Items</span>
            <Package size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{inventoryItems.length}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Low Stock Alerts</span>
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pending Orders</span>
            <Truck size={20} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{pendingProcurement}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Sales to Fulfill</span>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{pendingSales}</p>
        </div>
      </div>

      {/* Supply Chain Flow */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Supply Chain Flow</h3>
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
          {/* Procurement */}
          <div className="flex-1 min-w-[200px] text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Truck size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Procurement</h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">{procurementOrders.length}</p>
            <p className="text-xs text-slate-500">Purchase Orders</p>
          </div>

          <div className="text-slate-300 dark:text-slate-600">→</div>

          {/* Inventory */}
          <div className="flex-1 min-w-[200px] text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Package size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Inventory</h4>
            <p className="text-2xl font-bold text-green-600 mt-2">{inventoryItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
            <p className="text-xs text-slate-500">Total Units</p>
          </div>

          <div className="text-slate-300 dark:text-slate-600">→</div>

          {/* Sales */}
          <div className="flex-1 min-w-[200px] text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Sales</h4>
            <p className="text-2xl font-bold text-purple-600 mt-2">{salesOrders.length}</p>
            <p className="text-xs text-slate-500">Orders</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Low Stock Alerts</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {lowStockItems.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              All items are well stocked!
            </div>
          ) : (
            lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-700/50">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{item.quantity} {item.unit}</p>
                  <p className="text-xs text-slate-500">Reorder at: {item.reorderLevel}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Procurement */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Procurement</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {procurementOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{order.supplier}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Received' ? 'bg-green-100 text-green-700' :
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {procurementOrders.length === 0 && (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No procurement orders yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Sales</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {salesOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{order.customerName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {salesOrders.length === 0 && (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No sales orders yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
