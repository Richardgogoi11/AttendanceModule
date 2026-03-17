import { useState, useEffect, useRef } from 'react';

export const CountdownTimer = ({ targetEndTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const expiredRef = useRef(false);

    useEffect(() => {
        expiredRef.current = false; // Reset when targetEndTime changes

        if (!targetEndTime) {
            setTimeLeft(0);
            return;
        }

        const target = new Date(targetEndTime).getTime();

        if (isNaN(target)) {
            setTimeLeft(0);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((target - now) / 1000));
            setTimeLeft(diff);

            if (diff <= 0) {
                if (onExpire && !expiredRef.current) {
                    expiredRef.current = true;
                    onExpire();
                }
                clearInterval(timerId);
            }
        };

        const timerId = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        return () => clearInterval(timerId);
    }, [targetEndTime, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isCritical = timeLeft < 30 && timeLeft > 0;

    return (
        <div className={`text-center font-mono text-lg font-medium tracking-wider transition-colors duration-300 ${isCritical ? 'text-red-500' : 'text-muted-foreground'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};
