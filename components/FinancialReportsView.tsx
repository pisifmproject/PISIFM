
import React, { useState, useEffect, useRef } from 'react';
import {
  MOCK_PROJECTS,
  MOCK_PO,
  MOCK_COMPARISONS,
  MOCK_PAYMENTS,
  MOCK_VENDORS,
  MOCK_JOB_CATEGORIES,
  DEFAULT_APPROVAL_FLOWS
} from '../constants';
import { Project, Vendor, PurchaseOrder, ComparisonSheet, PaymentRecord, CapexItem, VendorRating, User, UserRole, WorkflowLog } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  Wallet, TrendingUp, ShoppingBag, FileCheck, CreditCard,
  Search, Plus, X, Phone, Mail, MapPin, Building2,
  User as UserIcon, AlertCircle, Landmark, Hash, Check, Truck, UserCheck,
  Timer, ArrowRight, Calendar, Box, BadgeDollarSign, Receipt, Banknote,
  ChevronDown, ChevronRight, FileText, Filter, MoreHorizontal,
  Clock, CheckCircle, Package, Store, DollarSign, History, Tag, ExternalLink,
  PhoneCall, Contact, BarChart3, ArrowDownRight, ArrowUpRight,
  HandCoins, Landmark as Bank, CreditCard as Card, Wallet2, Globe, FileStack, ListChecks,
  ShieldCheck, Star, StarOff, Layers, FileUp, Paperclip, MessageSquare, Info, UploadCloud,
  FileCode, FileSpreadsheet, Loader2, Briefcase, PlusCircle, Tag as TagIcon
} from 'lucide-react';

interface FinancialReportsViewProps {
  user?: User;
  projects: Project[];
}

