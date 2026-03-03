import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Trash2, ExternalLink, Mail, ChevronDown, Users, Video, Calendar, X } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

const CandidateManagement = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [interviewDate, setInterviewDate] = useState('');

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/applications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/applications/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCandidates();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleScheduleInterview = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/interviews/schedule`, {
                application_id: selectedCandidate.id,
                interview_date: interviewDate
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Interview scheduled successfully!');
            setIsScheduleModalOpen(false);
        } catch (err) {
            alert('Failed to schedule interview');
        }
    };

    const openResume = (path) => {
        const filename = path.split('\\').pop().split('/').pop();
        window.open(`${import.meta.env.VITE_SOCKET_URL}/uploads/${filename}`, '_blank');
    };

    const filteredCandidates = candidates.filter(c =>
        c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <h1 className="text-3xl font-black text-white leading-tight">Candidate Portal</h1>
                        <p className="text-slate-500 mt-1.5 text-base font-medium">Active applicant tracking and pipeline management</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 font-bold" />
                        <input
                            type="text"
                            placeholder="Search pool..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </motion.header>

                <div className="flex flex-col gap-4">
                    <AnimatePresence>
                        {filteredCandidates.map((candidate, i) => (
                            <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 rounded-2xl group flex flex-col md:flex-row items-center gap-6 border border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-lg font-black shadow-inner shrink-0 leading-none">
                                    {candidate.candidate_name[0]}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors truncate">{candidate.candidate_name}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${candidate.status === 'hired' ? 'bg-green-500/10 text-green-500' :
                                            candidate.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                candidate.status === 'shortlisted' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    candidate.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-white/5 text-slate-400'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="truncate max-w-[200px]">{candidate.candidate_email}</span>
                                        <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-indigo-500" /> {candidate.exp_match_score > 0 ? `${Math.round(candidate.exp_match_score / 20)}y exp` : 'Entry'}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500" /> Coimbatore</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 max-w-md justify-center md:justify-start">
                                    {candidate.skills?.split(',').slice(0, 4).map(skill => (
                                        <span key={skill} className="px-2 py-1 rounded-md bg-white/5 text-slate-400 font-black text-[9px] uppercase tracking-wider border border-white/5">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                    {candidate.skills?.split(',').length > 4 && (
                                        <span className="px-2 py-1 rounded-md bg-white/5 text-slate-500 font-black text-[9px] uppercase tracking-widest">
                                            +{candidate.skills.split(',').length - 4}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 h-10">
                                    <div className="relative group/dropdown h-full">
                                        <select
                                            value={candidate.status}
                                            onChange={(e) => handleStatusUpdate(candidate.id, e.target.value)}
                                            className="h-full px-4 pr-8 rounded-xl bg-white/5 border border-white/10 font-black text-[9px] tracking-widest uppercase text-slate-300 cursor-pointer transition-all appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="new">new</option>
                                            <option value="shortlisted">shortlisted</option>
                                            <option value="rejected">rejected</option>
                                            <option value="hired">hired</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={10} />
                                    </div>
                                    <button
                                        onClick={() => openResume(candidate.resume_path)}
                                        className="h-full px-5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2"
                                    >
                                        <ExternalLink size={12} /> Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCandidate(candidate);
                                            setIsScheduleModalOpen(true);
                                        }}
                                        className="h-full px-5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2"
                                    >
                                        <Video size={12} /> Interview
                                    </button>
                                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {!loading && filteredCandidates.length === 0 && (
                    <div className="mt-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center mb-6">
                            <Users size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No candidates found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Scheduling Modal */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0d1117] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
                                    <Video size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Schedule Interview</h3>
                                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Candidate: {selectedCandidate?.candidate_name}</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Select Date & Time</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="datetime-local"
                                            value={interviewDate}
                                            onChange={(e) => setInterviewDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleScheduleInterview}
                                        disabled={!interviewDate}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        Generate Interview Link
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default CandidateManagement;
