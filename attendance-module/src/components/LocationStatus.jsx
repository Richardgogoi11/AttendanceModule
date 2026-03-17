import { motion } from 'motion/react';
import { Loader2, AlertCircle, MapPinCheck, MapPinOff } from 'lucide-react';
import { cn } from '../utils/utils';

export const LocationStatus = ({ loading, error, isWithinRadius, distance }) => {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-2 text-muted-foreground my-4"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium tracking-wide">Acquiring GPS Signal...</span>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 my-4"
            >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border my-4 transition-colors duration-300 shadow-sm",
                isWithinRadius
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
            )}
        >
            <div className="flex items-center space-x-3 mb-2">
                {isWithinRadius ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <MapPinCheck className="w-5 h-5" />
                        </div>
                        <span className="text-base font-semibold text-emerald-500">Within Range</span>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                            <MapPinOff className="w-5 h-5" />
                        </div>
                        <span className="text-base font-semibold text-amber-500">Outside Range</span>
                    </>
                )}
            </div>

            {distance !== null && (
                <span className="text-xs font-medium text-muted-foreground mt-1">
                    Distance matching: {distance.toFixed(2)} meters
                </span>
            )}
        </motion.div>
    );
};
