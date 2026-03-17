import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, UserSquare2, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { loginAsTeacher, loginAsStudent } from '../services/attendanceService';
import { useSession } from '../context/SessionContext';
import { cn } from '../utils/utils';

const ROLES = {
    teacher: {
        label: 'Teacher Portal',
        icon: ShieldCheck,
        color: 'text-primary',
        placeholder: 'Enter teacher PIN',
        type: 'password',
        hint: 'Enter your assigned teacher PIN',
        inputLabel: 'Teacher PIN',
    },
    student: {
        label: 'Student Check-In',
        icon: UserSquare2,
        color: 'text-emerald-500',
        placeholder: 'Enter your Student ID',
        type: 'text',
        hint: 'Any non-empty ID works',
        inputLabel: 'Student ID',
    },
};

export const LoginPage = () => {
    const { role } = useParams(); // 'teacher' | 'student'
    const navigate = useNavigate();
    const { loginAsTeacher: ctxLoginTeacher, loginAsStudent: ctxLoginStudent } = useSession();

    const config = ROLES[role];

    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!config) {
            navigate('/');
        }
    }, [config, navigate]);

    if (!config) return null;

    const Icon = config.icon;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (role === 'teacher') {
                const info = await loginAsTeacher(value);
                ctxLoginTeacher(info);
                navigate('/teacher');
            } else {
                const info = await loginAsStudent(value);
                ctxLoginStudent(info);
                navigate('/student');
            }
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto"
        >
            {/* Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6">
                {/* Icon + Title */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center",
                        role === 'teacher' ? 'bg-primary/10' : 'bg-emerald-500/10'
                    )}>
                        <Icon className={cn("w-7 h-7", config.color)} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">{config.label}</h2>
                    <p className="text-sm text-muted-foreground">{config.hint}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor={`login-${role}-input`}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                            {config.inputLabel}
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id={`login-${role}-input`}
                                type={config.type}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={config.placeholder}
                                autoFocus
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !value.trim()}
                        className={cn(
                            "w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                            loading || !value.trim()
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                : role === 'teacher'
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                                    : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-sm"
                        )}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>

            {/* Back link */}
            <button
                onClick={() => navigate('/')}
                className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </button>
        </motion.div>
    );
};
