import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Share2, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentSuccessProps {
  txRef: string;
  amount: number;
  description: string;
  onClose: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ 
  txRef, 
  amount, 
  description, 
  onClose 
}) => {
  const [copied, setCopied] = useState(false);
  const paymentUrl = `https://chapa.co/payment/mock/${txRef}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Please complete your payment of ${amount.toLocaleString()} ETB for ${description}`,
          url: paymentUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { 
      style: 'currency', 
      currency: 'ETB' 
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Link Created!</h2>
            <p className="text-green-50 text-sm">Share this link with your customer</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-6">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Amount Due</span>
              <span className="text-xs text-slate-400 font-mono">{txRef}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(amount)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </div>

          {/* Payment Link */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Payment Link
            </label>
            
            <div className="bg-slate-50 dark:bg-dark-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#1C8D58] rounded-lg text-white shrink-0">
                  <ExternalLink size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Chapa Payment URL</p>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                    {paymentUrl}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  <Copy size={16} className="mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Next Steps:
            </h4>
            <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Share the payment link with your customer via SMS, email, or WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Customer completes payment using Telebirr, CBE Birr, or Card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Transaction status will update automatically once paid</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Finance
            </Button>
            <Button
              className="flex-1 bg-[#1C8D58] hover:bg-[#157a4a]"
              onClick={() => window.open(paymentUrl, '_blank')}
            >
              <ExternalLink size={16} className="mr-2" />
              Open Link
            </Button>
          </div>

          {/* Development: Simulate Payment */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-2 text-center">Development Mode</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  try {
                    const { api } = await import('../../services/api');
                    await api.payment.simulate(txRef, 'success');
                    alert('✅ Payment simulated successfully! Refresh to see updated balance.');
                    onClose();
                  } catch (error) {
                    alert('Failed to simulate payment');
                  }
                }}
              >
                🧪 Simulate Successful Payment
              </Button>
            </div>
          )}
        </div>

        {/* Chapa Branding */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-dark-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Secured by</span>
            <span className="font-bold text-[#1C8D58]">Chapa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
