import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import Login from '@/pages/Login';
import Unauthorized from '@/pages/Unauthorized';
import AdminDashboard from '@/pages/admin/Dashboard';
import EmployeeList from '@/pages/admin/EmployeeList';
import EmployeeDetail from '@/pages/admin/EmployeeDetail';
import EmployeeForm from '@/pages/admin/EmployeeForm';
import LeaveRequests from '@/pages/admin/LeaveRequests';
import AttendanceManagement from '@/pages/admin/AttendanceManagement';
import PayrollManagement from '@/pages/admin/PayrollManagement';
import Reports from '@/pages/admin/Reports';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* 404 - Redirect to admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
