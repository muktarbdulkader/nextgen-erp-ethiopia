import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGeminiStream } from '../services/geminiService';
import { Message, Attachment, User } from '../types';
import { Button } from './ui/Button';
import { Send, Bot, Sparkles, Loader2, Paperclip, X, FileText, Image as ImageIcon, Trash2, Globe } from 'lucide-react';

interface AIDemoProps {
    onClose?: () => void;
    user?: User | null;
}

export const AIDemo: React.FC<AIDemoProps> = ({ onClose, user }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'AM' | 'OR'>('EN');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with personalized message if user exists
  const companyName = user?.companyName || 'your business';
  const initialMessage = `Selam ${user?.firstName || ''}! I am Mukti. I'm ready to help "${companyName}" with insights, EFY 2017 tax regulations, and inventory management.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: initialMessage,
      timestamp: new Date()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, attachment, isLoading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    // Validate size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: language === 'AM' ? `ሰላም ${user?.firstName || ''}! እንዴት ልርዳዎት?` : language === 'OR' ? `Akkam ${user?.firstName || ''}! Maal isin gargaaruu?` : initialMessage,
        timestamp: new Date()
      }
    ]);
  };

  const toggleLanguage = () => {
      setLanguage(prev => {
          if (prev === 'EN') return 'AM';
          if (prev === 'AM') return 'OR';
          return 'EN';
      });
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const currentAttachment = attachment;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      attachment: currentAttachment ? { ...currentAttachment } : undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      // Create a placeholder for the bot message
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: new Date()
      }]);

      const stream = sendMessageToGeminiStream(
        userMsg.content, 
        messages, // Pass history
        currentAttachment ? { mimeType: currentAttachment.type, data: currentAttachment.data } : undefined,
        language
      );
      
      let fullContent = '';
      let isFirstChunk = true;

      for await (const chunk of stream) {
        if (isFirstChunk) {
            setIsLoading(false); // Stop "Thinking" indicator as soon as text starts
            isFirstChunk = false;
        }
        fullContent += chunk;
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, content: fullContent } : msg
        ));
      }
      
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={16} />;
    if (mimeType.includes('pdf')) return <FileText size={16} />;
    return <Paperclip size={16} />;
  };

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-dark-800 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-brand-500/10 backdrop-blur-sm border-2 border-dashed border-brand-500 flex items-center justify-center">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
              <Sparkles className="w-12 h-12 text-brand-500 mb-2" />
              <p className="font-bold text-brand-600 dark:text-brand-400">Drop file here to analyze</p>
            </div>
          </div>
        )}

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mukti AI • Online</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
                  title="Switch Language"
                >
                  <Globe size={12} />
                  <span>{language}</span>
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                <button 
                    onClick={handleClearChat} 
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Clear Chat"
                >
                    <Trash2 size={16} />
                </button>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1">
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-dark-900/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.attachment && (
                <div className={`mb-1 p-2 rounded-xl border flex items-center gap-3 w-fit max-w-[85%] ${
                    msg.role === 'user' 
                    ? 'bg-brand-700 border-brand-600 text-white' 
                    : 'bg-white dark:bg-dark-700 border-slate-200 dark:border-slate-600'
                }`}>
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getFileIcon(msg.attachment.type)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium truncate max-w-[150px]">{msg.attachment.name}</p>
                      <p className="text-[10px] opacity-70 uppercase">Attachment</p>
                    </div>
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-600'
                } ${language !== 'EN' && msg.role === 'model' ? 'ethiopic-text' : ''}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-dark-700 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Mukti is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-dark-800 border-t border-slate-200 dark:border-slate-700">
          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-3 flex items-start">
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-dark-700 pl-3 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-600 animate-fade-in-up">
                <div className="p-1.5 bg-white dark:bg-dark-600 rounded-lg text-brand-600">
                   {getFileIcon(attachment.type)}
                </div>
                <div className="mr-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{attachment.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{attachment.type.split('/')[1]}</p>
                </div>
                <button 
                  onClick={() => setAttachment(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-dark-600 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
             />
             <button 
                className="p-2.5 text-slate-400 hover:text-brand-500 bg-slate-100 dark:bg-dark-900 rounded-xl transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/10" 
                title="Upload PDF or Image"
                onClick={() => fileInputRef.current?.click()}
             >
                <Paperclip size={18} />
             </button>
             <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={attachment ? "Ask about this file..." : language === 'AM' ? "ጠይቅ..." : language === 'OR' ? "Gaaffii..." : "Ask Mukti..."}
                  className={`w-full pl-3 pr-2 py-2.5 bg-slate-100 dark:bg-dark-900 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-dark-900 focus:ring-0 rounded-xl text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${language === 'AM' ? 'ethiopic-text' : ''}`}
                />
             </div>
            <Button 
              onClick={handleSend} 
              disabled={isLoading || (!input.trim() && !attachment)}
              className="rounded-xl w-10 h-10 p-0 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
    </div>
  );
};