import React, { useState, useEffect } from 'react';
import { Building2, Plus, DollarSign, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface PayrollModuleProps {
  language: LanguageCode;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({ language }) => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    basicSalary: '',
    allowances: '',
    deductions: ''
  });

  useEffect(() => {
    loadPayrolls();
    loadEmployees();
    loadStats();
  }, []);

  const loadPayrolls = async () => {
    try {
      const data = await api.payroll.getAll();
      setPayrolls(data);
    } catch (error) {
      console.error('Failed to load payrolls:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await api.employees.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.payroll.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.payroll.create({
        ...newPayroll,
        basicSalary: parseFloat(newPayroll.basicSalary),
        allowances: parseFloat(newPayroll.allowances) || 0,
        deductions: parseFloat(newPayroll.deductions) || 0
      });
      setShowAddModal(false);
      setNewPayroll({
        employeeId: '',
        month: new Date().toISOString().slice(0, 7),
        basicSalary: '',
        allowances: '',
        deductions: ''
      });
      loadPayrolls();
      loadStats();
    } catch (error) {
      console.error('Failed to process payroll:', error);
      alert('Failed to process payroll');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.payroll.update(id, { status: 'Paid', paymentDate: new Date().toISOString() });
      loadPayrolls();
      loadStats();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Processed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-brand-600" size={32} />
            Payroll Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Salary processing and tax calculations
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Process Payroll
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Payroll</span>
            <DollarSign size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats ? `${stats.totalPayroll.toLocaleString()} ETB` : '...'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Processed</span>
            <CheckCircle size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.processed || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Paid</span>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.paid || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Employees</span>
            <Users size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.count || 0}</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tax</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No payroll records yet. Click "Process Payroll" to add one.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {getEmployeeName(payroll.employeeId)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{payroll.month}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{payroll.basicSalary.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{payroll.tax.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{payroll.netSalary.toLocaleString()} ETB</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payroll.status === 'Processed' && (
                        <Button size="sm" onClick={() => handleMarkPaid(payroll.id)}>
                          Mark as Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payroll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Process Payroll</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Employee *</label>
                <select
                  required
                  value={newPayroll.employeeId}
                  onChange={(e) => setNewPayroll({ ...newPayroll, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Month *</label>
                <input
                  type="month"
                  required
                  value={newPayroll.month}
                  onChange={(e) => setNewPayroll({ ...newPayroll, month: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Basic Salary (ETB) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newPayroll.basicSalary}
                  onChange={(e) => setNewPayroll({ ...newPayroll, basicSalary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allowances (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayroll.allowances}
                  onChange={(e) => setNewPayroll({ ...newPayroll, allowances: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deductions (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayroll.deductions}
                  onChange={(e) => setNewPayroll({ ...newPayroll, deductions: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tax will be calculated automatically based on Ethiopian tax brackets
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Process Payroll</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
