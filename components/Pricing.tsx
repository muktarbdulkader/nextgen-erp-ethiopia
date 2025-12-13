import React, { useState } from 'react';
import { Check, Zap, Globe } from 'lucide-react';
import { Button } from './ui/Button';

interface PricingProps {
  onPlanSelect: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onPlanSelect }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');

  const plans = [
    {
      name: 'Starter',
      price: currency === 'ETB' ? 'Free' : 'Free',
      annualPrice: currency === 'ETB' ? 'Free' : 'Free',
      period: 'forever',
      desc: 'Perfect for small shops and freelancers.',
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
      price: currency === 'ETB' ? '2,500 ETB' : '$49 USD',
      annualPrice: currency === 'ETB' ? '25,000 ETB' : '$490 USD',
      period: isAnnual ? '/ year' : '/ month',
      desc: 'For growing businesses needing automation.',
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
      price: 'Custom',
      annualPrice: 'Custom',
      period: '',
      desc: 'Tailored solutions for large organizations.',
      features: [
        'Unlimited Everything',
        'Custom AI Model Training',
        'Dedicated Account Manager',
        'On-premise Deployment Option',
        'API Access',
        'SLA Guarantee'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-dark-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">Transparent Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Choose the plan that fits your scale
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
            No hidden fees. Accepted worldwide.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Pay via Telebirr/Chapa (ET) or Credit Card/PayPal (International).
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12 animate-fade-in-up">
            
            {/* Currency Toggle */}
            <div className="bg-slate-100 dark:bg-dark-800 p-1 rounded-lg flex items-center">
                <button 
                    onClick={() => setCurrency('ETB')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currency === 'ETB' ? 'bg-white dark:bg-dark-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    ETB (🇪🇹)
                </button>
                <button 
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currency === 'USD' ? 'bg-white dark:bg-dark-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    USD (🇺🇸)
                </button>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

            {/* Billing Period Toggle */}
            <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
                <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    <span className={`${isAnnual ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200`} />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    Yearly <span className="text-brand-600 text-xs font-bold ml-1">(Save ~20%)</span>
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white dark:bg-dark-800 rounded-2xl p-8 flex flex-col border transition-all duration-300 ${
                plan.popular 
                  ? 'border-brand-500 shadow-xl shadow-brand-500/10 scale-105 z-10' 
                  : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px]">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {isAnnual ? plan.annualPrice : plan.price}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">{plan.period}</span>
                </div>
                {isAnnual && plan.savings && (
                   <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                     {plan.savings}
                   </span>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={18} className="text-brand-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'} 
                className="w-full"
                onClick={() => onPlanSelect(plan.name)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};