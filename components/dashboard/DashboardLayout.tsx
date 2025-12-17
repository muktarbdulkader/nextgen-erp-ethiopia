import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIDemo } from '../AIDemo';
import { ChapaModal } from './ChapaModal';
import { CommandPalette } from './CommandPalette';
import { Documentation } from './Documentation';
import { TaskModule } from './TaskModule';
import { FinanceModule } from './FinanceModule';
import { SettingsModule } from './SettingsModule';
import { SettingsPage } from './SettingsPage';
import { CRMModule } from './CRMModule';
import { MarketingModule } from './MarketingModule';
import { ProcurementModule } from './ProcurementModule';
import { SupplyChainModule } from './SupplyChainModule';
import { ExpensesModule } from './ExpensesModule';
import { PayrollModule } from './PayrollModule';
import { ApprovalsModule } from './ApprovalsModule';
import { InvoiceModal } from './InvoiceModal';
import { AddEmployeeModal } from './AddEmployeeModal';
import { LowStockModal } from './LowStockModal';
import { AddItemModal } from './AddItemModal';
import { InventoryModule } from './InventoryModule';
import { HRModule } from './HRModule';
import { SalesModule } from './SalesModule';
import { RevenueChart } from './RevenueChart';
import { ContactModal } from './ContactModal';
import { ModuleType, User, LanguageCode, Employee } from '../../types';
import { translations } from '../../utils/translations';
import { ArrowUpRight, TrendingUp, Users, AlertCircle, Wallet, Settings, Sparkles, X, Loader2, CheckCircle, Package, LifeBuoy } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface DashboardLayoutProps {
  onLogout: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout, user, onUpdateUser, language, setLanguage }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [showChapa, setShowChapa] = useState(false);
  const [chapaMode, setChapaMode] = useState<'payment' | 'upgrade'>('payment');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLoadingModule, setIsLoadingModule] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Translations shortcut
  const t = translations[language];

  const fetchDashboardData = async () => {
      try {
          const [empData, statsData] = await Promise.all([
              api.employees.getAll(),
              api.dashboard.getStats()
          ]);
          setEmployees(empData);
          setStats(statsData);
          
          // Fetch pending approvals count
          try {
              const result = await api.approvals.getPending();
              setPendingCount(result?.approvals?.length || 0);
          } catch (e) {
              console.log('Approvals not available');
          }
          
          // Fetch recent transactions
          try {
              const txData = await api.finance.getTransactions();
              setRecentTransactions(txData.slice(0, 5)); // Get latest 5
          } catch (e) {
              console.log('Transactions not available');
          }
      } catch (err) {
          console.error("Failed to fetch dashboard data", err);
      }
  };

  // Fetch Initial Data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshDashboard = () => {
      console.log('🔄 Refreshing dashboard...');
      fetchDashboardData();
      setRefreshKey(prev => prev + 1); // Force re-render of modules
  };

  // Mock Loading on module switch
  const handleSetModule = (module: ModuleType) => {
    if (module === activeModule) return;
    setIsLoadingModule(true);
    // Simulate network delay
    setTimeout(() => {
        setActiveModule(module);
        setIsLoadingModule(false);
    }, 400);
  };

  const handleSaveEmployee = async (newEmployeeData: Omit<Employee, 'id' | 'status'>) => {
    try {
        const savedEmployee = await api.employees.create(newEmployeeData);
        setEmployees(prev => [savedEmployee, ...prev]);
        setShowAddEmployee(false);
        refreshDashboard(); // Update stats (total employees)
    } catch (err) {
        console.error("Failed to save employee", err);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
        await api.employees.delete(employeeId);
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        refreshDashboard(); // Update stats (total employees)
    } catch (err) {
        console.error("Failed to delete employee", err);
        alert("Failed to delete employee. Please try again.");
    }
  };

  const handleLogout = () => {
      api.auth.logout();
      onLogout();
  };

  const handleUpgrade = () => {
      setChapaMode('upgrade');
      setShowChapa(true);
  };

  const handleQuickPay = () => {
      setChapaMode('payment');
      setShowChapa(true);
  };

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      
      // Close Command Palette on Esc
      if (e.key === 'Escape') {
          if (showCommandPalette) setShowCommandPalette(false);
          if (isAiOpen) setIsAiOpen(false);
          if (isSidebarOpen) setIsSidebarOpen(false);
          if (showInvoice) setShowInvoice(false);
          if (showAddEmployee) setShowAddEmployee(false);
          if (showLowStock) setShowLowStock(false);
          if (showAddItem) setShowAddItem(false);
          if (showContact) setShowContact(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, isAiOpen, isSidebarOpen, showInvoice, showAddEmployee, showLowStock, showAddItem, showContact]);

  const handleCommandAction = (action: string) => {
    switch(action) {
      case 'quick-pay':
        handleQuickPay();
        break;
      case 'new-invoice':
        setShowInvoice(true);
        break;
      case 'toggle-ai':
        setIsAiOpen(prev => !prev);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleExportReport = () => {
    // Mock CSV Export
    const data = [
      ['Date', 'Description', 'Amount', 'Type', 'Status'],
      ['2024-10-24', 'Coffee Export', '450000', 'Income', 'Paid'],
      ['2024-10-23', 'Office Rent', '120000', 'Expense', 'Paid'],
      ['2024-10-22', 'Utility Bill', '4500', 'Expense', 'Paid']
    ];
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "muktiAp_Report_2024.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const StatCard = ({ title, value, change, isPositive }: any) => (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-up">
      <h3 className={`text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        <span className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1 rotate-180" />}
          {change}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <Sidebar 
        key={sidebarRefreshKey}
        currentModule={activeModule === 'billing' || activeModule === 'account' ? 'settings' : activeModule} 
        setModule={handleSetModule} 
        onLogout={handleLogout} 
        language={language}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
            onSearchClick={() => setShowCommandPalette(true)} 
            user={user} 
            language={language}
            setLanguage={setLanguage}
            onMenuClick={() => setIsSidebarOpen(true)}
            onLogout={handleLogout}
            onNavigate={(m) => setActiveModule(m)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide relative">
          {/* Success Toast for Export */}
          {showExportSuccess && (
            <div className="absolute top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up">
              <CheckCircle size={20} />
              <span className="font-medium text-sm">{t.exportSuccess}</span>
            </div>
          )}

          {isLoadingModule ? (
              <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
          ) : (
            <>
            {activeModule === 'overview' && (
                <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                    <h1 className={`text-2xl font-bold ${language === 'AM' ? 'ethiopic-text' : ''}`}>
                        {t.welcome}, {user ? user.firstName : 'User'}!
                    </h1>
                    <p className={`text-slate-500 text-sm mt-1 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.overviewDesc}</p>
                    </div>
                    <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setShowAddItem(true)} 
                        className={`hidden md:inline-flex bg-white dark:bg-dark-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-600 border border-slate-200 dark:border-slate-600 shadow-sm ${language === 'AM' ? 'ethiopic-text' : ''}`}
                    >
                        <Package size={16} className="mr-2" />
                        {t.addItem}
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleQuickPay} 
                        className={`bg-white dark:bg-dark-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-600 border border-slate-200 dark:border-slate-600 shadow-sm ${language === 'AM' ? 'ethiopic-text' : ''}`}
                    >
                        <Wallet size={16} className="mr-2" />
                        {t.quickPay || "Quick Pay"}
                    </Button>
                    <Button size="sm" onClick={() => setShowInvoice(true)} className={language === 'AM' ? 'ethiopic-text' : ''}>{t.newInvoice}</Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title={t.totalRevenue} value={stats ? `ETB ${stats.revenue.toLocaleString()}` : "Loading..."} change="+12.5%" isPositive={true} />
                    <StatCard title={t.pendingInvoices} value={stats ? stats.pendingInvoices : "..."} change="Volume" isPositive={false} />
                    <StatCard title={t.activeClients} value={stats ? stats.activeClients : "..."} change="+4" isPositive={true} />
                    <StatCard title={t.inventoryAlerts} value={stats ? `${stats.lowStockCount} Items` : "..."} change="Low Stock" isPositive={false} />
                    
                    {/* Pending Approvals Card */}
                    <div 
                      onClick={() => setActiveModule('approvals')}
                      className={`bg-white dark:bg-dark-800 p-6 rounded-xl border shadow-sm animate-fade-in-up cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                        pendingCount > 0 
                          ? 'border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-dark-800' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</h3>
                        {pendingCount > 0 && (
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <span className={`text-2xl font-bold ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {pendingCount}
                        </span>
                        {pendingCount > 0 && (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle size={14} />
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                </div>

                {/* Revenue Graph Section */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-fade-in-up animation-delay-100">
                    <h3 className="font-bold text-sm mb-4 text-slate-700 dark:text-slate-300">Revenue Trends (Past 6 Months)</h3>
                    <div className="h-48 w-full">
                       <RevenueChart 
                          data={[350000, 420000, 380000, 450000, 510000, stats ? stats.revenue : 550000]} 
                          labels={['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']} 
                       />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up animation-delay-200">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className={`font-bold text-sm ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.recentTx}</h3>
                            <button className={`text-xs text-brand-600 hover:underline ${language === 'AM' ? 'ethiopic-text' : ''}`} onClick={() => setActiveModule('finance')}>{t.viewAll}</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentTransactions.length === 0 ? (
                              <div className="p-8 text-center text-slate-500 text-sm">
                                No transactions yet. Add your first transaction in Finance.
                              </div>
                            ) : (
                              recentTransactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono transition-colors ${
                                          tx.type === 'income' 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                                            : 'bg-slate-100 dark:bg-dark-700 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600'
                                        }`}>
                                            {tx.type === 'income' ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{tx.description}</div>
                                            <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                          {tx.type === 'income' ? '+' : '-'}ETB {tx.amount?.toLocaleString()}
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${language === 'AM' ? 'ethiopic-text' : ''} ${
                                          tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                          {tx.status === 'paid' ? t.paid : t.pending}
                                        </span>
                                    </div>
                                </div>
                              ))
                            )}
                        </div>
                    </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in-up animation-delay-300">
                        <h3 className={`font-bold text-sm mb-4 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.quickActions}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleQuickPay} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-center group">
                                <Wallet className="w-5 h-5 mx-auto mb-2 text-slate-400 group-hover:text-brand-500" />
                                <span className={`text-xs font-medium block ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.acceptPayment}</span>
                            </button>
                            <button onClick={() => setShowAddEmployee(true)} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-center group">
                                <Users className="w-5 h-5 mx-auto mb-2 text-slate-400 group-hover:text-brand-500" />
                                <span className={`text-xs font-medium block ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addEmployee}</span>
                            </button>
                             <button onClick={() => setShowContact(true)} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-center group">
                                <LifeBuoy className="w-5 h-5 mx-auto mb-2 text-slate-400 group-hover:text-brand-500" />
                                <span className={`text-xs font-medium block ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.contactSupport}</span>
                            </button>
                            <button onClick={handleExportReport} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-center group">
                                <ArrowUpRight className="w-5 h-5 mx-auto mb-2 text-slate-400 group-hover:text-brand-500" />
                                <span className={`text-xs font-medium block ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.exportReport}</span>
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            )}

            {activeModule === 'tasks' && <TaskModule key={`tasks-${refreshKey}`} language={language} />}
            {activeModule === 'finance' && <FinanceModule key={`finance-${refreshKey}`} language={language} onRefresh={refreshDashboard} />}
            {activeModule === 'inventory' && <InventoryModule key={`inventory-${refreshKey}`} language={language} onAddItem={() => setShowAddItem(true)} onRefresh={refreshDashboard} />}
            {activeModule === 'hr' && <HRModule key={`hr-${refreshKey}`} language={language} onAddEmployee={() => setShowAddEmployee(true)} />}
            {activeModule === 'sales' && <SalesModule key={`sales-${refreshKey}`} language={language} onRefresh={refreshDashboard} />}
            {activeModule === 'crm' && <CRMModule key={`crm-${refreshKey}`} language={language} />}
            {activeModule === 'marketing' && <MarketingModule key={`marketing-${refreshKey}`} language={language} />}
            {activeModule === 'procurement' && <ProcurementModule key={`procurement-${refreshKey}`} language={language} />}
            {activeModule === 'supply-chain' && <SupplyChainModule key={`supply-chain-${refreshKey}`} language={language} />}
            {activeModule === 'expenses' && <ExpensesModule key={`expenses-${refreshKey}`} language={language} />}
            {activeModule === 'payroll' && <PayrollModule key={`payroll-${refreshKey}`} language={language} />}
            {activeModule === 'approvals' && <ApprovalsModule key={`approvals-${refreshKey}`} language={language} onRefresh={refreshDashboard} />}
            {activeModule === 'settings' && <SettingsPage onModulesUpdated={() => setSidebarRefreshKey(prev => prev + 1)} />}
            {activeModule === 'account' && <SettingsModule user={user} onUpdateUser={onUpdateUser} language={language} initialTab="profile" onUpgrade={handleUpgrade} />}
            {activeModule === 'billing' && <SettingsModule user={user} onUpdateUser={onUpdateUser} language={language} initialTab="billing" onUpgrade={handleUpgrade} />}
            {activeModule === 'docs' && <Documentation />}
            
            {activeModule === 'ai-chat' && (
                <div className="h-[calc(100vh-8rem)] bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in">
                    <AIDemo user={user} />
                </div>
            )}

            {(activeModule !== 'overview' && activeModule !== 'docs' && activeModule !== 'tasks' && activeModule !== 'finance' && activeModule !== 'settings' && activeModule !== 'account' && activeModule !== 'billing' && activeModule !== 'inventory' && activeModule !== 'hr' && activeModule !== 'sales' && activeModule !== 'ai-chat') && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 text-slate-400 animate-pulse-slow">
                    <Settings size={32} />
                </div>
                <h3 className={`text-lg font-bold ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.moduleBuilding}</h3>
                <p className="text-slate-500 max-w-sm mt-2">The {activeModule} module is currently being built. Check back in the next update.</p>
                <Button className={`mt-6 ${language === 'AM' ? 'ethiopic-text' : ''}`} variant="outline" onClick={() => setActiveModule('overview')}>{t.backToDash}</Button>
                </div>
            )}
            </>
          )}
        </main>

        {/* Beautified Floating AI Button (only show if not on AI page) */}
        {activeModule !== 'ai-chat' && (
            <button 
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 hover:scale-110 hover:shadow-brand-500/50 group border-2 border-white/20 dark:border-dark-800/20`}
            title="Toggle Mukti AI"
            >
            {isAiOpen ? (
                <X size={24} className="text-white" />
            ) : (
                <div className="relative">
                    <Sparkles size={28} className="text-white fill-white/20 animate-pulse-slow" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
                    </span>
                </div>
            )}
            </button>
        )}

        {/* Floating AI Chat Window */}
        {isAiOpen && activeModule !== 'ai-chat' && (
          <div className="fixed bottom-28 right-8 w-96 h-[600px] max-h-[70vh] max-w-[calc(100vw-3rem)] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40 flex flex-col animate-fade-in-up origin-bottom-right">
             <AIDemo onClose={() => setIsAiOpen(false)} user={user} />
          </div>
        )}

      </div>
      
      <ChapaModal 
        isOpen={showChapa} 
        onClose={() => setShowChapa(false)} 
        mode={chapaMode}
        companyName={user?.displayCompanyName || user?.companyName || 'Your Company'}
      />
      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} language={language} />
      <AddEmployeeModal 
        isOpen={showAddEmployee} 
        onClose={() => setShowAddEmployee(false)} 
        language={language}
        onSave={handleSaveEmployee}
      />
      <LowStockModal isOpen={showLowStock} onClose={() => setShowLowStock(false)} language={language} />
      <AddItemModal 
        isOpen={showAddItem} 
        onClose={() => setShowAddItem(false)} 
        language={language}
        onSuccess={refreshDashboard}
      />
      
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(module) => setActiveModule(module)}
        onAction={handleCommandAction}
      />
    </div>
  );
};