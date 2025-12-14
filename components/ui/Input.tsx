import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ElementType;
  helperText?: string;
  variant?: 'default' | 'filled' | 'floating';
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon: Icon, 
  helperText,
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  if (variant === 'floating') {
    return (
      <div className="relative">
        <motion.div
          className={`relative border-2 rounded-xl transition-all duration-300 ${
            error 
              ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' 
              : isFocused 
                ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10 shadow-lg shadow-brand-500/10' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800'
          }`}
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Icon && (
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                isFocused ? 'text-brand-500' : 'text-slate-400'
              }`}
              animate={isFocused ? { scale: 1.1 } : { scale: 1 }}
            >
              <Icon size={18} />
            </motion.div>
          )}
          <input
            className={`
              w-full bg-transparent px-4 py-4 pt-6 text-sm outline-none
              text-slate-900 dark:text-white
              ${Icon ? 'pl-12' : ''}
              ${className}
            `}
            placeholder=" "
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          <motion.label
            className={`absolute left-4 pointer-events-none transition-all duration-300 ${
              Icon ? 'left-12' : ''
            } ${
              isFocused || hasValue
                ? 'top-2 text-xs font-semibold'
                : 'top-1/2 -translate-y-1/2 text-sm'
            } ${
              error 
                ? 'text-red-500' 
                : isFocused 
                  ? 'text-brand-600 dark:text-brand-400' 
                  : 'text-slate-400'
            }`}
          >
            {label}
          </motion.label>
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'filled') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <motion.div 
          className="relative"
          whileFocus={{ scale: 1.01 }}
        >
          {Icon && (
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                isFocused ? 'text-brand-500' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
            </motion.div>
          )}
          <input
            className={`
              w-full bg-slate-100 dark:bg-dark-700 border-2 border-transparent rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-300
              placeholder:text-slate-400 text-slate-900 dark:text-white
              focus:bg-white dark:focus:bg-dark-800 focus:border-brand-500 focus:shadow-lg focus:shadow-brand-500/10
              hover:bg-slate-50 dark:hover:bg-dark-600
              ${Icon ? 'pl-12' : ''}
              ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {/* Focus indicator line */}
          <motion.div
            className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
            initial={{ width: 0, x: '-50%' }}
            animate={isFocused ? { width: '100%', x: '-50%' } : { width: 0, x: '-50%' }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <AnimatePresence>
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`text-xs font-medium ${error ? 'text-red-500' : 'text-slate-400'}`}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <motion.div 
        className="relative group"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <motion.div 
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isFocused ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-500'
            }`}
            animate={isFocused ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={18} />
          </motion.div>
        )}
        <input
          className={`
            w-full bg-white dark:bg-dark-800 border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300
            placeholder:text-slate-400 text-slate-900 dark:text-white
            hover:border-slate-300 dark:hover:border-slate-600
            focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/50 dark:bg-red-900/10' 
              : 'border-slate-200 dark:border-slate-700'
            }
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={isFocused ? {
            boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
          } : {
            boxShadow: '0 0 0 0px rgba(102, 126, 234, 0)'
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
      <AnimatePresence>
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className={`text-xs font-medium flex items-center gap-1.5 ${error ? 'text-red-500' : 'text-slate-400'}`}
          >
            {error && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {error || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
