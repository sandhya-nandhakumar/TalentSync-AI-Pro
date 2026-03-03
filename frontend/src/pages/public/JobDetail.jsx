import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Globe, Zap } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const JobDetail = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
            <Navbar />
            <div className="max-w-3xl mx-auto">
                <Link to="/jobs" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Jobs
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-3xl"
                >
                    <header className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-4">{job.title}</h1>
                        <div className="flex gap-6 text-slate-400">
                            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                    </header>

                    <div className="prose prose-invert max-w-none mb-12">
                        <h3 className="text-white text-xl font-semibold mb-4">Job Description</h3>
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {job.description}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link to={`/apply/${job.id}`} className="group relative bg-blue-600 px-12 py-4 rounded-2xl text-lg font-bold text-white transition-all overflow-hidden hover:scale-105 active:scale-95 shadow-2xl">
                            <span className="relative z-10 flex items-center gap-2">
                                Apply for this Position
                                <Zap className="w-5 h-5 fill-current" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default JobDetail;
