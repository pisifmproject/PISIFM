
import React from 'react';
import { Project, User } from '../../types';
import { Calendar, User as UserIcon, MoreHorizontal, ArrowRight, MapPin } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick }) => {
    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Delayed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {projects.map(project => (
                        <tr key={project.id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-200 cursor-pointer" onClick={() => onProjectClick(project)}>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.name}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {project.location}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.status)} shadow-sm`}>
                                    {project.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${project.status === 'Delayed' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{project.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                                        {project.assignee.charAt(0)}
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[100px] font-medium">{project.assignee}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                {new Date(project.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200">
                                    <ArrowRight size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectList;
