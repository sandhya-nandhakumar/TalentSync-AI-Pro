import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 glass-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            TalentSync AI
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/jobs" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Jobs</Link>
                            <Link to="/login" className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-all">Admin Access</Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
