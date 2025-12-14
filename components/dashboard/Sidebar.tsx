import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Package, Users, ShoppingCart, Settings, LogOut, BookOpen, CheckSquare, X, Sparkles, UserCheck, Mail, Truck, BarChart3, DollarSign, Briefcase, Building2, Lock } from 'lucide-react';
import { ModuleType, LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { api } from '../../services/api';

interface SidebarProps {
  currentModule: ModuleType;
  setModule: (m: ModuleType) => void;
  onLogout: () => void;
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
}

// Permission requirements for each module
const MODULE_PERMISSIONS: Record<string, string[]> = {
  'overview': [], // Everyone can see dashboard
  'ai-chat': [], // Everyone can use AI
  'tasks': [], // Everyone can see tasks
  'crm': ['View Data', 'Edit Data', 'Full Access'],
  'sales': ['View Data', 'Create Records', 'Full Access'],
  'marketing': ['View Reports', 'Edit Data', 'Full Access'],
  'procurement': ['Approve Requests', 'Edit Data', 'Full Access'],
  'inventory': ['View Data', 'Create Records', 'Full Access'],
  'supply-chain': ['View Reports', 'Full Access'],
  'finance': ['View Reports', 'Billing', 'Full Access'],
  'expenses': ['Create Records', 'Approve Requests', 'Full Access'],
  'hr': ['Manage Team', 'User Management', 'Full Access'],
  'payroll': ['Billing', 'Full Access'],
  'settings': ['Settings', 'Full Access'],
};

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, setModule, onLogout, language, isOpen, onClose }) => {
  const t = translations[language];
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user permissions
  const userPermissions = api.auth.getCurrentUser()?.permissions || [];
  const userRole = api.auth.getCurrentUser()?.role || 'Viewer';
  const isAdmin = api.auth.isAdmin();
  
  // Check if user has permission for a module
  const hasModulePermission = (moduleId: string): boolean => {
    if (isAdmin) return true; // Admin can access everything
    const requiredPerms = MODULE_PERMISSIONS[moduleId] || [];
    if (requiredPerms.length === 0) return true; // No permission required
    return requiredPerms.some(perm => userPermissions.includes(perm));
  };

  // Load enabled modules from backend
  useEffect(() => {
    loadEnabledModules();
  }, []);

  const loadEnabledModules = async () => {
    try {
      const settings = await api.settings.getModuleSettings();
      setEnabledModules(settings.enabledModules || []);
    } catch (error) {
      console.error('Failed to load module settings:', error);
      // Default modules if loading fails
      setEnabledModules(['crm', 'sales', 'inventory', 'accounting', 'hr']);
    } finally {
      setIsLoading(false);
    }
  };

  // All available modules with their configurations
  const allModules = [
    // Core modules (always visible)
    { id: 'overview', label: t.dashboard, icon: LayoutDashboard, category: 'core' },
    { id: 'ai-chat', label: 'AI Assistant', icon: Sparkles, category: 'core' },
    
    // Sales & Marketing
    { id: 'crm', label: 'CRM', icon: UserCheck, category: 'sales', moduleId: 'crm' },
    { id: 'sales', label: t.sales, icon: ShoppingCart, category: 'sales', moduleId: 'sales' },
    { id: 'marketing', label: 'Marketing', icon: Mail, category: 'sales', moduleId: 'marketing' },
    
    // Operations
    { id: 'procurement', label: 'Procurement', icon: Truck, category: 'operations', moduleId: 'procurement' },
    { id: 'inventory', label: t.inventory, icon: Package, category: 'operations', moduleId: 'inventory' },
    { id: 'supply-chain', label: 'Supply Chain', icon: BarChart3, category: 'operations', moduleId: 'supply-chain' },
    
    // Finance
    { id: 'finance', label: t.finance, icon: Wallet, category: 'finance', moduleId: 'accounting' },
    { id: 'expenses', label: 'Expenses', icon: Briefcase, category: 'finance', moduleId: 'expenses' },
    
    // HR
    { id: 'hr', label: t.hr, icon: Users, category: 'hr', moduleId: 'hr' },
    { id: 'payroll', label: 'Payroll', icon: Building2, category: 'hr', moduleId: 'payroll' },
    
    // Tasks (always visible)
    { id: 'tasks', label: t.tasks, icon: CheckSquare, category: 'core' },
  ];

  // Filter modules based on enabled settings AND user permissions
  const menuItems = allModules.filter(module => {
    // Core modules are always visible (but still check permissions)
    if (module.category === 'core') {
      return hasModulePermission(module.id);
    }
    // Check if module is enabled AND user has permission
    const isEnabled = module.moduleId && enabledModules.includes(module.moduleId);
    const hasPermission = hasModulePermission(module.id);
    return isEnabled && hasPermission;
  });

  // Group modules by category for display
  const groupedModules = {
    core: menuItems.filter(m => m.category === 'core'),
    sales: menuItems.filter(m => m.category === 'sales'),
    operations: menuItems.filter(m => m.category === 'operations'),
    finance: menuItems.filter(m => m.category === 'finance'),
    hr: menuItems.filter(m => m.category === 'hr'),
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
              m
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">muktiAp</span>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block ml-2 ${
                userRole === 'Admin' ? 'bg-amber-500/20 text-amber-400' :
                userRole === 'Manager' ? 'bg-blue-500/20 text-blue-400' :
                userRole === 'User' ? 'bg-green-500/20 text-green-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {userRole}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : (
            <>
              {/* Core Modules */}
              <div className="space-y-2">
                {groupedModules.core.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setModule(item.id as ModuleType);
                        onClose();
                      }}
                      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 translate-x-1' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                      } ${language === 'AM' ? 'ethiopic-text' : ''}`}
                    >
                      <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sales & Marketing */}
              {groupedModules.sales.length > 0 && (
                <div>
                  <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sales & Marketing</div>
                  <div className="space-y-2">
                    {groupedModules.sales.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setModule(item.id as ModuleType);
                            onClose();
                          }}
                          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                            isActive 
                              ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 translate-x-1' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operations */}
              {groupedModules.operations.length > 0 && (
                <div>
                  <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Operations</div>
                  <div className="space-y-2">
                    {groupedModules.operations.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setModule(item.id as ModuleType);
                            onClose();
                          }}
                          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                            isActive 
                              ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 translate-x-1' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finance */}
              {groupedModules.finance.length > 0 && (
                <div>
                  <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Finance</div>
                  <div className="space-y-2">
                    {groupedModules.finance.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setModule(item.id as ModuleType);
                            onClose();
                          }}
                          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                            isActive 
                              ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 translate-x-1' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HR */}
              {groupedModules.hr.length > 0 && (
                <div>
                  <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Human Resources</div>
                  <div className="space-y-2">
                    {groupedModules.hr.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setModule(item.id as ModuleType);
                            onClose();
                          }}
                          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                            isActive 
                              ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 translate-x-1' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.resources}</div>
            <button
                onClick={() => {
                  setModule('docs');
                  onClose();
                }}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                  currentModule === 'docs' 
                    ? 'bg-slate-800 text-white translate-x-1' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
                } ${language === 'AM' ? 'ethiopic-text' : ''}`}
              >
                <BookOpen size={20} className="text-slate-500 group-hover:text-slate-300" />
                <span className="font-medium text-sm">{t.docs}</span>
              </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
              onClick={() => {
                  setModule('settings');
                  onClose();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 hover:translate-x-1 ${
                currentModule === 'settings'
                  ? 'bg-slate-800 text-white translate-x-1'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${language === 'AM' ? 'ethiopic-text' : ''}`}
          >
              <Settings size={20} className={`transition-colors ${currentModule === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="font-medium text-sm">{t.settings}</span>
          </button>
          <button 
              onClick={onLogout}
              className={`group flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl w-full transition-all duration-200 hover:translate-x-1 ${language === 'AM' ? 'ethiopic-text' : ''}`}
          >
              <LogOut size={20} className="group-hover:text-red-300 transition-colors" />
              <span className="font-medium text-sm">{t.signOut}</span>
          </button>
        </div>
      </div>
    </>
  );
};