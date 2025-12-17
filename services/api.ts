import { User, Employee, Task, Transaction, TaskStatus } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ==========================================
// API CLIENT HELPER
// ==========================================

// Track if auth warning has been shown
let authWarningShown = false;

export async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get token from localStorage if in browser environment
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('auth_token');
      
      // Log warning ONCE if no token for protected endpoints (exclude public endpoints)
      const publicEndpoints = ['/auth/', '/partner', '/testimonials', '/ai/public-chat'];
      const isPublicEndpoint = publicEndpoints.some(pub => endpoint.includes(pub));
      
      if (!token && !authWarningShown && !isPublicEndpoint) {
        console.warn('⚠️ Not logged in - Please log in to use protected features');
        authWarningShown = true;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Configure fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  // Add cache control for development
  if (process.env.NODE_ENV === 'development') {
    fetchOptions.cache = 'no-store';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    // Try to parse error response as JSON if possible
    const getErrorDetails = async () => {
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          return errorData.message || errorData.error || 'An error occurred';
        }
        return await response.text() || 'No error details available';
      } catch {
        return 'Could not parse error response';
      }
    };

    // Handle unauthorized/forbidden
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        authWarningShown = false; // Reset for next session
        
        // Show user-friendly alert (only once)
        if (!sessionStorage.getItem('auth_alert_shown')) {
          sessionStorage.setItem('auth_alert_shown', 'true');
          const shouldReload = confirm(
            '🔐 Session Expired\n\n' +
            'Your session has expired or you are not logged in.\n\n' +
            'Click OK to go to the login page.'
          );
          
          if (shouldReload) {
            window.location.href = '/';
          }
        }
      }
      const errorMessage = await getErrorDetails();
      throw new Error(errorMessage || 'Authentication required. Please log in.');
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorMessage = await getErrorDetails();
      console.error(`API Error [${endpoint} ${response.status}]:`, errorMessage);
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Only log network errors, not auth errors (already handled above)
    if (error instanceof Error && !error.message.includes('Authentication required')) {
      console.error(`Network Error [${endpoint}]:`, error.message);
      
      // Handle network errors (like CORS or server not reachable)
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not connect to the server. Please check your internet connection and try again.');
      }
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// ==========================================
// SERVICES
// ==========================================

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const data = await fetchClient<{ token: string, user: User & { permissions?: string[] } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('auth_token', data.token);
      // Store user info with permissions
      localStorage.setItem('user_info', JSON.stringify(data.user));
      return data.user;
    },

    register: async (userData: any): Promise<User> => {
      const data = await fetchClient<{ token: string, user: User & { permissions?: string[] } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      return data.user;
    },
    
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    },

    getMe: async (): Promise<User & { permissions: string[], role: string }> => {
      const user = await fetchClient<User & { permissions: string[], role: string }>('/auth/me');
      localStorage.setItem('user_info', JSON.stringify(user));
      return user;
    },

    // Get current user from localStorage
    getCurrentUser: (): { permissions: string[], role: string, companyName: string } | null => {
      try {
        const userInfo = localStorage.getItem('user_info');
        return userInfo ? JSON.parse(userInfo) : null;
      } catch {
        return null;
      }
    },

    // Check if user has permission
    hasPermission: (permission: string): boolean => {
      const user = api.auth.getCurrentUser();
      if (!user) return false;
      if (user.role === 'Admin' || user.permissions?.includes('Full Access')) return true;
      return user.permissions?.includes(permission) || false;
    },

    // Check if user is Admin
    isAdmin: (): boolean => {
      const user = api.auth.getCurrentUser();
      return user?.role === 'Admin' || user?.permissions?.includes('Full Access') || false;
    }
  },

  dashboard: {
    getStats: async () => {
        return await fetchClient('/dashboard/stats');
    }
  },

  notifications: {
    getAll: async () => {
        return await fetchClient<any[]>('/notifications');
    },
    markRead: async () => {
        return await fetchClient('/notifications/read', { method: 'POST' });
    }
  },

  partner: {
    submit: async (data: any) => {
        // No token needed for this, handling manually to avoid auth header if user not logged in
        const response = await fetch(`${API_BASE_URL}/partner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit');
        return response.json();
    }
  },

  payment: {
    getConfig: async () => {
        return await fetchClient<{ publicKey: string | null; isTestMode: boolean; isConfigured: boolean }>('/payments/config');
    },
    initialize: async (data: any) => {
        return await fetchClient<any>('/payments/initialize', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    verify: async (txRef: string) => {
        return await fetchClient<any>(`/payments/verify/${txRef}`);
    },
    simulate: async (txRef: string, status: 'success' | 'failed' = 'success') => {
        return await fetchClient<any>('/payments/simulate', {
            method: 'POST',
            body: JSON.stringify({ tx_ref: txRef, status })
        });
    },
    getHistory: async () => {
        return await fetchClient<any[]>('/payments/history');
    },
    getSubscription: async () => {
        return await fetchClient<{ plan: string; status: string; nextBillingDate: string; memberSince: string }>('/payments/subscription');
    }
  },

  employees: {
    getAll: async (): Promise<Employee[]> => {
      return await fetchClient<Employee[]>('/employees');
    },

    create: async (employee: Omit<Employee, 'id' | 'status'>): Promise<Employee> => {
      return fetchClient<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(employee)
      });
    },

    delete: async (id: string): Promise<void> => {
      return fetchClient<void>(`/employees/${id}`, {
        method: 'DELETE'
      });
    }
  },

  finance: {
    getTransactions: async (): Promise<Transaction[]> => {
        return await fetchClient<Transaction[]>('/finance/transactions');
    },
    createTransaction: async (tx: Partial<Transaction>): Promise<Transaction> => {
        return await fetchClient<Transaction>('/finance/transactions', {
            method: 'POST',
            body: JSON.stringify(tx)
        });
    },
    updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
        return await fetchClient<Transaction>(`/finance/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteTransaction: async (id: string): Promise<void> => {
        return await fetchClient<void>(`/finance/transactions/${id}`, {
            method: 'DELETE'
        });
    },
    getAccounts: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/finance/accounts');
    },
    createAccount: async (account: any): Promise<any> => {
        return await fetchClient<any>('/finance/accounts', {
            method: 'POST',
            body: JSON.stringify(account)
        });
    },
    updateAccount: async (id: string, account: any): Promise<any> => {
        return await fetchClient<any>(`/finance/accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(account)
        });
    },
    deleteAccount: async (id: string): Promise<void> => {
        return await fetchClient<void>(`/finance/accounts/${id}`, {
            method: 'DELETE'
        });
    }
  },

  inventory: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/inventory/items');
    },
    create: async (item: any): Promise<any> => {
        return await fetchClient<any>('/inventory/items', {
            method: 'POST',
            body: JSON.stringify(item)
        });
    }
  },

  tasks: {
    getAll: async (): Promise<Task[]> => {
        return await fetchClient<Task[]>('/tasks');
    },
    create: async (task: Partial<Task>): Promise<Task> => {
        return await fetchClient<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        });
    },
    updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
        return await fetchClient<Task>(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
  },

  sales: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/sales/orders');
    },
    create: async (order: any): Promise<any> => {
        return await fetchClient<any>('/sales/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
    }
  },

  settings: {
    getModuleSettings: async (): Promise<{ enabledModules: string[] }> => {
        return await fetchClient<{ enabledModules: string[] }>('/settings/modules');
    },
    updateModuleSettings: async (enabledModules: string[]): Promise<any> => {
        return await fetchClient<any>('/settings/modules', {
            method: 'PUT',
            body: JSON.stringify({ enabledModules })
        });
    },
    toggleModule: async (moduleId: string): Promise<any> => {
        return await fetchClient<any>('/settings/modules/toggle', {
            method: 'POST',
            body: JSON.stringify({ moduleId })
        });
    },
    // Organization settings
    getOrganization: async (): Promise<any> => {
        return await fetchClient<any>('/settings/organization');
    },
    updateOrganization: async (data: any): Promise<any> => {
        return await fetchClient<any>('/settings/organization', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    // Notification settings
    getNotifications: async (): Promise<any> => {
        return await fetchClient<any>('/settings/notifications');
    },
    updateNotifications: async (data: any): Promise<any> => {
        return await fetchClient<any>('/settings/notifications', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    // Integrations
    getIntegrations: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/settings/integrations');
    },
    connectIntegration: async (name: string, config: any): Promise<any> => {
        return await fetchClient<any>('/settings/integrations', {
            method: 'POST',
            body: JSON.stringify({ name, ...config })
        });
    },
    disconnectIntegration: async (name: string): Promise<any> => {
        return await fetchClient<any>(`/settings/integrations/${name}`, {
            method: 'DELETE'
        });
    }
  },

  teamMembers: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/team-members');
    },
    invite: async (data: { email: string; name: string; role: string }): Promise<any> => {
        return await fetchClient<any>('/team-members', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/team-members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    remove: async (id: string): Promise<any> => {
        return await fetchClient<any>(`/team-members/${id}`, {
            method: 'DELETE'
        });
    },
    getRoles: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/roles');
    }
  },

  roles: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/roles');
    },
    create: async (data: { name: string; description?: string; permissions: string[] }): Promise<any> => {
        return await fetchClient<any>('/roles', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: async (id: string): Promise<any> => {
        return await fetchClient<any>(`/roles/${id}`, {
            method: 'DELETE'
        });
    }
  },

  knowledge: {
    getArticles: async (params?: { category?: string; search?: string }): Promise<any[]> => {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return await fetchClient<any[]>(`/knowledge/articles${query}`);
    },
    getArticle: async (id: string): Promise<any> => {
        return await fetchClient<any>(`/knowledge/articles/${id}`);
    },
    createArticle: async (data: any): Promise<any> => {
        return await fetchClient<any>('/knowledge/articles', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    updateArticle: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/knowledge/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteArticle: async (id: string): Promise<any> => {
        return await fetchClient<any>(`/knowledge/articles/${id}`, {
            method: 'DELETE'
        });
    },
    getCategories: async (): Promise<string[]> => {
        return await fetchClient<string[]>('/knowledge/categories');
    },
    getStats: async (): Promise<any> => {
        return await fetchClient<any>('/knowledge/stats');
    }
  },

  expenses: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/expenses');
    },
    create: async (expense: any): Promise<any> => {
        return await fetchClient<any>('/expenses', {
            method: 'POST',
            body: JSON.stringify(expense)
        });
    },
    update: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    getStats: async (): Promise<any> => {
        return await fetchClient<any>('/expenses/stats');
    }
  },

  payroll: {
    getAll: async (month?: string): Promise<any[]> => {
        const query = month ? `?month=${month}` : '';
        return await fetchClient<any[]>(`/payroll${query}`);
    },
    create: async (payroll: any): Promise<any> => {
        return await fetchClient<any>('/payroll', {
            method: 'POST',
            body: JSON.stringify(payroll)
        });
    },
    update: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/payroll/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    getStats: async (): Promise<any> => {
        return await fetchClient<any>('/payroll/stats');
    }
  },

  procurement: {
    getAll: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/procurement/orders');
    },
    create: async (order: any): Promise<any> => {
        return await fetchClient<any>('/procurement/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
    },
    update: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/procurement/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
  },

  crm: {
    getLeads: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/crm/leads');
    },
    createLead: async (lead: any): Promise<any> => {
        return await fetchClient<any>('/crm/leads', {
            method: 'POST',
            body: JSON.stringify(lead)
        });
    },
    updateLead: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/crm/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteLead: async (id: string): Promise<any> => {
        return await fetchClient<any>(`/crm/leads/${id}`, {
            method: 'DELETE'
        });
    },
    getStats: async (): Promise<any> => {
        return await fetchClient<any>('/crm/stats');
    }
  },

  marketing: {
    getCampaigns: async (): Promise<any[]> => {
        return await fetchClient<any[]>('/marketing/campaigns');
    },
    createCampaign: async (campaign: any): Promise<any> => {
        return await fetchClient<any>('/marketing/campaigns', {
            method: 'POST',
            body: JSON.stringify(campaign)
        });
    },
    updateCampaign: async (id: string, data: any): Promise<any> => {
        return await fetchClient<any>(`/marketing/campaigns/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    getStats: async (): Promise<any> => {
        return await fetchClient<any>('/marketing/stats');
    }
  },

  approvals: {
    getPending: async (): Promise<{ approvals: any[]; summary: any }> => {
        return await fetchClient<{ approvals: any[]; summary: any }>('/approvals/pending');
    },
    approve: async (id: string, type: string): Promise<any> => {
        return await fetchClient<any>(`/approvals/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    },
    reject: async (id: string, type: string, reason?: string): Promise<any> => {
        return await fetchClient<any>(`/approvals/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ type, reason })
        });
    }
  },

  billing: {
    getOverview: async (): Promise<any> => {
        return await fetchClient<any>('/billing/overview');
    },
    upgradePlan: async (newPlan: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<any> => {
        return await fetchClient<any>('/billing/upgrade', {
            method: 'POST',
            body: JSON.stringify({ newPlan, billingCycle })
        });
    },
    confirmUpgrade: async (newPlan: string, billingCycle: 'monthly' | 'yearly', txRef: string): Promise<any> => {
        return await fetchClient<any>('/billing/confirm-upgrade', {
            method: 'POST',
            body: JSON.stringify({ newPlan, billingCycle, txRef })
        });
    },
    getInvoices: async (): Promise<any> => {
        return await fetchClient<any>('/billing/invoices');
    },
    getSubscription: async (): Promise<any> => {
        return await fetchClient<any>('/billing/subscription');
    },
    cancelSubscription: async (): Promise<any> => {
        return await fetchClient<any>('/billing/cancel', {
            method: 'POST'
        });
    },
    updatePaymentMethod: async (paymentMethod: string): Promise<any> => {
        return await fetchClient<any>('/billing/payment-method', {
            method: 'PUT',
            body: JSON.stringify({ paymentMethod })
        });
    },
    getBillingHistory: async (): Promise<any> => {
        return await fetchClient<any>('/billing/history');
    }
  }
};
