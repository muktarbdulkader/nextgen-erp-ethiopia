import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Building2, Users, Bell, Plug, BookOpen, CreditCard } from 'lucide-react';
import { OrganizationSettings } from './settings/OrganizationSettings';
import { UsersSettings } from './settings/UsersSettings';
import { NotificationsSettings } from './settings/NotificationsSettings';
import { IntegrationsSettings } from './settings/IntegrationsSettings';
import { KnowledgeSettings } from './settings/KnowledgeSettings';
import { ModulesSettings } from './settings/ModulesSettings';
import { BillingPage } from './BillingPage';

type TabType = 'modules' | 'organization' | 'users' | 'notifications' | 'integrations' | 'knowledge' | 'billing';

interface SettingsPageProps {
  onModulesUpdated?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onModulesUpdated }) => {
  const [activeTab, setActiveTab] = useState<TabType>('modules');

  const tabs = [
    { id: 'modules' as TabType, label: 'Modules', icon: Database },
    { id: 'organization' as TabType, label: 'Organization', icon: Building2 },
    { id: 'users' as TabType, label: 'Users & Permissions', icon: Users },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'integrations' as TabType, label: 'Integrations', icon: Plug },
    { id: 'knowledge' as TabType, label: 'Knowledge Base', icon: BookOpen },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-brand-600" size={32} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Manage your organization settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {activeTab === 'modules' && <ModulesSettings onModulesUpdated={onModulesUpdated} />}
        {activeTab === 'organization' && <OrganizationSettings />}
        {activeTab === 'users' && <UsersSettings />}
        {activeTab === 'notifications' && <NotificationsSettings />}
        {activeTab === 'integrations' && <IntegrationsSettings />}
        {activeTab === 'knowledge' && <KnowledgeSettings />}
        {activeTab === 'billing' && <BillingPage />}
      </div>
    </div>
  );
};
