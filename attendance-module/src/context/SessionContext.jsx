import { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

/**
 * Holds the active OTP session started by the teacher.
 * No auth — integrate your own auth system externally.
 */
export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [activeOtp, setActiveOtp] = useState(null);
    const [activeSubject, setActiveSubject] = useState(null);

    const loginAsTeacher = (userData) => {
        setUser({ ...userData, role: 'teacher' });
    };

    const loginAsStudent = (userData) => {
        setUser({ ...userData, role: 'student' });
    };

    const logout = () => {
        setUser(null);
        setActiveOtp(null);
        setActiveSubject(null);
    };

    const startSession = (otp, subject) => {
        setActiveOtp(otp);
        setActiveSubject(subject);
    };

    const clearSession = () => {
        setActiveOtp(null);
        setActiveSubject(null);
    };

    return (
        <SessionContext.Provider value={{
            user,
            activeOtp,
            activeSubject,
            startSession,
            clearSession,
            loginAsTeacher,
            loginAsStudent,
            logout
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
    return ctx;
};
