# Quick Start Guide - Attendance Management System Backend

## 📦 What's Included

Your backend package includes:
- `server.js` - Main Express server
- `db.js` - PostgreSQL connection and database initialization
- `package.json` - Dependencies
- `.env.example` - Environment variables template
- `middleware/auth.js` - JWT authentication middleware
- `routes/auth.js` - Login and registration endpoints
- `routes/students.js` - Student management endpoints
- `routes/attendance.js` - Attendance tracking endpoints
- `api-service.js` - React API service file for frontend
- `README.md` - Full documentation

---

## 🚀 Setup Instructions (5 Steps)

### Step 1: Copy Backend Files to Your Project
```bash
# In your project root directory
mkdir -p server
cp server.js db.js package.json .env.example middleware/ routes/ server/
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `cors` - Handle cross-origin requests
- `dotenv` - Environment variables
- `pg` - PostgreSQL driver
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemon` (dev) - Auto-reload on changes

### Step 3: Setup PostgreSQL Database

```bash
# Open PostgreSQL command line
psql -U postgres

# Create the database
CREATE DATABASE attendance_db;

# Exit
\q
```

### Step 4: Create Environment File

```bash
# In the server directory
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
PORT=5000
NODE_ENV=development

# Update these with your PostgreSQL credentials
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_db

# Keep JWT_SECRET safe - change in production!
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
```

### Step 5: Start the Server

```bash
# Production mode
npm start

# Or development mode (auto-reload)
npm run dev
```

**Expected Output:**
```
Server is running on http://localhost:5000
Environment: development
Database tables initialized successfully
```

---

## ✅ Verify It's Working

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{"status":"Server is running"}
```

---

## 🎯 First Test: Register & Login

### 1. Register a Teacher

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mr. Smith",
    "email": "smith@school.com",
    "password": "password123",
    "role": "teacher"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "name": "Mr. Smith", "role": "teacher" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

💾 Save the `token` value - you'll need it!

### 2. Register a Student

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Student",
    "email": "jane@school.com",
    "password": "password123",
    "role": "student",
    "roll_no": "001",
    "class": "Class A"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smith@school.com",
    "password": "password123"
  }'
```

---

## 📡 Using API in Your React Frontend

### Copy API Service

```bash
# From server directory
cp api-service.js ../src/services/api.js
```

### Example: Login in React

```javascript
import { authAPI } from '../services/api';

async function handleLogin(email, password) {
  try {
    const response = await authAPI.login(email, password);
    console.log('User:', response.user);
    console.log('Token saved to localStorage');
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}
```

### Example: Get All Students

```javascript
import { studentAPI } from '../services/api';

async function loadStudents() {
  try {
    const response = await studentAPI.getAll();
    console.log('Students:', response.students);
  } catch (error) {
    console.error('Failed to load students:', error.message);
  }
}
```

### Example: Mark Attendance

```javascript
import { attendanceAPI } from '../services/api';

async function markAttendance(studentId, date, status) {
  try {
    const response = await attendanceAPI.mark(studentId, date, status);
    console.log('Attendance marked:', response.attendance);
  } catch (error) {
    console.error('Failed to mark attendance:', error.message);
  }
}
```

---

## 🔑 Important Concepts

### JWT Tokens
- Every API request needs the token in the header
- Format: `Authorization: Bearer {token}`
- Tokens expire after 7 days
- The API service handles this automatically!

### Role-Based Access
- **Teachers** can:
  - View all students
  - Create/update/delete students
  - Mark attendance
  - View attendance reports
  
- **Students** can:
  - View only their own attendance records
  - Cannot create/delete anything

### Attendance Status
- `present` - Student was present
- `absent` - Student was absent
- `late` - Student was late

---

## 🔧 Common Issues & Solutions

### "Cannot find module 'pg'"
```bash
# Solution: Install dependencies
npm install
```

### "Database connection refused"
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### "CORS error from frontend"
- Frontend URL must match CORS settings
- The backend already allows localhost:3000 (React default)
- For other ports, update `cors()` in server.js

### "Invalid token"
- Token may have expired (7 days)
- User needs to login again
- Check token format in Authorization header

---

## 📚 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students (Teachers Only)
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance (Teachers Manage, Students View)
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/date/:date` - Get by date
- `GET /api/attendance/student/:id` - Get student's attendance
- `GET /api/attendance/report/:start/:end` - Get report

---

## 🚢 Production Deployment

Before deploying:

1. **Change JWT_SECRET in .env** to a strong random string
2. **Set NODE_ENV=production**
3. **Use a production database** (not localhost)
4. **Enable HTTPS** on your server
5. **Setup database backups**
6. **Configure CORS** for your domain
7. **Use a process manager** like PM2

Example PM2 setup:
```bash
npm install -g pm2
pm2 start server.js --name "attendance-api"
pm2 save
pm2 startup
```

---

## 📖 Full Documentation

For complete API documentation, examples, and troubleshooting, see `README.md`

---

## 💡 Next Steps

1. ✅ Set up backend server
2. ✅ Test with curl or Postman
3. ✅ Integrate with React frontend
4. ✅ Test all features
5. ✅ Deploy to production

**Happy coding! 🎉**
