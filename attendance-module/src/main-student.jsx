import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'motion/react';
import { UserSquare2 } from 'lucide-react';
import { StudentPanel } from './components/StudentPanel';
import { SessionProvider } from './context/SessionContext';
import { CONFIG } from './config';

const StudentApp = () => (
    <SessionProvider>
        <div className="min-h-screen w-full bg-background flex flex-col items-center py-12 px-4 selection:bg-primary/20">
            <div className="w-full max-w-4xl mx-auto flex flex-col pt-8">
                <div className="text-center mb-10">
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
    </SessionProvider>
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <StudentApp />
    </StrictMode>
);
