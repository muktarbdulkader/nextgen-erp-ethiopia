import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface ProcurementModuleProps {
  language: LanguageCode;
}

export const ProcurementModule: React.FC<ProcurementModuleProps> = ({ language }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    totalAmount: '',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.procurement.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.procurement.create({
        ...newOrder,
        totalAmount: parseFloat(newOrder.totalAmount),
        items: []
      });
      setShowAddModal(false);
      setNewOrder({ supplier: '', totalAmount: '', deliveryDate: '', notes: '' });
      loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create purchase order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Truck className="text-brand-600" size={32} />
            Procurement & Purchase
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Supplier management and purchase orders
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Orders</span>
            <Package size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pending</span>
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {orders.filter(o => o.status === 'Pending').length}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Received</span>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {orders.filter(o => o.status === 'Received').length}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Value</span>
            <Truck size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()} ETB
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No purchase orders yet. Click "New Purchase Order" to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-white">{order.orderNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.supplier}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{order.totalAmount.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Purchase Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Supplier *</label>
                <input
                  type="text"
                  required
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Amount (ETB) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newOrder.totalAmount}
                  onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={newOrder.deliveryDate}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Create Order</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
