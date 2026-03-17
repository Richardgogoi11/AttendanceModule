import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, UserSquare2, Github, LogOut } from 'lucide-react';
import { TeacherPanel, StudentPanel } from './components';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CONFIG } from './config';
import './App.css';

// Landing page — choose a portal
const LandingPage = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-8 shadow-sm ring-1 ring-primary/20"
      >
        <ShieldCheck className="w-12 h-12 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight text-center"
      >
        Secure Attendance System
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-lg max-w-lg mx-auto text-center mb-12"
      >
        Select your portal to continue.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto"
      >
        <div className="group flex flex-col p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 mx-auto">
            <UserSquare2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Student Check-In</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Verify presence via GPS & Photo.</p>
          <div className="flex flex-col gap-2">
            <Link to="/student" className="text-xs font-bold py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors">Internal Port 5173</Link>
            {import.meta.env.DEV && (
              <a href={CONFIG.STUDENT_PORTAL_URL} className="text-sm font-bold py-2.5 bg-emerald-500 text-white rounded-lg text-center hover:bg-emerald-600 transition-colors shadow-sm">Open Port 5175</a>
            )}
          </div>
        </div>

        <div className="group flex flex-col p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Teacher Portal</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Manage OTPs & Live Feed.</p>
          <div className="flex flex-col gap-2">
            <Link to="/teacher" className="text-xs font-bold py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors">Internal Port 5173</Link>
            {import.meta.env.DEV && (
              <a href={CONFIG.TEACHER_PORTAL_URL} className="text-sm font-bold py-2.5 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors shadow-sm">Open Port 5174</a>
            )}
          </div>
        </div>
      </motion.div>

      {isAuthenticated && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={logout}
          className="mt-12 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </motion.button>
      )}
    </div>
  );
};

// Shared page layout
const PageLayout = ({ children, title, role }) => {
  const { logout, user } = useAuth();
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8">
      <div className="text-center mb-10 relative">
        <div className="absolute right-0 top-0 flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors group"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-sm ring-1 ring-primary/20"
        >
          {role === 'teacher'
            ? <ShieldCheck className="w-8 h-8 text-primary" />
            : <UserSquare2 className="w-8 h-8 text-primary" />}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-foreground mb-2 tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block mt-1">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
      {children}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <div className="min-h-screen w-full bg-background flex flex-col items-center py-12 px-4 selection:bg-primary/20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/teacher" element={
                <ProtectedRoute allowedRole="teacher">
                  <PageLayout title="Teacher Dashboard" role="teacher">
                    <TeacherPanel sessionDuration={180} />
                  </PageLayout>
                </ProtectedRoute>
              } />

              <Route path="/student" element={
                <ProtectedRoute allowedRole="student">
                  <PageLayout title="Student Verification" role="student">
                    <StudentPanel
                      allowedRadius={CONFIG.ALLOWED_RADIUS}
                      targetLocation={CONFIG.TARGET_LOCATION}
                    />
                  </PageLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <div className="mt-auto pt-16 pb-8 text-center flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground/60">
                Built with React, Tailwind v4, and minimal Shadcn aesthetic.
              </p>
              <a
                href={CONFIG.GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

