import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
          setIsLoading(false);
          setIsSent(true);
          setTimeout(() => {
              setIsSent(false);
              onClose();
          }, 2000);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
         
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className={`font-bold text-lg text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.contactTitle}</h2>
                    <p className="text-xs text-slate-500">{t.contactDesc}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        <div className="p-6">
            {isSent ? (
                <div className="text-center py-8">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-4 mx-auto animate-bounce">
                        <Send size={32} />
                    </div>
                    <h3 className={`text-xl font-bold text-slate-900 dark:text-white mb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.messageSent}</h3>
                    <p className="text-slate-500 text-sm">Our support team will get back to you shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label={t.subject}
                        placeholder="e.g. Technical Issue"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.message}</label>
                        <textarea 
                            className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white transition-all resize-none"
                            rows={4}
                            placeholder="Describe your issue..."
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : t.sendMessage}
                        </Button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};