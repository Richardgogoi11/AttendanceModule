// src/services/api.js
// API service for communicating with the backend

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get authorization token
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization token if it exists
  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `HTTP ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', 'POST', { email, password });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  register: async (name, email, password, role, roll_no = null, classname = null) => {
    const data = { name, email, password, role };
    if (role === 'student') {
      data.roll_no = roll_no;
      data.class = classname;
    }
    const response = await apiRequest('/auth/register', 'POST', data);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Student API calls
export const studentAPI = {
  getAll: async () => {
    return await apiRequest('/students', 'GET');
  },

  getById: async (id) => {
    return await apiRequest(`/students/${id}`, 'GET');
  },

  create: async (name, roll_no, classname, email, password) => {
    return await apiRequest('/students', 'POST', {
      name,
      roll_no,
      class: classname,
      email,
      password,
    });
  },

  update: async (id, name, roll_no, classname) => {
    return await apiRequest(`/students/${id}`, 'PUT', {
      name,
      roll_no,
      class: classname,
    });
  },

  delete: async (id) => {
    return await apiRequest(`/students/${id}`, 'DELETE');
  },
};

// Attendance API calls
export const attendanceAPI = {
  mark: async (student_id, date, status) => {
    return await apiRequest('/attendance/mark', 'POST', {
      student_id,
      date,
      status,
    });
  },

  getByDate: async (date) => {
    return await apiRequest(`/attendance/date/${date}`, 'GET');
  },

  getByStudent: async (student_id) => {
    return await apiRequest(`/attendance/student/${student_id}`, 'GET');
  },

  getReport: async (startDate, endDate) => {
    return await apiRequest(`/attendance/report/${startDate}/${endDate}`, 'GET');
  },

  delete: async (id) => {
    return await apiRequest(`/attendance/${id}`, 'DELETE');
  },
};

// Health check
export const healthCheck = async () => {
  return await apiRequest('/health', 'GET');
};
