import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, Crown, Building2, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface PricingProps {
  onPlanSelect: (planName: string, price: string, requiresPayment: boolean) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onPlanSelect }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const plans = [
    {
      name: 'Starter',
      icon: <Sparkles className="w-6 h-6" />,
      price: currency === 'ETB' ? 'Free' : 'Free',
      annualPrice: currency === 'ETB' ? 'Free' : 'Free',
      period: 'forever',
      desc: 'Perfect for small shops and freelancers.',
      gradient: 'from-slate-500 to-slate-600',
      shadowColor: 'shadow-slate-500/20',
      features: [
        'Basic Inventory (up to 50 items)',
        '3 Invoices per month',
        'Standard Reports',
        '1 User Account',
        'Email Support'
      ],
      cta: 'Start for Free',
      popular: false
    },
    {
      name: 'Growth',
      icon: <Crown className="w-6 h-6" />,
      price: currency === 'ETB' ? '2,500 ETB' : '$49 USD',
      annualPrice: currency === 'ETB' ? '25,000 ETB' : '$490 USD',
      period: isAnnual ? '/ year' : '/ month',
      desc: 'For growing businesses needing automation.',
      gradient: 'from-brand-500 to-purple-600',
      shadowColor: 'shadow-brand-500/30',
      features: [
        'Unlimited Inventory',
        'Unlimited Invoices',
        'Chapa & Stripe Integration',
        'AI Assistant (Mukti)',
        '5 User Accounts',
        'Priority Support'
      ],
      cta: 'Start Free Trial',
      popular: true,
      savings: 'Save 17%'
    },
    {
      name: 'Enterprise',
      icon: <Building2 className="w-6 h-6" />,
      price: currency === 'ETB' ? '10,000 ETB' : '$199 USD',
      annualPrice: currency === 'ETB' ? '100,000 ETB' : '$1,990 USD',
      period: isAnnual ? '/ year' : '/ month',
      desc: 'Tailored solutions for large organizations.',
      gradient: 'from-slate-700 to-slate-900',
      shadowColor: 'shadow-slate-900/20',
      features: [
        'Unlimited Everything',
        'Custom AI Model Training',
        'Dedicated Account Manager',
        'On-premise Deployment Option',
        'API Access',
        'SLA Guarantee',
        'Custom Integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
  };

  return (
    <section ref={sectionRef} id="pricing" className="py-28 bg-gradient-to-b from-white via-slate-50 to-white dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-0 w-96 h-96 bg-brand-200/20 dark:bg-brand-500/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
        />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xs font-bold tracking-wide uppercase">Transparent Pricing</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Choose the plan that{' '}
            <span className="gradient-text">fits your scale</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-2">
            No hidden fees. Accepted worldwide.
          </p>
          <p className="text-sm text-slate-400">
            Pay via Telebirr/Chapa (ET) or Credit Card/PayPal (International).
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {/* Currency Toggle */}
          <div className="bg-white dark:bg-dark-800 p-1.5 rounded-xl flex items-center shadow-lg border border-slate-200 dark:border-slate-700">
            {['ETB', 'USD'].map((curr) => (
              <motion.button 
                key={curr}
                onClick={() => setCurrency(curr as 'ETB' | 'USD')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  currency === curr 
                    ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                whileHover={{ scale: currency === curr ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {curr === 'ETB' ? '🇪🇹' : '🇺🇸'} {curr}
              </motion.button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {/* Billing Period Toggle */}
          <div className="flex items-center gap-4">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
            <motion.button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 shadow-lg"
                animate={{ x: isAnnual ? 36 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Yearly
              <motion.span 
                className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full"
                animate={{ scale: isAnnual ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                Save 20%
              </motion.span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {plans.map((plan, index) => (
            <motion.div 
              key={index} 
              variants={cardVariants}
              className="relative group"
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular badge */}
              <AnimatePresence>
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div 
                      className="bg-gradient-to-r from-brand-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg"
                      animate={{ boxShadow: ['0 0 20px rgba(102, 126, 234, 0.3)', '0 0 40px rgba(102, 126, 234, 0.5)', '0 0 20px rgba(102, 126, 234, 0.3)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap size={14} className="fill-current" /> Most Popular
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                className={`relative h-full bg-white dark:bg-dark-800 rounded-3xl p-8 flex flex-col border-2 overflow-hidden ${
                  plan.popular 
                    ? 'border-brand-500 shadow-2xl shadow-brand-500/20' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                whileHover={{ 
                  y: -8, 
                  boxShadow: plan.popular 
                    ? '0 30px 60px -15px rgba(102, 126, 234, 0.3)' 
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  borderColor: plan.popular ? undefined : 'rgba(102, 126, 234, 0.3)'
                }}
                animate={plan.popular ? { scale: 1.02 } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Background gradient on hover */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${plan.gradient}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPlan === index ? 0.03 : 0 }}
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
                
                {/* Header */}
                <div className="relative z-10 mb-8">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${plan.shadowColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {plan.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px]">{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-baseline gap-1">
                    <motion.span 
                      className="text-5xl font-black text-slate-900 dark:text-white"
                      key={`${isAnnual}-${currency}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isAnnual ? plan.annualPrice : plan.price}
                    </motion.span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{plan.period}</span>
                  </div>
                  <AnimatePresence>
                    {isAnnual && plan.savings && (
                      <motion.span 
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Check size={12} /> {plan.savings}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Features */}
                <ul className="relative z-10 space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <motion.div 
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        whileHover={{ scale: 1.2 }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  variant={plan.popular ? 'gradient' : 'outline'} 
                  fullWidth
                  className="relative z-10"
                  onClick={() => onPlanSelect(
                    plan.name, 
                    isAnnual ? plan.annualPrice : plan.price,
                    plan.name !== 'Starter' // Require payment for non-Starter plans
                  )}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-slate-400 mb-4">Trusted payment methods</p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {['Telebirr', 'CBE Birr', 'Visa', 'Mastercard', 'PayPal'].map((method, index) => (
              <motion.div 
                key={method} 
                className="px-4 py-2 bg-white dark:bg-dark-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(102, 126, 234, 0.5)' }}
              >
                {method}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
