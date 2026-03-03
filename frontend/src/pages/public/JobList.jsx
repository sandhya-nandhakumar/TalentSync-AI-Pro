import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ChevronRight, Filter } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/jobs`)
            .then(res => setJobs(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 pt-24 px-4 sm:px-6 lg:px-8">
            <Navbar />
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-white mb-4">Open Positions</h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by role or keyword..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 transition-all">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {jobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Link to={`/jobs/${job.id}`} className="block p-5 glass-card rounded-2xl hover:border-blue-500/50 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                                                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.experience}</span>
                                                    <span className="bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">{job.type}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-slate-500" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobList;
