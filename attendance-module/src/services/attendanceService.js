export const API_BASE = 'http://localhost:5000';

/**
 * Helper to safely parse JSON from a response.
 * Throws a descriptive error if parsing fails.
 */
const parseJsonSafe = async (resp) => {
    const text = await resp.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error(`Failed to parse server response (Status: ${resp.status}). The server might be down or returning an error page.`);
    }
};

/**
 * Mock Service Layer — now connected to a local bridge server
 * to allow communication between port 5174 and 5175.
 */

export const loginAsTeacher = async (pin) => {
    const resp = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
    });
    const data = await parseJsonSafe(resp);
    if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Invalid PIN');
    }
    return { success: true, user: data.user };
};

export const loginAsStudent = async (studentId) => {
    const resp = await fetch(`${API_BASE}/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
    });
    const data = await parseJsonSafe(resp);
    if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Invalid Student ID');
    }
    return { success: true, user: data.user };
};

export const generateOtp = async (subject, duration = 3) => {
    try {
        // Only send metadata — server will generate the OTP
        const resp = await fetch(`${API_BASE}/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, duration })
        });

        const data = await parseJsonSafe(resp);

        if (!resp.ok || !data.success) {
            throw new Error(data.error || `Failed to start session: ${resp.status}`);
        }

        return {
            otp: data.otp,
            subject: data.subject,
            endTime: data.endTime
        };
    } catch (err) {
        console.error('[generateOtp]', err);
        throw err;
    }
};

export const verifyOtp = async (otp) => {
    const resp = await fetch(`${API_BASE}/session/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
    });
    const data = await parseJsonSafe(resp);
    if (!resp.ok || !data.valid) {
        throw new Error(data.error || 'Incorrect OTP code.');
    }
    return { valid: true };
};

export const submitAttendance = async (payload) => {
    const resp = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await parseJsonSafe(resp);
    if (!resp.ok) {
        throw new Error(data.error || `Failed to submit attendance: ${resp.status}`);
    }
    return data;
};

export const fetchAttendanceList = async () => {
    const resp = await fetch(`${API_BASE}/attendance`);
    const data = await parseJsonSafe(resp);
    if (!resp.ok) {
        throw new Error(data.error || `Failed to fetch attendance list: ${resp.status}`);
    }
    return data;
};

// Added for stopping session
export const stopActiveSession = async () => {
    try {
        const resp = await fetch(`${API_BASE}/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: null, subject: null })
        });
        const data = await parseJsonSafe(resp);
        if (!resp.ok) {
            throw new Error(data.error || `Server error: ${resp.status}`);
        }
        return data;
    } catch (err) {
        console.error('[stopActiveSession]', err);
        throw err;
    }
};
