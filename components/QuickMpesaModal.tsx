import React, { useState } from 'react';
import { X, Smartphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { api } from '../services/api';

interface QuickMpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onPaymentSuccess: (txRef: string) => void;
}

export const QuickMpesaModal: React.FC<QuickMpesaModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onPaymentSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txRef, setTxRef] = useState('');

  if (!isOpen) return null;

  const handleQuickPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Extract numeric amount from price string
      const numericAmount = parseFloat(planPrice.replace(/[^0-9.]/g, ''));
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid plan price');
      }

      // Initialize M-Pesa payment
      const paymentData = {
        amount: numericAmount,
        email: 'quickpay@example.com', // Temporary email for quick payment
        firstName: 'Quick',
        lastName: 'Payment',
        description: `${planName} Plan - Quick Payment`,
        category: 'Subscription',
        type: 'subscription',
        paymentMethod: 'mpesa',
        phoneNumber: phoneNumber
      };

      const response = await api.payment.initialize(paymentData);

      if (response.status === 'success') {
        setTxRef(response.data.tx_ref);
        setPaymentStatus('success');
        
        // Start polling for payment confirmation
        pollPaymentStatus(response.data.tx_ref);
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (txRef: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      try {
        const status = await api.payment.verify(txRef);
        
        if (status.status === 'success') {
          onPaymentSuccess(txRef);
          return;
        }
        
        if (status.status === 'failed') {
          setPaymentStatus('failed');
          setErrorMessage('Payment was declined or failed');
          return;
        }

        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('failed');
          setErrorMessage('Payment timeout. Please check your phone and try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX XXX XXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 9) {
      setPhoneNumber(formatted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Smartphone size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quick M-Pesa Payment</h2>
                <p className="text-green-100 text-sm">{planName} - {planPrice}</p>
              </div>
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
          {paymentStatus === 'idle' && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  M-Pesa Phone Number *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 font-medium">
                    +251
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="911 234 567"
                    maxLength={11} // Includes spaces
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Enter your M-Pesa registered mobile number</p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-900 dark:text-green-300">
                  <strong>📱 How it works:</strong><br />
                  1. Enter your M-Pesa registered phone number<br />
                  2. Click "Pay Now" to initiate payment<br />
                  3. Check your phone for the M-Pesa prompt<br />
                  4. Enter your M-Pesa PIN to complete payment
                </p>
              </div>

              <Button
                onClick={handleQuickPayment}
                disabled={!phoneNumber || phoneNumber.replace(/\D/g, '').length < 9 || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay ${planPrice} Now`
                )}
              </Button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <Loader2 size={48} className="animate-spin text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Payment Sent to Your Phone
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Check your phone (+251 {phoneNumber}) for the M-Pesa payment prompt
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>📱 Complete the payment:</strong><br />
                  1. STK Push sent to your phone<br />
                  2. Enter your M-Pesa PIN when prompted<br />
                  3. Confirm the payment amount<br />
                  4. Wait for payment confirmation
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <CheckCircle size={48} className="text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your {planName} plan has been activated
              </p>
              <p className="text-xs text-slate-500">
                Transaction ID: {txRef}
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <AlertCircle size={48} className="text-red-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Payment Failed
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {errorMessage}
              </p>
              <Button
                onClick={() => {
                  setPaymentStatus('idle');
                  setErrorMessage('');
                  setTxRef('');
                }}
                variant="outline"
                className="mr-2"
              >
                Try Again
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};