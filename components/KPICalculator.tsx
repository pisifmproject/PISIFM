
import React, { useState, useEffect } from 'react';
import { PERFORMANCE_REVIEW_DATA } from '../constants';
import { 
  TrendingUp, FileText, UserCircle, Check, MessageSquare, 
  Info, Target, Award, Star, 
  BrainCircuit, Users as UsersIcon, Handshake, 
  ShieldCheck, ArrowRight, Save, ClipboardList, PenTool
} from 'lucide-react';
import { User, Submission } from '../types';

interface KPICalculatorProps {
  user?: User;
  submissions?: Submission[];
}

export default function KPICalculator({ user, submissions = [] }: KPICalculatorProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'annual'>('monthly');
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [totalWeightScore, setTotalWeightScore] = useState(0); 

  // --- ANNUAL FORM STATE ---
  const [activeSection, setActiveSection] = useState<'info' | 'competencies' | 'technical' | 'summary'>('info');
  const [annualScores, setAnnualScores] = useState<Record<string, number>>({
     integrity: 0,
     collaboration: 0,
     customer_focus: 0,
     problem_solving: 0,
     safety: 0,
     tech_skill_1: 0,
     tech_skill_2: 0
  });

  useEffect(() => {
    let total = 0;
    PERFORMANCE_REVIEW_DATA.forEach(category => {
      category.items.forEach(item => {
        const selectedIdx = selections[item.id];
        // DATA STRUCTURE FIX: Use scoringGuidance instead of options
        const options = item.scoringGuidance || [];
        if (selectedIdx !== undefined && options[selectedIdx]) {
           total += options[selectedIdx].weightScore;
        }
      });
    });
    setTotalWeightScore(total);
  }, [selections]);

  const handleSelectionChange = (criteriaId: string, optionIndex: number) => {
    setSelections(prev => ({ ...prev, [criteriaId]: optionIndex }));
  };

  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.9) return 'bg-emerald-500';
    if (ratio >= 0.7) return 'bg-indigo-500';
    if (ratio >= 0.4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getTierLabel = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.9) return 'Exceeding';
    if (ratio >= 0.7) return 'Proficient';
    if (ratio >= 0.4) return 'Developing';
    if (ratio > 0) return 'Unsatisfactory';
    return 'Pending';
  };

  const getBadgeStyle = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.9) return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    if (ratio >= 0.7) return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (ratio >= 0.4) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    if (ratio > 0) return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
    return 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700';
  };

  const renderMonthlyCalculator = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between transition-all">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
               <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none">
                  <Award size={32} />
               </div>
               <div>
                  <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Total KPI Achievement</h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{totalWeightScore.toFixed(1)}</p>
                    <span className="text-gray-400 font-bold">/ 100</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-gray-400">Target Score</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-slate-300">85.0 Pts</p>
               </div>
               <div className={`h-12 w-px bg-gray-100 dark:bg-slate-800 hidden sm:block mx-2`}></div>
               <span className={`text-xs font-black px-6 py-2.5 rounded-2xl uppercase tracking-widest border-2 shadow-sm ${totalWeightScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {totalWeightScore >= 85 ? 'EXCEEDING TARGET' : totalWeightScore >= 70 ? 'MEETING EXPECTATIONS' : 'ACTION REQUIRED'}
               </span>
            </div>
         </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="p-8 w-1/4">Assessment Criteria</th>
                <th className="p-8 w-24 text-center">Weight</th>
                <th className="p-8 w-1/4">Target Parameters</th>
                <th className="p-8 w-1/4">Manager Assessment</th>
                <th className="p-8 w-48 text-center bg-indigo-50/30 dark:bg-indigo-900/10 text-indigo-600">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {PERFORMANCE_REVIEW_DATA.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 font-black text-[11px] text-slate-500 uppercase tracking-[0.2em]">
                    <td className="px-8 py-4" colSpan={5}>{category.name}</td>
                  </tr>
                  {category.items.map((item) => {
                    const selectedIdx = selections[item.id] ?? -1;
                    const options = item.scoringGuidance || [];
                    const currentOption = selectedIdx !== -1 ? options[selectedIdx] : null;
                    const score = currentOption ? currentOption.weightScore : 0;
                    const tier = getTierLabel(score, item.weight);
                    const badgeClass = getBadgeStyle(score, item.weight);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="p-8">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 dark:text-slate-100 text-lg mb-1">{item.name}</span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium leading-relaxed max-w-xs">{item.description}</span>
                          </div>
                        </td>
                        <td className="p-8 text-center font-black text-gray-400 dark:text-slate-600 text-lg">{item.weight}%</td>
                        <td className="p-8">
                           <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Objective</p>
                              <p className="text-sm text-gray-700 dark:text-slate-300 font-bold">{item.parameter}</p>
                           </div>
                        </td>
                        <td className="p-8">
                          <select
                            className={`w-full p-4 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all cursor-pointer`}
                            value={selectedIdx}
                            onChange={(e) => handleSelectionChange(item.id, parseInt(e.target.value))}
                          >
                            <option value={-1}>SELECT LEVEL...</option>
                            {(item.scoringGuidance || []).map((opt, idx) => (
                              <option key={idx} value={idx}>{opt.realization} (Score: {opt.scoring})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-8 bg-indigo-50/10 dark:bg-indigo-900/5">
                          <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className={`font-black text-3xl tracking-tighter ${score === 0 ? 'text-gray-300' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {score.toFixed(1)}
                              </span>
                              <span className="text-xs font-bold text-gray-400">/ {item.weight}</span>
                            </div>
                            
                            {/* Dynamic Badge */}
                            <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border-2 mb-4 w-full text-center ${badgeClass}`}>
                                {tier}
                            </div>
                            
                            {/* Refined Progress Indicator */}
                            <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative group/bar">
                               <div 
                                 className={`h-full transition-all duration-1000 ease-out ${getScoreColor(score, item.weight)} shadow-[0_0_12px_rgba(0,0,0,0.1)]`}
                                 style={{ width: `${(score / item.weight) * 100}%` }}
                               >
                                  <div className="absolute top-0 right-0 w-4 h-full bg-white/20 skew-x-12 transform translate-x-full group-hover/bar:translate-x-[-200%] transition-transform duration-1000"></div>
                               </div>
                            </div>
                            
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-3 tracking-widest opacity-60">Criterion Impact</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnnualForm = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-fadeIn">
       <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
          {/* Sidebar Nav */}
          <div className="p-8 bg-gray-50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-800">
             <div className="mb-10">
                <p className="text-[10px] font-black uppercase text-indigo-600 mb-2">Cycle Assessment</p>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Annual Review 2025</h3>
             </div>
             
             <div className="space-y-2">
                {[
                  { id: 'info', label: 'Candidate Profile', icon: UserCircle },
                  { id: 'competencies', label: 'Value Alignment', icon: BrainCircuit },
                  { id: 'technical', label: 'Technical Audit', icon: PenTool },
                  { id: 'summary', label: 'Final Verification', icon: ClipboardList }
                ].map(step => (
                  <button
                    key={step.id}
                    onClick={() => setActiveSection(step.id as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === step.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    <step.icon size={20} />
                    <span className="text-left">{step.label}</span>
                  </button>
                ))}
             </div>

             <div className="mt-20 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Section Status</p>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 w-1/4"></div>
                </div>
                <p className="text-[11px] font-bold text-gray-500 mt-3">Step 1 of 4</p>
             </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3 p-10 overflow-y-auto max-h-[800px] custom-scrollbar">
             {activeSection === 'info' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="border-b border-gray-100 dark:border-slate-800 pb-8">
                      <h4 className="text-3xl font-black text-gray-900 dark:text-slate-100">Official Profile</h4>
                      <p className="text-sm text-gray-500 font-medium">Verify employee metadata before proceeding with assessment.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Legal Name</label>
                         <input disabled className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold dark:text-slate-200" value={user?.name} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 ml-1">NIK Identification</label>
                         <input disabled className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-mono text-sm dark:text-slate-400" value={user?.id} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Assigned Department</label>
                         <input disabled className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold dark:text-slate-200" value="Project & Engineering" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Specialist Job Grade</label>
                         <input disabled className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold dark:text-slate-200" value="JG 14 - Senior Specialist" />
                      </div>
                   </div>

                   <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/50 flex gap-5">
                      <Info className="text-blue-600 shrink-0" size={24} />
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                         Core employee data is synchronized with the master talent register. For corrections, please submit a Request for Update in the Admin module.
                      </p>
                   </div>

                   <div className="flex justify-end pt-10">
                      <button onClick={() => setActiveSection('competencies')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none">
                         Continue Assessment <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
             )}

             {activeSection === 'competencies' && (
                <div className="space-y-10 animate-fadeIn">
                   <div className="border-b border-gray-100 dark:border-slate-800 pb-8">
                      <h4 className="text-3xl font-black text-gray-900 dark:text-slate-100">Core Value Alignment</h4>
                      <p className="text-sm text-gray-500 font-medium">Evaluation of professional conduct and adherence to PEAK standards.</p>
                   </div>

                   <div className="space-y-8">
                      {[
                        { id: 'integrity', label: 'Operational Integrity', icon: ShieldCheck, desc: 'Policy compliance and transparent technical reporting.' },
                        { id: 'collaboration', label: 'Cross-Team Synergy', icon: UsersIcon, desc: 'Effectiveness in collaborative engineering workflows.' },
                        { id: 'customer_focus', label: 'Internal Service Level', icon: Handshake, desc: 'Responsiveness to operational plant requirements.' }
                      ].map(comp => (
                        <div key={comp.id} className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm group">
                           <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                              <div className="flex items-center gap-5">
                                 <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform">
                                    <comp.icon size={24} />
                                 </div>
                                 <div>
                                    <h5 className="font-black text-gray-900 dark:text-slate-100 text-lg uppercase tracking-tight">{comp.label}</h5>
                                    <p className="text-xs text-gray-500 font-medium">{comp.desc}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 {[1, 2, 3, 4, 5].map(rating => (
                                    <button 
                                      key={rating}
                                      onClick={() => setAnnualScores({...annualScores, [comp.id]: rating})}
                                      className={`w-12 h-12 rounded-xl font-black text-xs transition-all ${annualScores[comp.id] === rating ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                       {rating}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <textarea placeholder="Provide technical evidence for the selected rating..." className="w-full p-6 bg-gray-50 dark:bg-slate-900/50 border-2 border-transparent rounded-[2rem] text-xs font-medium outline-none focus:border-indigo-500 transition-all min-h-[100px]" />
                        </div>
                      ))}
                   </div>

                   <div className="flex justify-between pt-10 border-t dark:border-slate-800">
                      <button onClick={() => setActiveSection('info')} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors">Previous Step</button>
                      <button onClick={() => setActiveSection('technical')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all">
                         Technical Audit <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
             )}

             {activeSection === 'technical' && (
                <div className="p-20 text-center bg-gray-50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-800">
                   <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/40 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-600">
                      <Target size={48} />
                   </div>
                   <h5 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">Discipline Audit Matrix</h5>
                   <p className="text-sm text-gray-500 mt-4 max-w-sm mx-auto font-medium">This module is generating specialized evaluation points based on the <span className="text-indigo-600 font-black">Mechanical & Process Engineering</span> job family profile.</p>
                   <button onClick={() => setActiveSection('summary')} className="mt-10 bg-gray-900 dark:bg-slate-100 dark:text-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Begin Technical Review</button>
                </div>
             )}

             {activeSection === 'summary' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Executive Strengths</label>
                        <textarea className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-[2.5rem] outline-none focus:border-indigo-500 h-48 font-medium shadow-inner" placeholder="Summarize key performance highlights..." />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Growth Objectives</label>
                        <textarea className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-[2.5rem] outline-none focus:border-indigo-500 h-48 font-medium shadow-inner" placeholder="Outline developmental goals for the next cycle..." />
                      </div>
                   </div>

                   <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                      <div className="relative z-10">
                         <div className="flex justify-between items-center mb-10">
                            <h5 className="text-xl font-black tracking-[0.15em] uppercase">Consolidated Scorecard</h5>
                            <Star className="text-amber-400" fill="currentColor" size={28} />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                               <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Behavioral Avg</p>
                               <p className="text-3xl font-black">4.2 <span className="text-xs opacity-40">/ 5.0</span></p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                               <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Technical Avg</p>
                               <p className="text-3xl font-black">3.8 <span className="text-xs opacity-40">/ 5.0</span></p>
                            </div>
                            <div className="p-6 bg-indigo-600 rounded-3xl shadow-xl">
                               <p className="text-[10px] font-black uppercase opacity-80 mb-2 tracking-widest text-indigo-100">Performance Rank</p>
                               <p className="text-3xl font-black uppercase tracking-tighter">EXCEED</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-end gap-4 pt-10 border-t dark:border-slate-800">
                      <button className="px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-3">
                        <Save size={18} /> Cache Draft
                      </button>
                      <button className="px-12 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-95">
                        Transmit Appraisal <Check size={20} />
                      </button>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none">
               <ClipboardList size={28} />
             </div>
             Performance Console
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Auditing professional achievement metrics for <span className="text-indigo-600 font-black">{user?.name}</span>.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
           <button onClick={() => setActiveTab('monthly')} className={`flex items-center gap-2 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>
             <TrendingUp size={16} /> Monthly Metrics
           </button>
           <button onClick={() => setActiveTab('annual')} className={`flex items-center gap-2 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'annual' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>
             <FileText size={16} /> Annual Form
           </button>
        </div>
      </div>

      {activeTab === 'monthly' ? renderMonthlyCalculator() : renderAnnualForm()}
    </div>
  );
}
