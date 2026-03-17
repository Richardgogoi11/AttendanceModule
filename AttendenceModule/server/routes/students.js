const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeTeacher } = require('../middleware/auth');

const router = express.Router();

// Get all students (only teachers can access)
router.get('/', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.id, s.name, s.roll_no, s.class FROM students s ORDER BY s.roll_no'
    );

    res.json({
      message: 'Students retrieved successfully',
      students: result.rows,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check authorization: students can only view their own data
    if (req.user.role === 'student' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT s.id, s.name, s.roll_no, s.class FROM students s WHERE s.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student retrieved successfully',
      student: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create a new student (only teachers can create)
router.post('/', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { name, roll_no, class: classname, email, password } = req.body;

    // Validation
    if (!name || !roll_no || !classname || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if roll_no already exists
    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE roll_no = $1',
      [roll_no]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(409).json({ error: 'Roll number already exists' });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user record
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, 'student']
    );

    const userId = userResult.rows[0].id;

    // Create student record
    const studentResult = await pool.query(
      'INSERT INTO students (user_id, name, roll_no, class) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, roll_no, classname]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: studentResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student (only teachers can update)
router.put('/:id', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_no, class: classname } = req.body;

    // Validation
    if (!name || !roll_no || !classname) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if student exists
    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (existingStudent.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if roll_no is unique (excluding current student)
    const rollNoCheck = await pool.query(
      'SELECT * FROM students WHERE roll_no = $1 AND id != $2',
      [roll_no, id]
    );

    if (rollNoCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Roll number already exists' });
    }

    const result = await pool.query(
      'UPDATE students SET name = $1, roll_no = $2, class = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, roll_no, classname, id]
    );

    res.json({
      message: 'Student updated successfully',
      student: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student (only teachers can delete)
router.delete('/:id', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (existingStudent.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const userId = existingStudent.rows[0].user_id;

    // Delete student (user will be deleted due to CASCADE)
    await pool.query('DELETE FROM students WHERE id = $1', [id]);

    // Delete associated user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
