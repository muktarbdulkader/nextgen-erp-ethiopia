import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, AlertCircle, Download, Calendar, DollarSign, Zap, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ChapaModal } from './ChapaModal';
import { api } from '../../services/api';

interface BillingData {
  currentPlan: string;
  planDetails: any;
  subscription: any;
  availablePlans: any[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  paidDate?: string;
}

export const BillingPage: React.FC = () => {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'history'>('overview');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [overviewRes, invoicesRes] = await Promise.all([
        api.billing.getOverview(),
        api.billing.getInvoices()
      ]);
      setBillingData(overviewRes.data);
      setInvoices(invoicesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (planName: string) => {
    setSelectedPlan(planName);
    setShowUpgradeModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowUpgradeModal(false);
    await fetchBillingData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const currentPlan = billingData?.currentPlan || 'Starter';
  const subscription = billingData?.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your plan and payment methods</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
          <Crown size={18} className="text-brand-600 dark:text-brand-400" />
          <span className="font-semibold text-brand-700 dark:text-brand-300">{currentPlan} Plan</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['overview', 'invoices', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <Card className="p-6 border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-900/10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {currentPlan} Plan
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {subscription?.status === 'active' ? 'Active subscription' : 'No active subscription'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">
                  {billingData?.planDetails?.monthlyPrice || 0}
                  <span className="text-lg text-slate-600 dark:text-slate-400 ml-1">ETB</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">per month</p>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {billingData?.planDetails?.features?.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check size={18} className="text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Subscription Info */}
            {subscription && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg mb-6">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Billing Cycle</p>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">{subscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Next Renewal</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Payment Method</p>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">
                    {subscription.paymentMethod || 'Not set'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {currentPlan !== 'Enterprise' && (
                <Button
                  className="flex-1"
                  onClick={() => handleUpgradeClick(currentPlan === 'Starter' ? 'Growth' : 'Enterprise')}
                >
                  <Zap size={18} className="mr-2" />
                  Upgrade Plan
                </Button>
              )}
              {subscription?.status === 'active' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your subscription?')) {
                      cancelSubscription();
                    }
                  }}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </Card>

          {/* Available Plans */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Available Plans</h3>
            <div className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {billingData?.availablePlans?.map((plan: any) => {
                  const currentMonthlyPrice = billingData?.planDetails?.monthlyPrice || 0;
                  const upgradeCost = plan.monthlyPrice - currentMonthlyPrice;
                  const isCurrentPlan = plan.name === currentPlan;
                  const isUpgrade = plan.monthlyPrice > currentMonthlyPrice;
                  const isDowngrade = plan.monthlyPrice < currentMonthlyPrice;

                  return (
                    <Card
                      key={plan.name}
                      className={`p-6 transition-all flex-shrink-0 w-80 ${
                        isCurrentPlan
                          ? 'border-2 border-brand-600 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-200 dark:ring-brand-800'
                          : 'border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                          {isCurrentPlan && (
                            <span className="px-2 py-1 bg-brand-600 dark:bg-brand-500 text-white text-xs font-bold rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        
                        {/* Pricing */}
                        <div className="mb-3">
                          <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                            {plan.monthlyPrice.toLocaleString()}
                            <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">ETB/mo</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {plan.yearlyPrice.toLocaleString()} ETB/year
                          </p>
                        </div>

                        {/* Upgrade/Downgrade Cost */}
                        {!isCurrentPlan && upgradeCost !== 0 && (
                          <div className={`p-2 rounded-lg text-sm font-semibold ${
                            isUpgrade
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          }`}>
                            {isUpgrade ? '📈 Upgrade' : '📉 Downgrade'}: {isUpgrade ? '+' : ''}{upgradeCost.toLocaleString()} ETB/mo
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {plan.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Check size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button */}
                      {isCurrentPlan ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${
                            isUpgrade
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          onClick={() => handleUpgradeClick(plan.name)}
                        >
                          {plan.monthlyPrice === 0 ? 'Downgrade to Free' : isUpgrade ? 'Upgrade Now' : 'Switch Plan'}
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No invoices yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {invoices.map(invoice => (
                <Card key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <CreditCard size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {invoice.total.toLocaleString()} ETB
                    </p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Download size={18} />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Billing History</h3>
          <Card className="p-6">
            <div className="space-y-4">
              {subscription?.payments?.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">No payment history</p>
              ) : (
                subscription?.payments?.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign size={20} className="text-brand-600 dark:text-brand-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {selectedPlan && (
        <ChapaModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedPlan(null);
          }}
          mode="upgrade"
          companyName={selectedPlan}
          initialAmount={
            selectedPlan === 'Growth' 
              ? (billingCycle === 'yearly' ? 25000 : 2500)
              : selectedPlan === 'Enterprise'
              ? (billingCycle === 'yearly' ? 100000 : 10000)
              : 0
          }
        />
      )}
    </div>
  );
};

async function cancelSubscription() {
  try {
    await api.billing.cancelSubscription();
    window.location.reload();
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    alert('Failed to cancel subscription');
  }
}
