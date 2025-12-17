import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Globe, ChevronDown, User, LogOut, Check, Menu, CreditCard } from 'lucide-react';
import { getEthiopianDateString } from '../../utils/ethiopianDate';
import { User as UserType, LanguageCode, ModuleType } from '../../types';
import { api } from '../../services/api';

interface HeaderProps {
  onSearchClick?: () => void;
  user: UserType | null;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onMenuClick: () => void;
  onLogout: () => void;
  onNavigate: (module: ModuleType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, user, language, setLanguage, onMenuClick, onLogout, onNavigate }) => {
  const ethiopianDate = getEthiopianDateString();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
      try {
          const data = await api.notifications.getAll();
          setNotifications(data);
      } catch (e) {
          console.error("Failed to load notifications");
      }
  };

  useEffect(() => {
    if (user) {
        fetchNotifications();
    }
  }, [user]);

  const handleMarkRead = async () => {
      try {
          await api.notifications.markRead();
          // Optimistic update
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'EN', label: 'English', native: 'English' },
    { code: 'AM', label: 'Amharic', native: 'አማርኛ' },
    { code: 'OR', label: 'Afan Oromo', native: 'Afaan Oromoo' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden mr-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>

      {/* Search Trigger */}
      <div 
        className="flex-1 max-w-lg relative hidden md:block cursor-pointer group"
        onClick={onSearchClick}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-500 transition-colors">
          <Search size={18} />
        </span>
        <div className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-dark-900 border border-transparent group-hover:border-slate-300 dark:group-hover:border-slate-600 rounded-lg text-sm text-slate-500 dark:text-slate-400 transition-all">
          Search invoices, clients, or modules...
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
             <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-300 rounded shadow-sm group-hover:border-slate-400">⌘K</kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        
        {/* Ethiopian Date Widget */}
        <div className="hidden xl:flex flex-col items-end mr-2">
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Ethiopian Calendar</span>
          <span className={`text-sm font-semibold text-slate-700 dark:text-slate-200 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{ethiopianDate}</span>
        </div>

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-sm font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{language}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-700 ${
                        language === lang.code ? 'text-brand-600 font-semibold bg-brand-50 dark:bg-brand-900/10' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                        <span>{lang.label}</span>
                        <span className="text-xs text-slate-400 ethiopic-text">{lang.native}</span>
                    </div>
                    {language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (!showNotifMenu && unreadCount > 0) handleMarkRead();
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-800 animate-pulse"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-sm">Notifications</span>
                  {unreadCount > 0 && <span className="text-xs text-brand-600 font-medium">{unreadCount} new</span>}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs">No notifications yet.</div>
                ) : (
                    notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors ${!notif.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-semibold ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{notif.message}</p>
                    </div>
                    ))
                )}
              </div>
              <div className="p-2 text-center border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-dark-900">
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">View Activity Log</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
             <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm overflow-hidden">
               {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <User size={16} />
               )}
             </div>
             <div className="hidden md:block text-left">
               <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{user ? user.firstName : 'Guest'}</div>
               <div className="text-[10px] text-slate-500 truncate max-w-[80px]">{user ? (user.displayCompanyName || user.companyName) : 'Visitor'}</div>
             </div>
             <ChevronDown size={14} className={`text-slate-400 hidden sm:block transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-dark-900">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'guest@muktiap.com'}</p>
               </div>
               <div className="p-1">
                  <button 
                    onClick={() => {
                        onNavigate('account');
                        setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                     <User size={16} className="text-slate-400" />
                     My Account
                  </button>
                  <button 
                    onClick={() => {
                        onNavigate('billing');
                        setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                     <CreditCard size={16} className="text-slate-400" />
                     Billing & Plans
                  </button>
               </div>
               <div className="p-1 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                     <LogOut size={16} />
                     Sign Out
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};