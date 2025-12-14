import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/Button';
import { ChevronRight, Play, Zap, Sparkles, ArrowRight, Star, CheckCircle } from 'lucide-react';

interface HeroProps {
    onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const techStack = [
    { name: 'REACT', color: 'from-blue-400 to-blue-600' },
    { name: 'PRISMA', color: 'from-purple-400 to-purple-600' },
    { name: 'GEMINI AI', color: 'from-brand-400 to-brand-600' },
    { name: 'CHAPA', color: 'from-green-400 to-green-600' },
  ];

  const features = [
    'Chapa Payment Integration',
    'Multi-language Support',
    'AI-Powered Analytics'
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs with parallax */}
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            top: '10%',
            left: '20%',
            y
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            bottom: '10%',
            right: '20%',
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
        <motion.div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[60px]"
          style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%'
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-brand-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        style={{ opacity }}
      >
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Announcement Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/30 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300 mb-8 cursor-default"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.3)' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-brand-500 to-purple-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase">Now Live in Beta</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]"
          >
            The Future of <br />
            <span className="relative inline-block">
              <motion.span 
                className="gradient-text-animated"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                Ethiopian Business
              </motion.span>
              {/* Decorative underline */}
              <motion.svg 
                className="absolute -bottom-2 left-0 w-full h-3 text-brand-500/30" 
                viewBox="0 0 200 8" 
                preserveAspectRatio="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                <motion.path 
                  d="M0 7 Q50 0 100 7 T200 7" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                />
              </motion.svg>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed"
          >
            Meet <strong className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">muktiAp</strong> — a modern, AI-powered ERP specifically designed for Ethiopian businesses.
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-3 flex-wrap mb-10"
          >
            {features.map((feature, i) => (
              <motion.span 
                key={feature}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {feature}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600"
              onClick={onGetStarted}
              leftIcon={<Zap className="w-5 h-5 fill-current" />}
              rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            >
              Join the Revolution
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto group border-2"
              onClick={scrollToFeatures}
              leftIcon={<Play className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 500 }}
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Trusted by 500+ businesses</span>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {techStack.map((tech, i) => (
              <motion.div 
                key={tech.name}
                className="group text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                  boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.2)'
                }}
              >
                <motion.div 
                  className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${tech.color}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                {tech.name}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div 
          className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 cursor-pointer" 
          onClick={scrollToFeatures}
          whileHover={{ color: '#667eea' }}
        >
          <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
          <motion.div 
            className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div 
              className="w-1.5 h-3 bg-current rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
