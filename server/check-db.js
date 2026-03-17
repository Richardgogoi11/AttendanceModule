const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
  try {
    await client.connect();
    console.log("SUCCESS: Connected to attendance_db");
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables found:", res.rows.map(r => r.table_name).join(", "));
  } catch (err) {
    console.error("FAILURE: Could not connect to attendance_db", err.message);
  } finally {
    await client.end();
  }
}
check();
