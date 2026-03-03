import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PenTool, Trash2, MapPin, Briefcase, X, Zap } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobManagement = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        experience: '',
        type: 'Full-time',
        status: 'active',
        required_skills: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (job) => {
        setEditingId(job.id);
        setFormData({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            experience: job.experience || '',
            type: job.type || 'Full-time',
            status: job.status || 'active',
            required_skills: job.required_skills || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', location: '', experience: '', type: 'Full-time', status: 'active', required_skills: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        };

        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/jobs/${editingId}`, formData, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/jobs`, formData, config);
            }
            resetForm();
            fetchJobs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job engine?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${id}`);
            fetchJobs();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-black text-white">Job Engines</h1>
                    <p className="text-slate-400 mt-2 text-base font-medium">Manage and optimize your active recruitment pipelines.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Engine
                </button>
            </motion.header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, i) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-[24px] relative group overflow-hidden border border-white/5"
                    >
                        <div className="flex justify-between items-start mb-5">
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${(job.status || 'active') === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                {job.status || 'active'}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(job)}
                                    className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    <PenTool size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(job.id)}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-white mb-1 leading-tight">{job.title}</h3>
                        <p className="text-slate-500 flex items-center gap-1.5 mb-5 font-bold uppercase tracking-widest text-[10px]">
                            <MapPin size={12} className="text-indigo-500" /> {job.location} • {job.type}
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">Exp. Target</span>
                                <span className="text-indigo-400">{job.experience}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {job.required_skills?.split(',').slice(0, 5).map(skill => (
                                    <span key={skill} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest">{skill.trim()}</span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/admin/match-engine')}
                            className="w-full h-11 rounded-xl bg-white/5 text-white font-black text-[9px] tracking-[0.2em] uppercase hover:bg-white/10 transition-all border border-white/5"
                        >
                            Match Analysis
                        </button>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-2xl p-10 rounded-[40px] border border-white/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-white">{editingId ? 'Edit Job Engine' : 'Configure New Engine'}</h2>
                                <button onClick={resetForm} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">Job Title</label>
                                        <input
                                            type="text" required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="e.g. Senior Product Designer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">Location</label>
                                        <input
                                            type="text" required
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="e.g. Remote"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">Required Skills (Comma separated)</label>
                                        <input
                                            type="text" required
                                            value={formData.required_skills}
                                            onChange={e => setFormData({ ...formData, required_skills: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="React, Node.js, Figma"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">Experience Level</label>
                                        <input
                                            type="text" required
                                            value={formData.experience}
                                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="e.g. 5+ Years"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 tracking-widest uppercase">Description</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                        placeholder="Detailed job description..."
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-[20px] font-black text-xs tracking-widest uppercase hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                                        {editingId ? 'Update Engine' : 'Deploy Engine'}
                                    </button>
                                    <button type="button" onClick={resetForm} className="px-8 py-4 rounded-[20px] bg-white/5 text-slate-400 font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default JobManagement;
