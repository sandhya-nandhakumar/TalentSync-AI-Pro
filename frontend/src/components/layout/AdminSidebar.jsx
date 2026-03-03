import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, Users, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Target, Video } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
        { icon: Target, label: 'Match Engine', path: '/admin/match-engine' },
        { icon: Users, label: 'Candidates', path: '/admin/candidates' },
        { icon: Video, label: 'Interview Hub', path: '/admin/interviews' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <>
            <motion.div
                initial={false}
                animate={{ width: collapsed ? 100 : 280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-screen bg-[#05070a] border-r border-white/5 flex flex-col relative z-50 shadow-2xl"
            >
                <div className="p-8 flex items-center justify-between">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Zap className="text-white" size={20} fill="currentColor" />
                            </div>
                            <span className="text-xl font-black text-white tracking-widest uppercase">Sync<span className="text-indigo-500">AI</span></span>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'mx-auto' : ''}`}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 p-4 rounded-[20px] transition-all group relative ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={22} className={`${isActive ? 'text-white' : 'group-hover:text-indigo-400'} transition-colors`} />
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="font-bold text-sm tracking-wide uppercase"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {isActive && !collapsed && (
                                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-4 p-4 w-full rounded-[20px] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group overflow-hidden"
                    >
                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                        {!collapsed && <span className="font-bold text-sm tracking-wide uppercase">Sign Out</span>}
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-sm p-8 rounded-[32px] border border-white/10 text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <LogOut size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Sign Out?</h2>
                            <p className="text-slate-400 mb-8 font-medium">Are you sure you want to end your active session?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
                                >
                                    Log Out
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
