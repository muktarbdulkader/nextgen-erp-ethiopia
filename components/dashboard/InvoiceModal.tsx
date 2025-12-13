import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Send, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose }) => {
  const [clientName, setClientName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting Services', quantity: 1, price: 5000 }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  const handleSend = () => {
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
        setIsSending(false);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            // Reset form
            setClientName('');
            setDueDate('');
            setItems([{ id: '1', description: 'Consulting Services', quantity: 1, price: 5000 }]);
        }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                    <FileText size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">New Invoice</h2>
                    <p className="text-xs text-slate-500">Create and send a professional invoice</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
            {showSuccess ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Sent!</h3>
                    <p className="text-slate-500 mt-2">The invoice has been sent to the client successfully.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Client Name" 
                            placeholder="e.g. Horizon Plantations" 
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                        <Input 
                            label="Due Date" 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Items</label>
                            <button onClick={handleAddItem} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                                <Plus size={12} /> Add Item
                            </button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-2 items-start">
                                    <input 
                                        className="flex-[2] bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    />
                                    <input 
                                        type="number"
                                        className="w-20 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    />
                                    <input 
                                        type="number"
                                        className="w-28 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white"
                                        placeholder="Price"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                    />
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-dark-900/50 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>VAT (15%)</span>
                            <span>{tax.toLocaleString()} ETB</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                            <span>Total</span>
                            <span>{total.toLocaleString()} ETB</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        {!showSuccess && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 flex justify-between gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <div className="flex gap-2">
                    <Button variant="outline" className="hidden sm:flex">
                        <Printer size={16} className="mr-2" />
                        Preview
                    </Button>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? 'Sending...' : (
                            <>
                                <Send size={16} className="mr-2" />
                                Send Invoice
                            </>
                        )}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};