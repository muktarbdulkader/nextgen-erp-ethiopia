import React, { useState, useEffect, useRef } from 'react';
import { Search, LayoutDashboard, Wallet, Package, ShoppingCart, Users, Bot, CreditCard, FileText, X, ArrowRight, CheckSquare } from 'lucide-react';
import { ModuleType } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ModuleType) => void;
  onAction: (actionType: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  type: 'navigation' | 'action';
  value: string; // ModuleType or Action ID
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, type: 'navigation', value: 'overview' },
    { id: 'nav-tasks', label: 'Go to Tasks', icon: CheckSquare, type: 'navigation', value: 'tasks' },
    { id: 'nav-finance', label: 'Go to Finance', icon: Wallet, type: 'navigation', value: 'finance' },
    { id: 'nav-inventory', label: 'Go to Inventory', icon: Package, type: 'navigation', value: 'inventory' },
    { id: 'nav-sales', label: 'Go to Sales', icon: ShoppingCart, type: 'navigation', value: 'sales' },
    { id: 'nav-hr', label: 'Go to HR & Payroll', icon: Users, type: 'navigation', value: 'hr' },
    // Actions
    { id: 'act-ai', label: 'Ask Mukti AI', icon: Bot, type: 'action', value: 'toggle-ai', shortcut: 'AI' },
    { id: 'act-pay', label: 'Quick Payment (Chapa)', icon: CreditCard, type: 'action', value: 'quick-pay', shortcut: 'QP' },
    { id: 'act-invoice', label: 'Create New Invoice', icon: FileText, type: 'action', value: 'new-invoice' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeCommand = (cmd: CommandItem) => {
    if (cmd.type === 'navigation') {
      onNavigate(cmd.value as ModuleType);
    } else {
      onAction(cmd.value);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700">
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 dark:bg-dark-700 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">ESC</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results found.
            </div>
          ) : (
            <>
              <div className="px-3 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggestions</div>
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                      isSelected 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600' : 'bg-slate-100 dark:bg-dark-700 text-slate-500'}`}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-1 font-medium">{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="text-xs text-slate-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={14} className="text-brand-500" />}
                  </button>
                );
              })}
            </>
          )}
        </div>
        
        <div className="px-4 py-2 bg-slate-50 dark:bg-dark-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-500">
           <span>Use <kbd className="font-bold">↑</kbd> <kbd className="font-bold">↓</kbd> to navigate</span>
           <span><kbd className="font-bold">↵</kbd> to select</span>
        </div>
      </div>
    </div>
  );
};