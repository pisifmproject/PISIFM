
import React, { useState } from 'react';
import {
    Eye, EyeOff, Lock, Mail,
    ArrowRight, Loader2, Settings,
    Cpu, Zap, ShieldCheck, UserPlus,
    LogIn, Binary, Database, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthViewProps {
    onLogin: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        department: 'Engineering'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate mechanical authentication process
        setTimeout(() => {
            setLoading(false);
            onLogin();
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
            <div className="absolute inset-0 blueprint-grid-fine opacity-10 pointer-events-none" />

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />

            {/* Main Auth Card */}
            <div className="relative z-10 w-full max-w-md px-6 animate-fadeIn">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">

                    {/* Header Section */}
                    <div className="text-center mb-8 relative">
                        <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/20 group hover:scale-110 transition-transform duration-500">
                            <Zap className="text-blue-400 w-8 h-8 group-hover:animate-pulse" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            PISIFM <span className="text-blue-500 font-light">SYSTEM</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Operation Terminal</p>
                    </div>

                    {/* Sliding Toggle (Segmented Control) */}
                    <div className="relative bg-slate-950/50 p-1 rounded-2xl mb-8 flex items-center border border-white/5">
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-blue-600 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-blue-600/20 ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form Container */}
                    <div className="relative overflow-hidden min-h-[300px]">
                        <form onSubmit={handleSubmit} className={`space-y-5 transition-all duration-500 ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none absolute inset-0'}`}>
                            <div className="space-y-4">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Identification ID"
                                        className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium placeholder-slate-600"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Access Protocol"
                                        className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium placeholder-slate-600"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-xs uppercase tracking-[0.2em] mt-8"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Authorize Entry
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <a href="#" className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest font-black">
                                    Lost access keys?
                                </a>
                            </div>
                        </form>

                        {/* Sign Up Form Area */}
                        <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-500 ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none absolute inset-0'}`}>
                            <div className="space-y-3">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Registry Name"
                                        className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium placeholder-slate-600"
                                    />
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Communication ID"
                                        className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium placeholder-slate-600"
                                    />
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Set Access Protocol"
                                        className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium placeholder-slate-600"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-xs uppercase tracking-[0.2em] mt-6"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Initialize Protocol
                                        <UserPlus size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Technical Meta */}
                <div className="mt-8 flex flex-col items-center gap-4 animate-fadeInDelay">
                    <div className="flex items-center gap-6 text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-blue-500/50" /> Secure_SSL</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                        <span className="flex items-center gap-1.5"><Database size={10} className="text-blue-500/50" /> Encrypted_DB</span>
                    </div>

                    <div className="px-4 py-1.5 bg-slate-900/50 border border-white/5 rounded-full text-[8px] text-slate-600 font-medium uppercase tracking-widest">
                        v4.2.1-stable // build.0x992
                    </div>
                </div>
            </div>

            {/* Decorative Gears/Machinery (reused from original but scaled down) */}
            <div className="absolute -top-20 -left-20 text-blue-500/5 animate-rotate-slow pointer-events-none">
                <Settings size={240} strokeWidth={0.5} />
            </div>
            <div className="absolute -bottom-40 -right-20 text-indigo-500/5 animate-rotate-reverse-slow pointer-events-none">
                <Settings size={400} strokeWidth={0.5} />
            </div>
        </div>
    );
};

export default AuthView;

