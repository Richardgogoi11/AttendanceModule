# Frontend & Backend Integration Guide

This guide shows how to connect your React frontend to the Node.js backend.

## 📁 Project Structure

```
your-attendance-project/
├── server/                          # Backend (Node.js/Express)
│   ├── server.js                   # Main server file
│   ├── db.js                       # Database connection
│   ├── package.json                # Backend dependencies
│   ├── .env                        # Environment variables (create this)
│   ├── .env.example                # Environment template
│   ├── middleware/
│   │   └── auth.js                # JWT authentication
│   └── routes/
│       ├── auth.js                # Login/Register endpoints
│       ├── students.js            # Student management
│       └── attendance.js          # Attendance tracking
│
└── src/                             # Frontend (React/Vite)
    ├── services/
    │   └── api.js                 # API service (copy from api-service.js)
    ├── pages/
    │   ├── LoginPage.jsx          # Login component
    │   ├── TeacherDashboard.jsx   # Teacher page
    │   └── StudentDashboard.jsx   # Student page
    ├── App.jsx
    ├── main.jsx
    └── ...
```

## 🔗 Integration Steps

### Step 1: Setup Backend

```bash
# 1. Create server folder
mkdir -p server
cd server

# 2. Copy all backend files
# (Copy server.js, db.js, package.json, middleware/, routes/ into server/)

# 3. Install dependencies
npm install

# 4. Create .env file
cp .env.example .env

# 5. Edit .env with your PostgreSQL credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# etc...

# 6. Create PostgreSQL database
psql -U postgres
CREATE DATABASE attendance_db;
\q

# 7. Start server (from server/ directory)
npm start
```

The server will run on `http://localhost:5000`

### Step 2: Setup Frontend

```bash
# From project root (not server folder)
cd ..

# If using Vite React
npm create vite@latest . -- --template react
npm install

# Install axios (optional, but api-service.js uses fetch)
npm install axios
```

### Step 3: Add API Service

```bash
# Copy api-service.js to src/services/
mkdir -p src/services
cp ../server/api-service.js src/services/api.js
```

Update the file path in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Step 4: Create Login Page

Create `src/pages/LoginPage.jsx`:

```javascript
import React, { useState } from 'react';
import { authAPI } from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      
      // Redirect based on role
      if (response.user.role === 'teacher') {
        window.location.href = '/teacher';
      } else {
        window.location.href = '/student';
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Attendance Management System</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
```

### Step 5: Create Teacher Dashboard

Create `src/pages/TeacherDashboard.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI, authAPI } from '../services/api';

function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceByDate();
    }
  }, [selectedDate]);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.students);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceByDate = async () => {
    try {
      const response = await attendanceAPI.getByDate(selectedDate);
      setAttendance(response.attendance);
    } catch {
      setAttendance([]);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await attendanceAPI.mark(studentId, selectedDate, status);
      loadAttendanceByDate(); // Refresh
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <header>
        <h1>Teacher Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="attendance-section">
        <h2>Mark Attendance - {selectedDate}</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentAttendance = attendance.find(
                (a) => a.student_id === student.id
              );
              const status = studentAttendance?.status;

              return (
                <tr key={student.id}>
                  <td>{student.roll_no}</td>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>
                    <button
                      className={status === 'present' ? 'active' : ''}
                      onClick={() =>
                        markAttendance(student.id, 'present')
                      }
                    >
                      Present
                    </button>
                    <button
                      className={status === 'absent' ? 'active' : ''}
                      onClick={() => markAttendance(student.id, 'absent')}
                    >
                      Absent
                    </button>
                    <button
                      className={status === 'late' ? 'active' : ''}
                      onClick={() => markAttendance(student.id, 'late')}
                    >
                      Late
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherDashboard;
```

### Step 6: Create Student Dashboard

Create `src/pages/StudentDashboard.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { attendanceAPI, authAPI } from '../services/api';

function StudentDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const user = authAPI.getCurrentUser();
      // Note: You need to store student_id in localStorage after login
      // Add this to your login response handling
      const studentId = localStorage.getItem('student_id');

      if (!studentId) {
        setError('Student ID not found');
        return;
      }

      const response = await attendanceAPI.getByStudent(studentId);
      setAttendance(response.attendance);
      setStats(response.statistics);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('student_id');
    window.location.href = '/';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <header>
        <h1>My Attendance</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div className="error">{error}</div>}

      {stats && (
        <div className="stats">
          <div>Present: {stats.present}</div>
          <div>Absent: {stats.absent}</div>
          <div>Late: {stats.late}</div>
          <div>Total: {stats.total}</div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentDashboard;
```

