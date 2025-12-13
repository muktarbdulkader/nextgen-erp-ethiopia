import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Globe, ChevronDown, Check, LayoutGrid, CreditCard, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { LanguageCode } from '../types';

interface NavbarProps {
  darkMode: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleTheme, onLoginClick, onRegisterClick, language, setLanguage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'EN', label: 'English', native: 'English' },
    { code: 'AM', label: 'Amharic', native: 'አማርኛ' },
    { code: 'OR', label: 'Afan Oromo', native: 'Afaan Oromoo' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
              m
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">muktiAp</span>
          </div>

          {/* Desktop Menu - Icons Only */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Features"
              aria-label="Features"
            >
              <LayoutGrid size={20} />
            </a>
            <a 
              href="#pricing" 
              className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Pricing"
              aria-label="Pricing"
            >
              <CreditCard size={20} />
            </a>
            <a 
              href="#ai-demo" 
              className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group relative"
              title="Mukti AI"
              aria-label="AI"
            >
              <Sparkles size={20} />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
            </a>
            <a 
              href="#about" 
              className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="About"
              aria-label="About"
            >
              <Info size={20} />
            </a>
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 text-sm font-medium"
              >
                <Globe size={18} />
                <span>{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in">
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

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onLoginClick}>Sign In</Button>
                <Button variant="primary" size="sm" onClick={onRegisterClick}>Get Started</Button>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 absolute w-full px-4 pt-2 pb-6 shadow-xl animate-fade-in-up">
          <div className="flex flex-col space-y-4 mt-4">
            <a href="#features" className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <LayoutGrid size={20} /> Features
            </a>
            <a href="#pricing" className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <CreditCard size={20} /> Pricing
            </a>
            <a href="#ai-demo" className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Sparkles size={20} className="text-brand-500" /> AI Assistant
            </a>
            <a href="#about" className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Info size={20} /> About
            </a>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
            <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-300">Language</span>
                <div className="flex gap-2">
                    {languages.map(lang => (
                        <button 
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`px-2 py-1 rounded text-sm ${language === lang.code ? 'bg-brand-100 text-brand-600' : 'text-slate-500'}`}
                        >
                            {lang.code}
                        </button>
                    ))}
                </div>
            </div>
            <Button variant="outline" className="w-full justify-center" onClick={() => { setIsOpen(false); onLoginClick(); }}>Log In</Button>
            <Button className="w-full justify-center" onClick={() => { setIsOpen(false); onRegisterClick(); }}>Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};