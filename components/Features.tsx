import React from 'react';
import { Globe, CreditCard, Calendar, Zap, LayoutGrid, ShieldCheck } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      title: "Chapa Integrated",
      desc: "Seamless local payments. Accept Telebirr, CBE, and cards instantly within your invoices.",
      icon: <CreditCard className="w-6 h-6 text-brand-500" />
    },
    {
      title: "Ethiopian Calendar",
      desc: "Native support for the Ge'ez calendar system across all financial reports and scheduling.",
      icon: <Calendar className="w-6 h-6 text-brand-500" />
    },
    {
      title: "Multi-Language",
      desc: "Full interface support for Amharic, Afan Oromo, and English. Switch instantly.",
      icon: <Globe className="w-6 h-6 text-brand-500" />
    },
    {
      title: "12+ Business Modules",
      desc: "Inventory, HR, CRM, Accounting, Sales, Manufacturing - all in one unified platform.",
      icon: <LayoutGrid className="w-6 h-6 text-brand-500" />
    },
    {
      title: "Real-time AI",
      desc: "Chat with your data. Ask 'Who is my top customer?' and get an answer instantly.",
      icon: <Zap className="w-6 h-6 text-brand-500" />
    },
    {
      title: "Bank-Grade Security",
      desc: "Encrypted data, role-based access control, and automated cloud backups.",
      icon: <ShieldCheck className="w-6 h-6 text-brand-500" />
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-50 dark:from-brand-900/10 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">Why muktiAp?</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for Ethiopia, <br className="hidden sm:block" /> Engineered for the World
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
            Stop using rigid international ERPs that don't understand your business context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-700/50 group cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};