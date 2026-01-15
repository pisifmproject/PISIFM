import React, { useState, useRef } from "react";
import {
  User,
  Submission,
  FormType,
  ApprovalFlow,
  JobAssignment,
  Project,
} from "../types";
import { DEFAULT_APPROVAL_FLOWS } from "../constants";
import {
  FileText,
  Clock,
  ShoppingCart,
  LogOut,
  Camera,
  Send,
  Loader2,
  TrendingUp,
  BarChart3,
  Info,
  Timer,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  ShieldCheck,
  ArrowRight,
  Eye,
  ClipboardList,
  Layers,
} from "lucide-react";

interface FormsViewProps {
  user: User;
  submissions: Submission[];
  jobs: JobAssignment[];
  projects: Project[];
  onAddSubmission: (submission: Submission) => void;
}

const FormsView: React.FC<FormsViewProps> = ({
  user,
  submissions,
  jobs,
  projects,
  onAddSubmission,
}) => {
  const [activeForm, setActiveForm] = useState<FormType>("daily_report");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specific form states
  const [dailyReport, setDailyReport] = useState({
    jobId: "",
    activityDate: new Date().toISOString().split("T")[0],
    progress: 0,
    description: "",
    photo: null as File | null,
  });

  const [leaveRequest, setLeaveRequest] = useState({
    type: "Short Permit",
    startDate: "",
    startTime: "",
    reason: "",
  });

  const [purchaseRequest, setPurchaseRequest] = useState({
    item: "",
    quantity: 1,
    reason: "",
    project: "",
  });

  const [lateArrival, setLateArrival] = useState({
    date: new Date().toISOString().split("T")[0],
    arrivalTime: "",
    reason: "",
  });

  const [overtime, setOvertime] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "17:00",
    endTime: "20:00",
    justification: "",
    jobId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDetails =
      activeForm === "overtime"
        ? overtime
        : activeForm === "daily_report"
        ? dailyReport
        : activeForm === "leave"
        ? leaveRequest
        : activeForm === "purchase"
        ? purchaseRequest
        : lateArrival;

    setTimeout(() => {
      const newSubmission: Submission = {
        id: `REQ-${Math.floor(Math.random() * 10000)}`,
        type: activeForm,
        title: getFormTitle(activeForm),
        date: new Date().toISOString().split("T")[0],
        status: "Pending",
        details: formDetails,
        currentStepIndex: 0,
        flowId: activeForm === "purchase" ? "flow-1" : "flow-2",
      };

      onAddSubmission(newSubmission);
      setIsSubmitting(false);
      alert(`${getFormTitle(activeForm)} has been submitted for approval.`);
    }, 1000);
  };

  const getFormTitle = (type: FormType) => {
    switch (type) {
      case "daily_report":
        return "Daily Activity Report";
      case "leave":
        return "Leave Permit Request";
      case "purchase":
        return "Purchase Requisition";
      case "overtime":
        return "Overtime Allocation";
      case "late_arrival":
        return "Tardiness Notice";
      default:
        return "Submission";
    }
  };

  const getSubmissionProgressLabel = (sub: Submission) => {
    const flow = DEFAULT_APPROVAL_FLOWS.find((f) => f.id === sub.flowId);
    if (!flow) return "Standard Queue";
    if (sub.status === "Approved") return "Fully Validated";
    if (sub.status === "Rejected") return "Rejection Issued";

    const currentRole = flow.steps[sub.currentStepIndex];
    return `Wait: ${currentRole.split(" ")[0]} Stage`;
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveForm(id)}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
        activeForm === id
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none translate-y-[-2px]"
          : "bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            Operations Hub
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">
            Standardized digital reporting and requisition forms.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <TabButton id="daily_report" label="Progress" icon={TrendingUp} />
        <TabButton id="overtime" label="Overtime" icon={Timer} />
        <TabButton id="leave" label="Leave" icon={LogOut} />
        <TabButton id="late_arrival" label="Tardiness" icon={Clock} />
        <TabButton id="purchase" label="Purchase" icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all">
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-4">
                <ClipboardList className="text-indigo-600" />
                {getFormTitle(activeForm)}
              </h3>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeForm === "daily_report" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                          Reference Job
                        </label>
                        <select
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={dailyReport.jobId}
                          onChange={(e) =>
                            setDailyReport({
                              ...dailyReport,
                              jobId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Project...</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                          Activity Date
                        </label>
                        <input
                          required
                          type="date"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={dailyReport.activityDate}
                          onChange={(e) =>
                            setDailyReport({
                              ...dailyReport,
                              activityDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp size={16} /> Progress
                        </label>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-sm">
                          {dailyReport.progress}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        value={dailyReport.progress}
                        onChange={(e) =>
                          setDailyReport({
                            ...dailyReport,
                            progress: parseInt(e.target.value),
                          })
                        }
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Not Started</span>
                        <span>In Progress</span>
                        <span>Completed</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                        Technical Summary
                      </label>
                      <textarea
                        required
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                        placeholder="Describe the work completed, issues encountered, and next steps..."
                        value={dailyReport.description}
                        onChange={(e) =>
                          setDailyReport({
                            ...dailyReport,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {activeForm === "overtime" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                          Date of Work
                        </label>
                        <input
                          required
                          type="date"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={overtime.date}
                          onChange={(e) =>
                            setOvertime({ ...overtime, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                          Link to Project
                        </label>
                        <select
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={overtime.jobId}
                          onChange={(e) =>
                            setOvertime({ ...overtime, jobId: e.target.value })
                          }
                        >
                          <option value="">Select Reference...</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 transition-all">
            <h3 className="font-black text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
              <Clock size={20} className="text-gray-400" /> Traceable Workflow
            </h3>
            <div className="space-y-6">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sub.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : sub.status === "Rejected"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 dark:text-slate-200 text-sm truncate uppercase tracking-tight">
                        {sub.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {sub.date} • ID: {sub.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-500">
                        <Layers size={12} /> {getSubmissionProgressLabel(sub)}
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          sub.status === "Approved"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : sub.status === "Rejected"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          sub.status === "Approved"
                            ? "bg-emerald-500 w-full"
                            : sub.status === "Rejected"
                            ? "bg-rose-500 w-full"
                            : "bg-amber-500 w-1/3"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-4">
              Workflow Guard
            </h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">
              Documents require{" "}
              <span className="font-black underline">
                Multi-Tier Validation
              </span>
              . Review status live in this panel for real-time verification of
              departmental clearance.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
              Approval Logic Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsView;
