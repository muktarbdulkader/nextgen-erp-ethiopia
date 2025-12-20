import React from 'react';
import { CheckCircle, ArrowRight, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';

interface PaymentSuccessPageProps {
  planName: string;
  planPrice: string;
  txRef: string;
  onContinueToRegister: () => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  planName,
  planPrice,
  txRef,
  onContinueToRegister
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your M-Pesa payment has been processed successfully
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-slate-50 dark:bg-dark-900 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Plan:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{planName}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Amount:</span>
            <span className="font-semibold text-green-600">{planPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Payment Method:</span>
            <div className="flex items-center gap-1">
              <Smartphone size={16} className="text-green-600" />
              <span className="font-semibold text-slate-900 dark:text-white">M-Pesa</span>
            </div>
          </div>
        </div>

        {/* Transaction Reference */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Transaction Reference:</p>
          <p className="text-sm font-mono text-blue-900 dark:text-blue-300 break-all">{txRef}</p>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What's Next?</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>✅ Payment confirmed and processed</li>
            <li>✅ {planName} plan features activated</li>
            <li>🔄 Complete your account registration</li>
            <li>🚀 Start using your new plan immediately</li>
          </ul>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinueToRegister}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
          rightIcon={<ArrowRight size={18} />}
        >
          Complete Registration
        </Button>

        {/* Support Note */}
        <p className="text-xs text-slate-500 mt-4">
          Need help? Contact our support team with your transaction reference.
        </p>
      </div>
    </div>
  );
};