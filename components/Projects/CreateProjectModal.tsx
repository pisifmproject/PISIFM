import React, { useState } from "react";
import {
  X,
  Calendar,
  DollarSign,
  MapPin,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Target,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Project, User } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  users: User[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  users,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    location: "",
    // Remove status from here - backend will calculate it
    progress: 0,
    budget: 0,
    spent: 0,
    committed: 0,
    assignee: "",
    dueDate: "",
    priority: "Medium",
    riskLevel: "Low",
    capexCategory: "Equipment",
    targetROI: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Don't include status - backend calculates it based on progress and dueDate
    const newProject: Omit<Project, "status"> & { status?: string } = {
      ...(formData as Project),
      id: `PRJ-${Date.now()}`,
      lifecycle: [],
      documents: [],
      plannedProgress: [],
      actualProgress: [],
      capexItems: [],
    };
    // Remove status if exists - backend will set it
    delete newProject.status;
    onSave(newProject as Project);
    onClose();
    setStep(1);
    // Reset form
    setFormData({
      name: "",
      location: "",
      progress: 0,
      budget: 0,
      spent: 0,
      committed: 0,
      assignee: "",
      dueDate: "",
      priority: "Medium",
      riskLevel: "Low",
      capexCategory: "Equipment",
      targetROI: 0,
    });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const steps = [
    { id: 1, label: "Identity", icon: Briefcase },
    { id: 2, label: "Strategy", icon: Target },
    { id: 3, label: "Risk & Safety", icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn border border-gray-100 dark:border-slate-800">
        {/* Progress Header */}
        <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                PROJECT INITIALIZATION
              </h3>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">
                Capital Expenditure Workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm hover:rotate-90"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div
                  key={s.id}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                      isActive
                        ? "bg-indigo-600 text-white scale-110 shadow-indigo-500/30"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-400 border border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      isActive ? "text-indigo-600" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-slideIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Project Registry Name
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
                  placeholder="e.g. Expansion Line 4 - Phase A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-600" /> Site
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
                    placeholder="Sector / Zone"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <UserIcon size={12} className="text-indigo-600" /> Custodian
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white appearance-none cursor-pointer"
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
                  >
                    <option value="">Map Personnel</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slideIn">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <DollarSign size={12} className="text-indigo-600" />{" "}
                    Authorized Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
                      value={formData.budget === 0 ? "" : formData.budget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <Calendar size={12} className="text-indigo-600" /> Delivery
                    Target
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Capex Categorization
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white appearance-none"
                    value={formData.capexCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capexCategory: e.target.value,
                      })
                    }
                  >
                    <option value="Equipment">Machine & Tools</option>
                    <option value="Installation">Field Installation</option>
                    <option value="Engineering">Civil/Structural</option>
                    <option value="Automation">Process Automation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Performance ROI (%)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
                    value={formData.targetROI === 0 ? "" : formData.targetROI}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetROI: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-slideIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">
                    Criticality Rating
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
                    {["Low", "Medium", "High"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, priority: p as any })
                        }
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.priority === p
                            ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-lg scale-105"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">
                    Risk Matrix Assessment
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
                    {["Low", "Medium", "High"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, riskLevel: r as any })
                        }
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.riskLevel === r
                            ? r === "High"
                              ? "bg-rose-600 text-white shadow-lg scale-105"
                              : "bg-amber-500 text-white shadow-lg scale-105"
                            : "text-slate-400"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                      Pre-deployment Compliance
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Initializing this project will automatically generate an
                      Audit Log entry. Required documentation (P&ID, Layout)
                      must be uploaded within 7 days of deployment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-10 mt-10 border-t border-gray-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft size={16} /> Previous Phase
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
              >
                Discard Draft
              </button>
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  Next Phase <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => formData.name && handleSubmit()}
                  className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${
                    formData.name
                      ? "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                  disabled={!formData.name}
                >
                  Initialize Project <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
