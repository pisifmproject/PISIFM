import React, { useState } from 'react';
import { User, Project } from '../types';
import ResourceGantt from './ResourceGantt';
import {
   Users, BrainCircuit, BarChart3, Clock,
   Search, ArrowRight, TrendingUp,
   Briefcase, Star, Target, Layers,
   ShieldCheck, Activity, Award, ClipboardList,
   Plus, Calendar, Timer, Send, CheckCircle, Info, Zap
} from 'lucide-react';
import {
   Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

interface ResourcePlanningProps {
   currentUser: User;
   users: User[];
   projects: Project[];
}

const ResourcePlanningView: React.FC<ResourcePlanningProps> = ({ currentUser, users, projects }) => {
   const [activeTab, setActiveTab] = useState<'talent' | 'workload' | 'log' | 'gantt'>('talent');
   const [searchTerm, setSearchTerm] = useState('');

   // Activity Log State
   const [logEntry, setLogEntry] = useState({
      projectId: '',
      hours: 8,
      description: '',
      date: new Date().toISOString().split('T')[0]
   });

   const filteredUsers = users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleLogSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Activity logged for ${logEntry.hours}h on Project ID: ${logEntry.projectId}. KPI scoring updated in real-time.`);
      setLogEntry({ ...logEntry, description: '' });
   };

   const renderTalentDirectory = () => (
      <div className="space-y-8 animate-fadeIn">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input type="text" placeholder="Filter talent by name, role, or NIK..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 font-bold text-sm shadow-inner transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">Provision New Talent</button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredUsers.map(user => (
               <div key={user.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                  <div className="h-24 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase border border-white/20">L3 CLEARANCE</span>
                     </div>
                  </div>
                  <div className="px-8 pb-8">
                     <div className="relative -mt-12 mb-6 flex justify-between items-end">
                        <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                           <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">{user.avatar}</div>
                        </div>
                        <div className={`mb-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.workloadScore && user.workloadScore > 85 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {user.workloadScore && user.workloadScore > 85 ? 'Overloaded' : 'Optimal'}
                        </div>
                     </div>
                     <h4 className="font-black text-gray-900 dark:text-slate-100 text-xl leading-tight">{user.name}</h4>
                     <div className="flex flex-col mt-1">
                        <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">{user.jobRole || user.jobTitle}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{user.department || 'Engineering'}</p>
                     </div>
                     {user.motto && (
                        <p className="mt-4 text-xs italic text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border-l-4 border-indigo-500">
                           "{user.motto}"
                        </p>
                     )}

                     <div className="mt-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Layers size={10} /> Utilization</p>
                              <p className={`text-lg font-black ${user.workloadScore && user.workloadScore > 85 ? 'text-rose-600' : 'text-indigo-600'}`}>{user.workloadScore}%</p>
                           </div>
                           <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Star size={10} /> Performance</p>
                              <p className="text-lg font-black text-gray-800 dark:text-slate-200">Exceed</p>
                           </div>
                        </div>
                     </div>

                     <button onClick={() => setActiveTab('log')} className="w-full mt-8 py-4 bg-gray-900 dark:bg-indigo-600 dark:text-white text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">Audit Timesheet <ArrowRight size={14} /></button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );

   const renderWorkloadMatrix = () => {
      const skillsData = [
         { subject: 'Civil', A: 80, fullMark: 100 },
         { subject: 'Mechanical', A: 95, fullMark: 100 },
         { subject: 'Electrical', A: 70, fullMark: 100 },
         { subject: 'Automation', A: 60, fullMark: 100 },
         { subject: 'Project Mgmt', A: 85, fullMark: 100 },
      ];

      const workloadData = users.map(u => ({
         name: u.name.split(' ')[0],
         score: u.workloadScore || 0,
         fill: (u.workloadScore || 0) > 85 ? '#ef4444' : '#6366f1'
      }));

      return (
         <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Team Domain Strength */}
               <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <BrainCircuit size={120} />
                  </div>
                  <div className="relative z-10 mb-8">
                     <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">Team Domain Strength</h3>
                     <p className="text-xs text-gray-500 mt-1">Aggregated technical competency across multiple disciplines.</p>
                  </div>
                  <div className="h-80 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                           <PolarGrid stroke="#e2e8f0" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Team Avg" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Individual Workload Intensity */}
               <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">Workload Intensity</h3>
                        <p className="text-xs text-gray-500 mt-1">Current utilization levels per engineer based on active projects.</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                           <span className="text-[10px] font-black text-gray-400 uppercase">Critical</span>
                        </div>
                     </div>
                  </div>
                  <div className="h-80 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workloadData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                           <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                           <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} tick={{ fill: '#94a3b8' }} />
                           <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }} />
                           <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={40}>
                              {workloadData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Matrix Recommendations */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-md border border-white/20">
                     <ShieldCheck size={48} className="text-indigo-200" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-2xl font-black uppercase tracking-widest mb-4">Balancing Recommendations</h4>
                     <p className="text-sm font-medium opacity-90 leading-relaxed mb-6">System analyzes that <strong>mechanical</strong> workload is concentrated on a single supervisor. Redistribution to junior engineers is recommended for project sustainability.</p>
                     <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2">Execute Load Balance <Zap size={14} /></button>
                        <button className="bg-indigo-500/50 text-white border border-white/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/70 transition-all flex items-center gap-2">Review Detailed Report <Info size={14} /></button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const renderLogEntry = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-3">
                     <ClipboardList className="text-indigo-600" /> Daily Activity Logger
                  </h3>
               </div>
               <form onSubmit={handleLogSubmit} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Project Assignment</label>
                        <select required className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-100"
                           value={logEntry.projectId} onChange={e => setLogEntry({ ...logEntry, projectId: e.target.value })}>
                           <option value="">Select Project...</option>
                           {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Activity Date</label>
                        <input type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-slate-200 outline-none"
                           value={logEntry.date} onChange={e => setLogEntry({ ...logEntry, date: e.target.value })} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Billable Engineering Hours</label>
                        <span className="text-indigo-600 font-black">{logEntry.hours}h</span>
                     </div>
                     <input type="range" min="1" max="16" className="w-full h-2 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        value={logEntry.hours} onChange={e => setLogEntry({ ...logEntry, hours: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Task Summary (Engineer Report)</label>
                     <textarea required placeholder="Outline technical execution steps and outcomes..." className="w-full p-6 bg-gray-50 dark:bg-slate-800 border-none rounded-[2rem] font-medium dark:text-slate-200 min-h-[150px] focus:ring-4 focus:ring-indigo-100"
                        value={logEntry.description} onChange={e => setLogEntry({ ...logEntry, description: e.target.value })} />
                  </div>
                  <div className="flex justify-end pt-6 border-t dark:border-slate-800">
                     <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3">
                        <Send size={18} /> Transmit Activity Log
                     </button>
                  </div>
               </form>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <Target className="mb-6 opacity-60" size={32} />
               <h4 className="text-xl font-black uppercase tracking-widest mb-4">Workflow Baseline</h4>
               <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">Your daily logs are automatically correlated with Project Vault physical progress. Accuracy ensures high departmental KPI scoring.</p>
               <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase mb-1">Current Period Compliance</p>
                  <p className="text-2xl font-black">100%</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
               <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Recent Records</h4>
               <div className="space-y-6">
                  {[1, 2].map(i => (
                     <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0"><Timer size={18} /></div>
                        <div>
                           <p className="text-xs font-black text-gray-900 dark:text-slate-100">8.0h - Electrical Audit</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">CEA-1 • Feb 24, 2025</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto pb-12">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
               <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-xl">
                     <Users size={24} />
                  </div>
                  Talent Hub
               </h2>
               <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Engineer Daily Activity Logs & Individual Performance Telemetry.</p>
            </div>

            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors overflow-x-auto max-w-full">
               {[
                  { id: 'talent', label: 'Talent Directory', icon: Users },
                  { id: 'gantt', label: 'Gantt Flow', icon: Clock },
                  { id: 'log', label: 'Activity Log', icon: ClipboardList },
                  { id: 'workload', label: 'Workload Matrix', icon: BarChart3 }
               ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                     <tab.icon size={16} />
                     <span className="hidden xl:inline">{tab.label}</span>
                  </button>
               ))}
            </div>
         </div>

         <div className="transition-all duration-300">
            {activeTab === 'talent' && renderTalentDirectory()}
            {activeTab === 'gantt' && <ResourceGantt users={users} projects={projects} />}
            {activeTab === 'log' && renderLogEntry()}
            {activeTab === 'workload' && renderWorkloadMatrix()}
         </div>
      </div>
   );
};

export default ResourcePlanningView;
