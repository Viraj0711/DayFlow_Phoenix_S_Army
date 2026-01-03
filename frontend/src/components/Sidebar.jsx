import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUser, FiClock, FiCalendar, 
  FiDollarSign, FiFileText, FiUsers, FiCheckSquare 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const employeeMenuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
    { path: '/attendance', icon: FiClock, label: 'Attendance' },
    { path: '/leave', icon: FiCalendar, label: 'Leave' },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
  ];

  const adminMenuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employees', icon: FiUsers, label: 'Employees' },
    { path: '/attendance', icon: FiClock, label: 'Attendance' },
    { path: '/leave-approvals', icon: FiCheckSquare, label: 'Leave Approvals' },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link active' : 'sidebar-link'
                  }
                >
                  <Icon className="sidebar-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
