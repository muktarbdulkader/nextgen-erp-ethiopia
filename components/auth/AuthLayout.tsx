import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  title: string;
  subtitle: string;
}

interface Testimonial {
  initial: string;
  name: string;
  title: string;
  message: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onBack, title, subtitle }) => {
  const [testimonial, setTestimonial] = useState<Testimonial>({
    initial: 'DK',
    name: 'Dawit Kebede',
    title: 'CEO, Horizon Coffee PLC',
    message: 'muktiAp transformed how we manage our coffee exports. The AI insights alone saved us thousands in inventory costs.'
  });

  useEffect(() => {
    // Fetch random testimonial from real users
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/testimonials/random`)
      .then(res => res.json())
      .then(data => setTestimonial(data))
      .catch(err => console.error('Failed to load testimonial:', err));
  }, []);
  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-900">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background */}
        <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-900 to-slate-900 opacity-90 z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Office" 
                className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
            />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
                    m
                </div>
                <span className="font-bold text-2xl tracking-tight">muktiAp</span>
            </div>
            <h2 className="text-4xl font-bold max-w-md leading-tight">
                Empowering Ethiopian Enterprises with Intelligent Automation.
            </h2>
        </div>

        <div className="relative z-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-lg font-medium italic opacity-90 mb-4">"{testimonial.message}"</p>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-900 font-bold">{testimonial.initial}</div>
                    <div>
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm opacity-70">{testimonial.title}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>
            {children}
        </div>
      </div>
    </div>
  );
};