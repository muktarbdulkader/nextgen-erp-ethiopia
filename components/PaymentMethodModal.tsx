import React, { useState } from 'react';
import { X, Smartphone, Building2, CreditCard, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onMethodSelected: (method: 'telebirr' | 'cbe' | 'card') => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onMethodSelected
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'telebirr' | 'cbe' | 'card' | null>(null);
  const [step, setStep] = useState<'select' | 'details'>('select');
  
  // Payment details state
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [cbeReference, setCbeReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const handleMethodSelect = (method: 'telebirr' | 'cbe' | 'card') => {
    setSelectedMethod(method);
    setStep('details');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedMethod(null);
  };

  const handleContinue = () => {
    // Validate based on selected method
    if (selectedMethod === 'telebirr' && !telebirrPhone) {
      alert('Please enter your Telebirr phone number');
      return;
    }
    if (selectedMethod === 'cbe' && !cbeReference) {
      alert('Please enter your CBE reference');
      return;
    }
    if (selectedMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert('Please enter all card details');
      return;
    }
    
    onMethodSelected(selectedMethod!);
  };

  const paymentMethods = [
    {
      id: 'telebirr' as const,
      name: 'Telebirr',
      icon: Smartphone,
      description: 'Pay with your Telebirr mobile wallet',
      color: 'green',
      popular: true
    },
    {
      id: 'cbe' as const,
      name: 'CBE Birr',
      icon: Building2,
      description: 'Pay with Commercial Bank of Ethiopia',
      color: 'purple',
      popular: false
    },
    {
      id: 'card' as const,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay with Visa, Mastercard, or Amex',
      color: 'blue',
      popular: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Choose Payment Method</h2>
              <p className="text-brand-100 text-sm">Select how you'd like to pay for {planName}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Plan Summary */}
          <div className="bg-slate-50 dark:bg-dark-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selected Plan</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                <p className="text-2xl font-bold text-brand-600">{planPrice}</p>
              </div>
            </div>
          </div>

          {step === 'select' ? (
            // Step 1: Select Payment Method
            <>
              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Select Payment Method:
            </p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left relative group hover:shadow-md ${
                      isSelected
                        ? method.color === 'green'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-green-100 dark:shadow-green-900/20'
                          : method.color === 'purple'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-purple-100 dark:shadow-purple-900/20'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-blue-100 dark:shadow-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${
                        method.color === 'green'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : method.color === 'purple'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        <Icon size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {method.name}
                          </h3>
                          {method.popular && (
                            <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {method.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center animate-scale-in ${
                          method.color === 'green'
                            ? 'bg-green-500'
                            : method.color === 'purple'
                            ? 'bg-purple-500'
                            : 'bg-blue-500'
                        }`}>
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>💡 Note:</strong> After entering your payment details, you'll create your account. Your payment will be processed securely through Chapa.
            </p>
          </div>
            </>
          

          ) : (
            // Step 2: Enter Payment Details
            <>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <ArrowRight size={16} className="rotate-180" />
                  Back to payment methods
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {selectedMethod === 'telebirr' && (
                    <>
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Telebirr Payment</h3>
                        <p className="text-sm text-slate-500">Enter your mobile number</p>
                      </div>
                    </>
                  )}
                  {selectedMethod === 'cbe' && (
                    <>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">CBE Birr Payment</h3>
                        <p className="text-sm text-slate-500">Enter your reference</p>
                      </div>
                    </>
                  )}
                  {selectedMethod === 'card' && (
                    <>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Card Payment</h3>
                        <p className="text-sm text-slate-500">Enter your card details</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Payment Form Fields */}
                <div className="space-y-4">
                  {selectedMethod === 'telebirr' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 font-medium">
                          +251
                        </span>
                        <input
                          type="tel"
                          value={telebirrPhone}
                          onChange={(e) => setTelebirrPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="912 345 678"
                          maxLength={9}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Enter your 9-digit Telebirr number</p>
                    </div>
                  )}

                  {selectedMethod === 'cbe' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        CBE Reference / Account Number *
                      </label>
                      <input
                        type="text"
                        value={cbeReference}
                        onChange={(e) => setCbeReference(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Enter your CBE reference"
                      />
                      <p className="text-xs text-slate-500 mt-1">Your CBE Birr account or reference number</p>
                    </div>
                  )}

                  {selectedMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                              setCardNumber(formatted.slice(0, 19));
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                setCardExpiry(value.slice(0, 2) + '/' + value.slice(2, 4));
                              } else {
                                setCardExpiry(value);
                              }
                            }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>🔒 Secure:</strong> Your payment information is encrypted and will be processed securely through Chapa. After this step, you'll create your account.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleContinue}
                >
                  Continue to Register
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