const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ user, projects }) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'spending' | 'sourcing' | 'orders' | 'vendors' | 'settlement'>('budget');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PO);
  const [comparisonSheets, setComparisonSheets] = useState<ComparisonSheet[]>(MOCK_COMPARISONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [poSearchTerm, setPoSearchTerm] = useState('');
  const [csSearchTerm, setCsSearchTerm] = useState('');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [projectFilterId, setProjectFilterId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Generic document update state
  const [updatingDoc, setUpdatingDoc] = useState<{ id: string, flowId?: string, currentStepIndex?: number, type: 'PO' | 'CS' } | null>(null);
  const [updateForm, setUpdateForm] = useState({
    comment: '',
    attachmentName: '',
    attachmentContent: ''
  });

  const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({
    poId: '',
    invoiceId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    method: 'Bank Transfer'
  });

  // Parse URL for projectId filter
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryPart = hash.split('?')[1];
      const params = new URLSearchParams(queryPart);
      const pid = params.get('projectId');
      if (pid) {
        setProjectFilterId(pid);
        setExpandedProjects(new Set([pid]));
        setActiveTab('budget');
      }
    }
  }, []);

  const canUpdateDocuments = user && [UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.ENGINEER, UserRole.SUPER_ADMIN].includes(user.role);

  const formatCurrency = (val: any): string => {
    const num = Number(val);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(isNaN(num) ? 0 : num);
  };

  const getWorkflowTag = (doc: { currentStepIndex?: number, flowId?: string, status: string }) => {
    if (doc.status === 'Paid' || doc.status === 'Finalized' || doc.status === 'Delivered') return { label: 'Fully Verified', color: 'text-emerald-500 bg-emerald-50' };
    if (!doc.flowId) return { label: 'Standard Queue', color: 'text-gray-400 bg-gray-50' };
    const flow = DEFAULT_APPROVAL_FLOWS.find(f => f.id === doc.flowId);
    if (!flow) return { label: 'Processing', color: 'text-blue-400 bg-blue-50' };

    const currentRole = flow.steps[doc.currentStepIndex || 0];
    return { label: `Waiting ${currentRole.split(' ')[0]}`, color: 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100' };
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleUpdateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingDoc || !user) return;

    const newLog: WorkflowLog = {
      step: (updatingDoc.currentStepIndex || 0) + 1,
      user: user.name,
      date: new Date().toISOString().split('T')[0],
      comment: updateForm.comment,
      attachmentName: updateForm.attachmentName,
      attachmentContent: updateForm.attachmentContent
    };

    if (updatingDoc.type === 'PO') {
      setPurchaseOrders(prev => prev.map(po => {
        if (po.id === updatingDoc.id) {
          const flow = DEFAULT_APPROVAL_FLOWS.find(f => f.id === po.flowId);
          const nextStep = (po.currentStepIndex || 0) + 1;
          const isLastStep = flow ? nextStep >= flow.steps.length : true;
          return {
            ...po,
            currentStepIndex: nextStep,
            status: isLastStep ? 'Delivered' : po.status,
            logs: [...(po.logs || []), newLog]
          };
        }
        return po;
      }));
    } else {
      setComparisonSheets(prev => prev.map(cs => {
        if (cs.id === updatingDoc.id) {
          const flow = DEFAULT_APPROVAL_FLOWS.find(f => f.id === cs.flowId);
          const nextStep = (cs.currentStepIndex || 0) + 1;
          const isLastStep = flow ? nextStep >= flow.steps.length : true;
          return {
            ...cs,
            currentStepIndex: nextStep,
            status: isLastStep ? 'Finalized' : cs.status,
            logs: [...(cs.logs || []), newLog]
          };
        }
        return cs;
      }));
    }

    setIsUpdateModalOpen(false);
    triggerToast(`Document ${updatingDoc.id} has been progressed to the next clearance stage.`);
    setUpdateForm({ comment: '', attachmentName: '', attachmentContent: '' });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payment: PaymentRecord = {
      ...newPayment,
      id: `PAY-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    } as PaymentRecord;

    setPayments([payment, ...payments]);

    // Update PO status to Paid if the full amount or a record is added
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === payment.poId) {
        return { ...po, status: 'Paid' };
      }
      return po;
    }));

    setIsPaymentModalOpen(false);
    triggerToast(`Payment record ${payment.id} for ${payment.poId} recorded.`);
    setNewPayment({
      poId: '',
      invoiceId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      method: 'Bank Transfer'
    });
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsReadingFile(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Basic "ISI" summary - first 150 chars
        const summary = content.substring(0, 150).replace(/[\r\n]+/g, ' ') + (content.length > 150 ? '...' : '');
        setUpdateForm(prev => ({
          ...prev,
          attachmentName: file.name,
          attachmentContent: summary
        }));
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        alert("Error reading file.");
      };
      reader.readAsText(file);
    }
  };

  const renderLogHistory = (logs: WorkflowLog[]) => (
    <div className="mt-4 pt-6 border-t border-gray-50 dark:border-slate-800 space-y-5">
      <div className="flex items-center gap-2">
        <History size={14} className="text-gray-400" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compliance & Progression Logs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {logs.map((log, lidx) => (
          <div key={lidx} className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 relative group/log">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 text-[10px] font-black">ST-{log.step}</div>
                <div>
                  <p className="text-xs font-black text-gray-900 dark:text-slate-100">{log.user}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{log.date}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-4 leading-relaxed italic">"{log.comment}"</p>
            {log.attachmentName && (
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-3 shadow-sm group-hover/log:border-indigo-300 transition-colors">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  {log.attachmentName.toLowerCase().endsWith('.csv') ? <FileSpreadsheet size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-gray-900 dark:text-slate-100 truncate">{log.attachmentName}</p>
                  <p className="text-[9px] text-gray-400 truncate opacity-80 mt-0.5">{log.attachmentContent}</p>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all">
                  <ExternalLink size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ProgressUpdateModal = () => {
    if (!updatingDoc) return null;
    const flow = DEFAULT_APPROVAL_FLOWS.find(f => f.id === updatingDoc.flowId);
    const currentStepNum = (updatingDoc.currentStepIndex || 0) + 1;
    const nextStepRole = flow ? flow.steps[(updatingDoc.currentStepIndex || 0) + 1] : 'N/A';

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsUpdateModalOpen(false)}></div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-slide-in border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none">
                <FileUp size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Technical Milestone Update</h3>
                <p className="text-sm text-gray-500 dark:text-slate-500 font-medium">Progressing Document ID: <span className="font-black text-indigo-600">{updatingDoc.id}</span></p>
              </div>
            </div>
            <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={24} /></button>
          </div>

          <form onSubmit={handleUpdateDocument} className="p-10 overflow-y-auto custom-scrollbar space-y-10">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 p-6 rounded-3xl flex gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl h-fit">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-900 dark:text-amber-300 font-black uppercase tracking-widest mb-1">Clearance Warning</p>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                  You are officially validating <strong>Step {currentStepNum}</strong>.
                  {nextStepRole !== 'N/A' && nextStepRole !== undefined ? (
                    <> Next departmental verification will be routed to: <span className="underline font-black">{nextStepRole}</span>.</>
                  ) : (
                    <> This is the <strong>Final Validation Step</strong> for this document workflow.</>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Workflow Summary & Commentary</label>
              <div className="relative group">
                <MessageSquare size={20} className="absolute left-5 top-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <textarea
                  required
                  placeholder="Provide a detailed technical justification or progress summary for this step..."
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 dark:text-slate-200 min-h-[150px] font-medium transition-all shadow-inner"
                  value={updateForm.comment}
                  onChange={e => setUpdateForm({ ...updateForm, comment: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Digital File Link (Attachment)</label>
                <div className="relative group flex gap-2">
                  <div className="relative flex-1">
                    <Paperclip size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      placeholder="Select or enter file name..."
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all shadow-inner"
                      value={updateForm.attachmentName}
                      onChange={e => setUpdateForm({ ...updateForm, attachmentName: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl hover:bg-indigo-200 transition-all shrink-0"
                    title="Upload and Auto-Fill Content"
                  >
                    {isReadingFile ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelection} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Content Scanned (ISI Document)</label>
                <div className="relative group">
                  <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    placeholder="Brief summary of document body..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all shadow-inner"
                    value={updateForm.attachmentContent}
                    onChange={e => setUpdateForm({ ...updateForm, attachmentContent: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-10 border-t border-gray-100 dark:border-slate-800">
              <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-10 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">Abort Update</button>
              <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3">
                <Check size={20} /> Transmit Validation
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSourcing = () => {
    const filteredCS = comparisonSheets.filter(cs =>
      cs.id.toLowerCase().includes(csSearchTerm.toLowerCase()) ||
      cs.requestTitle.toLowerCase().includes(csSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck size={24} className="text-indigo-600" />
              Sourcing & Comparison Hub
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Review vendor quotations and sourcing efficiency.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search CS ID or title..."
              className="pl-9 pr-4 py-2.5 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              value={csSearchTerm}
              onChange={(e) => setCsSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredCS.map(cs => {
            const workflow = getWorkflowTag(cs);
            return (
              <div key={cs.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm group hover:border-indigo-400 transition-all">
                <div className="flex flex-wrap justify-between items-start gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl group-hover:scale-105 transition-transform">
                      <FileCheck size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-gray-900 dark:text-slate-100 text-lg uppercase">{cs.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${workflow.color}`}>
                          <Layers size={12} /> {workflow.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-500 mt-1">{cs.requestTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Savings Identified</p>
                      <p className="text-xl font-black text-gray-900 dark:text-slate-100">{formatCurrency(cs.savings)}</p>
                    </div>
                    {canUpdateDocuments && cs.status !== 'Finalized' && (
                      <button
                        onClick={() => { setUpdatingDoc({ ...cs, type: 'CS' }); setIsUpdateModalOpen(true); }}
                        className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95"
                        title="Attach Quotation Analysis"
                      >
                        <FileUp size={22} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {cs.vendors.map((v, vidx) => (
                    <div key={vidx} className={`p-4 rounded-2xl border flex justify-between items-center ${v.selected ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800'}`}>
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-slate-100">{v.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Lead Time: {v.leadTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-indigo-600">{formatCurrency(v.price)}</p>
                        {v.selected && <span className="text-[9px] font-black text-emerald-600 uppercase">Selected</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {cs.logs && cs.logs.length > 0 && renderLogHistory(cs.logs)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filteredPOs = purchaseOrders.filter(po =>
      po.id.toLowerCase().includes(poSearchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(poSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag size={24} className="text-indigo-600" />
            Active Purchase Orders
          </h3>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter PO ID..."
              className="pl-9 pr-4 py-2.5 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              value={poSearchTerm}
              onChange={(e) => setPoSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {filteredPOs.map(po => {
            const workflow = getWorkflowTag(po);
            return (
              <div key={po.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm group hover:border-indigo-400 transition-all">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl group-hover:rotate-3 transition-transform">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-gray-900 dark:text-slate-100 text-lg uppercase tracking-tight">{po.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${workflow.color}`}>
                          <Layers size={12} /> {workflow.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{po.vendorName} • Issued {po.issueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Liability</p>
                      <p className="text-xl font-black text-indigo-600">{formatCurrency(po.totalValue)}</p>
                    </div>
                    {canUpdateDocuments && po.status !== 'Paid' && po.status !== 'Delivered' && (
                      <button
                        onClick={() => { setUpdatingDoc({ ...po, type: 'PO' }); setIsUpdateModalOpen(true); }}
                        className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95"
                        title="Update Progress & Attach File"
                      >
                        <FileUp size={22} />
                      </button>
                    )}
                  </div>
                </div>
                {po.logs && po.logs.length > 0 && renderLogHistory(po.logs)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSettlement = () => {
    const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const filteredPayments = payments.filter(p =>
      p.poId.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(paymentSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Disbursed</p>
              <h3 className="text-3xl font-black">{formatCurrency(totalPayments)}</h3>
            </div>
            <div className="p-4 bg-white/20 rounded-3xl relative z-10">
              <Banknote size={32} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Payment Queue</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-slate-100">{payments.length} Records</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <PlusCircle size={18} /> Record New Payment
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-all">
          <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <h4 className="font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest text-sm flex items-center gap-3">
              <Receipt size={20} className="text-indigo-600" />
              Settlement Ledger
            </h4>
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search PO or Invoice..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 text-[11px] font-bold"
                value={paymentSearchTerm}
                onChange={(e) => setPaymentSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <tr className="text-[10px] font-black uppercase text-gray-400">
                  <th className="px-8 py-5">Payment Ref</th>
                  <th className="px-8 py-5">Invoice Details</th>
                  <th className="px-8 py-5">PO Link</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Method</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400 italic font-medium">No payment records found matching your search.</td>
                  </tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl">
                            <CreditCard size={14} />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-gray-900 dark:text-slate-100 uppercase">{p.id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 dark:text-slate-200 text-xs">INV: {p.invoiceId}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{p.date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-gray-500">{p.poId}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-indigo-600">{formatCurrency(p.amount)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {p.method === 'Bank Transfer' ? <Landmark size={12} className="text-gray-400" /> : <Card size={12} className="text-gray-400" />}
                          <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-widest">{p.method}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBudgetReport = () => {
    let budgetProjects = projects;
    if (projectFilterId) {
      budgetProjects = budgetProjects.filter(p => p.id === projectFilterId);
    }

    const totalBudget = projects.reduce((a: number, b: Project) => a + b.budget, 0);
    const totalSpent = projects.reduce((a: number, b: Project) => a + b.spent, 0);
    const totalCommitted = projects.reduce((a: number, b: Project) => a + b.committed, 0);
    const totalPOs = purchaseOrders.length;
    const totalPRs = Array.from(new Set(purchaseOrders.map((po: PurchaseOrder) => po.prId))).length;
    const totalItems = projects.reduce((a: number, b: Project) => a + (b.capexItems?.length || 0), 0);
    const localVendors = vendors.filter(v => v.origin === 'Local').length;
    const overseasVendors = vendors.filter(v => v.origin === 'Overseas').length;
    const localSpend = purchaseOrders.filter(po => po.vendorOrigin === 'Local').reduce((a: number, b: PurchaseOrder) => a + b.totalValue, 0);
    const overseasSpend = purchaseOrders.filter(po => po.vendorOrigin === 'Overseas').reduce((a: number, b: PurchaseOrder) => a + b.totalValue, 0);

    const originPieData = [
      { name: 'Local Vendors', value: localVendors, color: '#6366f1' },
      { name: 'Overseas Vendors', value: overseasVendors, color: '#f43f5e' }
    ];

    const spendPieData = [
      { name: 'Local Spend', value: localSpend, color: '#10b981' },
      { name: 'Overseas Spend', value: overseasSpend, color: '#f59e0b' }
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        {projectFilterId && (
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-indigo-600" />
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Filtering Financials for Project: <strong>CEA-{projectFilterId}</strong></p>
            </div>
            <button
              onClick={() => {
                setProjectFilterId(null);
                window.location.hash = '#/finance';
              }}
              className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Total Authorized CAPEX</p>
              <Wallet size={20} className="opacity-50" />
            </div>
            <h3 className="text-4xl font-black tracking-tight">{formatCurrency(totalBudget)}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm group hover:border-indigo-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Actual Paid Out</p>
              <CreditCard size={20} className="text-gray-200" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{formatCurrency(totalSpent)}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm border-l-8 border-l-amber-500">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Available Reserve</p>
              <ShieldCheck size={20} className="text-amber-200" />
            </div>
            <h3 className="text-4xl font-black text-amber-600 dark:text-amber-500 tracking-tight">{formatCurrency(totalBudget - (totalSpent + totalCommitted))}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/30">
            <h4 className="font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest text-sm">Portfolio Breakdown</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {budgetProjects.map(p => (
              <div key={p.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${expandedProjects.has(p.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">CEA-{p.id} • {p.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = new Set(expandedProjects);
                      if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                      setExpandedProjects(next);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {expandedProjects.has(p.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedProjects.has(p.id) && (
                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Budget Allocation</p>
                        <p className="font-black text-indigo-600">{formatCurrency(p.budget)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Actual Spent</p>
                        <p className="font-black text-rose-500">{formatCurrency(p.spent)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Committed (POs)</p>
                        <p className="font-black text-amber-500">{formatCurrency(p.committed)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Available</p>
                        <p className="font-black text-emerald-600">{formatCurrency(p.budget - p.spent - p.committed)}</p>
                      </div>
                    </div>
                    {p.capexItems && p.capexItems.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[10px] font-black uppercase text-gray-400 border-b dark:border-slate-800 pb-2">
                              <th className="py-2 pr-4">Asset Code</th>
                              <th className="py-2 pr-4">Description</th>
                              <th className="py-2 pr-4">Estimated</th>
                              <th className="py-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.capexItems.map(item => (
                              <tr key={item.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-none">
                                <td className="py-3 font-mono text-indigo-600">{item.id}</td>
                                <td className="py-3 font-bold text-gray-700 dark:text-slate-300">{item.name}</td>
                                <td className="py-3 font-bold">{formatCurrency(item.proposedCost)}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total PRs', val: totalPRs, icon: FileStack, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Active POs', val: totalPOs, icon: ListChecks, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Tagged Items', val: totalItems, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Total Vendors', val: vendors.length, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:translate-y-[-2px]">
              <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-2xl`}>
                <kpi.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-slate-100">{kpi.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-slate-100">Vendor Origin Mix</h4>
                <p className="text-xs text-gray-500">Distribution of commercial entities by area.</p>
              </div>
              <Globe size={24} className="text-indigo-600" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={originPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {originPieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-slate-100">Expenditure Geography</h4>
                <p className="text-xs text-gray-500">Value based on vendor origin.</p>
              </div>
              <Banknote size={24} className="text-emerald-600" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spendPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {spendPieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVendors = () => (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-all mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Contact size={24} className="text-indigo-600" />
              Vendor Directory
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">Official register of commercial entities for procurement.</p>
          </div>
          <button
            onClick={() => setIsVendorModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={22} /> Register New Vendor
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search directory by vendor name..."
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all dark:text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {vendors.flatMap(v => v.category).filter((val, id, self) => self.indexOf(val) === id).map(catName => (
              <button
                key={catName}
                onClick={() => {
                  setSelectedCategories(prev => prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${selectedCategories.includes(catName)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
              >
                {catName}
                {selectedCategories.includes(catName) && <X size={10} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                <th className="px-8 py-5">Vendor Profile</th>
                <th className="px-8 py-5">Performance Rating</th>
                <th className="px-8 py-5">Origin</th>
                <th className="px-8 py-5">Contact Person</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategories.length === 0 || selectedCategories.some(c => v.category.includes(c)))).map(vendor => (
                <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600">
                        <Building2 size={20} />
                      </div>
                      <div className="relative group/tooltip">
                        <p className="font-black text-gray-900 dark:text-slate-100">{vendor.name}</p>
                        {/* Tooltip for categories */}
                        <div className="absolute left-0 bottom-full mb-3 hidden group-hover/tooltip:block z-[50] bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-600 whitespace-nowrap animate-fadeIn min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                            <TagIcon size={12} className="text-indigo-400" />
                            <p className="font-black uppercase tracking-[0.15em] text-[9px] text-indigo-400">Approved Segments</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {vendor.category.map(cat => (
                              <span key={cat} className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/5 text-[10px] font-bold">{cat}</span>
                            ))}
                          </div>
                          <div className="absolute left-6 -bottom-1.5 w-3 h-3 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 dark:border-slate-600 rotate-45"></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {vendor.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                        ))}
                        <span className="text-[10px] font-black text-gray-700 dark:text-slate-300 ml-1">4.0</span>
                      </div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Based on 12 reviews</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${vendor.origin === 'Local' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                      }`}>
                      {vendor.origin === 'Local' ? 'Domestik' : 'Import'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-400" />
                      {vendor.contactPerson}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Rate Performance"><Star size={18} /></button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><ExternalLink size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PaymentRecordingModal = () => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsPaymentModalOpen(false)}></div>
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-slide-in border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none">
              <BadgeDollarSign size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Record Payment</h3>
              <p className="text-sm text-gray-500 dark:text-slate-500 font-medium">Link invoice settlement to PO</p>
            </div>
          </div>
          <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleAddPayment} className="p-10 overflow-y-auto custom-scrollbar space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Reference Purchase Order</label>
            <select
              required
              className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all"
              value={newPayment.poId}
              onChange={e => setNewPayment({ ...newPayment, poId: e.target.value })}
            >
              <option value="">Select PO...</option>
              {purchaseOrders.filter(po => po.status !== 'Paid').map(po => (
                <option key={po.id} value={po.id}>{po.id} - {po.vendorName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Invoice Number</label>
              <input
                required
                placeholder="e.g. INV/2025/..."
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all"
                value={newPayment.invoiceId}
                onChange={e => setNewPayment({ ...newPayment, invoiceId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Payment Date</label>
              <input
                required
                type="date"
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all"
                value={newPayment.date}
                onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Amount Paid (USD)</label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all"
                value={newPayment.amount}
                onChange={e => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Method</label>
              <select
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 dark:text-slate-200 font-bold transition-all"
                value={newPayment.method}
                onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}
              >
                <option>Bank Transfer</option>
                <option>Corporate Card</option>
                <option>Cash / Reimbursement</option>
                <option>Check</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3">
              <Check size={20} /> Authorize & Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {showSuccessToast && (
        <div className="fixed top-24 right-10 z-[200] animate-slide-in-right">
          <div className="bg-indigo-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-700">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Check size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Update Verified</p>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-xl">
              <Wallet size={24} />
            </div>
            Financials & Procurement
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Monitoring departmental Capex utilization, sourcing efficiency, and performance tracking.</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors overflow-x-auto max-w-full">
          {[
            { id: 'budget', label: 'Budget & PR/PO', icon: Wallet },
            { id: 'spending', label: 'Analysis', icon: BarChart3 },
            { id: 'sourcing', label: 'Sourcing', icon: FileCheck },
            { id: 'orders', label: 'PO Tracking', icon: ShoppingBag },
            { id: 'settlement', label: 'Settlement', icon: BadgeDollarSign },
            { id: 'vendors', label: 'Vendors', icon: Store }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'
                }`}
            >
              <tab.icon size={16} />
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'budget' && renderBudgetReport()}
        {activeTab === 'vendors' && renderVendors()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'sourcing' && renderSourcing()}
        {activeTab === 'settlement' && renderSettlement()}

        {activeTab === 'spending' && (
          <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Spending Analysis Console</h3>
            <p className="text-sm text-gray-500">Detailed expenditure analytics are processed in the central data warehouse.</p>
          </div>
        )}
      </div>

      {isUpdateModalOpen && <ProgressUpdateModal />}
      {isPaymentModalOpen && <PaymentRecordingModal />}

      {isVendorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsVendorModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl relative z-10 overflow-hidden shadow-2xl animate-slide-in flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800">
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Store size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Vendor Registration</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Add a new commercial entity to the procurement system.</p>
                </div>
              </div>
              <button onClick={() => setIsVendorModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-8 text-center text-gray-400 italic">Form placeholder for Demo Purposes.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportsView;
