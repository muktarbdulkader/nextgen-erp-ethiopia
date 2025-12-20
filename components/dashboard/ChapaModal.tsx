import React, { useState } from 'react';
import { X, Lock, CheckCircle, CreditCard, Smartphone, Building2, Crown, Zap, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

/**
 * ChapaModal - Payment Gateway Component
 * 
 * NOTE: All payment methods (Telebirr, M-Pesa, CBE Birr, Card) are now processed
 * through the M-Pesa API gateway instead of Chapa. The modal name is kept for
 * backward compatibility, but the backend routes all payments via M-Pesa STK Push.
 */

interface ChapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'payment' | 'upgrade';
  companyName?: string;
  initialAmount?: number;
  onPaymentSuccess?: (txRef: string, paymentData: any) => void;
}

type PaymentMethod = 'telebirr' | 'cbe' | 'card' | 'mpesa';

export const ChapaModal: React.FC<ChapaModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'payment',
  companyName = 'Your Company',
  initialAmount = 0,
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<PaymentMethod>('telebirr');
  const [isLoading, setIsLoading] = useState(false);
  // Use initialAmount if provided, otherwise default based on mode
  const [amount, setAmount] = useState<number>(() => {
    if (initialAmount && initialAmount > 0) {
      return initialAmount;
    }
    // Default amounts for upgrade mode based on plan name
    if (mode === 'upgrade') {
      if (companyName === 'Growth') return 2500;
      if (companyName === 'Enterprise') return 10000;
      return 2500; // Default to Growth plan price
    }
    return 0;
  });
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  if (!isOpen) return null;

  const isUpgrade = mode === 'upgrade';
  const title = isUpgrade ? `Upgrade to ${companyName} Plan` : 'Secure Payment';
  const description = isUpgrade ? 'Monthly Subscription' : companyName;

  const upgradeFeatures = [
      "Unlimited Invoices & Inventory",
      "Full AI Assistant (Mukti) Access",
      "Chapa & Stripe Integration",
      "5 User Accounts",
      "Priority Support"
  ];

  const handlePay = async () => {
      // Validate amount
      if (!amount || amount <= 0) {
          alert('Please enter a valid amount');
          return;
      }

      // Validate customer info for non-upgrade payments
      if (!isUpgrade && (!customerName || !customerEmail)) {
          alert('Please enter customer name and email');
          return;
      }

      setIsLoading(true);
      try {
          // Get user info from localStorage for upgrades
          let userEmail = customerEmail;
          let userFirstName = customerName;
          let userLastName = '';
          
          if (isUpgrade) {
              try {
                  const userInfo = localStorage.getItem('user_info');
                  if (userInfo) {
                      const user = JSON.parse(userInfo);
                      userEmail = user.email || customerEmail;
                      userFirstName = user.firstName || 'Customer';
                      userLastName = user.lastName || 'User';
                  }
              } catch (e) {
                  console.error('Error reading user info:', e);
              }
          }
          
          const [firstName, ...lastNameParts] = userFirstName.split(' ');
          const lastName = lastNameParts.join(' ') || userLastName || 'User';

          // Get phone number for M-Pesa payments
          let phoneNumber = '';
          if (method === 'mpesa') {
              const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
              phoneNumber = phoneInput?.value || '';
          }

          // Initialize transaction
          // All payment methods now route through M-Pesa API
          const response = await api.payment.initialize({
              amount: amount,
              email: userEmail,
              firstName: firstName || "Customer",
              lastName: lastName,
              description: isUpgrade ? "Growth Plan Subscription" : `Payment from ${companyName}`,
              category: 'Sales',
              type: isUpgrade ? 'subscription' : 'order',
              paymentMethod: method, // telebirr, mpesa, cbe, or card - all via M-Pesa gateway
              phoneNumber: phoneNumber
          });

          if (response.status === 'success') {
              // All methods now use M-Pesa gateway - show realistic M-Pesa message
              setIsLoading(false);
              const methodName = method === 'telebirr' ? 'Telebirr' : 
                                method === 'cbe' ? 'CBE Birr' :
                                method === 'card' ? 'Card' : 'M-Pesa';
              
              if (onPaymentSuccess && response.data?.tx_ref) {
                // For registration flow, call success callback
                onPaymentSuccess(response.data.tx_ref, response.data);
              } else {
                // Show realistic M-Pesa message
                const phoneNumber = (document.querySelector('input[type="tel"]') as HTMLInputElement)?.value || '';
                const formattedPhone = phoneNumber.startsWith('0') ? '+251' + phoneNumber.substring(1) : '+251' + phoneNumber;
                alert(`STK Push sent to ${formattedPhone}. Enter your M-Pesa PIN to complete the ${amount.toLocaleString()} ETB payment.`);
              }
              onClose();
          } else {
              setIsLoading(false);
              alert('Payment request failed. Please try again.');
          }
      } catch (e: any) {
          console.error("Payment init failed", e);
          const errorMessage = e?.message || 'Payment initialization failed. Please try again.';
          alert(errorMessage);
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up my-8">
        {/* Payment Header - All methods via M-Pesa */}
        <div className={`p-4 flex items-center justify-between ${isUpgrade ? 'bg-gradient-to-r from-brand-600 to-accent-500' : 'bg-green-600'}`}>
           <div className="flex items-center gap-2">
               {isUpgrade && <Crown size={20} className="text-white fill-white/20" />}
               <div className="text-white font-bold text-lg tracking-wide">{isUpgrade ? 'muktiAp Premium' : 'M-Pesa Gateway'}</div>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isUpgrade ? 'bg-accent-100 text-accent-600' : 'bg-green-100 text-green-600'}`}>
                    {isUpgrade ? <Zap size={24} className="fill-current" /> : <Lock size={24} />}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
                {isUpgrade ? (
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {amount.toLocaleString()} <span className="text-sm font-medium text-slate-400">ETB</span>
                        </div>
                        <span className="text-xs font-normal text-slate-400 block mt-1">per month</span>
                    </div>
                ) : (
                    <div className="mt-3">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Amount</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount || ''} 
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-green-500"
                                placeholder="0.00"
                                min="1"
                                step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">ETB</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Plan Benefits List */}
            {isUpgrade && (
                <div className="bg-brand-50 dark:bg-brand-900/10 rounded-lg p-4 mb-6 border border-brand-100 dark:border-brand-900/30">
                    <p className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wide mb-2">What's Included:</p>
                    <ul className="space-y-2">
                        {upgradeFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <Check size={16} className="text-brand-600 shrink-0 mt-0.5" />
                                <span className="text-xs">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-4">
                {/* Customer info for non-upgrade payments */}
                {!isUpgrade && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                            <input 
                                type="text" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-dark-900 text-sm outline-none focus:border-green-500" 
                                placeholder="Abebe Bikila" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Email *</label>
                            <input 
                                type="email" 
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-dark-900 text-sm outline-none focus:border-green-500" 
                                placeholder="abebe@example.com" 
                                required
                            />
                        </div>
                    </>
                )}
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                   <button 
                        onClick={() => setMethod('telebirr')}
                        className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${method === 'telebirr' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'}`}
                   >
                      <Smartphone size={16} />
                      <span className="text-[10px] font-bold">Telebirr</span>
                   </button>
                   <button 
                        onClick={() => setMethod('mpesa')}
                        className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${method === 'mpesa' ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'}`}
                   >
                      <Smartphone size={16} />
                      <span className="text-[10px] font-bold">M-Pesa</span>
                   </button>
                   <button 
                        onClick={() => setMethod('cbe')}
                        className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${method === 'cbe' ? 'border-[#800080] bg-purple-50 dark:bg-purple-900/20 text-[#800080] dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'}`}
                   >
                      <Building2 size={16} />
                      <span className="text-[10px] font-bold">CBE Birr</span>
                   </button>
                   <button 
                        onClick={() => setMethod('card')}
                        className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${method === 'card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'}`}
                   >
                      <CreditCard size={16} />
                      <span className="text-[10px] font-bold">Card</span>
                   </button>
                </div>

                {/* Dynamic Inputs based on Method */}
                <div className="bg-slate-50 dark:bg-dark-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 animate-fade-in">
                    {method === 'telebirr' && (
                        <div>
                             <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number (via M-Pesa Gateway)</label>
                             <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-500 text-sm">+251</span>
                                <input type="tel" className="flex-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-sm outline-none focus:border-green-500" placeholder="911 234 567" />
                             </div>
                             <p className="text-xs text-slate-500 mt-1">Telebirr payments processed via M-Pesa gateway</p>
                        </div>
                    )}

                    {method === 'mpesa' && (
                        <div>
                             <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">M-Pesa Number</label>
                             <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-500 text-sm">+251</span>
                                <input type="tel" className="flex-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-sm outline-none focus:border-green-500" placeholder="912 345 678" />
                             </div>
                             <p className="text-xs text-slate-500 mt-1">Enter your M-Pesa registered mobile number</p>
                        </div>
                    )}

                    {method === 'cbe' && (
                        <div>
                             <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number (CBE via M-Pesa Gateway)</label>
                             <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-500 text-sm">+251</span>
                                <input type="tel" className="flex-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-sm outline-none focus:border-green-500" placeholder="911 234 567" />
                             </div>
                             <p className="text-xs text-slate-500 mt-1">CBE Birr payments processed via M-Pesa gateway</p>
                        </div>
                    )}

                    {method === 'card' && (
                        <div>
                             <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number (Card via M-Pesa Gateway)</label>
                             <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-500 text-sm">+251</span>
                                <input type="tel" className="flex-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-sm outline-none focus:border-green-500" placeholder="911 234 567" />
                             </div>
                             <p className="text-xs text-slate-500 mt-1">Card payments processed via M-Pesa gateway</p>
                        </div>
                    )}
                </div>
            </div>

            <Button 
                className={`w-full mt-4 transition-colors ${
                    isUpgrade ? 'bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-700 hover:to-accent-600' :
                    'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handlePay}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : (
                    isUpgrade ? `Subscribe via ${method === 'telebirr' ? 'Telebirr' : method === 'mpesa' ? 'M-Pesa' : method === 'cbe' ? 'CBE' : 'Card'} (M-Pesa Gateway)` :
                    `Pay ${amount.toLocaleString()} ETB via M-Pesa`
                )}
            </Button>
            
            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <CheckCircle size={10} />
                Powered by M-Pesa Gateway
            </div>
        </div>
      </div>
    </div>
  );
};