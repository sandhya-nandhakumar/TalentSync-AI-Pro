import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, Zap, ChevronRight, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_candidates: 0,
        active_jobs: 0,
        avg_match_score: 0,
        best_match_score: 0,
        best_candidate: null
    });
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const expData = [
        { name: '0-2', count: 2 },
        { name: '2-5', count: 1 },
        { name: '5-8', count: 1 },
        { name: '8+', count: 0 },
    ];

    const scoreData = [
        { name: '0-25', count: 1, color: '#8b5cf6' },
        { name: '25-50', count: 2, color: '#3b82f6' },
        { name: '50-75', count: 1, color: '#10b981' },
        { name: '75+', count: 0, color: '#f59e0b' },
    ];

    const statCards = [
        { label: 'TOTAL CANDIDATES', val: stats.total_candidates, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'ACTIVE JOBS', val: stats.active_jobs, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'AVG MATCH SCORE', val: `${stats.avg_match_score}%`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'BEST MATCH', val: `${stats.best_match_score}%`, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    return (
        <AdminLayout>
            <div className="max-w-[1200px] mx-auto p-2 md:p-4">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        Good evening, {user.name || 'Adhish'} <span className="animate-bounce">👋</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-base font-medium">Here's your recruiting overview</p>
                </motion.header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-5 rounded-[20px] relative overflow-hidden group border border-white/5 active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] mb-2 uppercase">{stat.label}</p>
                                    <p className="text-3xl font-black text-white">{stat.val}</p>
                                </div>
                                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Middle Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 rounded-[28px] border border-white/5"
                    >
                        <h3 className="text-[10px] font-black text-slate-500 tracking-[0.2em] mb-6 uppercase">Experience Distribution</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                                        {expData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 rounded-[28px] border border-white/5"
                    >
                        <h3 className="text-[10px] font-black text-slate-500 tracking-[0.2em] mb-6 uppercase">Match Score Distribution</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scoreData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                                        {scoreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Best Match Spotlight */}
                {stats.best_candidate && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 rounded-[28px] relative overflow-hidden group border border-white/5 active:scale-[0.995] transition-transform"
                    >
                        <div className="absolute top-0 right-0 p-6">
                            <Zap className="text-yellow-500 opacity-10 group-hover:opacity-40 transition-opacity" size={80} />
                        </div>

                        <div className="flex items-center gap-2 mb-6 text-yellow-500">
                            <Award size={16} />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Best Match Spotlight</span>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-indigo-500/10">
                                    {stats.best_candidate.candidate_name[0]}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white leading-tight">{stats.best_candidate.candidate_name}</h4>
                                    <p className="text-slate-400 mt-1 text-xs font-bold uppercase tracking-widest">
                                        Applied for <span className="text-indigo-400">{stats.best_candidate.job_title}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] mb-0.5 uppercase">MATCH SCORE</p>
                                <p className="text-4xl font-black text-white">{stats.best_candidate.ai_match_score}%</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 relative z-10">
                            <div className="flex justify-between text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                                <span>Overall Match Analysis</span>
                                <span className="text-indigo-400 font-black">{stats.best_candidate.ai_match_score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.best_candidate.ai_match_score}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-3">
                                {stats.best_candidate.skills?.split(', ').slice(0, 10).map(skill => (
                                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-colors uppercase">{skill}</span>
                                ))}
                                {(stats.best_candidate.skills?.split(', ').length > 10) && (
                                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] font-black text-slate-500 uppercase">+{stats.best_candidate.skills.split(', ').length - 10} more</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
