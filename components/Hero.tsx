import React from 'react';
import { Button } from './ui/Button';
import { ChevronRight, Play, Zap } from 'lucide-react';

interface HeroProps {
    onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300 mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase">Now Live in Beta</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 animate-fade-in-up animation-delay-200 leading-tight">
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 animate-shimmer">
             Ethiopian Business
          </span>
        </h1>

        <p className="mt-4 max-w-3xl mx-auto text-xl text-slate-600 dark:text-slate-300 mb-10 animate-fade-in-up animation-delay-500 leading-relaxed">
          Meet <strong className="text-brand-600 dark:text-brand-400">muktiAp</strong> — a modern, AI-powered ERP specifically designed for Ethiopian businesses. 
          <span className="block mt-2 text-lg text-slate-500 dark:text-slate-400">Chapa integrated • Multi-lingual • Powered by Gemini AI</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-700">
          <Button size="lg" className="w-full sm:w-auto group hover:shadow-glow" onClick={onGetStarted}>
            <Zap className="w-4 h-4 mr-2 fill-current group-hover:animate-bounce-slow" />
            Join the Revolution
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto group" onClick={scrollToFeatures}>
            <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            See How It Works
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
           {/* Tech stack badges */}
           <div className="text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>REACT
           </div>
           <div className="text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"></div>PRISMA
           </div>
           <div className="text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-slow"></div>GEMINI AI
           </div>
           <div className="text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-slow"></div>CHAPA
           </div>
        </div>
      </div>
      
      {/* Enhanced Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-200/30 dark:bg-brand-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-400/20 dark:bg-accent-500/10 rounded-full blur-[140px] animate-pulse-slow animation-delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-[100px] animate-pulse-slow animation-delay-300" />
      </div>
    </div>
  );
};