import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'bars' | 'pulse' | 'gradient';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} rounded-full bg-brand-500`}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex items-end gap-1 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`${size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : 'w-2'} bg-brand-500 rounded-full`}
            animate={{
              height: ['40%', '100%', '40%']
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
            style={{ height: '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        />
        <div className="absolute inset-0 rounded-full bg-brand-500" />
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, #667eea, transparent)'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <div className="absolute inset-1 rounded-full bg-white dark:bg-dark-800" />
      </div>
    );
  }

  // Default spinner
  return (
    <motion.div
      className={`${sizes[size]} border-2 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

// Full page loading
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <motion.div
    className="fixed inset-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-brand-500/30 mb-6"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity
      }}
    >
      m
    </motion.div>
    <Spinner size="lg" variant="dots" />
    <motion.p
      className="mt-4 text-slate-500 dark:text-slate-400 font-medium"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {message}
    </motion.p>
  </motion.div>
);

// Inline loading
export const InlineLoader: React.FC<{ text?: string }> = ({ text = 'Loading' }) => (
  <div className="flex items-center gap-2 text-slate-500">
    <Spinner size="sm" />
    <span className="text-sm">{text}</span>
  </div>
);

// Skeleton loader for content
export const ContentLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
  </div>
);
