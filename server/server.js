const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const sessionRoutes = require('./routes/session');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendance_db",   // change this
  password: "your_password",   // change this
  port: 5432,
});

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Session Routes
// The frontend uses /session for both admin (POST) and student (GET) requests
// and /admin/session for admin sync (GET).
app.use('/api/session', sessionRoutes);
app.use('/api/admin/session', sessionRoutes);
// For backward compatibility (frontend config might not use /api base)
app.use('/session', sessionRoutes);
app.use('/admin/session', sessionRoutes);

app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});