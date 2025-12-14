import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave'
}) => {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl'
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: '',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1em' : '100%')
  };

  if (animation === 'wave') {
    return (
      <div
        className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 ${variants[variant]} ${className}`}
        style={style}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 ${variants[variant]} ${animations[animation]} ${className}`}
      style={style}
    />
  );
};

// Skeleton Card
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 ${className}`}>
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
    <div className="mt-6 space-y-3">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  </div>
);

// Skeleton Table Row
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

// Skeleton List Item
export const SkeletonListItem: React.FC = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton variant="circular" width={40} height={40} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="70%" height={16} />
      <Skeleton variant="text" width="40%" height={12} />
    </div>
    <Skeleton variant="rounded" width={80} height={32} />
  </div>
);

// Skeleton Stats Grid
export const SkeletonStats: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <Skeleton variant="text" width="40%" height={14} className="mb-3" />
        <Skeleton variant="text" width="60%" height={32} className="mb-4" />
        <Skeleton variant="rounded" width={80} height={24} />
      </div>
    ))}
  </div>
);

// Skeleton Chart
export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
    <div className="flex items-center justify-between mb-6">
      <Skeleton variant="text" width={120} height={20} />
      <Skeleton variant="rounded" width={100} height={32} />
    </div>
    <div className="flex items-end gap-2" style={{ height }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t"
          initial={{ height: 0 }}
          animate={{ height: `${30 + Math.random() * 70}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
        />
      ))}
    </div>
  </div>
);

// Full Page Skeleton
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width={300} height={16} />
      </div>
      <div className="flex gap-3">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={120} height={40} />
      </div>
    </div>

    {/* Stats */}
    <SkeletonStats />

    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonChart />
      </div>
      <div>
        <SkeletonCard />
      </div>
    </div>
  </div>
);
