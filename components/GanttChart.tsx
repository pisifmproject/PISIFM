import React, { useState } from 'react';
import { User, Project } from '../types';
import { ChevronLeft, ChevronRight, Users, Calendar, ZoomIn, ZoomOut } from 'lucide-react';

interface GanttChartProps {
    users: User[];
    projects: Project[];
}

interface AllocationEntry {
    userId: string;
    userName: string;
    projectId: string;
    projectName: string;
    startDate: Date;
    endDate: Date;
    allocation: number; // percentage 0-100
}

const GanttChart: React.FC<GanttChartProps> = ({ users, projects }) => {
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generate mock allocations based on projects
    const generateAllocations = (): AllocationEntry[] => {
        const allocations: AllocationEntry[] = [];

        projects.forEach(project => {
            const assignedUser = users.find(u => u.name === project.assignee || u.id === project.assignee);
            if (assignedUser) {
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                const endDate = new Date(project.dueDate);

                allocations.push({
                    userId: assignedUser.id,
                    userName: assignedUser.name,
                    projectId: project.id,
                    projectName: project.name,
                    startDate,
                    endDate,
                    allocation: Math.min(100, (project.progress || 50) + 20)
                });
            }
        });

        return allocations;
    };

    const allocations = generateAllocations();

    // Get date range based on view mode
    const getDateRange = () => {
        const start = new Date(currentDate);
        const end = new Date(currentDate);

        switch (viewMode) {
            case 'week':
                start.setDate(start.getDate() - start.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'month':
                start.setDate(1);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                break;
            case 'quarter':
                start.setMonth(Math.floor(start.getMonth() / 3) * 3);
                start.setDate(1);
                end.setMonth(start.getMonth() + 3);
                end.setDate(0);
                break;
        }

        return { start, end };
    };

    const { start: rangeStart, end: rangeEnd } = getDateRange();

    // Generate column headers
    const generateColumns = () => {
        const columns: { label: string; date: Date }[] = [];
        const current = new Date(rangeStart);

        while (current <= rangeEnd) {
            if (viewMode === 'week') {
                columns.push({
                    label: current.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                    date: new Date(current)
                });
                current.setDate(current.getDate() + 1);
            } else if (viewMode === 'month') {
                columns.push({
                    label: current.getDate().toString(),
                    date: new Date(current)
                });
                current.setDate(current.getDate() + 1);
            } else {
                columns.push({
                    label: current.toLocaleDateString('en-US', { month: 'short' }),
                    date: new Date(current)
                });
                current.setMonth(current.getMonth() + 1);
            }
        }

        return columns;
    };

    const columns = generateColumns();

    // Calculate bar position and width
    const calculateBarStyle = (allocation: AllocationEntry) => {
        const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
        const startOffset = Math.max(0, (allocation.startDate.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
        const endOffset = Math.min(totalDays, (allocation.endDate.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.max(0, endOffset - startOffset);

        const leftPercent = (startOffset / totalDays) * 100;
        const widthPercent = (duration / totalDays) * 100;

        return {
            left: `${leftPercent}%`,
            width: `${Math.max(widthPercent, 2)}%`
        };
    };

    // Get color based on allocation percentage
    const getBarColor = (allocation: number) => {
        if (allocation >= 90) return 'bg-gradient-to-r from-red-500 to-red-600';
        if (allocation >= 70) return 'bg-gradient-to-r from-amber-500 to-orange-500';
        if (allocation >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-600';
        return 'bg-gradient-to-r from-emerald-500 to-green-600';
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        switch (viewMode) {
            case 'week':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
                break;
            case 'quarter':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
                break;
        }
        setCurrentDate(newDate);
    };

    // Group allocations by user
    const allocationsByUser = users.map(user => ({
        user,
        allocations: allocations.filter(a => a.userId === user.id)
    }));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn">
            {/* Header Controls */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-slate-100">Resource Allocation Timeline</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                {rangeStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                {viewMode === 'quarter' && ` - ${rangeEnd.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Mode Selector */}
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                            {(['week', 'month', 'quarter'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === mode
                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => navigateDate('prev')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <ChevronLeft size={20} className="text-gray-500" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => navigateDate('next')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <ChevronRight size={20} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gantt Chart Body */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Column Headers */}
                    <div className="flex border-b border-gray-100 dark:border-slate-800">
                        <div className="w-56 shrink-0 p-4 bg-gray-50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-800">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Team Member</span>
                        </div>
                        <div className="flex-1 flex">
                            {columns.map((col, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 p-2 text-center text-[10px] font-bold border-r border-gray-50 dark:border-slate-800 ${col.date.toDateString() === new Date().toDateString()
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {col.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Rows */}
                    {allocationsByUser.map(({ user, allocations: userAllocations }) => (
                        <div key={user.id} className="flex border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            {/* User Info */}
                            <div className="w-56 shrink-0 p-4 border-r border-gray-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {user.avatar}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{user.jobTitle}</p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 relative h-20 bg-gray-50/30 dark:bg-slate-900/30">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex">
                                    {columns.map((col, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex-1 border-r border-gray-100/50 dark:border-slate-800/50 ${col.date.toDateString() === new Date().toDateString()
                                                    ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                                    : ''
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Allocation Bars */}
                                {userAllocations.map((allocation, idx) => {
                                    const style = calculateBarStyle(allocation);
                                    return (
                                        <div
                                            key={idx}
                                            className={`absolute top-4 h-12 ${getBarColor(allocation.allocation)} rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group`}
                                            style={style}
                                            title={`${allocation.projectName} (${allocation.allocation}%)`}
                                        >
                                            <div className="px-3 h-full flex items-center overflow-hidden">
                                                <span className="text-[10px] font-bold text-white truncate">
                                                    {allocation.projectName}
                                                </span>
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                                <p>{allocation.projectName}</p>
                                                <p className="text-slate-400 text-[10px]">{allocation.allocation}% allocated</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Empty State */}
                                {userAllocations.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs text-gray-300 dark:text-slate-600 font-medium">No allocations</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilization Level:</span>
                    <div className="flex items-center gap-4">
                        {[
                            { color: 'bg-emerald-500', label: '< 50%' },
                            { color: 'bg-blue-500', label: '50-70%' },
                            { color: 'bg-amber-500', label: '70-90%' },
                            { color: 'bg-red-500', label: '> 90%' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${item.color}`} />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
