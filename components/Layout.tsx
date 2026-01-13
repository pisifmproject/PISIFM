import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// Fix: Removed non-existent UserFeedback from imports
import { User, Notification } from '../types';
import { NAV_ITEMS, MOCK_EVENTS } from '../constants';
import ChatDrawer from './Collaboration/ChatDrawer';
import {
  Menu, Bell, Search, LogOut,
  ChevronRight, ChevronDown, X, Briefcase,
  Clock, AlertTriangle, Info, BellRing, Trash2, Check, ExternalLink,
  History, ArrowRight, MessageSquare, Star, Smile, Frown, Meh, Laugh, Angry, Loader2,
  CheckCircle, Sun, Moon, AlertOctagon
} from 'lucide-react';

interface LayoutProps {
  children: React.Node;
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSwitchUser?: () => void;
  users: User[];
  notifications?: Notification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  theme,
  toggleTheme,
  onLogout,
  currentPath,
  onNavigate,
  onSwitchUser,
  users,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  // Use useLocation to get reactive path updates
  const location = useLocation();
  const activePath = location.pathname;
  
  // Determine if we are in a Command Center module
  const commandCenterIds = ['projects', 'resources', 'performance', 'requests', 'finance', 'ai_copilot'];
  const isCommandCenterActive = NAV_ITEMS.some(item => 
    commandCenterIds.includes(item.id) && activePath.startsWith(item.path) && item.path !== '/'
  );

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Initialize Open state based on active path
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(isCommandCenterActive);

