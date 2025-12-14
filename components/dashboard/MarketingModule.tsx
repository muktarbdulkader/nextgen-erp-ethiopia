import React, { useState, useEffect } from 'react';
import { Mail, TrendingUp, Send, BarChart3, Target, Plus, Play, Pause } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface MarketingModuleProps {
  language: LanguageCode;
}

export const MarketingModule: React.FC<MarketingModuleProps> = ({ language }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'Email',
    scheduledDate: ''
  });

  useEffect(() => {
    loadCampaigns();
    loadStats();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.marketing.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.marketing.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.marketing.createCampaign(newCampaign);
      setShowAddModal(false);
      setNewCampaign({ name: '', type: 'Email', scheduledDate: '' });
      loadCampaigns();
      loadStats();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.marketing.updateCampaign(id, { status });
      loadCampaigns();
      loadStats();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Completed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mail className="text-brand-600" size={32} />
            Marketing Automation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Email campaigns and lead nurturing
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Campaigns</span>
            <Target size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalCampaigns || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Emails Sent</span>
            <Send size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalSent?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Open Rate</span>
            <BarChart3 size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.openRate || 0}%</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Conversions</span>
            <TrendingUp size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalConversions || 0}</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Opened</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Conversions</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No campaigns yet. Click "New Campaign" to create one.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{campaign.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{campaign.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{campaign.sent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{campaign.opened.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{campaign.conversions}</td>
                    <td className="px-6 py-4 text-right">
                      {campaign.status === 'Draft' && (
                        <Button size="sm" onClick={() => handleStatusChange(campaign.id, 'Active')}>
                          <Play size={14} className="mr-1" />
                          Launch
                        </Button>
                      )}
                      {campaign.status === 'Active' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(campaign.id, 'Completed')}>
                          <Pause size={14} className="mr-1" />
                          Stop
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

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Campaign</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Campaign Type *</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  <option value="Email">Email Campaign</option>
                  <option value="SMS">SMS Campaign</option>
                  <option value="Social">Social Media</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Schedule Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduledDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Create Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
