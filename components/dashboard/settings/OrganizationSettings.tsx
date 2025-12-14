import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface OrganizationData {
  companyName: string;
  tinNumber: string;
  businessType: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  vatRate: number;
  withholdingTax: number;
}

export const OrganizationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationData>({
    companyName: '',
    tinNumber: '',
    businessType: 'Private Limited Company',
    industry: 'Agriculture & Food',
    address: '',
    phone: '',
    email: '',
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    vatRate: 15,
    withholdingTax: 2
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const data = await api.settings.getOrganization();
      if (data) setOrgData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.settings.updateOrganization(orgData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save organization:', error);
      alert('Failed to save organization settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-brand-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Settings</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your company information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
              <input type="text" value={orgData.companyName} disabled className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-900 dark:text-white outline-none cursor-not-allowed" />
              <p className="text-xs text-slate-500 mt-1">Company name is set during registration</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">TIN Number</label>
              <input type="text" value={orgData.tinNumber} onChange={(e) => setOrgData({...orgData, tinNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Type</label>
              <select value={orgData.businessType} onChange={(e) => setOrgData({...orgData, businessType: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500">
                <option>Private Limited Company</option>
                <option>Share Company</option>
                <option>Sole Proprietorship</option>
                <option>Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry</label>
              <select value={orgData.industry} onChange={(e) => setOrgData({...orgData, industry: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500">
                <option>Agriculture & Food</option>
                <option>Manufacturing</option>
                <option>Retail & Wholesale</option>
                <option>Technology</option>
                <option>Services</option>
                <option>Construction</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
              <input type="text" value={orgData.address} onChange={(e) => setOrgData({...orgData, address: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
              <input type="tel" value={orgData.phone} onChange={(e) => setOrgData({...orgData, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input type="email" value={orgData.email} onChange={(e) => setOrgData({...orgData, email: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Regional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
              <select value={orgData.currency} onChange={(e) => setOrgData({...orgData, currency: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500">
                <option value="ETB">ETB - Ethiopian Birr</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
              <select value={orgData.timezone} onChange={(e) => setOrgData({...orgData, timezone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500">
                <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Format</label>
              <select value={orgData.dateFormat} onChange={(e) => setOrgData({...orgData, dateFormat: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tax Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">VAT Rate (%)</label>
              <input type="number" value={orgData.vatRate} onChange={(e) => setOrgData({...orgData, vatRate: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Withholding Tax (%)</label>
              <input type="number" value={orgData.withholdingTax} onChange={(e) => setOrgData({...orgData, withholdingTax: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {saveSuccess && <div className="flex items-center gap-2 text-green-600 mr-auto"><CheckCircle size={18} /><span className="text-sm font-medium">Saved!</span></div>}
          <Button variant="outline" onClick={loadOrganization}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </div>
    </div>
  );
};
