import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">DF</div>
          <span className="logo-text">DayFlow</span>
        </Link>

        {user ? (
          <div className="navbar-menu">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <div className="navbar-user">
              <div className="user-avatar">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span>{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
