import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/distance';
import { verifyOtp, submitAttendance, API_BASE } from '../services/attendanceService';
import { useSession } from '../context/SessionContext';
import { OtpInput } from './OtpInput';
import { CameraCapture } from './CameraCapture';
import { LocationStatus } from './LocationStatus';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '../utils/utils';
import { CONFIG } from '../config';

/**
 * StudentPanel — no auth required.
 * Integrate your own auth externally before rendering this component.
 *
 * Props:
 *   targetLocation   {{ latitude, longitude }} — geofence centre
 *   allowedRadius    {number}                  — allowed distance in metres
 */
export const StudentPanel = ({
    targetLocation = CONFIG.TARGET_LOCATION,
    allowedRadius = CONFIG.ALLOWED_RADIUS
}) => {
    const { activeSubject, startSession, clearSession } = useSession();
    const { location, error: locError, loading: locLoading, refreshLocation } = useGeolocation();

    const [step, setStep] = useState(1);
    const [otpError, setOtpError] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [photoPayload, setPhotoPayload] = useState(null);
    const [distance, setDistance] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const [success, setSuccess] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [serverEndTime, setServerEndTime] = useState(null);

    // SYNC: Keep session in sync with bridge server
    useEffect(() => {
        const controller = new AbortController();

        const interval = setInterval(async () => {
            try {
                const resp = await fetch(`${API_BASE}/session`, { signal: controller.signal });

                if (!resp.ok) {
                    throw new Error(`Server sync failed: ${resp.status}`);
                }

                const data = await resp.json();

                if (controller.signal.aborted) return;

                if (data && data.activeSubject !== activeSubject) {
                    if (data.activeSubject) {
                        // Start session without providing OTP to client-side state
                        startSession(null, data.activeSubject);
                    } else {
                        clearSession();
                        setStep(1); // Reset to OTP entry if session stopped
                    }
                }

                if (data && data.endTime) {
                    setServerEndTime(data.endTime);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                /* silent */
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [activeSubject, startSession, clearSession]);

    useEffect(() => {
        if (location && targetLocation) {
            const dist = calculateDistance(
                location.latitude, location.longitude,
                targetLocation.latitude, targetLocation.longitude
            );
            setDistance(dist);
        }
    }, [location, targetLocation]);

    const isWithinRadius = distance !== null && distance <= allowedRadius;

    const handleOtpComplete = async (otp) => {
        setOtpError('');
        setVerifyingOtp(true);
        setEnteredOtp(otp);

        try {
            const result = await verifyOtp(otp);
            if (result.valid) setStep(2);
        } catch (err) {
            setOtpError(err.message || 'Invalid OTP. Please check the code with your teacher.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSubmit = async () => {
        if (!photoPayload) { setSubmissionError('Please capture a photo first.'); return; }
        if (!isWithinRadius) { setSubmissionError('You must be within the geofence radius to submit attendance.'); return; }

        setSubmissionError('');
        setSubmitting(true);
        try {
            const payload = { otp: enteredOtp, location, photo: photoPayload, timestamp: new Date().toISOString() };
            const response = await submitAttendance(payload);
            if (response.success) setSuccess(true);
        } catch (err) {
            setSubmissionError(err.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSessionExpire = () => {
        clearSession();
        setStep(1);
        setOtpError('');
        setEnteredOtp('');
        setPhotoPayload(null);
        setSuccess(false);
        setServerEndTime(null);
    };

    const resetFlow = () => {
        setStep(1);
        setSuccess(false);
        setPhotoPayload(null);
        setDistance(null);
        setEnteredOtp('');
        setSubmissionError(null);
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-lg border border-border text-center flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Attendance Logged</h2>
                {activeSubject && (
                    <p className="text-sm text-muted-foreground mb-1">
                        Subject: <span className="font-semibold text-foreground">{activeSubject}</span>
                    </p>
                )}
                <p className="text-muted-foreground mb-8">Your presence has been successfully verified.</p>
                <button
                    onClick={resetFlow}
                    className="px-6 py-2.5 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                    Submit Another
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto p-6 bg-card rounded-xl shadow-lg border border-border min-h-[400px]"
        >
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">
                    {step === 1 ? 'Enter OTP' : 'Location & Photo'}
                </h2>
            </div>

            {/* Active subject banner */}
            {activeSubject && (
                <div className="mb-4 flex flex-col gap-2">
                    <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 font-medium">
                        Active Session: {activeSubject}
                    </div>
                    {serverEndTime && (
                        <div className="flex items-center justify-between px-3 py-1 bg-muted/30 rounded-md border border-border/50">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Session Ends In</span>
                            <CountdownTimer targetEndTime={serverEndTime} onExpire={handleSessionExpire} />
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col"
                    >
                        <p className="text-sm text-muted-foreground mb-4">
                            Enter the 6-digit code displayed by your instructor.
                        </p>
                        <OtpInput length={6} onComplete={handleOtpComplete} />
                        {verifyingOtp && (
                            <div className="flex justify-center items-center space-x-2 mt-4 text-primary">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Verifying code...</span>
                            </div>
                        )}
                        {otpError && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-sm text-destructive font-medium text-center mt-4 bg-destructive/10 py-2 px-3 rounded-md border border-destructive/20"
                            >
                                {otpError}
                            </motion.p>
                        )}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col"
                    >
                        <LocationStatus loading={locLoading} error={locError} isWithinRadius={isWithinRadius} distance={distance} />
                        {locError && (
                            <button onClick={refreshLocation} className="mb-4 text-sm text-primary hover:underline self-center font-medium cursor-pointer">
                                Retry Location Access
                            </button>
                        )}
                        <div className="h-px bg-border my-6 w-full" />
                        <h3 className="text-sm font-medium text-foreground tracking-tight mb-2">Live Verification</h3>
                        <CameraCapture onCapture={setPhotoPayload} onClear={() => setPhotoPayload(null)} />
                        {submissionError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 my-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20"
                                role="alert"
                            >
                                {submissionError}
                            </motion.div>
                        )}
                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={!photoPayload || !isWithinRadius || submitting}
                                className={cn(
                                    "w-full py-3 h-11 px-4 text-sm font-medium rounded-md text-primary-foreground transition-all duration-200 flex justify-center items-center shadow-sm cursor-pointer",
                                    !photoPayload || !isWithinRadius || submitting
                                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                                        : "bg-primary hover:bg-primary/90 active:scale-[0.98]"
                                )}
                            >
                                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Mark Present'}
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full flex justify-center items-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Code Entry
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
