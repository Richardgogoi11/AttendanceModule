import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, RefreshCw, KeyRound, ShieldCheck, BookOpen, Zap, Loader2 } from 'lucide-react';
import { fetchAttendanceList, generateOtp, stopActiveSession, API_BASE } from '../services/attendanceService';
import { useSession } from '../context/SessionContext';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '../utils/utils';

const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration'];
const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA'];
const COURSE_TITLES = ['Data Structures', 'Operating Systems', 'Machine Learning', 'Thermodynamics', 'Structural Analysis', 'Marketing Management'];

/**
 * TeacherPanel — no auth required.
 * Integrate your own auth externally before rendering this component.
 *
 * Props:
 *   sessionDuration {number} — countdown seconds (default 180)
 */
export const TeacherPanel = ({ sessionDuration = 180 }) => {
    const { user, activeOtp, activeSubject, startSession, clearSession } = useSession();

    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection state
    const [dept, setDept] = useState('');
    const [sem, setSem] = useState('');
    const [course, setCourse] = useState('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(new Date().toTimeString().slice(0, 5));
    const [duration, setDuration] = useState('5');

    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState('');
    const [bridgeConnected, setBridgeConnected] = useState(true);
    const [serverEndTime, setServerEndTime] = useState(null);

    const refreshList = useCallback(async () => {
        setLoading(true);
        try {
            const list = await fetchAttendanceList();
            setAttendees(list);
        } catch (error) {
            console.error('Failed to fetch records', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // SYNC: Keep session in sync with bridge server
    useEffect(() => {
        if (!user?.token) return; // Guard: Only sync if logged in

        const controller = new AbortController();

        const interval = setInterval(async () => {
            try {
                const resp = await fetch(`${API_BASE}/admin/session`, {
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!resp.ok) {
                    setBridgeConnected(false);
                    return;
                }

                const data = await resp.json();

                if (controller.signal.aborted) return;

                setBridgeConnected(true);

                if (data.activeOtp !== activeOtp) {
                    startSession(data.activeOtp, data.activeSubject);
                    if (data.activeOtp) refreshList();
                }
                setServerEndTime(data.endTime);
            } catch (err) {
                if (err.name === 'AbortError') return;
                setBridgeConnected(false);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [user?.token, activeOtp, startSession, refreshList]);

    const handleGenerateOtp = async () => {
        if (!dept || !sem || !course || !title || !startTime) {
            setGenerateError('Please select all fields to start the session.');
            return;
        }

        // Real-time validation: Check if startTime matches current time (within 5 mins)
        const now = new Date();
        const [h, m] = startTime.split(':').map(Number);
        const selectedDate = new Date();
        selectedDate.setHours(h, m, 0, 0);

        const diffMinutes = Math.abs((selectedDate.getTime() - now.getTime()) / (1000 * 60));

        if (diffMinutes > 5) {
            setGenerateError(`Class Start Time (${startTime}) must match the current time (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}) to generate OTP.`);
            return;
        }

        setGenerateError('');
        setGenerating(true);
        try {
            const fullSubjectName = `${course} - ${title} (${dept}, ${sem})`;
            const result = await generateOtp(fullSubjectName, parseInt(duration));
            setServerEndTime(result.endTime);
            startSession(result.otp, result.subject);
            setAttendees([]);
            setTimeout(refreshList, 500);
        } catch (err) {
            setGenerateError(err.message || 'Failed to generate OTP.');
        } finally {
            setGenerating(false);
        }
    };

    const handleStopSession = async () => {
        if (!window.confirm("Are you sure you want to stop the current OTP? This will clear all attendance entry progress.")) return;

        try {
            await stopActiveSession();
            clearSession();
            setAttendees([]);
            setServerEndTime(null);
        } catch (err) {
            console.error('Failed to stop session', err);
            clearSession(); // Fallback
        }
    };

    const handleSessionExpire = () => {
        clearSession();
        setAttendees([]);
        setServerEndTime(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col gap-6"
        >
            {/* OTP Generator Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Session Setup</span>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            bridgeConnected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            <div className={cn("w-1 h-1 rounded-full", bridgeConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse")} />
                            {bridgeConnected ? "BRIDGE CONNECTED" : "BRIDGE DISCONNECTED"}
                        </div>
                    </div>
                    {activeOtp && (
                        <button
                            onClick={handleStopSession}
                            className="text-xs font-bold text-destructive hover:text-white hover:bg-destructive px-3 py-1.5 rounded-md border border-destructive/30 transition-all cursor-pointer"
                        >
                            Stop OTP
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="dept-select" className="text-xs font-medium text-muted-foreground ml-1 text-left">Department</label>
                        <select
                            id="dept-select"
                            value={dept}
                            onChange={(e) => { setDept(e.target.value); setGenerateError(''); }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        >
                            <option value="">— Select Dept —</option>
                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="sem-select" className="text-xs font-medium text-muted-foreground ml-1 text-left">Semester</label>
                        <select
                            id="sem-select"
                            value={sem}
                            onChange={(e) => { setSem(e.target.value); setGenerateError(''); }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        >
                            <option value="">— Select Semester —</option>
                            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="course-select" className="text-xs font-medium text-muted-foreground ml-1 text-left">Course</label>
                        <select
                            id="course-select"
                            value={course}
                            onChange={(e) => { setCourse(e.target.value); setGenerateError(''); }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        >
                            <option value="">— Select Course —</option>
                            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="title-select" className="text-xs font-medium text-muted-foreground ml-1 text-left">Course Title</label>
                        <select
                            id="title-select"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setGenerateError(''); }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        >
                            <option value="">— Select Title —</option>
                            {COURSE_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="start-time-input" className="text-xs font-medium text-muted-foreground ml-1 text-left">Class Start Time (HH:mm)</label>
                        <input
                            id="start-time-input"
                            type="time"
                            value={startTime}
                            onChange={(e) => { setStartTime(e.target.value); setGenerateError(''); }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="duration-select" className="text-xs font-medium text-muted-foreground ml-1 text-left">OTP Duration</label>
                        <select
                            id="duration-select"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer"
                        >
                            <option value="1">1 Minute</option>
                            <option value="2">2 Minutes</option>
                            <option value="5">5 Minutes</option>
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes (1 Hour)</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerateOtp}
                    disabled={generating || !dept || !sem || !course || !title}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer mt-2",
                        generating || !dept || !sem || !course || !title
                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                    )}
                >
                    {generating
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting Session...</>
                        : <><Zap className="w-4 h-4" /> Start Active Session & Generate OTP</>}
                </button>

                {generateError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                        {generateError}
                    </motion.p>
                )}

                {!activeOtp && (
                    <div className="flex flex-col items-center justify-center py-4 text-center border-t border-border/50 pt-6">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-30 mb-2" />
                        <p className="text-xs text-muted-foreground">Complete the fields above to begin taking attendance.</p>
                    </div>
                )}
            </div>

            {/* Active Session */}
            <AnimatePresence>
                {activeOtp && (
                    <motion.div
                        key="session-active"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col gap-4"
                    >
                        {/* OTP + Timer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col bg-card rounded-xl border border-border p-6 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1 text-left">
                                    <KeyRound className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Active Code</span>
                                </div>
                                <p className="text-xs font-bold text-foreground mb-3 truncate text-left" title={activeSubject}>
                                    {activeSubject}
                                </p>
                                <div className="flex gap-2 justify-start">
                                    {activeOtp.split('').map((digit, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: i * 0.05 }}
                                            key={i}
                                            className="w-9 h-12 bg-secondary rounded-lg border border-border flex items-center justify-center text-xl font-bold text-primary shadow-sm"
                                        >
                                            {digit}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col bg-card rounded-xl border border-border p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-3 text-left">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">Verified Students</span>
                                    </div>
                                    <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {attendees.length} Verified
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <CountdownTimer targetEndTime={serverEndTime} onExpire={handleSessionExpire} />
                                </div>
                            </div>
                        </div>

                        {/* Live Feed */}
                        <div className="flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                            <div className="bg-muted px-6 py-4 flex items-center justify-between border-b border-border">
                                <h3 className="text-sm font-semibold text-foreground tracking-tight">Live Entry Feed</h3>
                                <button
                                    onClick={refreshList}
                                    disabled={loading}
                                    className="p-1.5 rounded-md hover:bg-secondary text-primary transition-colors disabled:opacity-50 cursor-pointer"
                                    title="Refresh list"
                                >
                                    <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                                </button>
                            </div>
                            <div className="divide-y divide-border min-h-40 max-h-80 overflow-y-auto">
                                <AnimatePresence>
                                    {attendees.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-8 text-center text-muted-foreground text-sm font-medium"
                                        >
                                            No students have checked in yet.
                                        </motion.div>
                                    ) : (
                                        attendees.map((student, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={student.id}
                                                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {(student.name || '?').charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-medium text-foreground">{student.name || 'Anonymous Student'}</span>
                                                        <span className="text-xs text-muted-foreground">{student.time}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">{student.status}</span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
