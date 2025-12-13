import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthStatusProps {
  user: any;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ user }) => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setTokenInfo(null);
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        setTokenInfo(null);
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const expired = expiresAt < new Date();

      setTokenInfo({
        userId: payload.userId,
        email: payload.email,
        companyName: payload.companyName,
        expiresAt,
        expired
      });
      setIsExpired(expired);
    } catch (error) {
      console.error('Error parsing token:', error);
      setTokenInfo(null);
    }
  };

  if (!tokenInfo) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Not Authenticated</h4>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            No valid authentication token found. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Session Expired</h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Your session has expired. Please log in again to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Authenticated
        </h4>
        <div className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-0.5">
          <p><strong>Email:</strong> {tokenInfo.email}</p>
          <p><strong>Company:</strong> {tokenInfo.companyName}</p>
          <p><strong>Expires:</strong> {tokenInfo.expiresAt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
