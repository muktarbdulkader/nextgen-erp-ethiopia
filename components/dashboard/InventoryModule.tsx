import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertTriangle, CheckCircle, Loader2, Download } from 'lucide-react';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { downloadCSV } from '../../utils/csvHelper';

interface InventoryModuleProps {
  language: LanguageCode;
  onAddItem?: () => void;
  onRefresh?: () => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ language, onAddItem, onRefresh }) => {
  const t = translations[language];
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  // Refresh when onRefresh prop changes
  useEffect(() => {
    if (onRefresh) {
      fetchInventory();
    }
  }, [onRefresh]);

  const fetchInventory = async () => {
      setIsLoading(true);
      try {
          const data = await api.inventory.getAll();
          console.log('📦 Fetched inventory items:', data.length);
          setItems(data);
      } catch (e) {
          console.error('❌ Failed to fetch inventory:', e);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.inventory}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your stock levels and reorders.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={onAddItem}>
                <Package size={18} className="mr-2" />
                {t.addItem}
            </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-brand-500"
                />
             </div>
             <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700">
                    <Filter size={16} />
                    Filter
                 </button>
                 <button 
                    onClick={() => downloadCSV(items, 'muktiAp_Inventory')}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700"
                >
                    <Download size={16} />
                    Export
                 </button>
             </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3 font-medium">{t.itemName}</th>
                        <th className="px-6 py-3 font-medium">{t.sku}</th>
                        <th className="px-6 py-3 font-medium">{t.category}</th>
                        <th className="px-6 py-3 font-medium">{t.quantity}</th>
                        <th className="px-6 py-3 font-medium">{t.status}</th>
                        <th className="px-6 py-3 font-medium text-right">{t.price}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                        <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500"/></td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-500">No items found. Add one!</td></tr>
                    ) : items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                            <td className="px-6 py-4 font-mono text-slate-500">{item.sku}</td>
                            <td className="px-6 py-4 text-slate-500">{item.category}</td>
                            <td className="px-6 py-4 font-bold">{item.quantity} <span className="font-normal text-xs text-slate-400">{item.unit}</span></td>
                            <td className="px-6 py-4">
                                {item.quantity <= item.reorderLevel ? (
                                    <span className={`inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs font-medium ${language === 'AM' ? 'ethiopic-text' : ''}`}>
                                        <AlertTriangle size={12} />
                                        {t.lowStock}
                                    </span>
                                ) : (
                                    <span className={`inline-flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs font-medium ${language === 'AM' ? 'ethiopic-text' : ''}`}>
                                        <CheckCircle size={12} />
                                        {t.inStock}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">{item.price.toLocaleString()} ETB</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};