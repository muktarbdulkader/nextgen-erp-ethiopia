import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, Users, Package, MoreVertical, Calendar, Download, Plus, X, Trash2 } from 'lucide-react';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { downloadCSV } from '../../utils/csvHelper';
import { api } from '../../services/api';

interface SalesModuleProps {
  language: LanguageCode;
  onRefresh?: () => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ language, onRefresh }) => {
  const t = translations[language];
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Order State
  const [newOrder, setNewOrder] = useState({
    client: '',
    status: 'Processing',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const data = await api.sales.getAll();
        setOrders(data);
    } catch (e) {
        console.error("Failed sales", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddItem = () => {
      setNewOrder(prev => ({
          ...prev,
          items: [...prev.items, { name: '', quantity: 1, price: 0 }]
      }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
      const updatedItems = [...newOrder.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setNewOrder(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index: number) => {
      setNewOrder(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== index)
      }));
  };

  const handleCreateOrder = async () => {
      if (!newOrder.client || newOrder.items.length === 0) return;
      try {
          const created = await api.sales.create(newOrder);
          setOrders([created, ...orders]);
          setIsModalOpen(false);
          setNewOrder({ client: '', status: 'Processing', items: [{ name: '', quantity: 1, price: 0 }] });
          if (onRefresh) onRefresh();
      } catch (e) {
          alert('Error creating order');
      }
  };

  const calculateTotal = () => {
      return newOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const StatCard = ({ icon: Icon, title, value, change }: any) => (
      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
          <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
              <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" /> {change}
              </p>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600">
              <Icon size={20} />
          </div>
      </div>
  );

  const totalSalesValue = orders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.salesTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track orders and revenue.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadCSV(orders, 'muktiAp_Sales_Orders')}>
                <Download size={18} className="mr-2" />
                Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
                <ShoppingCart size={18} className="mr-2" />
                {t.newOrders}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={ShoppingCart} title={t.totalSales} value={`${totalSalesValue.toLocaleString()} ETB`} change="+15% this month" />
          <StatCard icon={Users} title={t.activeClients} value="124" change="+4 new this week" />
          <StatCard icon={Package} title="Orders Count" value={orders.length} change={`+${orders.filter(o => o.status === 'Processing').length} pending`} />
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-slate-900 dark:text-white">Recent Orders</h3>
             <button className="text-sm text-brand-600 hover:underline">View All</button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3 font-medium">Order ID</th>
                        <th className="px-6 py-3 font-medium">Client</th>
                        <th className="px-6 py-3 font-medium">Items</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Total</th>
                        <th className="px-6 py-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {orders.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-8 text-slate-500">No orders yet.</td></tr>
                    ) : orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                                {order.id.split('-')[0]}...
                            </td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{order.client}</td>
                            <td className="px-6 py-4 text-slate-500">
                                {order.items?.length || 0} items
                            </td>
                            <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                                <Calendar size={12} /> {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                {order.total.toLocaleString()} ETB
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-dark-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold dark:text-white">Create New Order</h2>
                     <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                 </div>

                 <div className="space-y-4">
                     <Input 
                        label="Client Name" 
                        value={newOrder.client} 
                        onChange={(e) => setNewOrder({...newOrder, client: e.target.value})}
                        placeholder="e.g. Cafe Tomoca"
                     />
                     
                     <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Items</label>
                             <button onClick={handleAddItem} className="text-xs text-brand-600 flex items-center gap-1"><Plus size={14}/> Add Item</button>
                         </div>
                         <div className="space-y-3">
                             {newOrder.items.map((item, idx) => (
                                 <div key={idx} className="flex gap-2 items-start">
                                     <div className="flex-1">
                                         <input 
                                            placeholder="Item Name"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                         />
                                     </div>
                                     <div className="w-20">
                                          <input 
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                         />
                                     </div>
                                     <div className="w-24">
                                          <input 
                                            type="number"
                                            placeholder="Price"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                         />
                                     </div>
                                     <button onClick={() => handleRemoveItem(idx)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                         <div className="text-right">
                             <p className="text-sm text-slate-500">Total Amount</p>
                             <p className="text-2xl font-bold text-slate-900 dark:text-white">{calculateTotal().toLocaleString()} ETB</p>
                         </div>
                     </div>

                     <div className="flex gap-3 mt-4">
                         <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                         <Button className="flex-1" onClick={handleCreateOrder}>Create Order</Button>
                     </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};