import React from 'react';
import { Mail, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
  onPartnerClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPartnerClick }) => {
  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-xs">m</div>
               <span className="font-bold text-xl text-slate-900 dark:text-white">muktiAp</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Empowering Ethiopian businesses with intelligent, local-first technology. The future of ERP is here.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#features" className="hover:text-brand-500">Features</a></li>
              <li><a href="#pricing" className="hover:text-brand-500">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-500">API</a></li>
              <li><a href="#" className="hover:text-brand-500">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-brand-500">About Us</a></li>
              <li><button onClick={onPartnerClick} className="hover:text-brand-500 text-left">Partner with Us</button></li>
              <li><a href="#" className="hover:text-brand-500">Careers</a></li>
              <li><a href="#" className="hover:text-brand-500">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Mail size={20} /></a>
            </div>
            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-2">Developed in Addis Ababa 🇪🇹</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2024 muktiAp. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};