import React, { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onEmailSubmitted: (email: string) => void;
}

export const EmailCollectionModal: React.FC<EmailCollectionModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onEmailSubmitted
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    onEmailSubmitted(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Complete Your Purchase</h2>
              <p className="text-brand-100 text-sm">Enter your email to proceed with payment</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-slate-50 dark:bg-dark-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selected Plan</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                <p className="text-xl font-bold text-brand-600">{planPrice}</p>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                We'll use this email for your account and payment confirmation
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !email}
              rightIcon={<ArrowRight size={16} />}
              className="mt-6"
            >
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};