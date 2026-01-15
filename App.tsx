import React, { useState, useEffect, Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
const DashboardView = React.lazy(() => import("./components/DashboardView"));
const KPICalculator = React.lazy(() => import("./components/KPICalculator"));
const ProposalView = React.lazy(() => import("./components/ProposalView"));
const UserManagementView = React.lazy(
  () => import("./components/UserManagementView")
);
const FormsView = React.lazy(() => import("./components/FormsView"));
const AICopilotView = React.lazy(() => import("./components/AICopilotView"));
const FinancialReportsView = React.lazy(
  () => import("./components/FinancialReportsView")
);
const ResourcePlanningView = React.lazy(
  () => import("./components/ResourcePlanningView")
);
const ProjectsView = React.lazy(
  () => import("./components/Projects/ProjectsView")
);

import AuthView from "./components/Auth/AuthView";
import LandingPage from "./components/LandingPage";
import {
  User,
  UserRole,
  ApprovalFlow,
  Submission,
  Notification,
  JobAssignment,
  Project,
} from "./types";
import {
  MOCK_USERS_DB,
  DEFAULT_APPROVAL_FLOWS,
  MOCK_SUBMISSIONS,
  MOCK_JOB_ASSIGNMENTS,
  MOCK_PROJECTS,
} from "./constants";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl">
    <h3 className="text-2xl font-bold text-gray-300 dark:text-slate-700 mb-2">
      {title}
    </h3>
    <p className="text-gray-400 dark:text-slate-500">
      This module is part of the architecture but not active in this demo.
    </p>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

import {
  projectService,
  userService,
  jobService,
  submissionService,
  authService,
} from "./services/api";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvalFlows, setApprovalFlows] = useState<ApprovalFlow[]>(
    DEFAULT_APPROVAL_FLOWS
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobs, setJobs] = useState<JobAssignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("50006020");
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authService.isAuthenticated()
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  const currentUser =
    users.find((u) => u.id === currentUserId) || users[0] || MOCK_USERS_DB[0];

  useEffect(() => {
    const fetchData = async () => {
      // Skip data fetch if not authenticated
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [projectsData, usersData, jobsData, submissionsData] =
          await Promise.all([
            projectService.getAll(),
            userService.getAll(),
            jobService.getAll(),
            submissionService.getAll(),
          ]);

        // If DB is empty, use mock data and seed it (simulated)
        setProjects(projectsData.length > 0 ? projectsData : MOCK_PROJECTS);
        setUsers(usersData.length > 0 ? usersData : MOCK_USERS_DB);
        setJobs(jobsData.length > 0 ? jobsData : MOCK_JOB_ASSIGNMENTS);
        setSubmissions(
          submissionsData.length > 0 ? submissionsData : MOCK_SUBMISSIONS
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to mock data on error
        setProjects(MOCK_PROJECTS);
        setUsers(MOCK_USERS_DB);
        setJobs(MOCK_JOB_ASSIGNMENTS);
        setSubmissions(MOCK_SUBMISSIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleUserSwitch = () => {
    const currentIndex = users.findIndex((u) => u.id === currentUserId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % users.length;
    setCurrentUserId(users[nextIndex].id);
  };

  const handleAddSubmission = async (s: Submission) => {
    try {
      const newSub = await submissionService.create(s);
      setSubmissions((p) => [newSub, ...p]);
    } catch (error) {
      console.error("Error adding submission:", error);
      setSubmissions((p) => [s, ...p]);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await userService.update(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleUpdateUserModules = async (userId: string, moduleId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      const newModules = user.allowedModules.includes(moduleId)
        ? user.allowedModules.filter((m) => m !== moduleId)
        : [...user.allowedModules, moduleId];
      await userService.update(userId, { allowedModules: newModules });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, allowedModules: newModules } : u
        )
      );
    } catch (error) {
      console.error("Error updating user modules:", error);
    }
  };

  const handleUpdateUserHierarchy = async (
    userId: string,
    updates: Partial<User>
  ) => {
    try {
      await userService.update(userId, updates);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
    } catch (error) {
      console.error("Error updating user hierarchy:", error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<AuthView onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/signup"
          element={<AuthView onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route path="/welcome" element={<LandingPage />} />
        <Route
          path="*"
          element={
            !isAuthenticated ? (
              <Navigate to="/welcome" />
            ) : (
              <Layout
                user={currentUser}
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={() => {
                  authService.logout();
                  setIsAuthenticated(false);
                }}
                currentPath={window.location.hash.replace("#", "") || "/"}
                onNavigate={(path) => (window.location.hash = path)}
                onSwitchUser={handleUserSwitch}
                users={users}
                notifications={notifications}
                onMarkNotificationRead={(id) =>
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                  )
                }
                onClearNotifications={() => setNotifications([])}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <DashboardView
                          user={currentUser}
                          users={users}
                          jobs={jobs}
                          projects={projects}
                          onNavigate={(path) => (window.location.hash = path)}
                        />
                      }
                    />
                    <Route
                      path="/ai-copilot"
                      element={
                        <AICopilotView user={currentUser} projects={projects} />
                      }
                    />
                    <Route
                      path="/finance"
                      element={
                        <FinancialReportsView
                          user={currentUser}
                          projects={projects}
                        />
                      }
                    />
                    <Route
                      path="/projects"
                      element={
                        <ProjectsView
                          currentUser={currentUser}
                          users={users}
                          projects={projects}
                          onNavigate={(path) => (window.location.hash = path)}
                          onRefresh={async () =>
                            setProjects(await projectService.getAll())
                          }
                        />
                      }
                    />
                    <Route
                      path="/performance"
                      element={
                        <KPICalculator
                          user={currentUser}
                          submissions={submissions}
                        />
                      }
                    />
                    <Route
                      path="/requests"
                      element={
                        <FormsView
                          user={currentUser}
                          submissions={submissions}
                          jobs={jobs}
                          projects={projects}
                          onAddSubmission={handleAddSubmission}
                        />
                      }
                    />
                    <Route
                      path="/resources"
                      element={
                        <ResourcePlanningView
                          currentUser={currentUser}
                          projects={projects}
                          users={users}
                        />
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <UserManagementView
                          currentUser={currentUser}
                          users={users}
                          flows={approvalFlows}
                          onUpdateFlows={setApprovalFlows}
                          onUpdateUserModules={handleUpdateUserModules}
                          onUpdateUserRole={handleUpdateUserRole}
                          onUpdateHierarchy={handleUpdateUserHierarchy}
                          onUserSelect={setCurrentUserId}
                        />
                      }
                    />
                    <Route
                      path="/safety"
                      element={
                        <PlaceholderPage title="Module 24: EHS & Safety" />
                      }
                    />
                    <Route path="/proposal" element={<ProposalView />} />
                  </Routes>
                </Suspense>
              </Layout>
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
