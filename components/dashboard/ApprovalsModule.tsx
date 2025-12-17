import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, 
  DollarSign, Receipt, Users, ShoppingCart, 
  Briefcase, FileText, Loader2, Filter,
  ChevronDown, Calendar, Building2
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface ApprovalsModuleProps {
  language: LanguageCode;
  onRefresh?: () => void;
}

interface ApprovalItem {
  id: string;
  type: string;
  module: string;
  title: string;
  amount: number | null;
  status: string;
  date: string;
  details: Record<string, any>;
}

interface Summary {
  total: number;
  byModule: {
    finance: number;
    expenses: number;
    payroll: number;
    sales: number;
    procurement: number;
    hr: number;
    team: number;
  };
}

const moduleConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  Finance: { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  Expenses: { icon: Receipt, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  Payroll: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  Sales: { icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  Procurement: { icon: Briefcase, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  HR: { icon: Calendar, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  Team: { icon: Building2, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
};

export const ApprovalsModule: React.FC<ApprovalsModuleProps> = ({ language, onRefresh }) => {
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(true);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await api.approvals.getPending();
      setApprovals(data.approvals);
      setSummary(data.summary);
    } catch (e) {
      console.error("Failed to load approvals", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    if (!window.confirm(`Approve this ${item.module.toLowerCase()} item?`)) return;
    
    setProcessingId(item.id);
    try {
      await api.approvals.approve(item.id, item.type);
      setApprovals(approvals.filter(a => a.id !== item.id));
      if (summary) {
        const moduleKey = item.module.toLowerCase() as keyof Summary['byModule'];
        setSummary({
          ...summary,
          total: summary.total - 1,
          byModule: {
            ...summary.byModule,
            [moduleKey]: Math.max(0, (summary.byModule[moduleKey] || 0) - 1)
          }
        });
      }
      if (onRefresh) onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    const reason = window.prompt(`Reason for rejecting this ${item.module.toLowerCase()} item (optional):`);
    if (reason === null) return; // User cancelled
    
    setProcessingId(item.id);
    try {
      await api.approvals.reject(item.id, item.type, reason);
      setApprovals(approvals.filter(a => a.id !== item.id));
      if (summary) {
        const moduleKey = item.module.toLowerCase() as keyof Summary['byModule'];
        setSummary({
          ...summary,
          total: summary.total - 1,
          byModule: {
            ...summary.byModule,
            [moduleKey]: Math.max(0, (summary.byModule[moduleKey] || 0) - 1)
          }
        });
      }
      if (onRefresh) onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  const filteredApprovals = moduleFilter === 'all' 
    ? approvals 
    : approvals.filter(a => a.module.toLowerCase() === moduleFilter);

  const modules = ['all', 'finance', 'expenses', 'payroll', 'sales', 'procurement', 'hr', 'team'];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review and approve pending items across all modules
          </p>
        </div>
        <Button variant="outline" onClick={fetchApprovals}>
          <Loader2 size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div 
            onClick={() => setModuleFilter('all')}
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              moduleFilter === 'all' 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
            }`}
          >
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className={`text-xs ${moduleFilter === 'all' ? 'text-brand-100' : 'text-slate-500'}`}>All Pending</div>
          </div>
          
          {Object.entries(summary.byModule).map(([key, count]) => {
            const config = moduleConfig[key.charAt(0).toUpperCase() + key.slice(1)] || moduleConfig.Finance;
            const Icon = config.icon;
            const isActive = moduleFilter === key;
            
            return (
              <div 
                key={key}
                onClick={() => setModuleFilter(key)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                    : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={isActive ? 'text-white' : config.color} />
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <div className={`text-xs capitalize ${isActive ? 'text-brand-100' : 'text-slate-500'}`}>{key}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pending Items
            <span className="text-sm font-normal text-slate-500">({filteredApprovals.length})</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
            <p className="text-slate-500">Loading pending approvals...</p>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">All caught up!</h3>
            <p className="text-slate-500">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredApprovals.map((item) => {
              const config = moduleConfig[item.module] || moduleConfig.Finance;
              const Icon = config.icon;
              const isProcessing = processingId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className="p-4 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={config.color} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                              {item.module}
                            </span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            {item.amount !== null && (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {formatCurrency(item.amount)}
                              </span>
                            )}
                          </div>
                          
                          {/* Details */}
                          {item.details && Object.keys(item.details).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(item.details).map(([key, value]) => (
                                value && (
                                  <span key={key} className="text-xs text-slate-400 bg-slate-100 dark:bg-dark-700 px-2 py-1 rounded">
                                    {key}: {String(value)}
                                  </span>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
