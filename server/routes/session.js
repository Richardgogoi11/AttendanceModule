const express = require('express');

const router = express.Router();

// Memory store for the active session since OTPs are short-lived.
let activeSession = {
  otp: null,
  subject: null,
  endTime: null,
};

// Start a new session / generating an OTP
router.post('/', (req, res) => {
  const { subject, duration, otp } = req.body;

  try {
    // If the client passes `otp: null` and `subject: null`, it's a stop request
    if (otp === null && subject === null) {
      activeSession = { otp: null, subject: null, endTime: null };
      return res.json({ success: true, message: 'Session stopped' });
    }

    // Generate a 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const durationMinutes = duration || 3;
    const endTime = Date.now() + durationMinutes * 60 * 1000;

    activeSession = {
      otp: newOtp,
      subject: subject,
      endTime: endTime,
    };

    res.json({
      success: true,
      otp: activeSession.otp,
      subject: activeSession.subject,
      endTime: activeSession.endTime,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Admin Route: Get full session details including OTP (for teacher panel sync)
router.get('/admin', (req, res) => {
  // Return early if there's no active session or it has expired
  if (!activeSession.otp || Date.now() > activeSession.endTime) {
    activeSession = { otp: null, subject: null, endTime: null };
    return res.json({
      activeOtp: null,
      activeSubject: null,
      endTime: null
    });
  }

  res.json({
    activeOtp: activeSession.otp,
    activeSubject: activeSession.subject,
    endTime: activeSession.endTime
  });
});

// Public Route: Get only the active subject and endTime (for student panel sync)
router.get('/', (req, res) => {
  // Hide OTP from students; only inform them if a session is currently active
  if (!activeSession.otp || Date.now() > activeSession.endTime) {
    activeSession = { otp: null, subject: null, endTime: null };
    return res.json({
      activeSubject: null,
      endTime: null
    });
  }

  res.json({
    activeSubject: activeSession.subject,
    endTime: activeSession.endTime
  });
});

// Verify OTP
router.post('/verify', (req, res) => {
  const { otp } = req.body;

  if (!activeSession.otp || Date.now() > activeSession.endTime) {
    activeSession = { otp: null, subject: null, endTime: null };
    return res.status(400).json({ valid: false, error: 'No active session or session expired.' });
  }

  if (otp === activeSession.otp) {
    return res.json({ valid: true });
  }

  return res.status(400).json({ valid: false, error: 'Incorrect OTP.' });
});

module.exports = {
  router,
  activeSession
};
