/**
 * Central configuration for the Attendance Module.
 * Values are read from environment variables (Vite-prefixed) with sensible defaults.
 */

const getEnvNumber = (key, defaultValue) => {
    const val = import.meta.env[key];
    const num = parseFloat(val);
    return isNaN(num) ? defaultValue : num;
};

const getEnvString = (key, defaultValue) => {
    return import.meta.env[key] || defaultValue;
};

export const CONFIG = {
    // Geofencing configuration
    TARGET_LOCATION: {
        latitude: getEnvNumber('VITE_TARGET_LAT', 37.7749),
        longitude: getEnvNumber('VITE_TARGET_LNG', -122.4194),
    },
    ALLOWED_RADIUS: getEnvNumber('VITE_ALLOWED_RADIUS', 500),

    // External Portal URLs (for LandingPage)
    STUDENT_PORTAL_URL: getEnvString('VITE_STUDENT_PORTAL_URL', 'http://localhost:5175'),
    TEACHER_PORTAL_URL: getEnvString('VITE_TEACHER_PORTAL_URL', 'http://localhost:5174'),

    // GitHub repository URL (fallback if package.json extraction were complex)
    GITHUB_REPO_URL: 'https://github.com/Richardgogoi11/attendence',
};

export default CONFIG;
