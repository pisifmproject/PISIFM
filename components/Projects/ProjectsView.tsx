import React, { useState } from "react";
import { Project, User } from "../../types";
import { projectService } from "../../services/api";
import ProjectList from "./ProjectList";
import ProjectBoard from "./ProjectBoard";
import CreateProjectModal from "./CreateProjectModal";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
} from "lucide-react";

interface ProjectsViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentUser,
  projects,
  users,
  onNavigate,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Map user IDs to user names for display
  const projectsWithUserNames = projects.map((project) => ({
    ...project,
    assignee:
      users.find((u) => u.id === project.assignee)?.name || project.assignee,
  }));

  // Status is now calculated on backend, don't allow manual changes
  const handleStatusChange = async (
    id: string,
    newStatus: Project["status"]
  ) => {
    // Status is auto-calculated on backend based on progress and target
    // This function is kept for compatibility but does nothing
    console.log(
      "Status is auto-calculated on backend based on progress and target date"
    );
  };

  const handleCreateProject = async (newProject: Project) => {
    setIsLoading(true);
    try {
      await projectService.create(newProject);
      await onRefresh(); // Refresh to get project with calculated status
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projectsWithUserNames.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="px-8 py-6 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Projects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage, track, and collaborate on engineering projects.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            New Project
          </button>
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium w-64 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>
            <button className="p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "board"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading projects...
              </p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutGrid
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                No Projects Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Get started by creating your first project."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Create Project
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "board" ? (
          <ProjectBoard
            projects={filteredProjects}
            onProjectClick={(p) => console.log("Clicked", p)}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <ProjectList
              projects={filteredProjects}
              onProjectClick={(p) => console.log("Clicked", p)}
            />
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateProject}
        users={users}
      />
    </div>
  );
};

export default ProjectsView;
