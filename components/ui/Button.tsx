import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glow' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center font-semibold
    rounded-xl transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
    overflow-hidden select-none
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-brand-600 to-brand-500 text-white
      hover:from-brand-500 hover:to-brand-600
      hover:shadow-lg hover:shadow-brand-500/30
      focus:ring-brand-500
      shadow-md shadow-brand-500/20
    `,
    secondary: `
      bg-slate-900 text-white
      hover:bg-slate-800 hover:shadow-lg
      focus:ring-slate-900
      dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200
      shadow-md
    `,
    outline: `
      border-2 border-slate-200 bg-transparent
      hover:bg-slate-50 hover:border-brand-300 hover:text-brand-600
      text-slate-700
      dark:border-slate-700 dark:text-slate-100
      dark:hover:bg-slate-800 dark:hover:border-brand-600 dark:hover:text-brand-400
      focus:ring-brand-500
    `,
    ghost: `
      bg-transparent
      hover:bg-slate-100 hover:text-brand-600
      text-slate-700
      dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-400
      focus:ring-slate-500
    `,
    gradient: `
      bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 text-white
      hover:from-brand-500 hover:via-purple-400 hover:to-pink-400
      hover:shadow-xl hover:shadow-brand-500/40
      focus:ring-brand-500
      shadow-lg shadow-brand-500/30
      bg-[length:200%_100%] hover:bg-right
    `,
    glow: `
      bg-gradient-to-r from-brand-600 to-purple-600 text-white
      hover:shadow-[0_0_30px_rgba(102,126,234,0.5)]
      focus:ring-brand-500
      shadow-lg shadow-brand-500/30
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500 text-white
      hover:from-red-500 hover:to-red-600
      hover:shadow-lg hover:shadow-red-500/30
      focus:ring-red-500
      shadow-md shadow-red-500/20
    `,
  };

  const sizes = {
    sm: "h-9 px-4 text-sm gap-1.5",
    md: "h-11 px-6 text-base gap-2",
    lg: "h-14 px-8 text-lg gap-2.5",
    xl: "h-16 px-10 text-xl gap-3",
  };

  return (
    <motion.button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: disabled || isLoading ? 0 : -2 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Animated shine effect */}
      <motion.span 
        className="absolute inset-0 overflow-hidden rounded-xl"
        initial={false}
      >
        <motion.span 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </motion.span>
      
      {/* Loading spinner */}
      {isLoading && (
        <motion.span 
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.span>
      )}
      
      {/* Content */}
      <motion.span 
        className={`relative z-10 flex items-center justify-center gap-2`}
        animate={{ opacity: isLoading ? 0 : 1 }}
      >
        {leftIcon && (
          <motion.span 
            className="flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            {leftIcon}
          </motion.span>
        )}
        {children}
        {rightIcon && (
          <motion.span 
            className="flex-shrink-0"
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >
            {rightIcon}
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  );
};

// Icon Button Component
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  tooltip,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    outline: 'bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600'
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <motion.button
      className={`inline-flex items-center justify-center rounded-xl transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={tooltip}
      {...props}
    >
      {icon}
    </motion.button>
  );
};

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => (
  <div className={`inline-flex rounded-xl overflow-hidden shadow-sm ${className}`}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement<{ className?: string }>(child)) {
        return React.cloneElement(child, {
          className: `${child.props.className || ''} rounded-none first:rounded-l-xl last:rounded-r-xl border-r border-white/20 last:border-r-0`
        });
      }
      return child;
    })}
  </div>
);
