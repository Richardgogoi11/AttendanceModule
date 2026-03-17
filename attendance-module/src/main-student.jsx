import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'motion/react';
import { UserSquare2, LogOut, Loader2 } from 'lucide-react';
import { StudentPanel } from './components/StudentPanel';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { CONFIG } from './config';
import './index.css';

const StudentAppContent = () => {
    const { user, loading, isAuthenticated, logout } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || user.role !== 'student') {
        return (
            <div className="min-h-screen bg-background">
                <LoginPage />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center py-12 px-4 selection:bg-primary/20">
            <div className="w-full max-w-4xl mx-auto flex flex-col pt-8">
                <div className="text-center mb-10 relative">
                    <div className="absolute right-0 top-0 flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
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
                        <UserSquare2 className="w-8 h-8 text-primary" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-bold text-foreground mb-2 tracking-tight"
                    >
                        Student Verification
                    </motion.h1>
                </div>
                <StudentPanel
                    allowedRadius={CONFIG.ALLOWED_RADIUS}
                    targetLocation={CONFIG.TARGET_LOCATION}
                />
            </div>
        </div>
    );
};

const StudentApp = () => (
    <BrowserRouter>
        <AuthProvider>
            <SessionProvider>
                <StudentAppContent />
            </SessionProvider>
        </AuthProvider>
    </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <StudentApp />
    </StrictMode>
);

