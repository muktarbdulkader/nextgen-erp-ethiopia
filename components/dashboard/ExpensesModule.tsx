import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface ExpensesModuleProps {
  language: LanguageCode;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  date: string;
  description?: string;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({ language }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Travel',
    description: ''
  });

  useEffect(() => {
    loadExpenses();
    loadStats();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await api.expenses.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.expenses.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.expenses.create({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      setShowAddModal(false);
      setNewExpense({ title: '', amount: '', category: 'Travel', description: '' });
      loadExpenses();
      loadStats();
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to submit expense');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.expenses.update(id, { status: 'Approved' });
      loadExpenses();
      loadStats();
    } catch (error) {
      console.error('Failed to approve expense:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.expenses.update(id, { status: 'Rejected' });
      loadExpenses();
      loadStats();
    } catch (error) {
      console.error('Failed to reject expense:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="text-brand-600" size={32} />
            Expense Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track and approve employee expenses
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Submit Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</span>
            <DollarSign size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats ? `${stats.totalExpenses.toLocaleString()} ETB` : '...'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pending</span>
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.pending || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Approved</span>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.approved || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Count</span>
            <Briefcase size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.count || 0}</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No expenses yet. Click "Submit Expense" to add one.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{expense.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{expense.category}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{expense.amount.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {expense.status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Submit New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="e.g., Client Meeting Lunch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount (ETB) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  <option>Travel</option>
                  <option>Meals</option>
                  <option>Office Supplies</option>
                  <option>Transportation</option>
                  <option>Accommodation</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Submit Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
