import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Network,
  GitMerge,
  Globe,
  Save,
  X,
  Trash2,
  Heart,
} from 'lucide-react';
import { User, UserRole, ApprovalFlow } from '../types';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  flows: ApprovalFlow[];
  onUpdateFlows: (flows: ApprovalFlow[]) => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
  onUpdateUserModules: (userId: string, modules: string[]) => void;
  onUpdateHierarchy: (userId: string, data: Partial<User>) => void;
  onUserSelect: (userId: string) => void;
}

const UserManagementView: React.FC<UserManagementProps> = ({
  currentUser,
  users,
  flows,
  onUpdateUserRole,
  onUpdateUserModules,
  onUpdateHierarchy,
  onUserSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'workflows' | 'hierarchy' | 'master_data'>('employees');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800/50';
      case UserRole.MANAGER: return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800/50';
      case UserRole.SUPERVISOR: return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800/50';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50';
    }
  };

  const renderMasterData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {['Workforce Class', 'Service Groups', 'Location Master', 'Entity Codes'].map(item => (
        <div key={item} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <MoreHorizontal size={24} />
          </div>
          <h4 className="text-lg font-black text-gray-900 dark:text-slate-100 mb-2 uppercase tracking-tight">{item}</h4>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manage Master Records</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-1 h-1 bg-indigo-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Administrative Governance</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tighter">RESOURCE CONTROL</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-4 text-sm font-medium leading-relaxed max-w-xl">
            Authorize personnel, map organizational hierarchies, and configure automated multi-level approval workflows for enterprise engineering projects.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl flex">
            {(['employees', 'hierarchy', 'workflows', 'master_data'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-lg scale-105 z-10'
                  : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-slideUp">
          <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Filter by Name, NIK, or Job Title..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/10 font-medium text-sm transition-all" />
            </div>
            <button className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none">
              <Plus size={18} /> Provision New User
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 transition-colors">
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-5">Profile Entity</th>
                <th className="px-8 py-5">Role Clearance</th>
                <th className="px-8 py-5">Official Assignment</th>
                <th className="px-8 py-5 text-right">Clearance Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => { setSelectedUser(u); setIsEditing(false); setEditForm({}); }}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">NIK: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getRoleStyle(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{u.jobTitle}</p>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter">{u.jobRole || 'Engineering Specialist'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg border border-blue-100 dark:border-blue-900/50">{u.jobGrade || 'L' + (Math.floor(Math.random() * 4) + 1)} Clearance</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'master_data' && renderMasterData()}

      {activeTab === 'hierarchy' && (
        <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800 animate-fadeIn">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600">
            <Network size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">Visual Hierarchy Mapping</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The interactive organization tree is under maintenance. Automated approval routing based on supervisor IDs remains fully functional in the backend.
          </p>
          <button className="mt-8 px-10 py-3.5 bg-gray-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Launch Legacy Tree View</button>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
          {flows.map(flow => (
            <div key={flow.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
                <GitMerge size={64} className="rotate-12" />
              </div>
              <h5 className="text-xl font-black text-gray-900 dark:text-slate-100 mb-2">{flow.name}</h5>
              <p className="text-xs text-gray-500 mb-8 font-medium">{flow.description}</p>
              <div className="space-y-4">
                {flow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 relative">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black z-10">{idx + 1}</div>
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-slate-400">
                      {step}
                    </div>
                    {idx < flow.steps.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-4 bg-indigo-100 dark:bg-slate-700"></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800 animate-slide-in">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">{selectedUser.name}</h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/50">NIK: {selectedUser.id}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">{selectedUser.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onUpdateHierarchy(selectedUser.id, editForm);
                    setSelectedUser(prev => ({ ...prev, ...editForm } as User));
                    setIsEditing(false);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  disabled={!isEditing}
                >
                  <Save size={16} /> Save Changes
                </button>
                <button onClick={() => setSelectedUser(null)} className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl hover:bg-gray-50 transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Personal Data */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-50 dark:border-slate-800">
                    <Users className="text-indigo-600" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Personal Identity</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Professional Motto</label>
                      <input
                        defaultValue={selectedUser.motto}
                        onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, motto: e.target.value })) }}
                        placeholder="e.g. Precision in every calculation"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-100 rounded-2xl text-sm font-bold transition-all italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Place & Date of Birth</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          defaultValue={selectedUser.birthPlace}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, birthPlace: e.target.value })) }}
                          placeholder="Place"
                          className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-100 rounded-2xl text-sm font-bold transition-all"
                        />
                        <input
                          type="date"
                          defaultValue={selectedUser.birthDate}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, birthDate: e.target.value })) }}
                          className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-100 rounded-2xl text-sm font-bold transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Gender</label>
                        <select
                          defaultValue={selectedUser.gender}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, gender: e.target.value as any })) }}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold appearance-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Marital Status</label>
                        <select
                          defaultValue={selectedUser.maritalStatus}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, maritalStatus: e.target.value as any })) }}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold appearance-none"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Contact Details</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input
                            defaultValue={selectedUser.phoneNumber}
                            onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, phoneNumber: e.target.value })) }}
                            placeholder="Phone Number"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input
                            defaultValue={selectedUser.personalEmail}
                            onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, personalEmail: e.target.value })) }}
                            placeholder="Personal Email"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Residential Address</label>
                      <textarea
                        defaultValue={selectedUser.address}
                        onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, address: e.target.value })) }}
                        rows={3}
                        placeholder="Complete address including province/region"
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-3xl text-sm font-bold border border-transparent focus:border-indigo-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Data */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-50 dark:border-slate-800">
                    <Briefcase className="text-blue-600" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Professional Assignment</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Job Role</label>
                        <input
                          defaultValue={selectedUser.jobRole}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, jobRole: e.target.value })) }}
                          placeholder="e.g. Lead Process Engineer"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Job Grade</label>
                        <input
                          defaultValue={selectedUser.jobGrade}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, jobGrade: e.target.value })) }}
                          placeholder="e.g. M1, S2, E3"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Department</label>
                        <input
                          defaultValue={selectedUser.department}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, department: e.target.value })) }}
                          placeholder="Engineering, Prod, etc."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Emp. Status</label>
                        <select
                          defaultValue={selectedUser.employmentStatus}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, employmentStatus: e.target.value as any })) }}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold appearance-none"
                        >
                          <option value="Permanent">Permanent</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                          <option value="Probation">Probation</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Join Date</label>
                        <input
                          type="date"
                          defaultValue={selectedUser.joinDate}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, joinDate: e.target.value })) }}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Corporate Email</label>
                        <input
                          defaultValue={selectedUser.companyEmail}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, companyEmail: e.target.value })) }}
                          placeholder="work@peak-corp.com"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold"
                        />
                      </div>
                    </div>

                    {/* Job History Sub-section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Position History</label>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Plus size={14} /></button>
                      </div>
                      <div className="space-y-2">
                        {(selectedUser.jobHistory || []).map((jh, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 flex justify-between items-center group">
                            <div>
                              <p className="text-xs font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">{jh.title}</p>
                              <p className="text-[9px] font-black text-gray-400 mt-0.5">{jh.period}</p>
                            </div>
                            <button className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications & Education */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-amber-50 dark:border-slate-800">
                    <GraduationCap className="text-amber-600" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Credentials & Background</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Formal Education</label>
                        <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Plus size={14} /></button>
                      </div>
                      {(selectedUser.educationHistory || []).map((ed, idx) => (
                        <div key={idx} className="p-5 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl group">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{ed.degree}</p>
                              <p className="text-xs font-black text-gray-900 dark:text-slate-100 mt-1">{ed.school}</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-1">Graduated in {ed.year}</p>
                            </div>
                            <button className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Technical Skills Matrix</label>
                        <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Update Level</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedUser.skills || []).map((s, idx) => (
                          <div key={idx} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center gap-3">
                            {s.name}
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < s.level ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-white/20'}`}></div>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency & Languages */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-rose-50 dark:border-slate-800">
                    <Heart className="text-rose-600" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Safety & Communication</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/30">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4">Urgent Contact (Emergency)</p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            defaultValue={selectedUser.emergencyContact?.name}
                            onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, emergencyContact: { ...(p.emergencyContact || { relationship: '', phone: '' }), name: e.target.value } as any })) }}
                            placeholder="Full Name"
                            className="px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-xs font-bold"
                          />
                          <input
                            defaultValue={selectedUser.emergencyContact?.relationship}
                            onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, emergencyContact: { ...(p.emergencyContact || { name: '', phone: '' }), relationship: e.target.value } as any })) }}
                            placeholder="Relationship"
                            className="px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-xs font-bold"
                          />
                        </div>
                        <input
                          defaultValue={selectedUser.emergencyContact?.phone}
                          onChange={(e) => { setIsEditing(true); setEditForm(p => ({ ...p, emergencyContact: { ...(p.emergencyContact || { name: '', relationship: '' }), phone: e.target.value } as any })) }}
                          placeholder="Contact Phone Number"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Languages Mastered</label>
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Plus size={14} /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedUser.languages || []).map((lang, idx) => (
                          <div key={idx} className="px-4 py-2 border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} /> {lang}
                            <button className="hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;