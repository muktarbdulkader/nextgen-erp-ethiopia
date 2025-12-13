import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from './ui/Button';

interface AuthGuardProps {
  children: React.ReactNode;
  onAuthRequired: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, onAuthRequired }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    
    // Check auth every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setTokenInfo(null);
        return;
      }

      // Parse token
      const parts = token.split('.');
      if (parts.length !== 3) {
        setIsAuthenticated(false);
        setTokenInfo(null);
        localStorage.removeItem('auth_token');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = expiresAt < new Date();

      if (isExpired) {
        setIsAuthenticated(false);
        setTokenInfo(null);
        localStorage.removeItem('auth_token');
        return;
      }

      // Check if token has required fields
      if (!payload.userId || !payload.email || !payload.companyName) {
        console.warn('⚠️ Token is missing required fields:', payload);
        setIsAuthenticated(false);
        setTokenInfo(null);
        localStorage.removeItem('auth_token');
        return;
      }

      setIsAuthenticated(true);
      setTokenInfo(payload);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setTokenInfo(null);
      localStorage.removeItem('auth_token');
    }
  };

  // Still checking
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your session has expired or you are not logged in. Please log in to continue.
          </p>

          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={onAuthRequired}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
            
            <button
              onClick={checkAuth}
              className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Again
            </button>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-dark-900 rounded-lg text-left">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              💡 Troubleshooting:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Make sure you're logged in</li>
              <li>• Clear your browser cache</li>
              <li>• Try logging in again</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show children
  return <>{children}</>;
};
