import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface MpesaStats {
  totalTransactions: number;
  successfulPayments: number;
  pendingPayments: number;
  totalAmount: number;
  todayTransactions: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    phoneNumber: string;
    status: string;
    paymentMethod: string;
    createdAt: string;
    mpesaReceiptNumber?: string;
  }>;
}

export const MpesaCounter: React.FC = () => {
  const [stats, setStats] = useState<MpesaStats>({
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    totalAmount: 0,
    todayTransactions: 0,
    recentPayments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchMpesaStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchMpesaStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMpesaStats = async () => {
    try {
      const response = await fetch('/api/payments/mpesa-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch M-Pesa stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">M-Pesa Gateway</h3>
              <p className="text-green-100 text-sm">Real-time transaction monitoring</p>
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp size={20} />
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalTransactions.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Total Transactions</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulPayments.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Successful</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingPayments.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Pending</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalAmount.toLocaleString()} ETB
            </div>
            <div className="text-sm text-slate-500">Total Amount</div>
          </motion.div>
        </div>

        {/* Today's Activity */}
        <div className="bg-slate-50 dark:bg-dark-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Today's Transactions
            </span>
            <motion.span 
              className="text-lg font-bold text-green-600"
              key={stats.todayTransactions}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {stats.todayTransactions}
            </motion.span>
          </div>
        </div>

        {/* Recent Payments */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Recent Payments
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-900/50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {payment.phoneNumber}
                        </div>
                        <div className="text-xs text-slate-500">
                          {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                        {payment.mpesaReceiptNumber && (
                          <div className="text-xs text-green-600 font-mono">
                            {payment.mpesaReceiptNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {payment.amount.toLocaleString()} ETB
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {stats.recentPayments.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No recent payments
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};