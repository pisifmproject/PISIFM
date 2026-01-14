
import React, { useState, useRef, useEffect } from 'react';
import { User, Project } from '../types';
import { getGeminiResponse, ChatMessage as GeminiChatMessage } from '../services/geminiService';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Zap,
  FileText,
  ShieldAlert,
  LineChart,
  Paperclip,
  X,
  FileSpreadsheet,
  FileSearch,
  Check,
  AlertCircle,
  FileCode,
  ChevronDown,
  Hammer,
  MapPin,
  ClipboardList,
  Target
} from 'lucide-react';

interface AICopilotViewProps {
  user: User;
  projects: Project[];
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const AICopilotView: React.FC<AICopilotViewProps> = ({ user, projects }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello ${user.name.split(' ')[0]}! I'm your Engineering Copilot powered by Gemini AI. I can help you analyze project data, draft reports, or provide technical guidance based on our current ${projects.length} active projects.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showJobSelectorHint, setShowJobSelectorHint] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context for Gemini
      const contextString = selectedProject ? `
        CURRENT PROJECT TECHNICAL CONTEXT:
        - IDENTIFIER: ${selectedProject.id}
        - NAME: ${selectedProject.name}
        - LOCATION: ${selectedProject.location}
        - CURRENT STATUS: ${selectedProject.status}
        - PHYSICAL PROGRESS: ${selectedProject.progress}%
        - STRATEGIC PRIORITY: ${selectedProject.priority}
        - RISK ASSESSMENT: ${selectedProject.riskLevel}
        - AUTHORIZED BUDGET: $${selectedProject.budget.toLocaleString()}
        - ACTUAL SPENT: $${selectedProject.spent.toLocaleString()}
        - COMMITTED PO: $${selectedProject.committed.toLocaleString()}
        - TARGET ROI: ${selectedProject.targetROI}%
        - CAPEX CATEGORY: ${selectedProject.capexCategory}
      ` : 'Note: No specific project context selected. Provide general engineering guidance.';

      const systemInstruction = `
        You are the PISIFM Engineering Intelligence (v1.5 Flash), an elite Project & Engineering Department Assistant for PT. Indofood Fortuna Makmur.
        Your interface is being accessed by ${user.name}, who holds the rank of ${user.jobTitle} (Clearance: ${user.jobGrade || 'L1'}).
        
        ${contextString}

        CORE PROTOCOLS:
        1. DATA PRECISION: When a project is selected, always reference its financials and progress in your analysis.
        2. TECHNICAL AUTHORITY: Provide specific engineering advice (Civil, Mechanical, Electrical, Automation) consistent with the CAPEX category.
        3. STRATEGIC INSIGHT: Correlate progress with budget utilization. If progress is low but spend is high, flag it as an efficiency risk.
        4. TONE: Professional, concise, data-driven, and highly supportive. Use bold text for key metrics.
        5. LINGUISTIC: Primarily English, but understand Indonesian engineering terminology.
      `;

      // Convert history to Gemini format
      const history: GeminiChatMessage[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: text }] });

      const response = await getGeminiResponse(history, systemInstruction);

      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "SYSTEM ERROR: I encountered a neural sync disruption. Please check your network or API configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ icon: Icon, label, description, prompt }: any) => (
    <button
      onClick={() => handleSendMessage(prompt)}
      className="flex flex-col items-start p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <span className="text-xs font-black text-slate-800 dark:text-white mb-1 uppercase tracking-wider">{label}</span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Engineering Copilot</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.5 Flash Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Context Engine</span>
              <div className="relative">
                <select
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border-none outline-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 w-64 appearance-none pr-10 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <option value="">Select Project Context...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Message View */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scroll-smooth hide-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                ${m.role === 'model' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}
              `}>
                {m.role === 'model' ? <Bot size={20} className="text-white" /> : <UserIcon size={20} className="text-slate-500" />}
              </div>
              <div className={`max-w-[70%] space-y-2 ${m.role === 'user' ? 'items-end' : ''}`}>
                <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm
                  ${m.role === 'model'
                    ? 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                  }
                `}>
                  {m.content}
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                  {m.role === 'model' ? 'Copilot AI' : user.name} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/50 flex items-center justify-center shrink-0">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-8 pb-8 pt-4 shrink-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -top-12 left-0 right-0 flex justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
              <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                <Zap size={10} className="text-yellow-400" /> Neural Link Established
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2rem] p-3 shadow-2xl focus-within:border-indigo-500 transition-all">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400 hover:text-indigo-600"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Consult with Engineering Intelligence...`}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium dark:text-white placeholder-slate-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel - Quick Actions */}
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 p-8 hidden xl:flex flex-col gap-8 shrink-0">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Expert Protocols</h3>
          <div className="space-y-4">
            <QuickAction
              icon={Hammer}
              label="Draft DAR"
              description="Daily Activity Report generator."
              prompt="Based on the active project context, please draft a detailed Daily Activity Report. Include sections for Work Done, Safety Precautions, and Material usage."
            />
            <QuickAction
              icon={FileSpreadsheet}
              label="Data Trends"
              description="Analyze project technical logs."
              prompt="Identify potential performance anomalies or delays in the current project progress data."
            />
            <QuickAction
              icon={Target}
              label="ROI Analysis"
              description="Evaluate project performance."
              prompt="Analyze the Target ROI and budget utilization of the current project and suggest optimizations."
            />
            <QuickAction
              icon={LineChart}
              label="KPI Forecast"
              description="Project score improvements."
              prompt={`As a ${user.jobTitle}, if I improve technical documentation quality by 25%, how will it impact our project performance scores?`}
            />
          </div>
        </div>

        <div className="mt-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-indigo-500">
            <ShieldAlert size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Enclave</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Project data and files remain within the secure session layer. Analysis is performed in real-time without external persistence.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
    </div>
  );
};

export default AICopilotView;