import React, { useState, useEffect } from 'react';
import { BookOpen, Database, Users, LifeBuoy, ArrowRight, Loader2, Plus, X, Edit2, Trash2, Search, Eye, Play, Mail, Phone, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  isPublic: boolean;
  createdAt: string;
}

const CATEGORIES = [
  'Getting Started',
  'Finance',
  'Inventory',
  'HR',
  'Sales',
  'Tax',
  'Payments',
  'Integrations',
  'API',
  'Troubleshooting'
];

export const KnowledgeSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [stats, setStats] = useState({ totalArticles: 0, videoTutorials: 12, supportAvailable: '24/7' });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Getting Started',
    tags: '',
    isPublic: false
  });
  const [showQuickLinkModal, setShowQuickLinkModal] = useState<'guide' | 'videos' | 'support' | null>(null);
  const [orgData, setOrgData] = useState<{ companyName: string; email: string; phone: string; address: string }>({
    companyName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadKnowledge();
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      const data = await api.settings.getOrganization();
      if (data) {
        setOrgData({
          companyName: data.companyName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  const loadKnowledge = async () => {
    try {
      setIsLoading(true);
      const [articlesData, statsData] = await Promise.all([
        api.knowledge.getArticles(),
        api.knowledge.getStats()
      ]);
      setArticles(articlesData || []);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (article?: KnowledgeArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags?.join(', ') || '',
        isPublic: article.isPublic
      });
    } else {
      setEditingArticle(null);
      setFormData({ title: '', content: '', category: 'Getting Started', tags: '', isPublic: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('Please fill in title, content, and category');
      return;
    }
    try {
      const data = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPublic: formData.isPublic
      };

      if (editingArticle) {
        const updated = await api.knowledge.updateArticle(editingArticle.id, data);
        setArticles(articles.map(a => a.id === editingArticle.id ? updated : a));
      } else {
        const created = await api.knowledge.createArticle(data);
        setArticles([created, ...articles]);
        setStats(prev => ({ ...prev, totalArticles: prev.totalArticles + 1 }));
      }
      setShowModal(false);
    } catch (error: any) {
      alert(error.message || 'Failed to save article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.knowledge.deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
      setStats(prev => ({ ...prev, totalArticles: prev.totalArticles - 1 }));
    } catch (error: any) {
      alert(error.message || 'Failed to delete article');
    }
  };

  const viewArticle = async (article: KnowledgeArticle) => {
    try {
      const fullArticle = await api.knowledge.getArticle(article.id);
      setViewingArticle(fullArticle);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-brand-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Help articles, tutorials, and documentation</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={18} className="mr-2" />
          New Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-6 text-white">
          <BookOpen size={32} className="mb-4" />
          <h3 className="text-2xl font-bold mb-2">{stats.totalArticles}</h3>
          <p className="text-brand-100">Help Articles</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Database size={32} className="mb-4" />
          <h3 className="text-2xl font-bold mb-2">{stats.videoTutorials}</h3>
          <p className="text-blue-100">Video Tutorials</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Users size={32} className="mb-4" />
          <h3 className="text-2xl font-bold mb-2">{stats.supportAvailable}</h3>
          <p className="text-green-100">Support Available</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Articles ({filteredArticles.length})</h3>
        <div className="space-y-3">
          {filteredArticles.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No articles found. Click "New Article" to create one.</p>
          ) : filteredArticles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 transition-all">
              <div className="flex-1 cursor-pointer" onClick={() => viewArticle(article)}>
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">{article.title}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs">{article.category}</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {article.views}</span>
                  {article.isPublic && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">Public</span>}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => openModal(article)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(article.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={() => setShowQuickLinkModal('guide')} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-left">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Getting Started Guide</span>
            <ArrowRight size={16} className="ml-auto text-slate-400" />
          </button>
          <button onClick={() => setShowQuickLinkModal('videos')} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-left">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Video Tutorials</span>
            <ArrowRight size={16} className="ml-auto text-slate-400" />
          </button>
          <button onClick={() => setShowQuickLinkModal('support')} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-left">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <LifeBuoy size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Contact Support</span>
            <ArrowRight size={16} className="ml-auto text-slate-400" />
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingArticle ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white resize-none"
                  placeholder="Write your article content here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                  placeholder="e.g., finance, setup, guide"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Make this article public (visible to all companies)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave}>{editingArticle ? 'Update' : 'Create'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Article Modal */}
      {showViewModal && viewingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{viewingArticle.title}</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>
            
            {/* Article Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-dark-900 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
                <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm font-medium">{viewingArticle.category}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Views</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1"><Eye size={14} /> {viewingArticle.views}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Visibility</p>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${viewingArticle.isPublic ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {viewingArticle.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(viewingArticle.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Article ID */}
            <div className="mb-4 p-3 bg-slate-100 dark:bg-dark-700 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Article ID</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{viewingArticle.id}</p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Content</p>
              <div className="prose dark:prose-invert max-w-none p-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{viewingArticle.content}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Tags</p>
              {viewingArticle.tags && viewingArticle.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingArticle.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No tags</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="flex-1" onClick={() => setShowViewModal(false)}>Close</Button>
              <Button className="flex-1" onClick={() => { setShowViewModal(false); openModal(viewingArticle); }}>Edit Article</Button>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Guide Modal */}
      {showQuickLinkModal === 'guide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Getting Started Guide</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Learn how to use the platform</p>
                </div>
              </div>
              <button onClick={() => setShowQuickLinkModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                <h4 className="font-semibold text-brand-800 dark:text-brand-300 mb-2">Welcome to the Platform!</h4>
                <p className="text-brand-700 dark:text-brand-400 text-sm">This guide will help you get started with all the features and modules available.</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Step 1: Set Up Your Organization</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-6">Go to Settings → Organization to configure your company details, logo, and preferences.</p>

                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Step 2: Add Team Members</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-6">Navigate to Settings → Users to invite team members and assign roles and permissions.</p>

                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Step 3: Enable Modules</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-6">Go to Settings → Modules to enable the features you need: Finance, HR, Inventory, CRM, and more.</p>

                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Step 4: Configure Integrations</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-6">Connect external services like payment gateways, email providers, and more in Settings → Integrations.</p>

                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Step 5: Start Using the Dashboard</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-6">Your dashboard provides an overview of all your business metrics. Explore each module from the sidebar.</p>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-dark-700 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Need More Help?</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Check out our video tutorials or contact support for personalized assistance.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="flex-1" onClick={() => setShowQuickLinkModal(null)}>Close</Button>
              <Button className="flex-1" onClick={() => { setShowQuickLinkModal(null); setSelectedCategory('Getting Started'); }}>View Related Articles</Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Tutorials Modal */}
      {showQuickLinkModal === 'videos' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Play size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Video Tutorials</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{stats.videoTutorials} tutorials available</p>
                </div>
              </div>
              <button onClick={() => setShowQuickLinkModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Platform Overview', duration: '5:30', category: 'Getting Started' },
                { title: 'Setting Up Your Organization', duration: '8:15', category: 'Getting Started' },
                { title: 'Managing Team Members', duration: '6:45', category: 'HR' },
                { title: 'Finance Module Walkthrough', duration: '12:20', category: 'Finance' },
                { title: 'Inventory Management', duration: '9:10', category: 'Inventory' },
                { title: 'CRM & Sales Pipeline', duration: '10:30', category: 'Sales' },
                { title: 'Payroll Processing', duration: '7:45', category: 'HR' },
                { title: 'Reports & Analytics', duration: '8:00', category: 'Finance' },
                { title: 'Integration Setup', duration: '6:30', category: 'Integrations' },
                { title: 'API Documentation', duration: '11:15', category: 'API' },
                { title: 'Mobile App Features', duration: '5:00', category: 'Getting Started' },
                { title: 'Troubleshooting Common Issues', duration: '7:20', category: 'Troubleshooting' },
              ].map((video, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">{video.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {video.duration}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{video.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="flex-1" onClick={() => setShowQuickLinkModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showQuickLinkModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <LifeBuoy size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Support</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">We're here to help {stats.supportAvailable}</p>
                </div>
              </div>
              <button onClick={() => setShowQuickLinkModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Company Info */}
              {orgData.companyName && (
                <div className="md:col-span-2 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                  <h4 className="font-semibold text-brand-800 dark:text-brand-300 mb-1">{orgData.companyName}</h4>
                  {orgData.address && <p className="text-brand-700 dark:text-brand-400 text-sm">{orgData.address}</p>}
                </div>
              )}

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Email Support</h4>
                    <p className="text-green-700 dark:text-green-400 text-sm">{orgData.email || 'support@example.com'}</p>
                  </div>
                </div>
                <p className="text-green-600 dark:text-green-500 text-xs">Response within 24 hours</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Phone Support</h4>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">{orgData.phone || '+251 911 123 456'}</p>
                  </div>
                </div>
                <p className="text-blue-600 dark:text-blue-500 text-xs">Mon-Fri, 9AM - 6PM EAT</p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <MessageCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Live Chat</h4>
                    <p className="text-purple-700 dark:text-purple-400 text-sm">Chat with us now</p>
                  </div>
                </div>
                <p className="text-purple-600 dark:text-purple-500 text-xs">Available 24/7</p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Response Time</h4>
                    <p className="text-orange-700 dark:text-orange-400 text-sm">Average: 2 hours</p>
                  </div>
                </div>
                <p className="text-orange-600 dark:text-orange-500 text-xs">Priority for premium plans</p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-dark-700 rounded-lg mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Submit a Support Ticket</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white resize-none"
                />
                <Button className="w-full">Submit Ticket</Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="flex-1" onClick={() => setShowQuickLinkModal(null)}>Close</Button>
              <Button className="flex-1" onClick={() => { setShowQuickLinkModal(null); setSelectedCategory('Troubleshooting'); }}>View Troubleshooting Articles</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
