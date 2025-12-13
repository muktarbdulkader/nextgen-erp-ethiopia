import React, { useState, useRef, useEffect } from 'react';
import { User, LanguageCode } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Camera, Save, User as UserIcon, Building2, Mail, CheckCircle, Upload, CreditCard, Download } from 'lucide-react';
import { translations } from '../../utils/translations';

interface SettingsModuleProps {
    user: User | null;
    onUpdateUser: (user: User) => void;
    language: LanguageCode;
    initialTab?: 'profile' | 'billing';
    onUpgrade?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ user, onUpdateUser, language, initialTab = 'profile', onUpgrade }) => {
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<'profile' | 'billing'>(initialTab);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update active tab when prop changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const [formData, setFormData] = useState<User>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        profileImage: user?.profileImage || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setIsSaved(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result as string });
                setIsSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onUpdateUser(formData);
        setIsLoading(false);
        setIsSaved(true);

        // Hide success message after 3 seconds
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-4xl mx-auto">
             {/* Header */}
            <div>
                <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.settingsTitle}</h1>
                <p className={`text-sm text-slate-500 dark:text-slate-400 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.settingsDesc}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    {t.personalInfo || 'Profile'}
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'billing' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    {t.billing || 'Billing'}
                </button>
            </div>

            {activeTab === 'profile' ? (
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <form onSubmit={handleSave} className="p-6 space-y-8">
                        
                        {/* Profile Picture Section */}
                        <div>
                            <h3 className={`text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}>
                                {t.uploadPhoto}
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={40} />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors"
                                        title={t.uploadPhoto}
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={16} className="mr-2" />
                                        {t.changePhoto}
                                    </Button>
                                    {formData.profileImage && (
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, profileImage: ''})}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                                        >
                                            {t.removePhoto}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <h3 className={`text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 ${language === 'AM' ? 'ethiopic-text' : ''}`}>
                                {t.personalInfo}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label={t.firstName}
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    icon={UserIcon}
                                />
                                <Input 
                                    label={t.lastName}
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    icon={UserIcon}
                                />
                                <Input 
                                    label={t.email}
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={Mail}
                                />
                                <Input 
                                    label={t.companyName}
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    icon={Building2}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                                {isLoading ? 'Saving...' : (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        {t.saveChanges}
                                    </>
                                )}
                            </Button>
                            {isSaved && (
                                <div className="flex items-center text-green-600 animate-fade-in">
                                    <CheckCircle size={18} className="mr-2" />
                                    <span className="text-sm font-medium">{t.savedSuccessfully}</span>
                                </div>
                            )}
                        </div>

                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Billing Content */}
                    
                    {/* Plan Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.currentPlan || 'Current Plan'}</h3>
                                <p className="text-slate-500 text-sm">{user?.plan || 'Starter'} Plan</p>
                             </div>
                             <div className="bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                Active
                             </div>
                        </div>
                        <div className="mt-6">
                             <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {user?.plan === 'Growth' ? '2,500 ETB' : '0 ETB'} 
                                <span className="text-sm font-normal text-slate-500"> / month</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-2">Next billing date: Nov 01, 2024</p>
                        </div>
                        
                        {user?.plan !== 'Growth' && user?.plan !== 'Enterprise' && (
                             <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                                <Button onClick={onUpgrade} className="w-full sm:w-auto">
                                    {t.upgradePlan || 'Upgrade Plan'}
                                </Button>
                             </div>
                        )}
                    </div>

                    {/* Payment Methods */}
                     <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t.paymentMethods || 'Payment Methods'}</h3>
                        <div className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-dark-900/50">
                            <div className="p-2 bg-white dark:bg-dark-800 rounded-lg shadow-sm text-brand-600">
                                <CreditCard size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Telebirr •••• 9876</p>
                                <p className="text-xs text-slate-500">Expires 12/25</p>
                            </div>
                            <span className="text-xs bg-slate-200 dark:bg-dark-700 px-2 py-1 rounded">Default</span>
                        </div>
                         <button className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-3">
                            + Add Payment Method
                         </button>
                     </div>

                    {/* Billing History */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-slate-900 dark:text-white">{t.billingHistory || 'Billing History'}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3">{t.date || 'Date'}</th>
                                        <th className="px-6 py-3">{t.description || 'Description'}</th>
                                        <th className="px-6 py-3">{t.amount || 'Amount'}</th>
                                        <th className="px-6 py-3">{t.status || 'Status'}</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    <tr>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Oct 01, 2024</td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Subscription - Starter</td>
                                        <td className="px-6 py-4 font-medium">0.00 ETB</td>
                                        <td className="px-6 py-4"><span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs">Paid</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-brand-600 hover:underline flex items-center gap-1 justify-end ml-auto">
                                                <Download size={14} /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Sep 01, 2024</td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Subscription - Starter</td>
                                        <td className="px-6 py-4 font-medium">0.00 ETB</td>
                                        <td className="px-6 py-4"><span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs">Paid</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-brand-600 hover:underline flex items-center gap-1 justify-end ml-auto">
                                                <Download size={14} /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};