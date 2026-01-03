import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => (
  <div className="landing">
    <header className="landing-hero">
      <div className="landing-container">
        <h1>DayFlow — HR made simple</h1>
        <p>Streamline attendance, payroll, leave and reports — all in one place.</p>
        <div className="landing-ctas">
          <Link to="/signup" className="btn primary">Get Started</Link>
          <Link to="/signin" className="btn secondary">Sign In</Link>
        </div>
      </div>
    </header>

    <section className="landing-features">
      <div className="landing-container">
        <h2>Manage your people with confidence</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Attendance</h3>
            <p>Accurate, easy attendance tracking.</p>
          </div>
          <div className="feature">
            <h3>Leave & Approvals</h3>
            <p>Simplify leave requests and approvals.</p>
          </div>
          <div className="feature">
            <h3>Payroll</h3>
            <p>Trusted payroll calculations and records.</p>
          </div>
          <div className="feature">
            <h3>Reports</h3>
            <p>Actionable reports in seconds.</p>
          </div>
        </div>
      </div>
    </section>

    <footer className="landing-footer">
      <div className="landing-container">
        <p>© {new Date().getFullYear()} DayFlow HRMS — Built for teams.</p>
      </div>
    </footer>
  </div>
);

export default Landing;
