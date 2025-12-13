import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, CheckCircle2, Circle, Clock, MoreVertical, Search, User as UserIcon, CheckSquare, Sparkles, Loader2, X, AlertCircle } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, LanguageCode } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { translations } from '../../utils/translations';
import { sendMessageToGemini } from '../../services/geminiService';
import { api } from '../../services/api';

interface TaskModuleProps {
  language: LanguageCode;
}

export const TaskModule: React.FC<TaskModuleProps> = ({ language }) => {
  const t = translations[language];
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selected Task for Details View
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    priority: 'medium',
    dueDate: new Date()
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
        const data = await api.tasks.getAll();
        // Convert string dates back to Date objects
        const parsedTasks = data.map(t => ({
            ...t,
            dueDate: new Date(t.dueDate)
        }));
        setTasks(parsedTasks);
    } catch (e) {
        console.error("Failed to fetch tasks", e);
    } finally {
        setLoading(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch(status) {
      case 'done': return <CheckCircle2 className="text-green-500 w-5 h-5" />;
      case 'in-progress': return <Clock className="text-amber-500 w-5 h-5" />;
      case 'todo': return <Circle className="text-slate-400 w-5 h-5" />;
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    
    const taskData = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as TaskPriority,
      status: 'todo' as TaskStatus,
      dueDate: newTask.dueDate || new Date(),
      assignee: newTask.assignee || 'Me'
    };

    try {
        const savedTask = await api.tasks.create(taskData);
        // Fix date object
        const parsed = { ...savedTask, dueDate: new Date(savedTask.dueDate) };
        setTasks([parsed, ...tasks]);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: new Date() });
    } catch (e) {
        console.error("Failed to add task");
    }
  };

  const handleAiSuggest = async () => {
      if (!newTask.title) return;
      setIsAiLoading(true);
      
      // Calculate Workloads
      const workloadMap: Record<string, number> = {};
      const activeTasks = tasks.filter(t => t.status !== 'done');
      
      // Get unique assignees from existing tasks + defaults
      const knownAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter((a): a is string => !!a)));
      const defaultAssignees = ["Dawit K.", "Abebe B.", "Tigist M."];
      const allAssignees = Array.from(new Set([...knownAssignees, ...defaultAssignees]));

      // Initialize counts
      allAssignees.forEach((a: string) => workloadMap[a] = 0);

      // Count active tasks for each assignee
      activeTasks.forEach(t => {
          if (t.assignee) {
              workloadMap[t.assignee] = (workloadMap[t.assignee] || 0) + 1;
          }
      });

      // Format workload context string
      const workloadContext = Object.entries(workloadMap)
          .map(([name, count]) => `${name} (${count} tasks)`)
          .join(', ');

      // Context about urgency/deadlines
      const highPriorityCount = activeTasks.filter(t => t.priority === 'high').length;
      const today = new Date();
      const overdueCount = activeTasks.filter(t => t.dueDate < today).length;
      
      const projectContext = `Current status: ${activeTasks.length} pending tasks. ${highPriorityCount} high priority. ${overdueCount} overdue.`;

      const prompt = `
          I am creating a new task for my ERP system.
          
          **New Task Details:**
          Title: "${newTask.title}"
          Description: "${newTask.description || ''}"
          
          **Team Workload (Active Tasks):**
          ${workloadContext}
          
          **Project Context:**
          ${projectContext}
          
          **Your Goal:**
          1. Determine **Priority** (low, medium, high). If keywords like "urgent", "ASAP", "critical" appear, or if it relates to financial compliance/deadlines, set HIGH.
          2. Select the **Best Assignee**. 
             - Match skills to task type (e.g., 'Dawit K.' usually handles Finance/Admin, 'Abebe B.' handles Sales/Inventory, 'Tigist M.' handles HR/Support).
             - Consider workload: If the best skill match has too many tasks (>5), try to delegate to someone with lower workload if possible.
          
          Return ONLY a JSON object:
          { "priority": "medium", "assignee": "Name", "reason": "Short explanation" }
      `;

      try {
          const response = await sendMessageToGemini(prompt, []);
          
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
              const suggestion = JSON.parse(jsonMatch[0]);
              setNewTask(prev => ({
                  ...prev,
                  priority: suggestion.priority?.toLowerCase() || prev.priority,
                  assignee: suggestion.assignee || prev.assignee
              }));
              console.log("AI Suggestion Reason:", suggestion.reason);
          }
      } catch (error) {
          console.error("AI Suggestion Error", error);
      } finally {
          setIsAiLoading(false);
      }
  };

  const toggleStatus = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    };
    const newStatus = nextStatus[currentStatus];
    
    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    try {
        await api.tasks.updateStatus(id, newStatus);
    } catch (e) {
        // Revert on error
        setTasks(tasks.map(t => 
           t.id === id ? { ...t, status: currentStatus } : t
        ));
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold text-slate-900 dark:text-white ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.taskTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team's work efficiently.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          <span className={language === 'AM' ? 'ethiopic-text' : ''}>{t.addTask}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: t.filterAll },
          { id: 'todo', label: t.filterTodo },
          { id: 'in-progress', label: t.filterInProgress },
          { id: 'done', label: t.filterDone },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${filter === tab.id 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-700'}
              ${language === 'AM' ? 'ethiopic-text' : ''}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           <div className="py-12 text-center text-slate-400"><Loader2 className="animate-spin w-8 h-8 mx-auto"/></div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
             <div className="w-12 h-12 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <CheckSquare size={24} />
             </div>
             <p className={`text-slate-500 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.noTasks}</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex items-start gap-4 group cursor-pointer"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, task.status); }}
                className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
              >
                {getStatusIcon(task.status)}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className={`font-semibold text-slate-900 dark:text-white ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                {task.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                    <Flag size={10} />
                    <span className="capitalize">{task.priority}</span>
                  </span>
                  
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded-md">
                    <Calendar size={12} />
                    {task.dueDate.toLocaleDateString()}
                  </span>

                  {task.assignee && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ml-auto">
                      <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[10px] font-bold">
                        {task.assignee.charAt(0)}
                      </div>
                      {task.assignee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Detail View Modal */}
      {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-3">
                          <button onClick={() => toggleStatus(selectedTask.id, selectedTask.status)}>
                              {getStatusIcon(selectedTask.status)}
                          </button>
                          <div>
                              <h2 className={`text-xl font-bold dark:text-white ${selectedTask.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                                  {selectedTask.title}
                              </h2>
                              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                  selectedTask.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                  {selectedTask.status}
                              </span>
                          </div>
                      </div>
                      <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-dark-900/50 p-4 rounded-xl">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedTask.description || "No description provided."}
                          </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assignee</h4>
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
                                      {selectedTask.assignee ? selectedTask.assignee.charAt(0) : '?'}
                                  </div>
                                  <span className="text-sm font-medium dark:text-white">{selectedTask.assignee || 'Unassigned'}</span>
                              </div>
                          </div>
                          <div>
                               <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</h4>
                               <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                   <Calendar size={16} />
                                   <span className="text-sm">{selectedTask.dueDate.toLocaleDateString()}</span>
                               </div>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                             <Flag size={14} className="mr-1.5" />
                             <span className="capitalize">{selectedTask.priority}</span>
                          </span>
                      </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                      <Button onClick={() => setSelectedTask(null)}>Close</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h2 className={`text-xl font-bold mb-4 ${language === 'AM' ? 'ethiopic-text' : ''}`}>{t.addTask}</h2>
            
            <div className="space-y-4">
              <Input 
                label={t.taskTitlePlaceholder}
                placeholder={t.taskTitlePlaceholder}
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                autoFocus
              />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.description}</label>
                    <button 
                        onClick={handleAiSuggest} 
                        disabled={isAiLoading || !newTask.title}
                        className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-50"
                    >
                        {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Auto-fill with AI
                    </button>
                </div>
                <textarea 
                  className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  rows={3}
                  placeholder={t.taskDescPlaceholder}
                  value={newTask.description || ''}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.priority}</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                     <button
                        key={p}
                        onClick={() => setNewTask({...newTask, priority: p})}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                          newTask.priority === p 
                            ? getPriorityColor(p) + ' ring-2 ring-offset-1 dark:ring-offset-dark-800 ring-slate-300 dark:ring-slate-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
                        }`}
                     >
                        {p}
                     </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.dueDate}</label>
                <input 
                  type="date"
                  className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                  onChange={e => setNewTask({...newTask, dueDate: new Date(e.target.value)})}
                />
              </div>
              
              <Input 
                label={t.assignee}
                placeholder="Name"
                icon={UserIcon}
                value={newTask.assignee || ''}
                onChange={e => setNewTask({...newTask, assignee: e.target.value})}
              />
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                {t.cancel}
              </Button>
              <Button className="flex-1" onClick={handleAddTask}>
                {t.saveTask}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};