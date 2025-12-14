import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface NotificationData {
  emailNotifications: {
    newOrders: boolean;
    lowStock: boolean;
    paymentReceived: boolean;
    taskAssignments: boolean;
    weeklyReports: boolean;
  };
  inAppNotifications: {
    desktop: boolean;
    sound: boolean;
    badge: boolean;
  };
}

export const NotificationsSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifData, setNotifData] = useState<NotificationData>({
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      paymentReceived: true,
      taskAssignments: false,
      weeklyReports: true
    },
    inAppNotifications: {
      desktop: true,
      sound: false,
      badge: true
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await api.settings.getNotifications();
      if (data) {
        setNotifData(prev => ({
          emailNotifications: { ...prev.emailNotifications, ...data.emailNotifications },
          inAppNotifications: { ...prev.inAppNotifications, ...data.inAppNotifications }
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.settings.updateNotifications(notifData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save notifications:', error);
      alert('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEmailNotif = (key: keyof NotificationData['emailNotifications']) => {
    setNotifData(prev => ({
      ...prev,
      emailNotifications: { ...prev.emailNotifications, [key]: !prev.emailNotifications[key] }
    }));
  };

  const toggleInAppNotif = (key: keyof NotificationData['inAppNotifications']) => {
    setNotifData(prev => ({
      ...prev,
      inAppNotifications: { ...prev.inAppNotifications, [key]: !prev.inAppNotifications[key] }
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-brand-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Settings</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Configure how you receive notifications</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail size={20} className="text-brand-600" />
            Email Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: 'newOrders' as const, label: 'New Orders', description: 'Get notified when new orders are placed' },
              { key: 'lowStock' as const, label: 'Low Stock Alerts', description: 'Receive alerts when inventory is running low' },
              { key: 'paymentReceived' as const, label: 'Payment Received', description: 'Notification when payments are received' },
              { key: 'taskAssignments' as const, label: 'Task Assignments', description: 'Get notified when tasks are assigned to you' },
              { key: 'weeklyReports' as const, label: 'Weekly Reports', description: 'Receive weekly summary reports' },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{notif.label}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{notif.description}</p>
                </div>
                <button onClick={() => toggleEmailNotif(notif.key)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifData.emailNotifications[notif.key] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`${notifData.emailNotifications[notif.key] ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={20} className="text-brand-600" />
            In-App Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: 'desktop' as const, label: 'Desktop Notifications', description: 'Show browser notifications' },
              { key: 'sound' as const, label: 'Sound Alerts', description: 'Play sound for important notifications' },
              { key: 'badge' as const, label: 'Badge Counter', description: 'Show unread count on app icon' },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{notif.label}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{notif.description}</p>
                </div>
                <button onClick={() => toggleInAppNotif(notif.key)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifData.inAppNotifications[notif.key] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`${notifData.inAppNotifications[notif.key] ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {saveSuccess && <div className="flex items-center gap-2 text-green-600 mr-auto"><CheckCircle size={18} /><span className="text-sm font-medium">Saved!</span></div>}
          <Button variant="outline" onClick={loadNotifications}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </div>
    </div>
  );
};
