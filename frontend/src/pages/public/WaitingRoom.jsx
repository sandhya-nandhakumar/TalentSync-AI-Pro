import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, ShieldAlert, Clock, CheckCircle2, XCircle } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import InterviewRoom from '../../components/InterviewRoom';

const WaitingRoom = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, waiting, approved, rejected, error
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/interviews/join/${token}`);
                setInterview(res.data);
                setStatus('waiting');

                // Initialize Socket
                const newSocket = io(import.meta.env.VITE_SOCKET_URL);
                setSocket(newSocket);

                newSocket.emit('join-room', res.data.token);
                newSocket.emit('candidate-waiting', {
                    roomId: res.data.token,
                    candidateName: res.data.candidate_name
                });

                newSocket.on('entry-approved', () => setStatus('approved'));
                newSocket.on('entry-rejected', () => setStatus('rejected'));

            } catch (err) {
                console.error(err);
                setStatus('error');
                setError(err.response?.data?.error || 'Failed to join interview');
            }
        };

        fetchInterview();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [token]);

    const handleEndCall = () => {
        navigate('/');
    };

    if (status === 'approved') {
        return (
            <InterviewRoom
                roomName={interview.token}
                displayName={interview.candidate_name}
                onEndCall={handleEndCall}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 bg-gradient-premium">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full"></div>

                <div className="relative z-10 text-center">
                    {status === 'loading' && (
                        <div className="py-12">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h2 className="text-xl font-black uppercase tracking-widest">Verifying Link</h2>
                        </div>
                    )}

                    {status === 'waiting' && (
                        <>
                            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                                <Clock size={40} className="text-indigo-400 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Waiting Room</h2>
                            <p className="text-slate-400 font-medium mb-8">Hello <span className="text-white">{interview?.candidate_name}</span>. The recruiter has been notified of your arrival. Please wait for approval.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                                    <Video size={20} className="text-slate-500 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Camera</span>
                                    <span className="text-xs font-bold text-green-500 mt-1">Ready</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                                    <Mic size={20} className="text-slate-500 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Mic</span>
                                    <span className="text-xs font-bold text-green-500 mt-1">Ready</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 text-left">
                                <ShieldAlert size={20} className="text-indigo-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Security Note</p>
                                    <p className="text-[11px] text-slate-300 font-medium leading-tight">Your session is secure and encrypted. Only the intended recruiter can admit you.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'rejected' && (
                        <div className="py-12">
                            <XCircle size={60} className="text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Entry Denied</h2>
                            <p className="text-slate-400 font-medium">The recruiter has declined your entry request. If you believe this is a mistake, please contact support.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-12">
                            <ShieldAlert size={60} className="text-yellow-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Access Error</h2>
                            <p className="text-slate-400 font-medium">{error}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default WaitingRoom;
