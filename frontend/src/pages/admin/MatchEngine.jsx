import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronRight, Zap, Target, Mail, Search, Award, ExternalLink, Eye, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

const MatchEngine = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            setJobs(res.data);
            if (res.data.length > 0) handleJobSelect(res.data[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJobSelect = async (job) => {
        setSelectedJob(job);
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/applications/job/${job.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCandidates(res.data.sort((a, b) => b.ai_match_score - a.ai_match_score));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!selectedJob) return;
        setLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/applications/job/${selectedJob.id}/recalculate`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            handleJobSelect(selectedJob);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            handleJobSelect(selectedJob);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleSendEmail = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/applications/${id}/send-email`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Status update email sent to candidate');
        } catch (err) {
            alert('Failed to send email');
        }
    };

    const openResume = (path) => {
        if (!path) return;
        const filename = path.split('\\').pop().split('/').pop();
        window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
    };

    const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <AdminLayout>
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Sidebar: Job Selection */}
                <div className="w-full lg:w-96 space-y-10">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-4">
                            <Zap className="text-indigo-500 fill-indigo-500" size={32} />
                            Active Job Engines
                        </h2>
                        <div className="relative mt-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 font-black" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase px-2">Select Active Pipeline</p>
                        <div className="space-y-4">
                            {filteredJobs.map(job => (
                                <motion.div
                                    key={job.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleJobSelect(job)}
                                    className={`p-6 rounded-[28px] cursor-pointer transition-all border ${selectedJob?.id === job.id
                                        ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`text-lg font-black ${selectedJob?.id === job.id ? 'text-white' : 'text-slate-200'}`}>{job.title}</h4>
                                            <p className={`text-xs mt-1 font-bold ${selectedJob?.id === job.id ? 'text-indigo-100' : 'text-slate-500'}`}>Hashone Connect</p>
                                        </div>
                                        <ChevronRight size={20} className={selectedJob?.id === job.id ? 'text-white' : 'text-slate-500'} />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedJob?.id === job.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>FULL-TIME</span>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedJob?.id === job.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>{job.experience}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Match Results */}
                <div className="flex-1 space-y-10">
                    <AnimatePresence mode="wait">
                        {!selectedJob || loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                                    <Zap className={`text-indigo-400 ${loading ? 'animate-pulse' : ''}`} size={32} fill="currentColor" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">{loading ? 'Engine Synchronization' : 'AI Match Engine'}</h3>
                                <p className="text-slate-500 max-w-sm font-medium text-sm leading-relaxed">
                                    {loading ? 'Analyzing all candidates based on latest requirements.' : 'Select a pipeline to rank applicants by match score.'}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-black text-white leading-tight">
                                            Results for <span className="text-indigo-500">{selectedJob.title}</span>
                                        </h2>
                                        <div className="flex items-center gap-5 mt-3">
                                            <p className="text-slate-500 flex items-center gap-1.5 font-black text-[9px] tracking-widest uppercase">
                                                <Target size={14} className="text-indigo-500" /> {candidates.length} ranked
                                            </p>
                                            <button
                                                onClick={handleSync}
                                                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-black text-[9px] tracking-widest uppercase active:scale-95"
                                            >
                                                <Zap size={14} fill="currentColor" /> Sync Engine
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                                            <Award size={16} className="text-yellow-500" />
                                            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase">TOP: </span>
                                            <span className="text-lg font-black text-white">{candidates[0]?.ai_match_score || 0}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {candidates.map((c, i) => (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-card p-6 rounded-[28px] relative overflow-hidden group border border-white/5"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-black text-white mb-1 leading-tight">{c.candidate_name}</h3>
                                                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-slate-500">
                                                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-indigo-500" /> {c.candidate_email}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] mb-0.5 uppercase">OVERALL MATCH</p>
                                                    <p className={`text-5xl font-black ${c.ai_match_score >= 75 ? 'text-green-500' : c.ai_match_score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {c.ai_match_score}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase">
                                                        <span className="text-slate-500">Skills Match</span>
                                                        <span className={c.skill_match_score >= 75 ? 'text-green-500' : c.skill_match_score >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                                                            {c.skill_match_score}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.skill_match_score}%` }} className={`h-full ${c.skill_match_score >= 75 ? 'bg-green-500' : c.skill_match_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {c.skills?.split(',').slice(0, 8).map(skill => (
                                                            <span key={skill} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${selectedJob.required_skills?.toLowerCase().includes(skill.trim().toLowerCase()) ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-white/5 text-slate-500 border border-white/5'}`}>{skill.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase">
                                                        <span className="text-slate-500">Experience Match</span>
                                                        <span className={c.exp_match_score >= 75 ? 'text-green-500' : c.exp_match_score >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                                                            {c.exp_match_score}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.exp_match_score}%` }} className={`h-full ${c.exp_match_score >= 75 ? 'bg-green-500' : c.exp_match_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                    </div>
                                                    <div className="flex gap-3 items-center pt-2">
                                                        <button onClick={() => openResume(c.resume_path)} className="flex-1 h-10 flex items-center justify-center gap-2 px-4 rounded-xl bg-white/5 text-white font-black text-[9px] tracking-widest uppercase hover:bg-white/10 transition-all border border-white/5">
                                                            <ExternalLink size={14} /> Resume
                                                        </button>
                                                        <button onClick={() => handleSendEmail(c.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all">
                                                            <Mail size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminLayout>
    );
};

export default MatchEngine;
