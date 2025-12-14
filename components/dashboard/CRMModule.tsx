import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, Building2, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types';
import { api } from '../../services/api';

interface CRMModuleProps {
  language: LanguageCode;
}

export const CRMModule: React.FC<CRMModuleProps> = ({ language }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'Cold',
    value: '',
    source: '',
    notes: ''
  });

  useEffect(() => {
    loadLeads();
    loadStats();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await api.crm.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.crm.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crm.createLead({
        ...newLead,
        value: newLead.value ? parseFloat(newLead.value) : null
      });
      setShowAddModal(false);
      setNewLead({ name: '', company: '', email: '', phone: '', status: 'Cold', value: '', source: '', notes: '' });
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('Failed to create lead');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.crm.deleteLead(id);
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.crm.updateLead(id, { status });
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Warm': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <UserCheck className="text-brand-600" size={32} />
            Customer Relationship Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage leads, contacts, and sales pipeline
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Leads</span>
            <UserCheck size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalLeads || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Hot Leads</span>
            <DollarSign size={20} className="text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats?.hotLeads || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Conversions</span>
            <UserCheck size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.conversions || 0}</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Pipeline Value</span>
            <DollarSign size={20} className="text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.pipelineValue?.toLocaleString() || 0} ETB
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search leads by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Value</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {searchTerm ? 'No leads found matching your search.' : 'No leads yet. Click "Add New Lead" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={`mailto:${lead.email}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 flex items-center gap-1">
                            <Mail size={12} />
                            {lead.email}
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 flex items-center gap-1">
                              <Phone size={12} />
                              {lead.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.company && (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-white">{lead.company}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        <option value="Cold">Cold</option>
                        <option value="Warm">Warm</option>
                        <option value="Hot">Hot</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {lead.value ? `${lead.value.toLocaleString()} ETB` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add New Lead</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estimated Value (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Add Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
