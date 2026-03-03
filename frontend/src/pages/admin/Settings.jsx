import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Lock, Globe, Save, ShieldCheck, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useState } from 'react';
import axios from 'axios';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/auth/password`, passwords, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (err) {
            alert('Failed to update password: ' + (err.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-black text-white">System Settings</h1>
                <p className="text-slate-500 mt-1.5 text-base font-medium">Configure your recruitment pipeline and security preferences.</p>
            </motion.header>

            <div className="grid gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-[28px] border border-white/5"
                >
                    <div className="space-y-12 max-w-3xl">
                        <section>
                            <h3 className="flex items-center gap-3 text-white font-black mb-6 text-xl tracking-tight">
                                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                SECURITY & AUTHENTICATION
                            </h3>
                            <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white/5 rounded-3xl border border-white/5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 tracking-wider">CURRENT PASSWORD</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 tracking-wider">NEW PASSWORD</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        disabled={loading}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Lock size={18} /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-3 text-white font-black mb-6 text-xl tracking-tight">
                                <Bell className="w-6 h-6 text-blue-500" />
                                EMAIL NOTIFICATIONS
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div>
                                        <p className="text-white font-bold text-lg">New Application Alerts</p>
                                        <p className="text-slate-500 mt-1">Notify HR when a new candidate applies.</p>
                                    </div>
                                    <div className="w-14 h-8 bg-blue-600 rounded-full flex items-center justify-end px-1.5 cursor-pointer">
                                        <div className="w-5 h-5 bg-white rounded-full shadow-lg"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div>
                                        <p className="text-white font-bold text-lg">Candidate Confirmation</p>
                                        <p className="text-slate-500 mt-1">Send an automated receipt to candidates.</p>
                                    </div>
                                    <div className="w-14 h-8 bg-blue-600 rounded-full flex items-center justify-end px-1.5 cursor-pointer">
                                        <div className="w-5 h-5 bg-white rounded-full shadow-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pb-4">
                            <h3 className="flex items-center gap-3 text-white font-black mb-6 text-xl tracking-tight">
                                <Globe className="w-6 h-6 text-purple-500" />
                                AI MATCH THRESHOLD
                            </h3>
                            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-500 tracking-wider">MINIMUM SIMILARITY SCORE</span>
                                    <span className="text-lg font-black text-indigo-400">65%</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" style={{ width: '65%' }}></div>
                                </div>
                                <p className="text-sm text-slate-500 mt-6">Candidates below this score will be flagged for manual review by the talent team.</p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
