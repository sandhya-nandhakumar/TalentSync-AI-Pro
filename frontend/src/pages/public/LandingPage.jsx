import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

const LandingPage = () => {
    return (
        <div className="relative isolate pt-14">
            <Navbar />

            {/* Background Blobs */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="py-24 sm:py-32 lg:pb-40">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-blue-400 border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Recruitment 2.0</span>
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-8">
                            Syncing Talent with <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">
                                Intelligent Precision.
                            </span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
                            Our advanced AI matcher analyzes resumes and job descriptions to find the 0.1% of candidates who truly fit. No more manual screening, just perfect matches.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link to="/jobs" className="group relative rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all overflow-hidden transition-all duration-300 transform hover:scale-105">
                                <span className="relative z-10 flex items-center gap-2">
                                    Explore Opportunities
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="mt-20 glass-card p-6 rounded-3xl relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20"></div>
                        <div className="relative border border-white/5 rounded-2xl overflow-hidden bg-slate-900/50">
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                            </div>
                            <div className="p-8 grid md:grid-cols-3 gap-8">
                                {[
                                    { icon: Zap, title: "Nano-second Parsing", desc: "Instant AI extraction of candidate skills and experience." },
                                    { icon: Sparkles, title: "Match Intelligence", desc: "Proprietary TF-IDF algorithm for unbiased scoring." },
                                    { icon: Shield, title: "Recruiter Command", desc: "Centralized dashboard with advanced decision support." }
                                ].map((feature, i) => (
                                    <div key={i} className="text-left group cursor-default">
                                        <feature.icon className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
