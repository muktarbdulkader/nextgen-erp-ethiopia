import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { api } from '../../services/api';

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const LowStockModal: React.FC<LowStockModalProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLowStockItems();
    }
  }, [isOpen]);

  const fetchLowStockItems = async () => {
    setIsLoading(true);
    try {
      const items = await api.inventory.getAll();
      // Filter items where quantity is at or below reorder level
      const lowStock = items.filter((item: any) => item.quantity <= item.reorderLevel);
      setLowStockItems(lowStock);
    } catch (e) {
      console.error('Failed to fetch inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white dark:bg-dark-800 rounded-lg text-red-600">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h2 className={`font-bold text-lg text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.lowStock}</h2>
                    <p className="text-xs text-slate-500">Items below reorder level</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                <p className="text-sm text-slate-500">Loading inventory...</p>
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-500">All items are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                  {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-dark-900/50">
                          <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                              <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                          </div>
                          <div className="text-right mx-4">
                              <div className="font-bold text-red-600">{item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                              <div className="text-[10px] text-slate-400">Reorder at: {item.reorderLevel} {item.unit}</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs h-8">
                              <ShoppingCart size={14} className="mr-1" />
                              {t.reorder}
                          </Button>
                      </div>
                  ))}
              </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-center">
            <Button className="w-full" onClick={onClose}>
                Done
            </Button>
        </div>
      </div>
    </div>
  );
};
