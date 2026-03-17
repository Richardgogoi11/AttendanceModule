// Example: Complete Teacher Dashboard Component
// This shows how to use all the API endpoints from your React frontend

import React, { useState, useEffect } from 'react';
import {
  authAPI,
  studentAPI,
  attendanceAPI,
} from '../services/api';

function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Load attendance when date changes
  useEffect(() => {
    if (students.length > 0) {
      loadAttendanceByDate();
    }
  }, [selectedDate]);

  // ==========================================
  // STUDENT MANAGEMENT
  // ==========================================

  // Get all students
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      setStudents(response.students);
      setError('');
    } catch (err) {
      setError(`Failed to load students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new student
  const createStudent = async (name, roll_no, classname, email, password) => {
    try {
      const response = await studentAPI.create(
        name,
        roll_no,
        classname,
        email,
        password
      );
      setStudents([...students, response.student]);
      setSuccessMessage('Student created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (err) {
      setError(`Failed to create student: ${err.message}`);
      return false;
    }
  };

  // Update student
  const updateStudent = async (id, name, roll_no, classname) => {
    try {
      const response = await studentAPI.update(id, name, roll_no, classname);
      setStudents(
        students.map((s) => (s.id === id ? response.student : s))
      );
      setSuccessMessage('Student updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (err) {
      setError(`Failed to update student: ${err.message}`);
      return false;
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        setStudents(students.filter((s) => s.id !== id));
        setSuccessMessage('Student deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } catch (err) {
        setError(`Failed to delete student: ${err.message}`);
        return false;
      }
    }
  };

  // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================

  // Get attendance by date
  const loadAttendanceByDate = async () => {
    try {
      const response = await attendanceAPI.getByDate(selectedDate);
      setAttendance(response.attendance);
      setError('');
    } catch (err) {
      // It's okay if no attendance records exist for the date
      setAttendance([]);
    }
  };

  // Mark attendance for a student
  const markAttendance = async (studentId, status) => {
    try {
      const response = await attendanceAPI.mark(studentId, selectedDate, status);
      
      // Update attendance list
      setAttendance(
        attendance.map((a) =>
          a.student_id === studentId && a.date === selectedDate
            ? { ...a, status }
            : a
        )
      );
      
      // Add new record if it doesn't exist
      if (!attendance.find((a) => a.student_id === studentId)) {
        setAttendance([
          ...attendance,
          {
            ...response.attendance,
            name: students.find((s) => s.id === studentId)?.name,
            roll_no: students.find((s) => s.id === studentId)?.roll_no,
          },
        ]);
      }

      setSuccessMessage('Attendance marked successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (err) {
      setError(`Failed to mark attendance: ${err.message}`);
      return false;
    }
  };

  // Get attendance report for date range
  const generateReport = async (startDate, endDate) => {
    try {
      const response = await attendanceAPI.getReport(startDate, endDate);
      console.log('Attendance Report:', response);
      return response.attendance;
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
      return [];
    }
  };

  // Get specific student's attendance
  const viewStudentAttendance = async (studentId) => {
    try {
      const response = await studentAPI.getById(studentId);
      const attendanceResponse = await attendanceAPI.getByStudent(studentId);
      setSelectedStudent({
        ...response.student,
        ...attendanceResponse,
      });
    } catch (err) {
      setError(`Failed to load student attendance: ${err.message}`);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/login';
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="dashboard-content">
        {/* ATTENDANCE SECTION */}
        <section className="attendance-section">
          <h2>Mark Attendance</h2>

          <div className="date-picker">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {students.length === 0 ? (
            <p>No students registered yet.</p>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentAttendance = attendance.find(
                    (a) => a.student_id === student.id
                  );
                  const status = studentAttendance?.status || '';

                  return (
                    <tr key={student.id}>
                      <td>{student.roll_no}</td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>
                        {status && (
                          <span className={`status ${status}`}>{status}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() =>
                              markAttendance(student.id, 'present')
                            }
                            className={`btn ${
                              status === 'present' ? 'active' : ''
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'late')}
                            className={`btn ${
                              status === 'late' ? 'active' : ''
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'absent')}
                            className={`btn ${
                              status === 'absent' ? 'active' : ''
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() =>
                              viewStudentAttendance(student.id)
                            }
                            className="btn view-btn"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* STUDENT DETAILS SECTION */}
        {selectedStudent && (
          <section className="student-details-section">
            <h2>Student Attendance Details</h2>
            <h3>{selectedStudent.name}</h3>

            <div className="statistics">
              <div className="stat">
                <span className="label">Present:</span>
                <span className="value">
                  {selectedStudent.statistics?.present || 0}
                </span>
              </div>
              <div className="stat">
                <span className="label">Absent:</span>
                <span className="value">
                  {selectedStudent.statistics?.absent || 0}
                </span>
              </div>
              <div className="stat">
                <span className="label">Late:</span>
                <span className="value">
                  {selectedStudent.statistics?.late || 0}
                </span>
              </div>
              <div className="stat">
                <span className="label">Total:</span>
                <span className="value">
                  {selectedStudent.statistics?.total || 0}
                </span>
              </div>
            </div>

            <table className="attendance-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.attendance?.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>
                      <span className={`status ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => setSelectedStudent(null)}
              className="btn close-btn"
            >
              Close
            </button>
          </section>
        )}
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 15px;
        }

        .logout-btn {
          padding: 10px 20px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .logout-btn:hover {
          background-color: #c82333;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #c3e6cb;
        }

        .date-picker {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .date-picker input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .attendance-table,
        .attendance-history-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .attendance-table th,
        .attendance-table td,
        .attendance-history-table th,
        .attendance-history-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .attendance-table th,
        .attendance-history-table th {
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }

        .attendance-table tbody tr:hover {
          background-color: #f5f5f5;
        }

        .status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status.present {
          background-color: #d4edda;
          color: #155724;
        }

        .status.absent {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status.late {
          background-color: #fff3cd;
          color: #856404;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .btn:hover {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .btn.active {
          background-color: #28a745;
          color: white;
          border-color: #28a745;
        }

        .view-btn {
          background-color: #17a2b8;
          color: white;
          border-color: #17a2b8;
        }

        .close-btn {
          background-color: #6c757d;
          color: white;
          border-color: #6c757d;
          margin-top: 20px;
        }

        .statistics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 20px 0;
        }

        .stat {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat .label {
          font-weight: bold;
          color: #666;
        }

        .stat .value {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }

        @media (max-width: 768px) {
          .statistics {
            grid-template-columns: repeat(2, 1fr);
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default TeacherDashboard;

// ==========================================
// STUDENT ATTENDANCE PAGE EXAMPLE
// ==========================================

function StudentAttendancePage() {
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
      // In a real app, you'd get the student_id from the user/profile
      const studentId = user?.student_id; // You need to add this to your user profile

      const response = await attendanceAPI.getByStudent(studentId);
      setAttendance(response.attendance);
      setStats(response.statistics);
      setError('');
    } catch (err) {
      setError(`Failed to load attendance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your attendance...</div>;

  return (
    <div className="student-page">
      <h1>Your Attendance</h1>

      {error && <div className="error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card present">
            <div className="number">{stats.present}</div>
            <div className="label">Present</div>
          </div>
          <div className="stat-card absent">
            <div className="number">{stats.absent}</div>
            <div className="label">Absent</div>
          </div>
          <div className="stat-card late">
            <div className="number">{stats.late}</div>
            <div className="label">Late</div>
          </div>
          <div className="stat-card total">
            <div className="number">{stats.total}</div>
            <div className="label">Total</div>
          </div>
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
              <td>
                <span className={`badge ${record.status}`}>
                  {record.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { TeacherDashboard, StudentAttendancePage };
