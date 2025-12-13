import React, { useState } from 'react';
import { X, Handshake, CheckCircle, Building2, User, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api } from '../services/api';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    type: 'Reseller',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        await api.partner.submit(formData);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
            setFormData({ name: '', company: '', email: '', type: 'Reseller', message: '' });
        }, 2000);
    } catch (err) {
        setError('Failed to submit. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                    <Handshake size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Partner with muktiAp</h2>
                    <p className="text-xs text-slate-500">Let's build the ecosystem together</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Received!</h3>
                    <p className="text-slate-500 mt-2 max-w-xs">Check your email. Our team will contact you within 24 hours.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <Input 
                        label="Full Name" 
                        name="name"
                        placeholder="Abebe Bikila"
                        icon={User}
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input 
                        label="Company / Organization" 
                        name="company"
                        placeholder="Your Company PLC"
                        icon={Building2}
                        value={formData.company}
                        onChange={handleChange}
                        required
                    />

                    <Input 
                        label="Business Email" 
                        name="email"
                        type="email"
                        placeholder="partner@company.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Partnership Interest</label>
                        <select 
                            name="type"
                            className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white transition-all"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Reseller">Reseller / Distributor</option>
                            <option value="Integrator">Technical Integrator</option>
                            <option value="Investor">Investor</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message (Optional)</label>
                        <textarea 
                            name="message"
                            className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white transition-all resize-none"
                            rows={3}
                            placeholder="Tell us about your proposal..."
                            value={formData.message}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Proposal'}
                        </Button>
                        <p className="text-xs text-center text-slate-400 mt-3">
                            By submitting, you agree to our Partner Terms.
                        </p>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
