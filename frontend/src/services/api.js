import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Employee API
export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  uploadDocument: (formData) => api.post('/employee/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Attendance API
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: (params) => api.get('/attendance/me', { params }),
  getAttendanceByMonth: (year, month) => api.get(`/attendance/me/${year}/${month}`),
};

// Leave API
export const leaveAPI = {
  getMyLeaves: () => api.get('/leave/me'),
  applyLeave: (leaveData) => api.post('/leave', leaveData),
  cancelLeave: (id) => api.delete(`/leave/${id}`),
  getLeaveBalance: () => api.get('/leave/balance'),
};

// Payroll API
export const payrollAPI = {
  getMyPayroll: () => api.get('/payroll/me'),
  getPayslip: (id) => api.get(`/payroll/payslip/${id}`),
  downloadPayslip: (id) => api.get(`/payroll/payslip/${id}/download`, {
    responseType: 'blob'
  }),
};

// Admin API
export const adminAPI = {
  getAllEmployees: () => api.get('/admin/employees'),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  createEmployee: (data) => api.post('/admin/employees', data),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  getAllAttendance: (params) => api.get('/admin/attendance', { params }),
  getPendingLeaves: () => api.get('/admin/leave/pending'),
  approveLeave: (id, comments) => api.put(`/admin/leave/${id}/approve`, { comments }),
  rejectLeave: (id, comments) => api.put(`/admin/leave/${id}/reject`, { comments }),
  generateReport: (type, params) => api.get(`/admin/reports/${type}`, { params }),
};

export default api;
