import React from "react";
import { Project } from "../../types";
import { MoreHorizontal, Calendar, MapPin, AlertCircle } from "lucide-react";

interface ProjectBoardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onStatusChange: (id: string, status: Project["status"]) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({
  projects,
  onProjectClick,
  onStatusChange,
}) => {
  const columns: Project["status"][] = [
    "Planning",
    "In Progress",
    "Completed",
    "Delayed",
  ];

  // Status is now calculated on backend - drag and drop is disabled
  // Keeping the function signatures for compatibility but no-op implementation

  const getColumnColor = (status: Project["status"]) => {
    switch (status) {
      case "Planning":
        return "border-t-4 border-slate-400";
      case "In Progress":
        return "border-t-4 border-blue-500";
      case "Completed":
        return "border-t-4 border-green-500";
      case "Delayed":
        return "border-t-4 border-red-500";
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full custom-scrollbar">
      {columns.map((status) => (
        <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full">
          <div
            className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-800 mb-4 flex items-center justify-between ${getColumnColor(
              status
            )}`}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-700 dark:text-slate-200">
                {status}
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {projects.filter((p) => p.status === status).length}
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {projects
              .filter((p) => p.status === status)
              .map((project) => (
                <div
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter border border-gray-200 dark:border-slate-700">
                          {project.location}
                        </span>
                        {project.priority && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                              project.priority === "High"
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                : project.priority === "Medium"
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            }`}
                          >
                            {project.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    {project.status === "Delayed" && (
                      <AlertCircle
                        size={14}
                        className="text-red-500 animate-pulse"
                      />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.name}
                  </h4>

                  <div className="space-y-3">
                    {project.riskLevel && (
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            project.riskLevel === "High"
                              ? "bg-red-500 animate-ping"
                              : project.riskLevel === "Medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {project.riskLevel} Risk
                        </span>
                      </div>
                    )}

                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          project.status === "Delayed"
                            ? "bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-black shadow-md uppercase">
                            {project.assignee.charAt(0)}
                          </div>
                        </div>
                        <span className="font-bold text-[11px]">
                          {project.assignee.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[10px] bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-slate-800">
                        <Calendar size={12} className="text-blue-500" />{" "}
                        {new Date(project.dueDate).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectBoard;
