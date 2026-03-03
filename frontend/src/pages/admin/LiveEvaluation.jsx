import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, FileText, MessageSquare, Award, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import axios from 'axios';

const LiveEvaluation = ({ interviewId, candidateName, candidateSkills, onComplete }) => {
    const [questions, setQuestions] = useState({ technical: [], behavioral: [], experience: [] });
    const [evaluations, setEvaluations] = useState({});
    const [ratings, setRatings] = useState({ technical: 0, communication: 0 });
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // In a real app, this would be an API call to get generated questions
                // For now, we use the candidate data to generate them locally or via a specialized endpoint
                const res = await axios.get(`http://localhost:5000/api/applications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                // Mock question generation based on skills (mirroring backend logic)
                const skills = candidateSkills || 'React, Node.js, SQL';
                const skillList = skills.split(',').map(s => s.trim());

                setQuestions({
                    technical: skillList.slice(0, 3).map(skill => ({
                        id: `tech-${skill}`,
                        text: `Explain the core concepts of ${skill} and how you've used it in your projects.`,
                        category: 'technical'
                    })),
                    behavioral: [
                        { id: 'beh-1', text: 'Tell me about a challenging project you worked on.', category: 'behavioral' },
                        { id: 'beh-2', text: 'How do you handle disagreement in a team?', category: 'behavioral' }
                    ],
                    experience: [
                        { id: 'exp-1', text: 'What are your career goals for the next 3 years?', category: 'experience' }
                    ]
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [candidateSkills]);

    const handleQuestionRating = (qId, rating) => {
        setEvaluations(prev => ({ ...prev, [qId]: rating }));
    };

    const handleSubmit = async () => {
        const finalScore = (ratings.technical * 10) + (ratings.communication * 5); // Simple weighted score out of 75
        const recommendation = finalScore > 50 ? 'Hire' : finalScore > 30 ? 'Hold' : 'Reject';

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/interviews/evaluate`, {
                interview_id: interviewId,
                notes,
                technical_rating: ratings.technical,
                communication_rating: ratings.communication,
                evaluation_data: evaluations,
                final_score: finalScore,
                recommendation
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onComplete();
        } catch (err) {
            alert('Failed to submit evaluation');
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0d1117] border-l border-white/5 shadow-2xl overflow-hidden">
            <header className="p-6 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-indigo-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Live Evaluation</h2>
                </div>
                <h3 className="text-lg font-black text-white">{candidateName}</h3>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                {/* Questions Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interview Script</span>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : (
                            Object.entries(questions).map(([category, qs]) => (
                                <div key={category} className="space-y-4">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-500/50 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                        {category}
                                    </h4>
                                    {qs.map(q => (
                                        <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                            <p className="text-xs font-medium text-slate-300 mb-3">{q.text}</p>
                                            <div className="flex items-center gap-2">
                                                {['Poor', 'Average', 'Good'].map((label, idx) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => handleQuestionRating(q.id, idx + 1)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${evaluations[q.id] === idx + 1
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Core Ratings */}
                <section className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Metrics</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Technical Knowledge (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setRatings(prev => ({ ...prev, technical: val }))}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${ratings.technical === val ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Communication Skills (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setRatings(prev => ({ ...prev, communication: val }))}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${ratings.communication === val ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notes */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recruiter Notes</span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type interview feedback here..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32 resize-none transition-all"
                    ></textarea>
                </section>
            </main>

            <footer className="p-6 border-t border-white/5 bg-white/5 shrink-0">
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Send size={16} />
                    Complete Evaluation
                </button>
            </footer>
        </div>
    );
};

export default LiveEvaluation;
