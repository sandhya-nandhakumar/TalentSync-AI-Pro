import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import JobList from './pages/public/JobList'
import JobDetail from './pages/public/JobDetail'
import ApplyForm from './pages/public/ApplyForm'
import LoginPage from './pages/public/LoginPage'
import Dashboard from './pages/admin/Dashboard'
import JobManagement from './pages/admin/JobManagement'
import CandidateManagement from './pages/admin/CandidateManagement'
import MatchEngine from './pages/admin/MatchEngine'
import Settings from './pages/admin/Settings'
import InterviewDashboard from './pages/admin/InterviewDashboard'
import WaitingRoom from './pages/public/WaitingRoom'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-slate-200">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/jobs" element={<JobList />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/apply/:id" element={<ApplyForm />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/jobs" element={<JobManagement />} />
                    <Route path="/admin/match-engine" element={<MatchEngine />} />
                    <Route path="/admin/candidates" element={<CandidateManagement />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/interviews" element={<InterviewDashboard />} />
                    <Route path="/interview/:token" element={<WaitingRoom />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
