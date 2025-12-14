import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, CreditCard, Calendar, Zap, LayoutGrid, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const features = [
    {
      title: "Chapa Integrated",
      desc: "Seamless local payments. Accept Telebirr, CBE, and cards instantly within your invoices.",
      icon: <CreditCard className="w-7 h-7" />,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
      title: "Ethiopian Calendar",
      desc: "Native support for the Ge'ez calendar system across all financial reports and scheduling.",
      icon: <Calendar className="w-7 h-7" />,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
    },
    {
      title: "Multi-Language",
      desc: "Full interface support for Amharic, Afan Oromo, and English. Switch instantly.",
      icon: <Globe className="w-7 h-7" />,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
    },
    {
      title: "12+ Business Modules",
      desc: "Inventory, HR, CRM, Accounting, Sales, Manufacturing - all in one unified platform.",
      icon: <LayoutGrid className="w-7 h-7" />,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
    },
    {
      title: "Real-time AI",
      desc: "Chat with your data. Ask 'Who is my top customer?' and get an answer instantly.",
      icon: <Zap className="w-7 h-7" />,
      gradient: "from-brand-500 to-violet-500",
      bgGradient: "from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20"
    },
    {
      title: "Bank-Grade Security",
      desc: "Encrypted data, role-based access control, and automated cloud backups.",
      icon: <ShieldCheck className="w-7 h-7" />,
      gradient: "from-slate-600 to-slate-800",
      bgGradient: "from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section ref={sectionRef} id="features" className="py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/50 dark:from-brand-900/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-50/50 dark:from-purple-900/10 to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Floating shapes */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-brand-200/30 dark:bg-brand-500/10 blur-2xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-purple-200/30 dark:bg-purple-500/10 blur-2xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Why muktiAp?</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Built for Ethiopia,{' '}
            <span className="relative">
              <span className="gradient-text">Engineered for the World</span>
            </span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            Stop using rigid international ERPs that don't understand your business context.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="group relative bg-white dark:bg-dark-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700/50 cursor-pointer overflow-hidden"
              whileHover={{ 
                y: -8, 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                borderColor: 'rgba(102, 126, 234, 0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Hover gradient overlay */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Shine effect */}
              <motion.div 
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </motion.div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {feature.desc}
                </p>
                
                {/* Learn more link */}
                <motion.div 
                  className="flex items-center text-brand-600 dark:text-brand-400 font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </motion.div>
              </div>
              
              {/* Corner decoration */}
              <motion.div 
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} blur-2xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.15 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            And many more features designed specifically for Ethiopian businesses
          </p>
          <motion.a 
            href="#pricing" 
            className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold"
            whileHover={{ gap: '12px' }}
            transition={{ duration: 0.2 }}
          >
            View all features
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
