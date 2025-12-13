import React from 'react';
import { Layers, Database, Cpu, Zap, CreditCard, Code, Globe, MessageSquare } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="bg-brand-600 rounded-2xl p-8 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">muktiAp Documentation</h1>
            <p className="text-brand-100 text-lg">
               A modern, AI-powered ERP system designed specifically for local Ethiopian needs.
            </p>
         </div>
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
         <Layers className="absolute -bottom-6 -right-6 text-white/10 w-48 h-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
               <Zap className="text-brand-500" /> Key Features
            </h2>
            <ul className="space-y-3">
               {[
                 "💳 Chapa payment integration",
                 "📅 Ethiopian Calendar Support",
                 "🌍 Amharic & Afan Oromo Support",
                 "⚡️ Modern UI/UX, dark mode, shortcuts",
                 "📦 12+ essential business modules",
                 "🔌 Real-time updates & deep integrations"
               ].map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <span className="mt-1 w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>
                    {item}
                 </li>
               ))}
            </ul>
         </div>

         <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
               <Cpu className="text-brand-500" /> AI Capabilities
            </h2>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Powered by Gemini API + MCP + LangChain.
             </p>
            <ul className="space-y-3">
               <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0"></span>
                  Understand context and take real actions
               </li>
               <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0"></span>
                  Chat-with-PDF knowledge base included
               </li>
               <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0"></span>
                  Automated insights and reporting
               </li>
            </ul>
         </div>
      </div>

      <div className="bg-slate-50 dark:bg-dark-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
         <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Code className="text-slate-500" /> Tech Stack
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Frontend</h3>
               <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Vite', 'Shadcn', 'TanStack Query', 'i18next'].map(tag => (
                     <span key={tag} className="px-2 py-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {tag}
                     </span>
                  ))}
               </div>
            </div>
             <div>
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Backend</h3>
               <div className="flex flex-wrap gap-2">
                  {['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Better-Auth', 'Socket.io', 'Docker'].map(tag => (
                     <span key={tag} className="px-2 py-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {tag}
                     </span>
                  ))}
               </div>
            </div>
             <div>
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">AI Layer</h3>
               <div className="flex flex-wrap gap-2">
                  {['Gemini API', 'MCP', 'LangChain', 'pgvector'].map(tag => (
                     <span key={tag} className="px-2 py-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {tag}
                     </span>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-xl border border-brand-100 dark:border-brand-900">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-100 dark:bg-brand-900 rounded-full">
               <MessageSquare className="text-brand-600 dark:text-brand-400 w-6 h-6" />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 dark:text-white">Collaborate with Us</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 mb-4">
                  For Ethiopian startups working on ERP solutions: If you want to collaborate, build together, or integrate features — just say "Hi". Let’s create something big for our ecosystem.
               </p>
               <div className="flex gap-3">
                  <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Get in touch &rarr;</a>
                  <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">View Roadmap &rarr;</a>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};