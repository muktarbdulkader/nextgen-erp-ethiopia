import React, { useState, useEffect } from 'react';
import { Plug, DollarSign, Mail, Bell, Database, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface IntegrationData {
  name: string;
  status: string;
  apiKey?: string;
}

const INTEGRATIONS = [
  { name: 'chapa', displayName: 'Chapa', description: 'Accept payments via Telebirr, CBE Birr, and cards. Ethiopian payment solution.', icon: DollarSign, color: 'green' },
  { name: 'google', displayName: 'Google Workspace', description: 'Sync emails, calendar events, and contacts with Google Workspace.', icon: Mail, color: 'blue' },
  { name: 'slack', displayName: 'Slack', description: 'Get notifications and updates directly in your Slack workspace.', icon: Plug, color: 'purple' },
  { name: 'telegram', displayName: 'Telegram', description: 'Receive instant alerts and notifications via Telegram bot.', icon: Bell, color: 'blue' },
  { name: 'quickbooks', displayName: 'QuickBooks', description: 'Sync financial data with QuickBooks for seamless accounting.', icon: Database, color: 'green' },
  { name: 'zapier', displayName: 'Zapier', description: 'Connect with 5000+ apps and automate your workflows.', icon: Plug, color: 'orange' },
];

export const IntegrationsSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await api.settings.getIntegrations();
      setIntegrations(data || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (name: string) => {
    try {
      await api.settings.connectIntegration(name, {});
      loadIntegrations();
    } catch (error) {
      console.error('Failed to connect integration:', error);
      alert('Failed to connect integration');
    }
  };

  const handleDisconnect = async (name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    try {
      await api.settings.disconnectIntegration(name);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const getIntegrationStatus = (name: string) => {
    const integration = integrations.find(i => i.name === name);
    return integration?.status === 'connected';
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Plug className="text-brand-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Connect third-party services to your account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          const isConnected = getIntegrationStatus(integration.name);
          return (
            <div key={integration.name} className={`bg-white dark:bg-dark-800 rounded-xl p-6 border-2 ${isConnected ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    integration.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    integration.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    integration.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <Icon size={24} className={
                      integration.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      integration.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      integration.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-orange-600 dark:text-orange-400'
                    } />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{integration.displayName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{integration.name === 'chapa' ? 'Payment Gateway' : 'Integration'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{integration.description}</p>
              {isConnected ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Configure</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDisconnect(integration.name)}>Disconnect</Button>
                </div>
              ) : (
                <Button size="sm" className="w-full" onClick={() => handleConnect(integration.name)}>Connect {integration.displayName}</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
