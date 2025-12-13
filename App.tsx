import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { AIDemo } from './components/AIDemo';
import { Footer } from './components/Footer';
import { Button } from './components/ui/Button';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { PartnerModal } from './components/PartnerModal';
import { User, LanguageCode } from './types';

type ViewState = 'landing' | 'login' | 'register' | 'dashboard';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<LanguageCode>('EN');

  // Initialize theme based on preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-login: Check if user has valid token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token && !currentUser) {
        try {
          // Token exists, try to fetch user data
          const { api } = await import('./services/api');
          const stats = await api.dashboard.getStats();
          // If this succeeds, user is authenticated
          // We can infer user from token
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: payload.userId,
            email: payload.email,
            firstName: payload.email.split('@')[0],
            lastName: '',
            companyName: payload.companyName,
            plan: 'Growth',
            role: 'admin'
          } as User);
          setCurrentView('dashboard');
        } catch (error) {
          // Token invalid or expired, clear it
          localStorage.removeItem('auth_token');
        }
      }
    };
    
    checkAuth();
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setCurrentView('dashboard');
  };

  const handleRegister = (user: User) => {
      setCurrentUser(user);
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentView('landing');
  };

  const handleUpdateUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
  };

  // Router Logic (State-based)
  switch (currentView) {
    case 'dashboard':
      return (
        <DashboardLayout 
          onLogout={handleLogout} 
          user={currentUser} 
          onUpdateUser={handleUpdateUser}
          language={language}
          setLanguage={setLanguage}
        />
      );
    
    case 'login':
      return (
        <LoginPage 
            onLogin={handleLogin} 
            onNavigateToRegister={() => setCurrentView('register')}
            onBack={() => setCurrentView('landing')}
            language={language}
        />
      );

    case 'register':
      return (
        <RegisterPage 
            onRegister={handleRegister} 
            onNavigateToLogin={() => setCurrentView('login')}
            onBack={() => setCurrentView('landing')}
            selectedPlan={selectedPlan}
            language={language}
        />
      );

    default: // Landing Page
      return (
        <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-300 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar 
            darkMode={darkMode} 
            toggleTheme={toggleTheme} 
            onLoginClick={() => setCurrentView('login')}
            onRegisterClick={() => setCurrentView('register')}
            language={language}
            setLanguage={setLanguage}
          />
          
          <main>
            <Hero onGetStarted={() => setCurrentView('register')} />
            
            <Features />

            <Pricing onPlanSelect={(plan) => {
              setSelectedPlan(plan);
              setCurrentView('register');
            }} />

            {/* AI Showcase Section */}
            <section id="ai-demo" className="py-24 bg-slate-100 dark:bg-dark-800/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                  <div className="lg:w-1/2 space-y-8">
                    <div className="inline-block bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Artificial Intelligence
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      Meet Mukti.<br />
                      <span className="text-slate-500 dark:text-slate-400">Your new CFO, Inventory Manager, and Assistant.</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      Forget complicated menus. Just chat with your business. Mukti understands Amharic, Afan Oromo, and English contexts. It can analyze PDFs, draft Chapa invoices, and predict stock shortages before they happen.
                    </p>
                    <ul className="space-y-4">
                      {[
                        "Understand Ethiopian Tax Context",
                        "Analyze PDF Reports Instantly",
                        "Automate Reordering via Email",
                        "Multi-language Natural Conversation"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">✓</div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="mt-4" onClick={() => setCurrentView('login')}>Try the App Demo</Button>
                  </div>
                  
                  <div className="lg:w-1/2 w-full h-[600px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                    <AIDemo />
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden bg-brand-600">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Ready to modernize your Ethiopian business?
                </h2>
                <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto">
                  Join the waiting list today. Whether you are a startup or an established enterprise, muktiAp scales with you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 shadow-xl border-none" onClick={() => setCurrentView('register')}>
                    Start Free Trial
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-white border-white hover:bg-white/10"
                    onClick={() => setIsPartnerModalOpen(true)}
                  >
                    Partner with us
                  </Button>
                </div>
              </div>
            </section>
          </main>

          <Footer onPartnerClick={() => setIsPartnerModalOpen(true)} />
          <PartnerModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
        </div>
      );
  }
}

export default App;