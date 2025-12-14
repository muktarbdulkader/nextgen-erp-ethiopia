import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Heart, ArrowUpRight, Send, X, Book, Map, FileText, Users, Briefcase, MessageSquare, Phone, HelpCircle, Globe, Activity, Shield, Scale, Cookie, Code, Rocket, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';

interface FooterProps {
  onPartnerClick: () => void;
}

// Modal Content Components
const APIContent = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-xl">
      <Code className="w-10 h-10 text-brand-600" />
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white">muktiAp REST API</h3>
        <p className="text-sm text-slate-500">Version 2.0 • RESTful Architecture</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {['Authentication', 'Inventory', 'Sales', 'Finance', 'HR', 'Reports'].map((endpoint) => (
        <div key={endpoint} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <code className="text-sm text-brand-600">/api/v2/{endpoint.toLowerCase()}</code>
        </div>
      ))}
    </div>
    <div className="p-4 bg-slate-900 rounded-xl">
      <code className="text-green-400 text-sm">
        curl -X GET "https://api.muktiap.com/v2/inventory" \<br/>
        &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
      </code>
    </div>
    <p className="text-sm text-slate-500">Full documentation available after registration.</p>
  </div>
);

const RoadmapContent = () => (
  <div className="space-y-4">
    {[
      { quarter: 'Q1 2025', items: ['Mobile App Launch', 'AI-Powered Forecasting', 'Multi-currency Support'], status: 'current' },
      { quarter: 'Q2 2025', items: ['Telebirr Integration', 'Advanced Analytics Dashboard', 'Bulk Import/Export'], status: 'upcoming' },
      { quarter: 'Q3 2025', items: ['Marketplace Integration', 'Custom Report Builder', 'API v3 Release'], status: 'planned' },
      { quarter: 'Q4 2025', items: ['Enterprise Features', 'White-label Solution', 'Regional Expansion'], status: 'planned' },
    ].map((phase) => (
      <div key={phase.quarter} className={`p-4 rounded-xl border-2 ${phase.status === 'current' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${phase.status === 'current' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {phase.quarter}
          </span>
          {phase.status === 'current' && <span className="text-xs text-brand-600 font-medium">In Progress</span>}
        </div>
        <ul className="space-y-1">
          {phase.items.map((item) => (
            <li key={item} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Rocket className="w-3 h-3 text-brand-500" /> {item}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const ChangelogContent = () => (
  <div className="space-y-4">
    {[
      { version: 'v2.5.0', date: 'Dec 10, 2025', changes: ['New AI Assistant', 'Improved Dashboard', 'Bug fixes'], type: 'major' },
      { version: 'v2.4.2', date: 'Dec 1, 2025', changes: ['Performance improvements', 'Security patches'], type: 'patch' },
      { version: 'v2.4.0', date: 'Nov 20, 2025', changes: ['Payroll Module', 'Export to PDF', 'Dark mode improvements'], type: 'minor' },
      { version: 'v2.3.0', date: 'Nov 5, 2025', changes: ['CRM Module Launch', 'Email notifications', 'API rate limiting'], type: 'minor' },
    ].map((release) => (
      <div key={release.version} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-900 dark:text-white">{release.version}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${release.type === 'major' ? 'bg-purple-100 text-purple-600' : release.type === 'minor' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
              {release.type}
            </span>
            <span className="text-xs text-slate-400">{release.date}</span>
          </div>
        </div>
        <ul className="space-y-1">
          {release.changes.map((change) => (
            <li key={change} className="text-sm text-slate-600 dark:text-slate-300">• {change}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const AboutUsContent = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-4">m</div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">muktiAp</h3>
      <p className="text-brand-600">Next-Gen Ethiopian ERP</p>
    </div>
    <p className="text-slate-600 dark:text-slate-300 text-center">
      Founded in 2024, muktiAp is on a mission to empower Ethiopian businesses with intelligent, local-first technology. We believe every business deserves access to world-class tools.
    </p>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">500+</div>
        <div className="text-xs text-slate-500">Businesses</div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">15+</div>
        <div className="text-xs text-slate-500">Team Members</div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">🇪🇹</div>
        <div className="text-xs text-slate-500">Made in Ethiopia</div>
      </div>
    </div>
  </div>
);

const CareersContent = () => (
  <div className="space-y-4">
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
      <p className="text-green-700 dark:text-green-300 font-medium">🚀 We're hiring! Join our growing team.</p>
    </div>
    {[
      { title: 'Senior Full-Stack Developer', type: 'Full-time', location: 'Addis Ababa' },
      { title: 'UI/UX Designer', type: 'Full-time', location: 'Remote' },
      { title: 'DevOps Engineer', type: 'Full-time', location: 'Addis Ababa' },
      { title: 'Customer Success Manager', type: 'Full-time', location: 'Addis Ababa' },
    ].map((job) => (
      <motion.div key={job.title} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" whileHover={{ x: 5 }}>
        <h4 className="font-bold text-slate-900 dark:text-white">{job.title}</h4>
        <div className="flex gap-3 mt-1 text-sm text-slate-500">
          <span>{job.type}</span>
          <span>•</span>
          <span>{job.location}</span>
        </div>
      </motion.div>
    ))}
    <p className="text-sm text-slate-500 text-center">Send your CV to careers@muktiap.com</p>
  </div>
);

const BlogContent = () => (
  <div className="space-y-4">
    {[
      { title: 'How AI is Transforming Ethiopian Businesses', date: 'Dec 12, 2025', category: 'Technology', image: '🤖' },
      { title: 'Complete Guide to VAT Compliance in Ethiopia', date: 'Dec 8, 2025', category: 'Finance', image: '📊' },
      { title: 'Top 10 Inventory Management Tips', date: 'Dec 1, 2025', category: 'Operations', image: '📦' },
      { title: 'Building a Remote-First Company Culture', date: 'Nov 25, 2025', category: 'Culture', image: '🌍' },
    ].map((post) => (
      <motion.div key={post.title} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" whileHover={{ x: 5 }}>
        <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-2xl">{post.image}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{post.title}</h4>
          <div className="flex gap-2 mt-1 text-xs text-slate-500">
            <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full">{post.category}</span>
            <span>{post.date}</span>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const ContactContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      {[
        { icon: Phone, label: 'Phone', value: '+251 911 123 456' },
        { icon: Mail, label: 'Email', value: 'hello@muktiap.com' },
        { icon: Globe, label: 'Website', value: 'www.muktiap.com' },
        { icon: Clock, label: 'Hours', value: 'Mon-Sat 9AM-6PM' },
      ].map((item) => (
        <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <item.icon className="w-5 h-5 text-brand-500 mb-2" />
          <div className="text-xs text-slate-400">{item.label}</div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</div>
        </div>
      ))}
    </div>
    <div className="p-4 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-xl">
      <h4 className="font-bold text-slate-900 dark:text-white mb-2">📍 Office Location</h4>
      <p className="text-sm text-slate-600 dark:text-slate-300">Bole Road, Friendship Building<br/>4th Floor, Suite 401<br/>Addis Ababa, Ethiopia</p>
    </div>
  </div>
);

const DocumentationContent = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: '🚀', title: 'Getting Started', desc: 'Quick setup guide' },
        { icon: '📖', title: 'User Guide', desc: 'Complete documentation' },
        { icon: '🔧', title: 'API Reference', desc: 'Developer docs' },
        { icon: '🎥', title: 'Video Tutorials', desc: 'Step-by-step videos' },
        { icon: '💡', title: 'Best Practices', desc: 'Tips & tricks' },
        { icon: '❓', title: 'FAQs', desc: 'Common questions' },
      ].map((doc) => (
        <motion.div key={doc.title} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" whileHover={{ scale: 1.02 }}>
          <div className="text-2xl mb-2">{doc.icon}</div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{doc.title}</h4>
          <p className="text-xs text-slate-500">{doc.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const HelpCenterContent = () => (
  <div className="space-y-4">
    <div className="p-4 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl text-white">
      <h4 className="font-bold mb-1">Need Help?</h4>
      <p className="text-sm text-white/80">Our support team is available 24/7</p>
    </div>
    <div className="space-y-3">
      {[
        { q: 'How do I reset my password?', views: '2.5k' },
        { q: 'How to generate VAT reports?', views: '1.8k' },
        { q: 'Setting up multi-branch?', views: '1.2k' },
        { q: 'Integrating with Telebirr?', views: '980' },
      ].map((faq) => (
        <motion.div key={faq.q} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer" whileHover={{ x: 5 }}>
          <span className="text-sm text-slate-700 dark:text-slate-300">{faq.q}</span>
          <span className="text-xs text-slate-400">{faq.views} views</span>
        </motion.div>
      ))}
    </div>
    <button className="w-full py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors">
      Contact Support
    </button>
  </div>
);

const CommunityContent = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">5K+</div>
        <div className="text-xs text-slate-500">Members</div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">200+</div>
        <div className="text-xs text-slate-500">Discussions</div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-2xl font-bold text-brand-600">50+</div>
        <div className="text-xs text-slate-500">Events</div>
      </div>
    </div>
    <div className="space-y-3">
      {[
        { platform: 'Telegram', members: '3.2k', icon: '✈️' },
        { platform: 'Discord', members: '1.5k', icon: '💬' },
        { platform: 'LinkedIn Group', members: '800', icon: '💼' },
      ].map((community) => (
        <motion.div key={community.platform} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer" whileHover={{ scale: 1.02 }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{community.icon}</span>
            <span className="font-medium text-slate-900 dark:text-white">{community.platform}</span>
          </div>
          <span className="text-sm text-slate-500">{community.members} members</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const StatusContent = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span className="font-medium text-green-700 dark:text-green-300">All Systems Operational</span>
    </div>
    <div className="space-y-2">
      {[
        { service: 'API', status: 'operational', uptime: '99.99%' },
        { service: 'Web App', status: 'operational', uptime: '99.95%' },
        { service: 'Database', status: 'operational', uptime: '99.99%' },
        { service: 'Payment Gateway', status: 'operational', uptime: '99.90%' },
        { service: 'Email Service', status: 'operational', uptime: '99.85%' },
      ].map((service) => (
        <div key={service.service} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{service.service}</span>
          </div>
          <span className="text-xs text-slate-500">{service.uptime}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-slate-400 text-center">Last updated: Just now</p>
  </div>
);

const PrivacyPolicyContent = () => (
  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
    <div className="flex items-center gap-2 text-brand-600">
      <Shield className="w-5 h-5" />
      <span className="font-bold">Privacy Policy</span>
    </div>
    <p>Last updated: December 1, 2025</p>
    <div className="space-y-3">
      <div><strong className="text-slate-900 dark:text-white">Data Collection:</strong> We collect information you provide directly, including name, email, and business information.</div>
      <div><strong className="text-slate-900 dark:text-white">Data Usage:</strong> Your data is used to provide and improve our services, process transactions, and communicate with you.</div>
      <div><strong className="text-slate-900 dark:text-white">Data Protection:</strong> We implement industry-standard security measures including encryption and secure servers.</div>
      <div><strong className="text-slate-900 dark:text-white">Your Rights:</strong> You can access, update, or delete your personal data at any time through your account settings.</div>
    </div>
  </div>
);

const TermsContent = () => (
  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
    <div className="flex items-center gap-2 text-brand-600">
      <Scale className="w-5 h-5" />
      <span className="font-bold">Terms of Service</span>
    </div>
    <p>Last updated: December 1, 2025</p>
    <div className="space-y-3">
      <div><strong className="text-slate-900 dark:text-white">Acceptance:</strong> By using muktiAp, you agree to these terms and our privacy policy.</div>
      <div><strong className="text-slate-900 dark:text-white">Account:</strong> You are responsible for maintaining the security of your account and all activities under it.</div>
      <div><strong className="text-slate-900 dark:text-white">Usage:</strong> You agree to use our services only for lawful purposes and in accordance with these terms.</div>
      <div><strong className="text-slate-900 dark:text-white">Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.</div>
    </div>
  </div>
);

const CookiePolicyContent = () => (
  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
    <div className="flex items-center gap-2 text-brand-600">
      <Cookie className="w-5 h-5" />
      <span className="font-bold">Cookie Policy</span>
    </div>
    <p>Last updated: December 1, 2025</p>
    <div className="space-y-3">
      <div><strong className="text-slate-900 dark:text-white">Essential Cookies:</strong> Required for basic site functionality and security.</div>
      <div><strong className="text-slate-900 dark:text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website.</div>
      <div><strong className="text-slate-900 dark:text-white">Preference Cookies:</strong> Remember your settings and preferences.</div>
      <div><strong className="text-slate-900 dark:text-white">Managing Cookies:</strong> You can control cookies through your browser settings.</div>
    </div>
  </div>
);

type ModalType = 'api' | 'roadmap' | 'changelog' | 'about' | 'careers' | 'blog' | 'contact' | 'documentation' | 'helpCenter' | 'community' | 'status' | 'privacy' | 'terms' | 'cookies' | null;

export const Footer: React.FC<FooterProps> = ({ onPartnerClick }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const currentYear = new Date().getFullYear();

  const modalConfig: Record<Exclude<ModalType, null>, { title: string; content: React.ReactNode }> = {
    api: { title: 'API Documentation', content: <APIContent /> },
    roadmap: { title: 'Product Roadmap', content: <RoadmapContent /> },
    changelog: { title: 'Changelog', content: <ChangelogContent /> },
    about: { title: 'About Us', content: <AboutUsContent /> },
    careers: { title: 'Careers', content: <CareersContent /> },
    blog: { title: 'Blog', content: <BlogContent /> },
    contact: { title: 'Contact Us', content: <ContactContent /> },
    documentation: { title: 'Documentation', content: <DocumentationContent /> },
    helpCenter: { title: 'Help Center', content: <HelpCenterContent /> },
    community: { title: 'Community', content: <CommunityContent /> },
    status: { title: 'System Status', content: <StatusContent /> },
    privacy: { title: 'Privacy Policy', content: <PrivacyPolicyContent /> },
    terms: { title: 'Terms of Service', content: <TermsContent /> },
    cookies: { title: 'Cookie Policy', content: <CookiePolicyContent /> },
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'API', modal: 'api' as ModalType },
      { label: 'Roadmap', modal: 'roadmap' as ModalType },
      { label: 'Changelog', modal: 'changelog' as ModalType },
    ],
    company: [
      { label: 'About Us', modal: 'about' as ModalType },
      { label: 'Partner with Us', onClick: onPartnerClick },
      { label: 'Careers', modal: 'careers' as ModalType, badge: 'Hiring' },
      { label: 'Blog', modal: 'blog' as ModalType },
      { label: 'Contact', modal: 'contact' as ModalType },
    ],
    resources: [
      { label: 'Documentation', modal: 'documentation' as ModalType },
      { label: 'Help Center', modal: 'helpCenter' as ModalType },
      { label: 'Community', modal: 'community' as ModalType },
      { label: 'Status', modal: 'status' as ModalType },
    ],
    // legal: [
    //   { label: 'Privacy Policy', modal: 'privacy' as ModalType },
    //   { label: 'Terms of Service', modal: 'terms' as ModalType },
    //   { label: 'Cookie Policy', modal: 'cookies' as ModalType },
    // ],
  };

  const socialLinks = [
    { icon: '𝕏', href: '#', label: 'Twitter' },
    { icon: 'in', href: '#', label: 'LinkedIn' },
    { icon: '⌘', href: '#', label: 'GitHub' },
    { icon: '✉', href: '#', label: 'Email' },
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Modals */}
      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={modalConfig[activeModal].title}
          size="lg"
        >
          {modalConfig[activeModal].content}
        </Modal>
      )}

      <footer className="relative bg-gradient-to-b from-white to-slate-50 dark:from-dark-900 dark:to-dark-800 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-200/20 dark:bg-brand-500/5 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.25, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         

          {/* Stats Section */}
          <motion.div 
            className="py-12 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[
              { value: '500+', label: 'Active Businesses', icon: '🏢' },
              { value: '50K+', label: 'Transactions/Day', icon: '💳' },
              { value: '99.9%', label: 'Uptime', icon: '⚡' },
              { value: '24/7', label: 'Support', icon: '🛟' },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Footer Content */}
          <motion.div 
            className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Brand Column */}
            <motion.div 
              className="col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6 group cursor-pointer" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  m
                </motion.div>
                <span className="font-bold text-2xl text-slate-900 dark:text-white">muktiAp</span>
              </motion.div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                Empowering Ethiopian businesses with intelligent, local-first technology. The future of ERP is here.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3 mb-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-colors font-bold text-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>

              {/* App Download Badges */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-400 mb-1">Coming Soon</p>
                <div className="flex gap-2">
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-white">
                      <div className="text-[8px] leading-none">Download on</div>
                      <div className="text-xs font-semibold leading-none">App Store</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.219-.738 1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                    </svg>
                    <div className="text-white">
                      <div className="text-[8px] leading-none">Get it on</div>
                      <div className="text-xs font-semibold leading-none">Google Play</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + categoryIndex * 0.1 }}
              >
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 capitalize">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <motion.li 
                      key={link.label}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      {'href' in link && link.href ? (
                        <a href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
                          {link.label}
                          {'badge' in link && link.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-600 rounded-full">{link.badge}</span>
                          )}
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            if ('modal' in link && link.modal) {
                              setActiveModal(link.modal);
                            } else if ('onClick' in link && link.onClick) {
                              link.onClick();
                            }
                          }}
                          className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1"
                        >
                          {link.label}
                          {'badge' in link && link.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-600 rounded-full">{link.badge}</span>
                          )}
                        </button>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Bar */}
          <motion.div 
            className="py-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>© {currentYear} muktiAp. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1">
                Made with <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}><Heart className="w-4 h-4 text-red-500 fill-red-500" /></motion.span> in Ethiopia
              </span>
            </div>
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setActiveModal('privacy')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">Privacy</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setActiveModal('terms')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">Terms</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setActiveModal('cookies')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">Cookies</motion.button>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
};