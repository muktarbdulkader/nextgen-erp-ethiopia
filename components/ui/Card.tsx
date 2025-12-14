import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
  hover?: 'none' | 'lift' | 'scale' | 'glow' | 'border';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = 'lift',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 shadow-sm',
    elevated: 'bg-white dark:bg-dark-800 shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50',
    outlined: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
    gradient: 'bg-gradient-to-br from-white to-slate-50 dark:from-dark-800 dark:to-dark-900 border border-slate-200/50 dark:border-slate-700/50',
    glass: 'bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverEffects = {
    none: {},
    lift: { y: -6, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' },
    scale: { scale: 1.02 },
    glow: { boxShadow: '0 0 40px rgba(102, 126, 234, 0.3)' },
    border: { borderColor: 'rgba(102, 126, 234, 0.5)' }
  };

  return (
    <motion.div
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
      whileHover={hoverEffects[hover]}
      whileTap={hover !== 'none' ? { scale: 0.99 } : {}}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  trend?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend
}) => {
  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    negative: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    neutral: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400'
  };

  return (
    <Card hover="lift" className="relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {value}
            </motion.p>
          </div>
          {icon && (
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        {change && (
          <motion.div 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${changeColors[changeType]}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {changeType === 'positive' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {changeType === 'negative' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {change}
          </motion.div>
        )}

        {/* Mini trend chart */}
        {trend && trend.length > 0 && (
          <div className="mt-4 h-12 flex items-end gap-1">
            {trend.map((value, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient = 'from-brand-500 to-purple-500',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card 
        hover="lift" 
        className="h-full group cursor-pointer relative overflow-hidden"
      >
        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <div className="relative">
          <motion.div 
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:shadow-xl transition-shadow`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-600 group-hover:to-purple-600 transition-all duration-300">
            {title}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Corner decoration */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
      </Card>
    </motion.div>
  );
};
