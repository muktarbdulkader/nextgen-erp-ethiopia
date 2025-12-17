import React from 'react';

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachment?: Attachment;
  timestamp: Date;
}

export type LanguageCode = 'EN' | 'AM' | 'OR';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string; // Used for data isolation (always email)
  displayCompanyName?: string; // Actual company name for display
  profileImage?: string;
  plan?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export type ModuleType = 'overview' | 'finance' | 'inventory' | 'sales' | 'hr' | 'tasks' | 'ai-chat' | 'docs' | 'settings' | 'account' | 'billing' | 'crm' | 'marketing' | 'procurement' | 'supply-chain' | 'expenses' | 'payroll' | 'approvals';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assignee?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: string;
  profileImage?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  account: string;
  status: 'paid' | 'pending';
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Chapa' | 'Other';
}

export interface DashboardState {
  currentModule: ModuleType;
  isSidebarOpen: boolean;
  isChapaModalOpen: boolean;
}