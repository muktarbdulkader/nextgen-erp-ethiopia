import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, Package, Users, ShoppingCart, Settings, LogOut, BookOpen, CheckSquare, X, Sparkles, UserCheck, Mail, Truck, BarChart3, Briefcase, Building2, ClipboardCheck } from 'lucide-react';
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

const MODULE_PERMISSIONS: Record<string, string[]> = {
  'overview': [],
  'ai-chat': [],
  'tasks': [],
  'approvals': ['Approve Requests', 'Full Access'],
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const userPermissions = api.auth.getCurrentUser()?.permissions || [];
  const userRole = api.auth.getCurrentUser()?.role || 'Viewer';
  const isAdmin = api.auth.isAdmin();
  
  const hasModulePermission = (moduleId: string): boolean => {
    if (isAdmin) return true;
    const requiredPerms = MODULE_PERMISSIONS[moduleId] || [];
    if (requiredPerms.length === 0) return true;
    return requiredPerms.some(perm => userPermissions.includes(perm));
  };

  useEffect(() => {
    loadEnabledModules();
  }, []);

  const loadEnabledModules = async () => {
    try {
      const settings = await api.settings.getModuleSettings();
      setEnabledModules(settings.enabledModules || []);
    } catch (error) {
      setEnabledModules(['crm', 'sales', 'inventory', 'accounting', 'hr']);
    } finally {
      setIsLoading(false);
    }
  };

  const allModules = [
    { id: 'overview', label: t.dashboard, icon: LayoutDashboard, category: 'core' },
    { id: 'ai-chat', label: 'AI Assistant', icon: Sparkles, category: 'core' },
    { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, category: 'core' },
    { id: 'crm', label: 'CRM', icon: UserCheck, category: 'sales', moduleId: 'crm' },
    { id: 'sales', label: t.sales, icon: ShoppingCart, category: 'sales', moduleId: 'sales' },
    { id: 'marketing', label: 'Marketing', icon: Mail, category: 'sales', moduleId: 'marketing' },
    { id: 'procurement', label: 'Procurement', icon: Truck, category: 'operations', moduleId: 'procurement' },
    { id: 'inventory', label: t.inventory, icon: Package, category: 'operations', moduleId: 'inventory' },
    { id: 'supply-chain', label: 'Supply Chain', icon: BarChart3, category: 'operations', moduleId: 'supply-chain' },
    { id: 'finance', label: t.finance, icon: Wallet, category: 'finance', moduleId: 'accounting' },
    { id: 'expenses', label: 'Expenses', icon: Briefcase, category: 'finance', moduleId: 'expenses' },
    { id: 'hr', label: t.hr, icon: Users, category: 'hr', moduleId: 'hr' },
    { id: 'payroll', label: 'Payroll', icon: Building2, category: 'hr', moduleId: 'payroll' },
    { id: 'tasks', label: t.tasks, icon: CheckSquare, category: 'core' },
  ];

  const menuItems = allModules.filter(module => {
    if (module.category === 'core') return hasModulePermission(module.id);
    const isEnabled = module.moduleId && enabledModules.includes(module.moduleId);
    return isEnabled && hasModulePermission(module.id);
  });

  const groupedModules = {
    core: menuItems.filter(m => m.category === 'core'),
    sales: menuItems.filter(m => m.category === 'sales'),
    operations: menuItems.filter(m => m.category === 'operations'),
    finance: menuItems.filter(m => m.category === 'finance'),
    hr: menuItems.filter(m => m.category === 'hr'),
  };

  const roleColors: Record<string, string> = {
    Admin: 'bg-amber-500/20 text-amber-400',
    Manager: 'bg-blue-500/20 text-blue-400',
    User: 'bg-green-500/20 text-green-400',
    Viewer: 'bg-slate-500/20 text-slate-400'
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.3 }
    })
  };

  const MenuItem = ({ item, index }: { item: typeof allModules[0]; index: number }) => {
    const Icon = item.icon;
    const isActive = currentModule === item.id;

    return (
      <button
        onClick={() => { setModule(item.id as ModuleType); onClose(); }}
        className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
          isActive 
            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
        } ${language === 'AM' ? 'ethiopic-text' : ''}`}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
        )}

        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
          <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
        </div>
        <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
          {item.label}
        </span>

        {/* AI badge */}
        {item.id === 'ai-chat' && (
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
        )}

        {/* Approvals badge */}
        {item.id === 'approvals' && (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
            !
          </span>
        )}
      </button>
    );
  };

  const CategorySection = ({ title, items }: { title: string; items: typeof allModules }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </div>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <MenuItem key={item.id} item={item} index={idx} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/30"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              m
            </motion.div>
            <div>
              <span className="font-bold text-xl tracking-tight">muktiAp</span>
              <motion.div 
                className={`text-xs px-2 py-0.5 rounded-full inline-block ml-2 ${roleColors[userRole] || roleColors.Viewer}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {userRole}
              </motion.div>
            </div>
          </motion.div>
          <motion.button 
            onClick={onClose} 
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div 
                className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : (
            <>
              <CategorySection title="" items={groupedModules.core} />
              <CategorySection title="Sales & Marketing" items={groupedModules.sales} />
              <CategorySection title="Operations" items={groupedModules.operations} />
              <CategorySection title="Finance" items={groupedModules.finance} />
              <CategorySection title="Human Resources" items={groupedModules.hr} />
            </>
          )}

          {/* Resources */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <motion.div 
              className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t.resources}
            </motion.div>
            <motion.button
              onClick={() => { setModule('docs'); onClose(); }}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentModule === 'docs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              } ${language === 'AM' ? 'ethiopic-text' : ''}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen size={20} className="text-slate-500 group-hover:text-slate-300" />
              <span className="font-medium text-sm">{t.docs}</span>
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <motion.button 
            onClick={() => { setModule('settings'); onClose(); }}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 ${
              currentModule === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            } ${language === 'AM' ? 'ethiopic-text' : ''}`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={20} className={currentModule === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
            <span className="font-medium text-sm">{t.settings}</span>
          </motion.button>
          
          <motion.button 
            onClick={onLogout}
            className={`group flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl w-full transition-all duration-200 ${language === 'AM' ? 'ethiopic-text' : ''}`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} className="group-hover:text-red-300 transition-colors" />
            <span className="font-medium text-sm">{t.signOut}</span>
          </motion.button>
        </div>
      </div>
    </>
  );
};
