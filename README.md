# Attendance Management System

A secure, production-ready Attendance Management System featuring dedicated portals for teachers and students. This system utilizes a React frontend and a Node.js/Express backend with a PostgreSQL database.

## 🎯 Project Objective
The goal of this project is to provide a robust platform for educational institutions to manage attendance efficiently. 
- **Teachers** can manage students, generate sessions, and mark attendance records.
- **Students** can view their attendance history and verify their presence (to be integrated with GPS and photo verification).
- **Security** is a priority, using JWT-based authentication and role-based access control (RBAC).

## 📂 Project Structure

```text
AttendenceModule/
├── README.md                        # Project overview and documentation (You are here)
├── attendance-module/               # 💻 Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/              # UI Components (LoginPage, TeacherPanel, StudentPanel)
│   │   ├── services/                # API services for backend communication
│   │   ├── context/                 # State management (SessionContext)
│   │   ├── App.jsx                  # Main application routing
│   │   └── main.jsx                 # Entry point
│   ├── public/                      # Static assets
│   └── package.json                 # Frontend dependencies and scripts
│
└── server/                          # 🚀 Backend (Node.js + Express + PostgreSQL)
    ├── middleware/
    │   └── auth.js                  # JWT authentication and role authorization
    ├── routes/
    │   ├── auth.js                  # Registration and Login endpoints
    │   ├── students.js              # Student CRUD operations
    │   └── attendance.js            # Attendance marking and reporting
    ├── db.js                        # Database connection and schema initialization
    ├── server.js                    # Server entry point and middleware configuration
    ├── .env                         # Environment variables (Database credentials, JWT secret)
    └── package.json                 # Backend dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **PostgreSQL** (running locally or remotely)
- **npm** or **yarn**

### Quick Setup

1. **Database Setup**:
   - Create a database named `attendance_db` in PostgreSQL.

2. **Backend Setup**:
   - Navigate to the `server/` directory.
   - Run `npm install`.
   - Configure the `.env` file with your database credentials.
   - Run `npm start` to start the backend on `http://localhost:5000`.

3. **Frontend Setup**:
   - Navigate to the `attendance-module/` directory.
   - Run `npm install`.
   - Run `npm run dev` to start the development server.

## 🛠️ Security & Features
- **JWT Auth**: Secure token-based authentication.
- **BCrypt**: Password hashing for secure storage.
- **RBAC**: Role-Based Access Control ensuring students cannot access teacher data.
- **PostgreSQL**: Relational database for data integrity and reliability.
