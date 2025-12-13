import React from 'react';
import { LayoutDashboard, Wallet, Package, Users, ShoppingCart, Settings, LogOut, BookOpen, CheckSquare, X, Sparkles } from 'lucide-react';
import { ModuleType, LanguageCode } from '../../types';
import { translations } from '../../utils/translations';

interface SidebarProps {
  currentModule: ModuleType;
  setModule: (m: ModuleType) => void;
  onLogout: () => void;
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, setModule, onLogout, language, isOpen, onClose }) => {
  const t = translations[language];

  const menuItems = [
    { id: 'overview', label: t.dashboard, icon: LayoutDashboard },
    { id: 'ai-chat', label: 'AI Assistant', icon: Sparkles },
    { id: 'tasks', label: t.tasks, icon: CheckSquare },
    { id: 'finance', label: t.finance, icon: Wallet },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'sales', label: t.sales, icon: ShoppingCart },
    { id: 'hr', label: t.hr, icon: Users },
  ];

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
            <span className="font-bold text-xl tracking-tight">muktiAp</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setModule(item.id as ModuleType);
                  onClose(); // Close on mobile select
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