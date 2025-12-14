import React, { useState, useEffect } from 'react';
import { Database, ShoppingCart, Mail, Package, Truck, BarChart3, DollarSign, UserCheck, Building2, Briefcase, Users, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  enabled: boolean;
}

interface ModulesSettingsProps {
  onModulesUpdated?: () => void;
}

const DEFAULT_MODULES: Module[] = [
  { id: 'crm', name: 'Customer Relationship Management', description: 'Manage leads, contacts, and sales pipeline', icon: UserCheck, category: 'SALES & MARKETING', enabled: true },
  { id: 'sales', name: 'Sales Management', description: 'Quotations, orders, and invoicing', icon: ShoppingCart, category: 'SALES & MARKETING', enabled: true },
  { id: 'marketing', name: 'Marketing Automation', description: 'Email campaigns and lead nurturing', icon: Mail, category: 'SALES & MARKETING', enabled: false },
  { id: 'procurement', name: 'Procurement & Purchase', description: 'Supplier management and purchase orders', icon: Truck, category: 'OPERATIONS', enabled: true },
  { id: 'inventory', name: 'Inventory & Warehouse', description: 'Stock management and warehouse operations', icon: Package, category: 'OPERATIONS', enabled: true },
  { id: 'supply-chain', name: 'Supply Chain Management', description: 'End-to-end supply chain visibility', icon: BarChart3, category: 'OPERATIONS', enabled: false },
  { id: 'accounting', name: 'Accounting & Finance', description: 'General ledger, accounts, and reporting', icon: DollarSign, category: 'FINANCE', enabled: true },
  { id: 'expenses', name: 'Expense Management', description: 'Track and approve employee expenses', icon: Briefcase, category: 'FINANCE', enabled: true },
  { id: 'hr', name: 'Human Resources', description: 'Employee records and HR management', icon: Users, category: 'HUMAN RESOURCES', enabled: true },
  { id: 'payroll', name: 'Payroll Management', description: 'Salary processing and tax calculations', icon: Building2, category: 'HUMAN RESOURCES', enabled: false }
];

export const ModulesSettings: React.FC<ModulesSettingsProps> = ({ onModulesUpdated }) => {
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await api.settings.getModuleSettings();
      const enabledModuleIds = settings.enabledModules || [];
      setModules(prev => prev.map(m => ({ ...m, enabled: enabledModuleIds.includes(m.id) })));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, enabled: !m.enabled } : m));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const enabledModuleIds = modules.filter(m => m.enabled).map(m => m.id);
      await api.settings.updateModuleSettings(enabledModuleIds);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onModulesUpdated) onModulesUpdated();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = Array.from(new Set(modules.map(m => m.category)));
  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="text-brand-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Module Management</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Enable or disable modules for your organization</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Enabled Modules</p>
          <p className="text-2xl font-bold text-brand-600">{enabledCount} of {modules.length}</p>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{category}</h3>
          <div className="space-y-3">
            {modules.filter(m => m.category === category).map(module => {
              const Icon = module.icon;
              return (
                <div key={module.id} className={`bg-white dark:bg-dark-800 rounded-xl p-6 border-2 transition-all ${module.enabled ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${module.enabled ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{module.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{module.description}</p>
                    </div>
                    <button onClick={() => toggleModule(module.id)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${module.enabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <span className={`${module.enabled ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mr-auto">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </div>
        )}
        <Button variant="outline" onClick={loadSettings}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
};
