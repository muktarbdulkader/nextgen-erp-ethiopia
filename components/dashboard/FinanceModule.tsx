import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  Plus, ArrowUpRight, ArrowDownLeft, Building2, 
  CreditCard, PieChart, Landmark, CheckCircle2, Copy, Link as LinkIcon, X, Loader2, Download, Trash2, Edit2
} from 'lucide-react';
import { LanguageCode, Transaction } from '../../types';
import { translations } from '../../utils/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { downloadCSV } from '../../utils/csvHelper';
import { PaymentSuccess } from './PaymentSuccess';

interface FinanceModuleProps {
  language: LanguageCode;
  onRefresh?: () => void;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'bank' | 'mobile' | 'cash';
  accountNumber?: string;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ language, onRefresh }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [showAccountSuccess, setShowAccountSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<{ txRef: string; amount: number; description: string } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // State for Editing Account
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [txData, accData] = await Promise.all([
            api.finance.getTransactions(),
            api.finance.getAccounts()
        ]);
        setTransactions(txData);
        setAccounts(accData);
    } catch (e) {
        console.error("Failed to load finance data", e);
    } finally {
        setIsLoading(false);
    }
  };

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: 'General',
    paymentMethod: 'Bank Transfer',
    status: 'paid',
    account: '' // No default account
  });

  const [accountForm, setAccountForm] = useState<Partial<Account>>({
      type: 'bank',
      balance: 0,
      name: ''
  });

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesStatus && matchesType;
  });

  // Status counts
  const statusCounts = {
    all: transactions.length,
    paid: transactions.filter(t => t.status === 'paid').length,
    pending: transactions.filter(t => t.status === 'pending').length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  const resetForm = () => {
    setNewTransaction({ 
        type: 'expense', 
        date: new Date().toISOString().split('T')[0], 
        category: 'General',
        paymentMethod: 'Bank Transfer',
        status: 'paid'
    });
    setPaymentData(null);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
        alert('Please enter description and amount');
        return;
    }
    
    // Validate amount
    const amount = Number(newTransaction.amount);
    if (amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
    }

    // For expenses, require account selection and validate balance
    if (newTransaction.type === 'expense') {
        if (!newTransaction.account) {
            alert('Please select an account for this expense');
            return;
        }
        
        const selectedAccount = accounts.find(acc => acc.name === newTransaction.account);
        if (!selectedAccount) {
            alert('Selected account not found');
            return;
        }
        
        if (selectedAccount.balance < amount) {
            alert(`Insufficient balance!\n\nRequired: ${formatCurrency(amount)}\nAvailable: ${formatCurrency(selectedAccount.balance)}\nShortfall: ${formatCurrency(amount - selectedAccount.balance)}`);
            return;
        }
    }

    setIsSubmitting(true);

    // Handle Chapa Flow
    if (newTransaction.type === 'income' && newTransaction.paymentMethod === 'Chapa') {
        try {
            const response = await api.payment.initialize({
                amount: newTransaction.amount,
                description: newTransaction.description,
                category: newTransaction.category,
                email: 'client@example.com', // In a real app, you'd capture this
                first_name: 'Client', // Placeholder
                last_name: 'User'
            });

            if (response.data && response.data.checkout_url) {
                setPaymentData({
                    txRef: response.data.tx_ref,
                    amount: newTransaction.amount!,
                    description: newTransaction.description!
                });
                setIsAddModalOpen(false);
                // Refresh transactions to show the new pending one
                const txData = await api.finance.getTransactions();
                setTransactions(txData);
                if (onRefresh) onRefresh(); // Update Dashboard stats
            }
        } catch (e) {
            console.error("Failed to initialize Chapa", e);
            alert("Failed to generate payment link.");
        } finally {
            setIsSubmitting(false);
        }
        return; 
    }
    
    // Normal Flow - Find account ID
    let accountId = null;
    if (newTransaction.type === 'expense' && newTransaction.account) {
        const selectedAccount = accounts.find(acc => acc.name === newTransaction.account);
        accountId = selectedAccount?.id;
    }

    const txData = {
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      type: newTransaction.type as 'income' | 'expense',
      category: newTransaction.category || 'General',
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      accountId: accountId,
      status: 'pending' as const,
      paymentMethod: newTransaction.paymentMethod as any
    };

    try {
        const savedTx = await api.finance.createTransaction(txData);
        setTransactions([savedTx, ...transactions]);
        
        // Refresh accounts to show updated balance
        const accData = await api.finance.getAccounts();
        setAccounts(accData);
        
        setIsAddModalOpen(false);
        resetForm();
        if (onRefresh) onRefresh(); // Update Dashboard stats
    } catch (e: any) {
        alert(e?.message || "Error saving transaction");
    } finally {
        setIsSubmitting(false);
    }
  };

  const openAccountModal = (account?: Account) => {
      if (account) {
          setEditingAccount(account);
          setAccountForm({ ...account });
      } else {
          setEditingAccount(null);
          setAccountForm({ type: 'bank', balance: 0, name: '', accountNumber: '' });
      }
      setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async () => {
      if (!accountForm.name) return;
      
      try {
          if (editingAccount) {
              // Update
              const updated = await api.finance.updateAccount(editingAccount.id, accountForm);
              setAccounts(accounts.map(acc => acc.id === updated.id ? updated : acc));
          } else {
              // Create
              const created = await api.finance.createAccount(accountForm);
              setAccounts([...accounts, created]);
          }
          
          setIsAccountModalOpen(false);
          setShowAccountSuccess(true);
          setTimeout(() => setShowAccountSuccess(false), 3000);
      } catch (e) {
          console.error("Account save failed", e);
          alert("Failed to save account");
      }
  };

  const handleDeleteAccount = async (id: string) => {
      const account = accounts.find(a => a.id === id);
      if (!window.confirm(`Are you sure you want to delete "${account?.name || 'this account'}"?`)) return;
      try {
          await api.finance.deleteAccount(id);
          setAccounts(accounts.filter(a => a.id !== id));
      } catch (e: any) {
          console.error("Delete failed", e);
          alert(e?.message || "Failed to delete account. It may have transactions linked to it.");
      }
  };

  const handleCloseModal = () => {
      setIsAddModalOpen(false);
      resetForm();
  };

  const handleDownloadReport = () => {
      // Create a clean version of data for export
      const exportData = transactions.map(tx => ({
          Date: new Date(tx.date).toLocaleDateString(),
          Description: tx.description,
          Category: tx.category,
          Type: tx.type,
          Amount: tx.amount,
          Status: tx.status,
          PaymentMethod: tx.paymentMethod
      }));
      downloadCSV(exportData, 'muktiAp_Finance_Report');
  };

  const handleApproveTransaction = async (id: string) => {
      if (!window.confirm("Mark this transaction as paid? This will update the account balance.")) return;
      try {
          const updated = await api.finance.updateTransaction(id, { status: 'paid' });
          setTransactions(transactions.map(tx => tx.id === id ? updated : tx));
          // Refresh accounts to show updated balance
          const accData = await api.finance.getAccounts();
          setAccounts(accData);
          if (onRefresh) onRefresh();
      } catch (e: any) {
          console.error("Approve failed", e);
          alert(e?.message || "Failed to approve transaction");
      }
  };

  const handleDeleteTransaction = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) return;
      try {
          await api.finance.deleteTransaction(id);
          setTransactions(transactions.filter(tx => tx.id !== id));
          // Refresh accounts to show updated balance
          const accData = await api.finance.getAccounts();
          setAccounts(accData);
          if (onRefresh) onRefresh();
      } catch (e: any) {
          console.error("Delete failed", e);
          alert(e?.message || "Failed to delete transaction");
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 relative">
      {/* Payment Success Modal */}
      {paymentData && (
        <PaymentSuccess
          txRef={paymentData.txRef}
          amount={paymentData.amount}
          description={paymentData.description}
          onClose={() => {
            setPaymentData(null);
            resetForm();
          }}
        />
      )}

      {/* Success Toast */}
      {showAccountSuccess && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 size={20} className="text-green-400" />
          <span className="font-medium">{editingAccount ? 'Account updated' : t.accountAddedSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.financeTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your cash flow and accounts.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-dark-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'accounts' ? 'bg-white dark:bg-dark-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
            >
              {t.accounts}
            </button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            <span className={language === 'AM' ? 'ethiopic-text' : ''}>{t.addTransaction}</span>
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl p-6 text-white shadow-lg shadow-brand-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wallet size={24} className="text-white" />
                </div>
                <span className="text-brand-100 text-xs font-semibold uppercase tracking-wider">Total Balance</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{formatCurrency(totalBalance)}</h3>
              <p className="text-brand-100 text-sm flex items-center gap-1">
                <TrendingUp size={14} /> +12% from last month
              </p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ArrowDownLeft size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.income}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalIncome)}</h3>
              <p className="text-green-600 text-sm font-medium">+8.2% vs last period</p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <ArrowUpRight size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.expenses}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalExpense)}</h3>
              <p className="text-red-500 text-sm font-medium">+2.4% vs last period</p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className={`font-bold text-lg ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.transactionHistory}</h3>
                <Button variant="ghost" size="sm" onClick={handleDownloadReport}>
                  <Download className="mr-2 h-4 w-4"/>
                  Download Report
                </Button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Status Filter */}
                <div className="flex bg-slate-100 dark:bg-dark-700 p-1 rounded-lg">
                  {(['all', 'paid', 'pending'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        statusFilter === status
                          ? 'bg-white dark:bg-dark-600 shadow-sm text-brand-600'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status === 'paid' && <CheckCircle2 size={14} className="text-green-500" />}
                      {status === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        statusFilter === status ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-slate-200 dark:bg-dark-600'
                      }`}>
                        {statusCounts[status]}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Type Filter */}
                <div className="flex bg-slate-100 dark:bg-dark-700 p-1 rounded-lg">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        typeFilter === type
                          ? 'bg-white dark:bg-dark-600 shadow-sm text-brand-600'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type === 'income' && <ArrowDownLeft size={14} className="text-green-500" />}
                      {type === 'expense' && <ArrowUpRight size={14} className="text-red-500" />}
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium">{t.description}</th>
                    <th className="px-6 py-3 font-medium">{t.category}</th>
                    <th className="px-6 py-3 font-medium">{t.paymentMethod}</th>
                    <th className="px-6 py-3 font-medium">{t.date}</th>
                    <th className="px-6 py-3 font-medium">{t.status}</th>
                    <th className="px-6 py-3 font-medium text-right">{t.amount}</th>
                    <th className="px-6 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {isLoading ? (
                      <tr><td colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500"/></td></tr>
                  ) : filteredTransactions.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-slate-500">
                        {transactions.length === 0 ? 'No transactions recorded yet.' : `No ${statusFilter !== 'all' ? statusFilter : ''} ${typeFilter !== 'all' ? typeFilter : ''} transactions found.`}
                      </td></tr>
                  ) : filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        {tx.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-dark-700 text-slate-800 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                         {tx.paymentMethod === 'Chapa' && <span className="text-[#1C8D58] font-bold">Chapa</span>}
                         {tx.paymentMethod !== 'Chapa' && tx.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                         }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                           {tx.status === 'paid' ? t.paid : t.pending}
                         </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleApproveTransaction(tx.id)}
                              className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {accounts.map(acc => {
            // Bank brand configurations
            const getBankBranding = (name: string) => {
              const nameLower = name.toLowerCase();
              
              // Ethiopian Banks
              if (nameLower.includes('cbe') || nameLower.includes('commercial bank of ethiopia')) {
                return { bg: 'bg-gradient-to-br from-[#800080] to-[#4B0082]', text: 'text-white', accent: '#800080', logo: '🏛️', bankName: 'Commercial Bank of Ethiopia' };
              }
              if (nameLower.includes('awash')) {
                return { bg: 'bg-gradient-to-br from-[#f7941d] to-[#e67e00]', text: 'text-white', accent: '#f7941d', logo: '🦁', bankName: 'Awash Bank' };
              }
              if (nameLower.includes('dashen')) {
                return { bg: 'bg-gradient-to-br from-[#003366] to-[#001a33]', text: 'text-white', accent: '#003366', logo: '🏔️', bankName: 'Dashen Bank' };
              }
              if (nameLower.includes('abyssinia')) {
                return { bg: 'bg-gradient-to-br from-[#006633] to-[#004422]', text: 'text-white', accent: '#006633', logo: '🌿', bankName: 'Bank of Abyssinia' };
              }
              if (nameLower.includes('wegagen')) {
                return { bg: 'bg-gradient-to-br from-[#0066cc] to-[#004499]', text: 'text-white', accent: '#0066cc', logo: '🌅', bankName: 'Wegagen Bank' };
              }
              if (nameLower.includes('nib')) {
                return { bg: 'bg-gradient-to-br from-[#cc0000] to-[#990000]', text: 'text-white', accent: '#cc0000', logo: '🐝', bankName: 'Nib Bank' };
              }
              if (nameLower.includes('oromia') || nameLower.includes('coop')) {
                return { bg: 'bg-gradient-to-br from-[#009933] to-[#006622]', text: 'text-white', accent: '#009933', logo: '🌾', bankName: 'Cooperative Bank of Oromia' };
              }
              if (nameLower.includes('zemen')) {
                return { bg: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]', text: 'text-white', accent: '#1a1a2e', logo: '⏰', bankName: 'Zemen Bank' };
              }
              if (nameLower.includes('bunna')) {
                return { bg: 'bg-gradient-to-br from-[#8B4513] to-[#654321]', text: 'text-white', accent: '#8B4513', logo: '☕', bankName: 'Bunna Bank' };
              }
              if (nameLower.includes('abay')) {
                return { bg: 'bg-gradient-to-br from-[#0077b6] to-[#005588]', text: 'text-white', accent: '#0077b6', logo: '🌊', bankName: 'Abay Bank' };
              }
              if (nameLower.includes('berhan')) {
                return { bg: 'bg-gradient-to-br from-[#ffd700] to-[#ffb700]', text: 'text-slate-900', accent: '#ffd700', logo: '☀️', bankName: 'Berhan Bank' };
              }
              if (nameLower.includes('enat')) {
                return { bg: 'bg-gradient-to-br from-[#ff69b4] to-[#ff1493]', text: 'text-white', accent: '#ff69b4', logo: '👩', bankName: 'Enat Bank' };
              }
              
              // Mobile Money
              if (nameLower.includes('telebirr')) {
                return { bg: 'bg-gradient-to-br from-[#1ca55d] to-[#0d8a47]', text: 'text-white', accent: '#1ca55d', logo: '📱', bankName: 'Telebirr' };
              }
              if (nameLower.includes('m-pesa') || nameLower.includes('mpesa')) {
                return { bg: 'bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]', text: 'text-white', accent: '#4CAF50', logo: '📲', bankName: 'M-Pesa' };
              }
              if (nameLower.includes('cbe birr')) {
                return { bg: 'bg-gradient-to-br from-[#9932CC] to-[#800080]', text: 'text-white', accent: '#9932CC', logo: '💳', bankName: 'CBE Birr' };
              }
              if (nameLower.includes('amole')) {
                return { bg: 'bg-gradient-to-br from-[#FF6B00] to-[#CC5500]', text: 'text-white', accent: '#FF6B00', logo: '🔶', bankName: 'Amole' };
              }
              if (nameLower.includes('hellocash')) {
                return { bg: 'bg-gradient-to-br from-[#00BCD4] to-[#0097A7]', text: 'text-white', accent: '#00BCD4', logo: '👋', bankName: 'HelloCash' };
              }
              
              // International
              if (nameLower.includes('paypal')) {
                return { bg: 'bg-gradient-to-br from-[#003087] to-[#001f5c]', text: 'text-white', accent: '#003087', logo: '🅿️', bankName: 'PayPal' };
              }
              if (nameLower.includes('stripe')) {
                return { bg: 'bg-gradient-to-br from-[#635BFF] to-[#4B44CC]', text: 'text-white', accent: '#635BFF', logo: '💳', bankName: 'Stripe' };
              }
              if (nameLower.includes('wise') || nameLower.includes('transferwise')) {
                return { bg: 'bg-gradient-to-br from-[#9FE870] to-[#7BC950]', text: 'text-slate-900', accent: '#9FE870', logo: '🌍', bankName: 'Wise' };
              }
              if (nameLower.includes('western union')) {
                return { bg: 'bg-gradient-to-br from-[#FFDD00] to-[#FFB700]', text: 'text-slate-900', accent: '#FFDD00', logo: '🌐', bankName: 'Western Union' };
              }
              if (nameLower.includes('worldremit')) {
                return { bg: 'bg-gradient-to-br from-[#6B2D5B] to-[#4A1F3F]', text: 'text-white', accent: '#6B2D5B', logo: '🌎', bankName: 'WorldRemit' };
              }
              
              // Default
              if (acc.type === 'cash') {
                return { bg: 'bg-gradient-to-br from-slate-600 to-slate-800', text: 'text-white', accent: '#475569', logo: '💵', bankName: 'Cash' };
              }
              return { bg: 'bg-gradient-to-br from-slate-500 to-slate-700', text: 'text-white', accent: '#64748b', logo: '🏦', bankName: 'Bank Account' };
            };
            
            const branding = getBankBranding(acc.name);
            
            return (
              <div key={acc.id} className={`${branding.bg} p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                </div>
                
                {/* Card Chip Design */}
                <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-50 transition-opacity">
                  <div className="w-12 h-10 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                    <div className="w-8 h-6 border-2 border-yellow-600/50 rounded-sm" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                        {branding.logo}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${branding.text}`}>{acc.name}</h3>
                        <p className={`text-sm ${branding.text} opacity-80`}>
                          {acc.type === 'bank' ? '🏛️ Bank Account' : acc.type === 'mobile' ? '📱 Mobile Wallet' : '💵 Cash'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openAccountModal(acc)}
                        className={`p-2 ${branding.text} opacity-70 hover:opacity-100 hover:bg-white/20 rounded-lg transition-all`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAccount(acc.id)}
                        className={`p-2 ${branding.text} opacity-70 hover:opacity-100 hover:bg-red-500/30 rounded-lg transition-all`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <p className={`text-xs ${branding.text} opacity-70 uppercase font-semibold tracking-wider`}>Current Balance</p>
                    <h2 className={`text-4xl font-black ${branding.text} tracking-tight`}>{formatCurrency(acc.balance)}</h2>
                  </div>
                  
                  {acc.accountNumber && (
                    <div className={`pt-4 border-t border-white/20 flex justify-between items-center`}>
                      <span className={`text-sm ${branding.text} opacity-70`}>Account Number</span>
                      <span className={`font-mono font-bold ${branding.text} tracking-[0.2em] text-lg`}>
                        •••• {acc.accountNumber.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          <button 
             onClick={() => openAccountModal()}
             className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all min-h-[200px]"
          >
             <Plus size={40} className="mb-2" />
             <span className={`font-medium ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addAccount}</span>
          </button>
        </div>
      )}

      {/* Account Modal (Add/Edit) */}
      {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">
                      {editingAccount ? 'Edit Account' : t.addAccount}
                  </h2>
                  <div className="space-y-4">
                      <Input 
                          label={t.accountName}
                          placeholder="e.g. Commercial Bank of Ethiopia"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      />
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.accountType}</label>
                          <select 
                              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                              value={accountForm.type}
                              onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as any })}
                          >
                              <option value="bank">Bank Account</option>
                              <option value="mobile">Mobile Wallet (Telebirr/M-Pesa)</option>
                              <option value="cash">Cash / Petty Cash</option>
                          </select>
                      </div>
                      <Input 
                          label={t.initialBalance}
                          type="number"
                          placeholder="0.00"
                          icon={DollarSign}
                          value={accountForm.balance}
                          onChange={(e) => setAccountForm({ ...accountForm, balance: Number(e.target.value) })}
                      />
                      {accountForm.type !== 'cash' && (
                          <Input 
                              label={t.accountNumberOpt}
                              placeholder="1000..."
                              value={accountForm.accountNumber || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                          />
                      )}
                  </div>
                  <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1" onClick={() => setIsAccountModalOpen(false)}>Cancel</Button>
                      <Button className="flex-1" onClick={handleSaveAccount}>
                          {editingAccount ? 'Update Account' : t.saveAccount}
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h2 className={`text-xl font-bold mb-6 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addTransaction}</h2>
                    
                    <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newTransaction.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                        >
                            <ArrowDownLeft size={24} />
                            <span className="font-medium text-sm">{t.income}</span>
                        </button>
                        <button 
                            onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newTransaction.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                        >
                            <ArrowUpRight size={24} />
                            <span className="font-medium text-sm">{t.expenses}</span>
                        </button>
                    </div>

                    <Input 
                        label={t.description}
                        placeholder={newTransaction.type === 'income' ? "Client Name / Invoice Ref" : "e.g. Office Rent"}
                        value={newTransaction.description || ''}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label={t.amount}
                            type="number"
                            placeholder="0.00"
                            icon={DollarSign}
                            value={newTransaction.amount || ''}
                            onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.date}</label>
                            <input 
                            type="date"
                            className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                            value={newTransaction.date}
                            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.category}</label>
                        <select 
                            className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                            value={newTransaction.category}
                            onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                        >
                            <option>Sales</option>
                            <option>Rent</option>
                            <option>Utilities</option>
                            <option>Salary</option>
                            <option>Supplies</option>
                            <option>General</option>
                        </select>
                    </div>

                    {/* Dynamic Account / Payment Method Section */}
                    {newTransaction.type === 'income' ? (
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.paymentMethod}</label>
                             <div className="grid grid-cols-3 gap-2">
                                {['Bank Transfer', 'Cash', 'Chapa'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setNewTransaction({...newTransaction, paymentMethod: method as any})}
                                        className={`py-2 px-1 text-sm rounded-lg border transition-all ${
                                            newTransaction.paymentMethod === method 
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                {t.accounts}
                                {newTransaction.account && (() => {
                                    const selectedAcc = accounts.find(a => a.name === newTransaction.account);
                                    return selectedAcc ? (
                                        <span className={`ml-2 text-xs ${selectedAcc.balance >= (Number(newTransaction.amount) || 0) ? 'text-green-600' : 'text-red-600'}`}>
                                            (Available: {formatCurrency(selectedAcc.balance)})
                                        </span>
                                    ) : null;
                                })()}
                            </label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                                value={newTransaction.account}
                                onChange={(e) => setNewTransaction({...newTransaction, account: e.target.value})}
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.name}>
                                        {acc.name} - {formatCurrency(acc.balance)}
                                    </option>
                                ))}
                            </select>
                            {accounts.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">⚠️ Please create an account first</p>
                            )}
                        </div>
                    )}
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                        {t.cancel}
                      </Button>
                      <Button 
                        className={`flex-1 ${newTransaction.type === 'income' && newTransaction.paymentMethod === 'Chapa' ? 'bg-[#1C8D58] hover:bg-[#157a4a]' : ''}`}
                        onClick={handleAddTransaction}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (newTransaction.type === 'income' && newTransaction.paymentMethod === 'Chapa' ? (
                            <>
                               <CreditCard className="w-4 h-4 mr-2" />
                               {t.generateRequest}
                            </>
                        ) : t.saveTransaction)}
                      </Button>
                    </div>
          </div>
        </div>
      )}
    </div>
  );
};