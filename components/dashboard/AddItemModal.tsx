import React, { useState } from 'react';
import { X, Package, Tag, DollarSign, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { api } from '../../services/api';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSuccess?: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, language, onSuccess }) => {
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    reorderLevel: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        await api.inventory.create(formData);
        // Refresh would happen if state was lifted, for now we close and reset
        setFormData({ name: '', sku: '', category: '', price: '', quantity: '', reorderLevel: '' });
        onClose();
        if (onSuccess) onSuccess();
    } catch (e) {
        console.error("Failed to add item", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                    <Package size={20} />
                </div>
                <div>
                    <h2 className={`font-bold text-lg text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addItem}</h2>
                    <p className="text-xs text-slate-500">Add new stock to inventory</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input 
                label={t.itemName} 
                name="name"
                placeholder="e.g. Arabica Beans"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label={t.sku} 
                    name="sku"
                    placeholder="SKU-123"
                    icon={Tag}
                    value={formData.sku}
                    onChange={handleChange}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.category}</label>
                    <select 
                        name="category"
                        className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="Raw Material">Raw Material</option>
                        <option value="Finished Good">Finished Good</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Office">Office</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label={t.price} 
                    name="price"
                    type="number"
                    placeholder="0.00"
                    icon={DollarSign}
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
                 <Input 
                    label={t.quantity} 
                    name="quantity"
                    type="number"
                    placeholder="0"
                    icon={Layers}
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />
            </div>

            <Input 
                label={t.reorderLevel} 
                name="reorderLevel"
                type="number"
                placeholder="Alert when stock is below..."
                value={formData.reorderLevel}
                onChange={handleChange}
            />

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    {t.cancel}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Saving...' : t.saveItem}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};