### Step 7: Setup Routing

Create `src/App.jsx`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

Install React Router:
```bash
npm install react-router-dom
```

### Step 8: Update Login to Store Student ID

Modify the API service to store student_id after login:

In `src/services/api.js`, update the `login` function:

```javascript
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', 'POST', { email, password });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // For students, store student_id
      // You might need to fetch this separately from /students endpoint
      if (response.user.role === 'student') {
        // Store for later use
        localStorage.setItem('userId', response.user.id);
      }
    }
    return response;
  },
  // ... rest of auth functions
};
```

## 🧪 Testing the Integration

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend running on http://localhost:5173 (or 3000)
```

### 2. Test Registration

1. Go to login page
2. Click "Register" (you'll need to add this)
3. Register a teacher account
4. Register a student account

### 3. Test Login

1. Login with teacher account
2. You should see the attendance marking page
3. Logout and login with student account
4. You should see your attendance records

### 4. Test Attendance

1. Login as teacher
2. Select a date
3. Mark students as Present/Absent/Late
4. Login as student
5. Verify the attendance is showing correctly

## 🔐 Important: Update API Service for Students

Your API needs to return `student_id` in the login response. Update your backend's `routes/auth.js`:

```javascript
router.post('/login', async (req, res) => {
  // ... existing code ...
  
  // Find user by email
  const userResult = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // ... password verification ...

  // If student, get student_id
  let student_id = null;
  if (user.role === 'student') {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [user.id]
    );
    if (studentResult.rows.length > 0) {
      student_id = studentResult.rows[0].id;
    }
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, student_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      student_id, // Add this
    },
    token,
  });
});
```

## 🐛 Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure backend CORS is configured correctly in `server.js`:
```javascript
app.use(cors());
```

### Token Error
```
Invalid or expired token
```
**Solution:** 
- Check token is in Authorization header: `Bearer {token}`
- Token expires after 7 days - user needs to login again

### Database Connection Error
```
Cannot connect to database
```
**Solution:**
- Ensure PostgreSQL is running
- Check .env credentials match your setup
- Verify database `attendance_db` exists

### API Not Found (404)
```
Cannot GET /api/students
```
**Solution:**
- Ensure backend is running on http://localhost:5000
- Check API endpoint spelling
- Use correct HTTP method (GET/POST/PUT/DELETE)

## 📚 API Endpoints Quick Reference

All require `Authorization: Bearer {token}` header except `/auth/login` and `/auth/register`.

| Method | Endpoint | Auth Required | Role |
|--------|----------|---------------|------|
| POST | /api/auth/register | No | - |
| POST | /api/auth/login | No | - |
| GET | /api/students | Yes | teacher |
| POST | /api/students | Yes | teacher |
| GET | /api/students/:id | Yes | - |
| PUT | /api/students/:id | Yes | teacher |
| DELETE | /api/students/:id | Yes | teacher |
| POST | /api/attendance/mark | Yes | teacher |
| GET | /api/attendance/date/:date | Yes | teacher |
| GET | /api/attendance/student/:id | Yes | - |
| GET | /api/attendance/report/:start/:end | Yes | teacher |

## ✅ Checklist

- [ ] Backend server created in `/server` folder
- [ ] PostgreSQL database `attendance_db` created
- [ ] `.env` file created with correct credentials
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend created with React/Vite
- [ ] `api-service.js` copied to `src/services/api.js`
- [ ] React Router installed and configured
- [ ] Login, Teacher, and Student pages created
- [ ] Tested login/registration
- [ ] Tested attendance marking
- [ ] Tested attendance viewing

---

## 🚀 You're Ready!

Your Attendance Management System is now fully integrated. Both frontend and backend are communicating through secure JWT-authenticated APIs.

For any issues, refer to the comprehensive README.md and QUICK_START.md files.

Happy coding! 🎉
