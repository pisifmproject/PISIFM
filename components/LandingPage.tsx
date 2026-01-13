import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowRight, Activity, Database, ShieldCheck, Zap, Monitor, Cpu } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1e] text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
            <div className="absolute inset-0 blueprint-grid-fine opacity-10 pointer-events-none" />
            
            {/* Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />

            {/* Floating Gears */}
            <div className="absolute top-20 left-20 text-blue-500/5 animate-rotate-slow pointer-events-none">
                <Settings size={300} strokeWidth={0.5} />
            </div>
            <div className="absolute bottom-20 right-20 text-indigo-500/5 animate-rotate-reverse-slow pointer-events-none">
                <Settings size={400} strokeWidth={0.5} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fadeIn">
                <div className="inline-flex p-5 bg-blue-600/10 rounded-2xl mb-8 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.2)] backdrop-blur-xl group hover:scale-110 transition-transform duration-500">
                    <Zap className="text-blue-400 w-16 h-16 group-hover:animate-pulse" />
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 drop-shadow-2xl">
                    PISIFM
                </h1>
                
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-6 opacity-50" />

                <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light tracking-[0.2em] max-w-3xl uppercase">
                    Project Information System <span className="text-blue-400 font-bold glow-text">IFM</span>
                </p>

                <button 
                    onClick={() => navigate('/login')}
                    className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-xl overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:translate-y-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative flex items-center gap-4 text-base font-bold tracking-[0.2em] uppercase">
                        Initialize System
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>

                {/* Footer Features */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    <div className="flex flex-col items-center gap-3 group hover:text-blue-400 transition-colors cursor-default">
                        <Monitor className="text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                        <span>Dashboard</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group hover:text-blue-400 transition-colors cursor-default">
                        <Activity className="text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                        <span>Analytics</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group hover:text-blue-400 transition-colors cursor-default">
                        <ShieldCheck className="text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                        <span>Security</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group hover:text-blue-400 transition-colors cursor-default">
                        <Cpu className="text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                        <span>Automation</span>
                    </div>
                </div>

                <div className="mt-16 text-[9px] text-slate-700 font-mono">
                    SYSTEM READY // WAITING FOR INPUT
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
