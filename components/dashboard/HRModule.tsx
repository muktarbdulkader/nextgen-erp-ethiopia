import React, { useState } from 'react';
import { Users, Search, Mail, Phone, MoreVertical, UserPlus, User as UserIcon, Download, Trash2, Edit } from 'lucide-react';
import { LanguageCode, Employee } from '../../types';
import { translations } from '../../utils/translations';
import { Button } from '../ui/Button';
import { downloadCSV } from '../../utils/csvHelper';

interface HRModuleProps {
  language: LanguageCode;
  onAddEmployee?: () => void;
  onDeleteEmployee?: (id: string) => void;
  employees: Employee[];
}

export const HRModule: React.FC<HRModuleProps> = ({ language, onAddEmployee, onDeleteEmployee, employees }) => {
  const t = translations[language];

  const handleDelete = (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      onDeleteEmployee?.(employee.id);
    }
  };

  const handleExport = () => {
      const exportData = employees.map(e => ({
          Name: `${e.firstName} ${e.lastName}`,
          Email: e.email,
          Phone: e.phone,
          Role: e.role,
          Department: e.department,
          Status: e.status
      }));
      downloadCSV(exportData, 'muktiAp_Employees');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.hr}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team and payroll.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={onAddEmployee}>
                <UserPlus size={18} className="mr-2" />
                {t.addEmployee}
            </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-brand-500"
                />
             </div>
             <div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700"
                >
                    <Download size={16} />
                    Export List
                </button>
             </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3 font-medium">{t.employeeName}</th>
                        <th className="px-6 py-3 font-medium">{t.role}</th>
                        <th className="px-6 py-3 font-medium">{t.department}</th>
                        <th className="px-6 py-3 font-medium">Contact</th>
                        <th className="px-6 py-3 font-medium">{t.status}</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                {emp.profileImage ? (
                                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden border border-slate-200 dark:border-slate-700">
                                         <img src={emp.profileImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                                        {emp.firstName.charAt(0)}
                                    </div>
                                )}
                                {emp.firstName} {emp.lastName}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{emp.role}</td>
                            <td className="px-6 py-4 text-slate-500">{emp.department}</td>
                            <td className="px-6 py-4 text-slate-500">
                                <div className="flex gap-2">
                                    <a href={`mailto:${emp.email}`} className="text-slate-400 hover:text-brand-600"><Mail size={16} /></a>
                                    <a href={`tel:${emp.phone}`} className="text-slate-400 hover:text-brand-600"><Phone size={16} /></a>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    emp.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                }`}>
                                    {emp.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleDelete(emp)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete employee"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};