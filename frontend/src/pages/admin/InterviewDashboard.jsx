import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, User, Briefcase, ExternalLink, Play, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';
import io from 'socket.io-client';
import InterviewRoom from '../../components/InterviewRoom';
import LiveEvaluation from './LiveEvaluation';

const InterviewDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeInterview, setActiveInterview] = useState(null);
    const [waitingCandidates, setWaitingCandidates] = useState([]);
    const [socket, setSocket] = useState(null);

    const fetchInterviews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/interviews/recruiter`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setInterviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();

        const newSocket = io(import.meta.env.VITE_SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('candidate-joined-waiting-room', ({ candidateName, socketId }) => {
            setWaitingCandidates(prev => [...prev, { name: candidateName, socketId }]);
        });

        return () => newSocket.disconnect();
    }, []);

    const handleApprove = (token, candidateSocketId) => {
        socket.emit('approve-entry', { roomId: token, socketId: candidateSocketId });
        setWaitingCandidates(prev => prev.filter(c => c.socketId !== candidateSocketId));

        const intv = interviews.find(i => i.token === token);
        setActiveInterview(intv);
    };

    const handleReject = (token, candidateSocketId) => {
        socket.emit('reject-entry', { roomId: token, socketId: candidateSocketId });
        setWaitingCandidates(prev => prev.filter(c => c.socketId !== candidateSocketId));
    };

    if (activeInterview) {
        return (
            <div className="flex h-screen overflow-hidden bg-black">
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1">
                        <InterviewRoom
                            roomName={activeInterview.token}
                            displayName="Recruiter"
                            onEndCall={() => setActiveInterview(null)}
                        />
                    </div>
                </div>

                {/* Sidebar for both Evaluation and Waiting Room */}
                <div className="w-[400px] shrink-0 border-l border-white/5 flex flex-col bg-[#05070a]">
                    <div className="flex-1 overflow-y-auto">
                        <LiveEvaluation
                            interviewId={activeInterview.id}
                            candidateName={activeInterview.candidate_name}
                            candidateSkills={activeInterview.candidate_skills}
                            jobTitle={activeInterview.job_title}
                            onComplete={() => {
                                setActiveInterview(null);
                                fetchInterviews();
                            }}
                        />
                    </div>

                    {/* Compact Waiting Room for Active Calls */}
                    {waitingCandidates.length > 0 && (
                        <div className="p-6 border-t border-white/5 bg-indigo-600/5">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center justify-between">
                                <span>Another Candidate Waiting</span>
                                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[8px]">{waitingCandidates.length}</span>
                            </h2>
                            <div className="space-y-3">
                                {waitingCandidates.map(candidate => (
                                    <div key={candidate.socketId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-black">
                                                {candidate.name?.[0] || '?'}
                                            </div>
                                            <span className="text-xs font-bold truncate max-w-[120px]">{candidate.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(activeInterview.token, candidate.socketId)}
                                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                            >
                                                Admit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-black text-white leading-tight">Interview Hub</h1>
                    <p className="text-slate-500 mt-1.5 text-base font-medium">Coordinate and conduct live technical assessments</p>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Interview Queue */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Scheduled Interviews</h2>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-black text-slate-400">{interviews.length} Total</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {interviews.map((interview, i) => (
                                    <motion.div
                                        key={interview.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-black text-xl">
                                                {interview.candidate_name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{interview.candidate_name}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-indigo-500" /> {interview.job_title}</span>
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500" /> {new Date(interview.interview_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${interview.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {interview.status}
                                            </span>
                                            {interview.status !== 'completed' && (
                                                <button
                                                    onClick={() => setActiveInterview(interview)}
                                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                                >
                                                    <Play size={16} fill="currentColor" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {interviews.length === 0 && (
                                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">No interviews scheduled</h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Waiting Room sidebar */}
                    <div className="space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Live Waiting Room</h2>
                        <div className="glass-card rounded-3xl border border-white/5 p-6 min-h-[300px]">
                            <AnimatePresence>
                                {waitingCandidates.length > 0 ? (
                                    waitingCandidates.map((candidate) => (
                                        <motion.div
                                            key={candidate.socketId}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-4"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black">
                                                    {candidate.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white leading-none">{candidate.name}</p>
                                                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Is Waiting...</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(interviews[0]?.token, candidate.socketId)}
                                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(interviews[0]?.token, candidate.socketId)}
                                                    className="px-3 py-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                            <Clock size={20} className="text-slate-600" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No candidates waiting</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Stats / Help */}
                        <div className="glass-card rounded-3xl border border-white/5 p-6 bg-gradient-to-br from-indigo-600/10 to-transparent">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Info size={12} />
                                CONDUCTING INTERVIEWS
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                Candidates join via unique links. You'll see them in the waiting room above. Approve entry to start the secure video session with live evaluation panels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default InterviewDashboard;
