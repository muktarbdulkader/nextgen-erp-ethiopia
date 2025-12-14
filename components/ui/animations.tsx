import React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

// Animation Variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } }
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// Hover animations
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const hoverLift = {
  y: -4,
  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
  transition: { duration: 0.3 }
};

export const tapScale = {
  scale: 0.98
};

// Animated Components
interface AnimatedDivProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

export const FadeIn: React.FC<AnimatedDivProps> = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInUp: React.FC<AnimatedDivProps> = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={fadeInUp}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInDown: React.FC<AnimatedDivProps> = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeInDown}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn: React.FC<AnimatedDivProps> = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={scaleIn}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer: React.FC<AnimatedDivProps> = ({ children, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    variants={staggerContainer}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<AnimatedDivProps> = ({ children, ...props }) => (
  <motion.div variants={staggerItem} {...props}>
    {children}
  </motion.div>
);

// Interactive Card Component
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'tilt';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  hoverEffect = 'lift',
  className = '',
  ...props 
}) => {
  const hoverEffects = {
    lift: { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' },
    scale: { scale: 1.03 },
    glow: { boxShadow: '0 0 30px rgba(102, 126, 234, 0.4)' },
    tilt: { rotateX: 2, rotateY: -2 }
  };

  return (
    <motion.div
      className={className}
      whileHover={hoverEffects[hoverEffect]}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Floating Animation Component
export const FloatingElement: React.FC<AnimatedDivProps> = ({ children, ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Pulse Animation Component
export const PulseElement: React.FC<AnimatedDivProps> = ({ children, ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Gradient Border Animation
export const GradientBorder: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`relative p-[2px] rounded-2xl overflow-hidden ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500"
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{ backgroundSize: '200% 200%' }}
    />
    <div className="relative bg-white dark:bg-dark-800 rounded-2xl">
      {children}
    </div>
  </div>
);

// Shimmer Effect
export const ShimmerButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, 
  className = '',
  onClick 
}) => (
  <motion.button
    className={`relative overflow-hidden ${className}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      initial={{ x: '-100%' }}
      whileHover={{ x: '100%' }}
      transition={{ duration: 0.6 }}
    />
    {children}
  </motion.button>
);

// Page Transition Wrapper
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Counter Animation
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({ 
  from = 0, 
  to, 
  duration = 2,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(from + (to - from) * easeOutQuart));

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [from, to, duration]);

  return <span className={className}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Typewriter Effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50, className = '' }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};
