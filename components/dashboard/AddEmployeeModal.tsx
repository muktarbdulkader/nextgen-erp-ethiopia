import React, { useState, useRef } from 'react';
import { X, UserPlus, Briefcase, Phone, Mail, User, Camera, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LanguageCode, Employee } from '../../types';
import { translations } from '../../utils/translations';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'status'>) => void;
  language: LanguageCode;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave, language }) => {
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    profileImage: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Map 'role' to 'position' for backend compatibility
        const employeeData = {
          ...formData,
          position: formData.role, // Backend expects 'position'
          salary: 0, // Default salary
          hireDate: new Date().toISOString().split('T')[0] // Today's date
        };
        
        // Now calling the parent's handler which uses the API service
        await onSave(employeeData as any);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', role: '', department: '', profileImage: '' });
    } catch (error) {
        console.error("Error saving employee", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, profileImage: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                    <UserPlus size={20} />
                </div>
                <div>
                    <h2 className={`font-bold text-lg text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addEmployee}</h2>
                    <p className="text-xs text-slate-500">Onboard a new team member</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden hover:border-brand-500 transition-colors">
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <Camera size={24} />
                                <span className="text-[10px] mt-1 font-medium">Upload Photo</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-dark-800">
                        <Upload size={14} />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label={t.firstName} 
                    name="firstName"
                    placeholder="Abebe"
                    icon={User}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <Input 
                    label={t.lastName} 
                    name="lastName"
                    placeholder="Bikila"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
            </div>

            <Input 
                label={t.email} 
                name="email"
                type="email"
                placeholder="abebe@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                required
            />

            <Input 
                label={t.phone} 
                name="phone"
                placeholder="+251 9..."
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label={t.role} 
                    name="role"
                    placeholder="Accountant"
                    icon={Briefcase}
                    value={formData.role}
                    onChange={handleChange}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.department}</label>
                    <select 
                        name="department"
                        className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Dept</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    {t.cancel}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Saving...' : t.saveEmployee}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};