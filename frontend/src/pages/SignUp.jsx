import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormGroup, FormLabel, FormInput, FormSelect } from '../components/Form';
import Button from '../components/Button';
import { Alert } from '../components/Components';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    designation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      designation: formData.designation,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join DayFlow HRMS today</p>
        </div>

        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" title="Success">
            Account created successfully! Redirecting to sign in...
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormGroup>
            <FormLabel htmlFor="name" required>
              Full Name
            </FormLabel>
            <FormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <FormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </FormGroup>

          <div className="auth-row">
            <FormGroup>
              <FormLabel htmlFor="department" required>
                Department
              </FormLabel>
              <FormSelect
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="designation" required>
                Designation
              </FormLabel>
              <FormInput
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Software Engineer"
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <FormInput
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength="8"
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="confirmPassword" required>
              Confirm Password
            </FormLabel>
            <FormInput
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              minLength="8"
              required
            />
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || success}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/signin" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
