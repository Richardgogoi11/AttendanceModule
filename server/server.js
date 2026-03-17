const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Use the centralized database config
const { router: sessionRoutes } = require('./routes/session');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/admin/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// For backward compatibility
app.use('/auth', authRoutes);
app.use('/session', sessionRoutes);
app.use('/admin/session', sessionRoutes);
app.use('/attendance', attendanceRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});