  // Sync open state when path changes (optional, but good for deep linking)
  useEffect(() => {
    if (isCommandCenterActive) {
      setIsCommandCenterOpen(true);
    }
  }, [isCommandCenterActive]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlertSound = (type: 'critical' | 'normal') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'critical') {
        // More aggressive sound for critical
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;
  const criticalUnreadCount = unreadNotifications.filter(n => n.type === 'critical' || n.type === 'overdue').length;
  const prevUnreadCountRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      const latest = unreadNotifications[0];
      const isUrgent = latest?.type === 'critical' || latest?.type === 'overdue';
      playAlertSound(isUrgent ? 'critical' : 'normal');
      setActiveToast(latest);
      const timer = setTimeout(() => setActiveToast(null), 6000);
      return () => clearTimeout(timer);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

  const filteredNavItems = NAV_ITEMS.filter(item => user.allowedModules.includes(item.moduleId));

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="text-red-500" size={16} />;
      case 'overdue': return <Clock className="text-orange-500" size={16} />;
      case 'system': return <Info className="text-blue-500" size={16} />;
      default: return <BellRing className="text-indigo-500" size={16} />;
    }
  };

  const getNotifColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white dark:bg-slate-900';
    switch (type) {
      case 'critical': return 'bg-red-50 border-l-4 border-red-500 dark:bg-red-950/20';
      case 'overdue': return 'bg-orange-50 border-l-4 border-orange-500 dark:bg-orange-950/20';
      default: return 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950/20';
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0 || !feedbackCategory) return;
    setIsSubmittingFeedback(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmittingFeedback(false);
    setFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSuccess(false);
      setFeedbackRating(0);
      setFeedbackCategory('');
      setFeedbackComment('');
    }, 2000);
  };

  const ratings = [
    { value: 1, icon: Angry, color: 'text-red-500', label: 'Terrible' },
    { value: 2, icon: Frown, color: 'text-orange-500', label: 'Bad' },
    { value: 3, icon: Meh, color: 'text-yellow-500', label: 'Okay' },
    { value: 4, icon: Smile, color: 'text-blue-500', label: 'Good' },
    { value: 5, icon: Laugh, color: 'text-green-500', label: 'Great' },
  ];

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <style>{`
        @keyframes bell-shake {
          0% { transform: rotate(0); }
          15% { transform: rotate(5deg); }
          30% { transform: rotate(-5deg); }
          45% { transform: rotate(4deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(2deg); }
          85% { transform: rotate(-2deg); }
          100% { transform: rotate(0); }
        }
        .animate-bell-shake {
          animation: bell-shake 0.8s cubic-bezier(.36,.07,.19,.97) infinite;
        }
        @keyframes toast-progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-toast-progress {
          animation: toast-progress 6s linear forwards;
        }
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in 0.3s ease-out forwards;
        }
        @keyframes banner-pulse {
          0% { background-color: #dc2626; }
          50% { background-color: #ef4444; }
          100% { background-color: #dc2626; }
        }
        .animate-banner-pulse {
          animation: banner-pulse 2s infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes nav-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(99, 102, 241, 0.2);
          }
          50% { 
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.5), 0 0 45px rgba(99, 102, 241, 0.3);
          }
        }
        .animate-nav-glow {
          animation: nav-glow 2s ease-in-out infinite;
        }
        .nav-hover-glow:hover {
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.3), 0 0 15px rgba(99, 102, 241, 0.2);
        }
        @keyframes nav-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Floating Feedback Trigger */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-14 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all group flex items-center gap-2"
        title="Give Application Feedback"
      >
        <MessageSquare size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold text-sm whitespace-nowrap px-0 group-hover:px-1">
          Feedback
        </span>
      </button>

      {/* Enhanced Real-time Toast Notification */}
      {activeToast && (
        <div className="fixed top-24 right-6 z-[200] w-80 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 overflow-hidden animate-slide-in-right">
          <div className={`h-1 animate-toast-progress ${activeToast.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          <div className="p-4 flex gap-4">
            <div className={`p-2.5 rounded-xl shrink-0 h-fit ${activeToast.type === 'critical' ? 'bg-red-500 shadow-lg shadow-red-900/20' : 'bg-blue-500'}`}>
              {activeToast.type === 'critical' ? <AlertOctagon size={20} /> : <BellRing size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm truncate pr-2">{activeToast.title}</h4>
                <button onClick={() => setActiveToast(null)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{activeToast.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (activeToast.link) onNavigate(activeToast.link);
                    setActiveToast(null);
                  }}
                  className="flex-1 text-[10px] font-black bg-white/10 hover:bg-white/20 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all border border-white/5 active:scale-95"
                >
                  TAKE ACTION <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white
        transform transition-transform duration-300
        lg:transform-none lg:fixed lg:inset-y-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col shadow-2xl overflow-hidden
      `}>
        <div className="absolute inset-0 blueprint-grid opacity-[0.05] pointer-events-none"></div>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent tracking-tighter">
              PEAK
            </h1>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Analysis & Review System</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {(() => {
            const dashboardItem = filteredNavItems.find(item => item.id === 'dashboard');
            const commandCenterItems = filteredNavItems.filter(item => commandCenterIds.includes(item.id));
            const otherItems = filteredNavItems.filter(item => !commandCenterIds.includes(item.id) && item.id !== 'dashboard');
            
            const isDashboardActive = activePath === '/';

            return (
              <>
                {/* Command Center Group */}
                {dashboardItem && (
                  <div className="space-y-1">
                    <div
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative cursor-pointer ${isDashboardActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : (isCommandCenterActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')
                      }`}
                      onClick={() => {
                        if (activePath !== '/') onNavigate('/');
                        setIsCommandCenterOpen(!isCommandCenterOpen);
                      }}
                    >
                      <div className="flex items-center space-x-3 relative z-10">
                        <dashboardItem.icon size={20} className={`${isDashboardActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="font-medium text-sm tracking-wide">{dashboardItem.label}</span>
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCommandCenterOpen(!isCommandCenterOpen);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isCommandCenterOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>

                    {/* Dropdown Items */}
                    {isCommandCenterOpen && (
                      <div className="pl-4 space-y-1 animate-slide-in-right">
                        {commandCenterItems.map(item => {
                          const Icon = item.icon;
                          const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNavigate(item.path);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-white text-slate-900 shadow-md font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                              <div className="flex items-center space-x-3 relative z-10">
                                <Icon size={18} className={`${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-white'}`} />
                                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Other Items */}
                <div className="pt-2 mt-2 border-t border-slate-800/50">
                  {otherItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center space-x-3 relative z-10">
                          <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                          <span className="font-medium text-sm tracking-wide">{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 mt-auto">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center space-x-3 text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all group text-left relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <span className="font-bold text-sm">{user.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate" title={user.name}>{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.jobTitle}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-colors duration-300 lg:pl-72">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl w-96 border border-gray-200 dark:border-slate-700">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, projects, or users..."
              className="bg-transparent border-none outline-none ml-3 text-sm w-full dark:text-slate-100 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`p-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-slate-800 relative ${unreadCount > 0
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900'
                  : 'text-gray-500 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800'
                  } ${criticalUnreadCount > 0 ? 'animate-bell-shake text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className={`absolute top-0 right-0 w-5 h-5 ${criticalUnreadCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'} text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 transform translate-x-1 -translate-y-1 shadow-md`}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-slate-800 relative text-gray-500 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
              >
                <MessageSquare size={22} />
              </button>

              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 z-20 overflow-hidden animate-slide-in">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={onClearNotifications}
                          className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                          <BellRing className="text-gray-200 dark:text-slate-800 mb-2" size={32} />
                          <p className="text-xs text-gray-400">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-50 dark:border-slate-800 transition-colors relative group ${getNotifColor(notif.type, notif.read)}`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-1 shrink-0">{getNotifIcon(notif.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <p className={`text-xs font-bold leading-none ${notif.read ? 'text-gray-700 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>{notif.title}</p>
                                  <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed mb-2 ${notif.read ? 'text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-300'}`}>{notif.message}</p>
                                <div className="flex gap-2">
                                  {notif.link && (
                                    <button
                                      onClick={() => {
                                        onNavigate(notif.link!);
                                        setShowNotifDropdown(false);
                                      }}
                                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink size={10} /> View Details
                                    </button>
                                  )}
                                  {!notif.read && (
                                    <button
                                      onClick={() => onMarkNotificationRead?.(notif.id)}
                                      className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                      <Check size={10} /> Mark read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onSwitchUser}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-slate-400 transition-all active:scale-95"
            >
              <History size={16} /> Switch Role
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <LogOut size={22} />
            </button>
          </div>
        </header>

        {/* Critical Alert Banner */}
        {criticalUnreadCount > 0 && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between animate-banner-pulse shrink-0 shadow-lg relative z-[5]">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-1.5 rounded-lg border border-white/20">
                <AlertTriangle size={20} className="animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em]">Critical Alert Protocol Active</p>
                <p className="text-[10px] text-red-100 font-bold opacity-90">{criticalUnreadCount} unread high-priority safety or project tasks require immediate verification.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onNavigate('/projects');
                setShowNotifDropdown(true);
              }}
              className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-all shadow-md active:scale-95"
            >
              Review Items Now
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        <footer className="h-10 bg-slate-900 border-t border-slate-800 flex items-center px-4 text-slate-400 shrink-0 relative z-20">
          <div className="flex items-center gap-2 mr-4 text-slate-300 font-bold shrink-0 bg-slate-800 px-3 py-1 rounded z-20 relative shadow-lg">
            <Clock size={14} /> LIVE EVENTS
          </div>
          <div className="flex-1 overflow-hidden h-full flex items-center relative">
            <div className="flex items-center gap-8 animate-marquee">
              {MOCK_EVENTS.map(event => (
                <div key={event.id} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span className={`w-2 h-2 rounded-full ${event.type === 'Deadline' ? 'bg-red-500' : 'bg-blue-400'}`}></span>
                  <span className="font-bold text-slate-200">{event.title}</span>
                  <span className="text-slate-500">@{event.time}</span>
                </div>
              ))}
              {MOCK_EVENTS.map(event => (
                <div key={`${event.id}-dup`} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span className={`w-2 h-2 rounded-full ${event.type === 'Deadline' ? 'bg-red-500' : 'bg-blue-400'}`}></span>
                  <span className="font-bold text-slate-200">{event.title}</span>
                  <span className="text-slate-500">@{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* User Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => !isSubmittingFeedback && setShowFeedbackModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-slide-in border dark:border-slate-800">
            {feedbackSuccess ? (
              <div className="p-12 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Thank You!</h3>
                <p className="text-gray-500 dark:text-slate-400">Your feedback helps us build a better PEAK experience.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Application Feedback</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">How is your experience with the system?</p>
                  </div>
                  <button
                    disabled={isSubmittingFeedback}
                    onClick={() => setShowFeedbackModal(false)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Overall Satisfaction</label>
                    <div className="flex justify-between gap-2">
                      {ratings.map((rating) => {
                        const RatingIcon = rating.icon;
                        const isSelected = feedbackRating === rating.value;
                        return (
                          <button
                            key={rating.value}
                            type="button"
                            onClick={() => setFeedbackRating(rating.value)}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 shadow-md transform scale-105'
                              : 'bg-gray-50 dark:bg-slate-800 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                          >
                            <RatingIcon size={28} className={isSelected ? rating.color : 'text-gray-400'} />
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>{rating.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">What can we improve?</label>
                    <select
                      required
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm dark:text-slate-100"
                    >
                      <option value="" disabled className="dark:bg-slate-900">Select a category...</option>
                      <option value="UI/UX Design" className="dark:bg-slate-900">UI/UX Design & Layout</option>
                      <option value="New Feature" className="dark:bg-slate-900">New Feature Request</option>
                      <option value="Bug Report" className="dark:bg-slate-900">Technical Bug / Error</option>
                      <option value="Performance" className="dark:bg-slate-900">Performance / Speed</option>
                      <option value="Other" className="dark:bg-slate-900">Other Suggestions</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Additional Details</label>
                    <textarea
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm dark:text-slate-100"
                      rows={4}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackRating === 0 || !feedbackCategory || isSubmittingFeedback}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Submit Feedback <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setShowProfileModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-slide-in border dark:border-slate-800">
            <div className="h-32 bg-gradient-to-br from-indigo-600 via-blue-700 to-teal-500"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6">
                <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.avatar}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
              </div>
              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{user.name}</h3>
                <p className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Briefcase size={16} className="text-slate-400" />
                  {user.jobTitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">NIK</p>
                  <p className="font-mono text-sm text-gray-800 dark:text-slate-100">{user.id}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Role</p>
                  <p className="text-sm text-gray-800 dark:text-slate-100 font-bold">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
              >
                Close Profile
              </button>
            </div>
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
      )}


      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        users={users}
      />
    </div>
  );
};

export default Layout;