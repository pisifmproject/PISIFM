import React, { useMemo } from 'react';
import { User, Project } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search, Info } from 'lucide-react';

interface ResourceGanttProps {
    users: User[];
    projects: Project[];
}

const ResourceGantt: React.FC<ResourceGanttProps> = ({ users, projects }) => {
    // Generate dates for current month + next month (total 60 days)
    const dates = useMemo(() => {
        const result = [];
        const start = new Date();
        start.setDate(1); // Start from beginning of current month
        start.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            result.push(date);
        }
        return result;
    }, []);

    const monthGroups = useMemo(() => {
        const groups: { month: string; days: number }[] = [];
        dates.forEach(date => {
            const monthName = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.month === monthName) {
                lastGroup.days++;
            } else {
                groups.push({ month: monthName, days: 1 });
            }
        });
        return groups;
    }, [dates]);

    const getDayOffset = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        const start = dates[0];
        const diffTime = d.getTime() - start.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDurationDays = (startStr: string, endStr: string) => {
        const s = new Date(startStr);
        const e = new Date(endStr);
        const diffTime = Math.abs(e.getTime() - s.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const todayOffset = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return getDayOffset(now.toISOString());
    }, [dates]);

    const getProjectColor = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return 'bg-slate-400';
        switch (project.priority) {
            case 'High': return 'bg-indigo-600';
            case 'Medium': return 'bg-blue-500';
            case 'Low': return 'bg-teal-500';
            default: return 'bg-indigo-600';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px] animate-fadeIn">
            {/* Gantt Header */}
            <div className="px-10 py-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                <div className="flex items-center gap-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">RESOURCE ALLOCATION FLOWMAP</h3>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">Real-time Engineering Deployment</p>
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner">
                        <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><ChevronLeft size={16} className="text-slate-400" /></button>
                        <span className="text-[10px] font-black px-4 text-slate-600 dark:text-slate-300 uppercase tracking-widest">{monthGroups[0].month} - {monthGroups[1]?.month}</span>
                        <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><ChevronRight size={16} className="text-slate-400" /></button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Engineer..."
                            className="pl-11 pr-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 w-56 font-bold dark:text-white transition-all"
                        />
                    </div>
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-700 shadow-sm">
                        <Filter size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Gantt Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="min-w-[2600px] h-full flex flex-col font-sans">
                    {/* Time Header */}
                    <div className="flex sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
                        <div className="w-80 flex-shrink-0 border-r border-gray-100 dark:border-slate-800 p-6 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engineer / Specialist</span>
                            <Info size={14} className="text-slate-300" />
                        </div>
                        <div className="flex-1">
                            <div className="flex h-12 border-b border-gray-50 dark:border-slate-800">
                                {monthGroups.map((group, i) => (
                                    <div
                                        key={i}
                                        className="border-r border-gray-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
                                        style={{ width: `${group.days * 40}px` }}
                                    >
                                        {group.month}
                                    </div>
                                ))}
                            </div>
                            <div className="flex h-10">
                                {dates.map((date, i) => {
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    const isToday = todayOffset === i;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-10 flex-shrink-0 border-r border-gray-50/50 dark:border-slate-800/30 flex flex-col items-center justify-center text-[9px] font-black transition-colors ${isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/10 text-slate-300' : 'text-slate-400'} ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''}`}
                                        >
                                            {date.getDate()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Resources Rows */}
                    <div className="flex-1">
                        {users.map(user => (
                            <div key={user.id} className="flex border-b border-gray-50 dark:border-slate-800/30 hover:bg-slate-50/30 dark:hover:bg-indigo-900/5 transition-all group h-20">
                                <div className="w-80 flex-shrink-0 border-r border-gray-100 dark:border-slate-800 p-6 flex items-center gap-4 bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-indigo-950/20 transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                        {user.avatar}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate tracking-tight">{user.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{user.jobTitle}</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    {/* Background Grid Lines rendered only once typically, but here for each row for easy weekend visualization */}
                                    <div className="absolute inset-0 flex">
                                        {dates.map((date, i) => {
                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                            return <div key={i} className={`w-10 flex-shrink-0 border-r border-gray-50/30 dark:border-slate-800/10 h-full ${isWeekend ? 'bg-slate-50/20 dark:bg-slate-800/5' : ''}`} />;
                                        })}
                                    </div>

                                    {/* Allocation Bars */}
                                    {user.assignments?.map((assignment) => {
                                        const startIdx = getDayOffset(assignment.startDate);
                                        const totalDays = getDurationDays(assignment.startDate, assignment.endDate);
                                        const project = projects.find(p => p.id === assignment.projectId);

                                        // Only render if within visible window
                                        if (startIdx + totalDays < 0 || startIdx >= dates.length) return null;

                                        const visibleStart = Math.max(0, startIdx);
                                        const visibleEnd = Math.min(dates.length, startIdx + totalDays);
                                        const visibleWidth = (visibleEnd - visibleStart) * 40;
                                        const visibleLeft = visibleStart * 40;

                                        return (
                                            <div
                                                key={assignment.projectId}
                                                title={`${project?.name || assignment.projectId}: ${assignment.startDate} to ${assignment.endDate}`}
                                                className={`absolute top-5 h-10 rounded-[1.25rem] flex items-center px-4 text-[10px] font-black text-white shadow-xl shadow-indigo-500/10 overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group/bar z-10 ${getProjectColor(assignment.projectId)}`}
                                                style={{
                                                    left: `${visibleLeft}px`,
                                                    width: `${visibleWidth}px`,
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                                <div className="flex items-center gap-2 truncate relative z-10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    <span className="truncate uppercase tracking-wider">{project?.name || assignment.projectId}</span>
                                                </div>
                                                <div className="ml-auto flex items-center gap-2 opacity-50 group-hover/bar:opacity-100 transition-opacity shrink-0">
                                                    <span className="bg-black/20 px-2 py-0.5 rounded-full font-black text-[8px] uppercase">{project?.status || 'Active'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Today Marker */}
                    {todayOffset >= 0 && todayOffset < dates.length && (
                        <div
                            className="absolute top-0 bottom-0 w-[3px] bg-red-500 z-40 pointer-events-none"
                            style={{ left: `${(320 + todayOffset * 40)}px` }}
                        >
                            <div className="sticky top-[108px] -left-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-white dark:border-slate-900 shadow-xl" />
                            <div className="h-full bg-gradient-to-b from-red-500 to-transparent opacity-20" />
                        </div>
                    )}
                </div>
            </div>

            {/* Legend / Footer */}
            <div className="px-10 py-6 border-t border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">High Strategic</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/20" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Operational Build</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-lg bg-teal-500 shadow-lg shadow-teal-500/20" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Support / Maintenance</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap">Neural Sync Established v2.04</span>
                </div>
            </div>
        </div>
    );
};

export default ResourceGantt;
