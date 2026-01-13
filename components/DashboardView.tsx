
import React from 'react';
import { User, JobAssignment, Project } from '../types';
import { MOCK_PROJECTS, MOCK_USERS_DB } from '../constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Clock, Briefcase, MapPin,
  Zap, Users, ArrowUpRight, Signal,
  AlertOctagon, TrendingDown, Award, BellRing,
  DollarSign, BarChart3, Calendar, ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  user: User;
  users: User[];
  jobs: JobAssignment[];
  projects: Project[];
  onNavigate: (path: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardView: React.FC<DashboardProps> = ({ user, users = [], jobs, projects, onNavigate }) => {

  const totalCapex = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const avgKpi = 88.2;
  const totalAlerts = projects.filter(p => p.status === 'Delayed' || p.spent > p.budget).length;
  const avgLoad = users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.workloadScore || 0), 0) / users.length) : 0;
  const StatCard = ({ title, value, subValue, icon: Icon, trend, colorClass, onClick }: any) => (
    <div
      onClick={onClick}
      className={`bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white/20 dark:border-slate-800/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-lg shadow-gray-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{value}</h4>
          {subValue && <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{subValue}</span>}
        </div>
      </div>
    </div>
  );

  const AlertCenter = () => {
    const delayedProjects = projects.filter(p => p.status === 'Delayed');
    const overBudgetProjects = projects.filter(p => p.spent > p.budget);
    const criticalTasks = jobs.filter(j => j.priority === 'High' && j.status === 'In Progress');

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <BellRing className="text-rose-500" />
            <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">Alert Center</h3>
          </div>
          <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-3 py-1 rounded-full">{delayedProjects.length + overBudgetProjects.length} CRITICAL ITEMS</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {delayedProjects.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/50 p-6 rounded-[2rem] flex gap-5 items-start shadow-sm border-l-8 border-l-rose-500 group hover:shadow-md transition-all">
              <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 rounded-2xl"><Clock className="animate-pulse" size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Schedule Delay</p>
                <h4 className="font-bold text-gray-900 dark:text-slate-100">{p.name}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-medium">Physical progress is 12% behind baseline schedule.</p>
                <button onClick={() => onNavigate('/projects')} className="mt-4 text-[10px] font-black text-rose-600 uppercase flex items-center gap-1 hover:underline">Re-baseline Schedule <ArrowUpRight size={12} /></button>
              </div>
            </div>
          ))}

          {overBudgetProjects.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/50 p-6 rounded-[2rem] flex gap-5 items-start shadow-sm border-l-8 border-l-amber-500 group hover:shadow-md transition-all">
              <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/20 rounded-2xl"><DollarSign className="animate-bounce" size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Budget Variance</p>
                <h4 className="font-bold text-gray-900 dark:text-slate-100">{p.name}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-medium">Actual spend exceeds authorized budget by ${(p.spent - p.budget).toLocaleString()}.</p>
                <button onClick={() => onNavigate('/finance')} className="mt-4 text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 hover:underline">Audit Transactions <ArrowUpRight size={12} /></button>
              </div>
            </div>
          ))}

          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="relative z-10">
              <ShieldAlert className="text-indigo-400 mb-4" size={24} />
              <h4 className="text-lg font-black uppercase tracking-widest">Bottleneck Warning</h4>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">System detects resource Dany Taufiq is handling 92% of high-priority electrical tasks. Redistribution recommended.</p>
              <button onClick={() => onNavigate('/resources')} className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Optimize Talent Hub</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const KPIBoard = () => {
    const sCurveData = [
      { name: 'Jan', planned: 10, actual: 12 },
      { name: 'Feb', planned: 25, actual: 22 },
      { name: 'Mar', planned: 45, actual: 40 },
      { name: 'Apr', planned: 70 },
      { name: 'May', planned: 90 },
      { name: 'Jun', planned: 100 },
    ];

    const achievementData = [
      { name: 'Civil', value: 85 },
      { name: 'Mechanical', value: 92 },
      { name: 'Electrical', value: 78 },
      { name: 'Safety', value: 100 },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex items-center gap-3 px-2">
          <BarChart3 className="text-indigo-600" />
          <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">KPI Board</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <TrendingUp size={120} className="text-indigo-600" />
            </div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Physical S-Curve Analytics</h3>
                <p className="text-xs text-gray-500 mt-1">Real-time gap analysis between Planned vs Actual physical progress.</p>
              </div>
              <div className="flex gap-4 text-[10px] font-black uppercase">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded"></div> <span>Planned</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded"></div> <span>Actual</span></div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sCurveData}>
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }} />
                  <Area type="monotone" dataKey="planned" stroke="#cbd5e1" fill="url(#colorPlanned)" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="actual" stroke="#6366f1" fillOpacity={0} strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap size={120} className="text-amber-500" />
            </div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Automated Discipline Scoring</h3>
                <p className="text-xs text-gray-500 mt-1">Cross-departmental performance metrics based on milestone delivery.</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={achievementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {achievementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-12 relative">
      <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none -z-10"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tighter">PEAK Command Center</h2>
          <div className="flex items-center gap-3 mt-2">
            <Signal size={16} className="text-emerald-500 animate-pulse" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Real-time Engineering Telemetry Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <Calendar size={18} className="text-indigo-600 ml-2" />
          <span className="text-xs font-black text-gray-700 dark:text-slate-300 pr-4 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Portfolio CAPEX" value={`$${(totalCapex / 1000).toFixed(0)}k`} subValue="USD" icon={Briefcase} colorClass="bg-indigo-600" />
        <StatCard title="Dept. KPI Avg" value={avgKpi} subValue="Points" icon={Award} trend={2.4} colorClass="bg-emerald-500" />
        <StatCard title="Alert Count" value={totalAlerts} subValue="Critical" icon={AlertOctagon} colorClass="bg-rose-500" onClick={() => { }} />
        <StatCard title="Resource Load" value={`${avgLoad}%`} subValue="Avg" icon={Users} colorClass="bg-blue-500" />
      </div>

      <AlertCenter />
      <KPIBoard />
    </div>
  );
};

export default DashboardView;
