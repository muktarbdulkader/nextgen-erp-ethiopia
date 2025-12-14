import React, { useState, useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User as UserIcon, Building2, Loader2, CheckCircle, Github, Globe, CreditCard, Shield } from 'lucide-react';
import { User, LanguageCode } from '../../types';
import { translations } from '../../utils/translations';
import { api } from '../../services/api';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
  selectedPlan?: string;
  language: LanguageCode;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin, onBack, selectedPlan, language }) => {
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    country: 'Ethiopia',
    plan: selectedPlan || 'Starter',
    role: 'User',
    adminCode: ''
  });

  useEffect(() => {
    if (selectedPlan) {
        setFormData(prev => ({ ...prev, plan: selectedPlan }));
    }
  }, [selectedPlan]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const user = await api.auth.register(formData);
        onRegister(user);
    } catch (err: any) {
        setError(err.message || 'Registration failed.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'Google' | 'GitHub') => {
      // Social login is usually a redirect flow, so we keep simulation for now
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newUser: User = {
          firstName: 'New',
          lastName: 'User',
          email: `user@${provider.toLowerCase()}.com`,
          companyName: 'International Business Ltd',
          plan: formData.plan
      };
      setIsLoading(false);
      onRegister(newUser);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout 
      title={t.createAccount}
      subtitle={t.joinBusiness}
      onBack={onBack}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        )}
        
        {/* Plan Selection Indicator/Dropdown */}
        <div className="space-y-1.5 mb-4">
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Plan
            </label>
           <div className={`relative bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-1 flex items-center`}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-600 dark:text-brand-400">
                  <CreditCard size={18} />
              </div>
              <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none pl-9 pr-3 py-2 text-sm font-semibold text-brand-700 dark:text-brand-300 outline-none focus:ring-0 cursor-pointer appearance-none"
              >
                  <option value="Starter">Starter Plan (Free)</option>
                  <option value="Growth">Growth Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-600 dark:text-brand-400">
                   <CheckCircle size={16} />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input 
                label={t.firstName}
                name="firstName" 
                placeholder="Abebe" 
                icon={UserIcon} 
                required 
                value={formData.firstName}
                onChange={handleChange}
            />
            <Input 
                label={t.lastName}
                name="lastName" 
                placeholder="Bikila" 
                required 
                value={formData.lastName}
                onChange={handleChange}
            />
        </div>
        
        <Input 
            label={t.companyName}
            name="companyName" 
            placeholder="Abyssinia Trading PLC" 
            icon={Building2} 
            required 
            value={formData.companyName}
            onChange={handleChange}
        />

        {/* Country Selector for International Support */}
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.country}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Globe size={18} />
                </div>
                <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:text-white appearance-none"
                >
                    <option value="Ethiopia">Ethiopia 🇪🇹</option>
                    <option value="Kenya">Kenya 🇰🇪</option>
                    <option value="USA">United States 🇺🇸</option>
                    <option value="UK">United Kingdom 🇬🇧</option>
                    <option value="UAE">UAE 🇦🇪</option>
                    <option value="Other">International (Other)</option>
                </select>
            </div>
        </div>

        <Input 
            label={t.email}
            name="email" 
            type="email" 
            placeholder="admin@company.com" 
            icon={Mail} 
            required 
            value={formData.email}
            onChange={handleChange}
        />
        <Input 
            label={t.password}
            name="password" 
            type="password" 
            placeholder="Create a strong password" 
            icon={Lock} 
            required 
            value={formData.password}
            onChange={handleChange}
        />

        {/* Role Selection */}
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Your Role
            </label>
            <div className="grid grid-cols-2 gap-2">
                {[
                    { value: 'Admin', label: 'Admin', desc: 'Full access to all features', icon: '👑', requiresCode: true },
                    { value: 'Manager', label: 'Manager', desc: 'Manage team & reports', icon: '📊', requiresCode: true },
                    { value: 'User', label: 'User', desc: 'Create & edit records', icon: '👤', requiresCode: false },
                    { value: 'Viewer', label: 'Viewer', desc: 'View data only', icon: '👁️', requiresCode: false }
                ].map((role) => (
                    <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.value, adminCode: '' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                            formData.role === role.value
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span>{role.icon}</span>
                            <span className={`font-semibold text-sm ${
                                formData.role === role.value ? 'text-brand-700 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                            }`}>{role.label}</span>
                            {role.requiresCode && <Shield size={12} className="text-amber-500" />}
                        </div>
                        <p className="text-xs text-slate-500">{role.desc}</p>
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
                {formData.role === 'Admin' && '✓ You will have full control over all company data and settings'}
                {formData.role === 'Manager' && '✓ You can manage team, view reports, and approve requests'}
                {formData.role === 'User' && '✓ You can view, create, and edit your own records'}
                {formData.role === 'Viewer' && '✓ You can only view data without making changes'}
            </p>
        </div>

        {/* Admin/Manager - Enter Access Code */}
        {(formData.role === 'Admin' || formData.role === 'Manager') && (
            <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Shield size={16} />
                    {formData.role} Access Code Required
                </label>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    Enter the {formData.role.toLowerCase()} access code to register with this role. Contact your system administrator if you don't have the code.
                </p>
                <Input 
                    name="adminCode" 
                    type="password" 
                    placeholder={`Enter ${formData.role.toLowerCase()} access code`}
                    icon={Lock} 
                    required 
                    value={formData.adminCode}
                    onChange={handleChange}
                />
            </div>
        )}
        
        <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" required />
            <label htmlFor="terms" className="text-sm text-slate-500 dark:text-slate-400">
                {t.agreeTerms}
            </label>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            t.getStarted
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-dark-900 text-slate-500">{t.orSignUp}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => handleSocialRegister('Google')}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             Google
          </button>
          <button 
            type="button" 
            onClick={() => handleSocialRegister('GitHub')}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm"
          >
             <Github size={20} />
             GitHub
          </button>
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
          {t.alreadyAccount}{' '}
          <button onClick={onNavigateToLogin} className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
            {t.signIn}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};