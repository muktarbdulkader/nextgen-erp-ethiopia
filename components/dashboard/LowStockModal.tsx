import React from 'react';
import { X, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const LowStockModal: React.FC<LowStockModalProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];

  if (!isOpen) return null;

  const lowStockItems = [
    { id: 1, name: 'Yirgacheffe Grade 2', sku: 'CF-YIR-G2', current: 45, alert: 50, unit: 'kg' },
    { id: 2, name: 'Packaging Bags (500g)', sku: 'PKG-500G', current: 120, alert: 200, unit: 'pcs' },
    { id: 3, name: 'Printer Paper (A4)', sku: 'OFF-A4', current: 2, alert: 5, unit: 'reams' },
  ];

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
        <div className="p-4">
            <div className="space-y-3">
                {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-dark-900/50">
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                        </div>
                        <div className="text-right mx-4">
                            <div className="font-bold text-red-600">{item.current} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                            <div className="text-[10px] text-slate-400">Target: {item.alert} {item.unit}</div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                            <ShoppingCart size={14} className="mr-1" />
                            {t.reorder}
                        </Button>
                    </div>
                ))}
            </div>
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