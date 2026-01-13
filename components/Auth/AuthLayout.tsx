
import React from 'react';
import { Briefcase } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10 mx-4">
                {/* Logo/Brand Area */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 mb-6 shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-300">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {subtitle}
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 transform transition-all hover:border-white/20">
                    {children}
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} PEAK System. Secure Enclave.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
