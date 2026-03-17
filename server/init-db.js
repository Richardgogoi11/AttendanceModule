const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.DB_NAME || 'attendance_db';

async function initDatabase() {
  // Connect to the default 'postgres' database first to create our target database
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // default DB
  });

  try {
    await client.connect();
    console.log("Connected to default postgres database.");
    
    // Check if the database already exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    if (error.code === '28P01') {
      console.error("FATAL: Invalid PostgreSQL password or user.");
      console.error("Please ensure PostgreSQL is installed and the credentials in .env are correct.");
      process.exit(1);
    } else if (error.code === 'ECONNREFUSED') {
      console.error("FATAL: Could not connect to PostgreSQL. Is the PostgreSQL service running?");
      process.exit(1);
    } else {
      console.error("Error creating database:", error);
    }
  } finally {
    await client.end();
  }

  // Now the server's db.js will automatically create the tables when required
  console.log("Database setup phase complete. The 'db.js' module will create tables automatically on server start.");
}

initDatabase();
