import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, User, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const ApplyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        candidate_name: '',
        candidate_email: '',
        resume: null
    });

    const handleFileChange = (e) => {
        setFormData({ ...formData, resume: e.target.files[0] });
    };

    const handleSubmit = async () => {
        setLoading(true);
        const data = new FormData();
        data.append('job_id', id);
        data.append('candidate_name', formData.candidate_name);
        data.append('candidate_email', formData.candidate_email);
        data.append('resume', formData.resume);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/applications`, data);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 rounded-3xl text-center max-w-lg w-full"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
                    <p className="text-slate-400 mb-8">Thank you for your application. You will receive a confirmation email shortly.</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-500 transition-all font-semibold"
                    >
                        Back to Opportunities
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
            <Navbar />
            <div className="max-w-xl mx-auto">
                <div className="mb-10 flex justify-between items-center px-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= i ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-slate-500'}`}>
                                {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                            </div>
                            {i === 1 && <div className={`h-1 w-24 mx-2 rounded-full ${step > 1 ? 'bg-blue-600' : 'bg-white/10'}`}></div>}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="glass-card p-8 rounded-3xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.candidate_name}
                                            onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={formData.candidate_email}
                                            onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={!formData.candidate_name || !formData.candidate_email}
                                    onClick={() => setStep(2)}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                                >
                                    Next Step
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="glass-card p-8 rounded-3xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Resume Upload</h2>
                            <div className="space-y-8">
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-blue-500/50 transition-all cursor-pointer bg-white/5 group">
                                    <div className="bg-blue-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <span className="text-white font-medium mb-1">
                                        {formData.resume ? formData.resume.name : 'Upload PDF Resume'}
                                    </span>
                                    <span className="text-sm text-slate-500">Max file size 5MB</span>
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                </label>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                    <button
                                        disabled={!formData.resume || loading}
                                        onClick={handleSubmit}
                                        className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application
                                                <FileText className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ApplyForm;
