import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card';
import { FormGroup, FormLabel, FormInput, FormSelect } from '../components/Form';
import Button from '../components/Button';
import { Alert } from '../components/Components';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    department: '',
    designation: '',
    joiningDate: '',
    emergencyContact: '',
    emergencyContactName: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await employeeAPI.getProfile();
      setProfileData(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Use mock data if API fails
      setProfileData({
        name: user?.name || 'John Doe',
        email: user?.email || 'john@dayflow.com',
        phone: '+1 234 567 8900',
        address: '123 Main Street, City, State 12345',
        dateOfBirth: '1990-01-15',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        joiningDate: '2020-03-15',
        emergencyContact: '+1 234 567 8901',
        emergencyContactName: 'Jane Doe',
      });
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await employeeAPI.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setError('');
  };

  return (
    <DashboardLayout>
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">Manage your personal information</p>
          </div>
          {!isEditing && (
            <Button variant="primary" icon={FiEdit2} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {success && <Alert variant="success" title="Success">{success}</Alert>}
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div className="profile-grid">
          {/* Profile Picture Card */}
          <Card>
            <CardBody>
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {profileData.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="profile-name">{profileData.name}</h3>
                <p className="profile-role">{profileData.designation}</p>
                <p className="profile-department">{profileData.department}</p>
              </div>
            </CardBody>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="profile-form-grid">
                  <FormGroup>
                    <FormLabel htmlFor="name">Full Name</FormLabel>
                    <FormInput
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="email">Email Address</FormLabel>
                    <FormInput
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="phone">Phone Number</FormLabel>
                    <FormInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                    <FormInput
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup className="form-group-full">
                    <FormLabel htmlFor="address">Address</FormLabel>
                    <FormInput
                      type="text"
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>
                </div>

                {isEditing && (
                  <div className="profile-actions">
                    <Button type="submit" variant="primary" icon={FiSave} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" icon={FiX} onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>

          {/* Employment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FiBriefcase />
                  </div>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Department</p>
                    <p className="profile-info-value">{profileData.department}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FiUser />
                  </div>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Designation</p>
                    <p className="profile-info-value">{profileData.designation}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FiCalendar />
                  </div>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Joining Date</p>
                    <p className="profile-info-value">
                      {new Date(profileData.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FiMapPin />
                  </div>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Employee ID</p>
                    <p className="profile-info-value">EMP{user?.id || '001'}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Emergency Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="profile-form-grid">
                  <FormGroup>
                    <FormLabel htmlFor="emergencyContactName">Contact Name</FormLabel>
                    <FormInput
                      type="text"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={profileData.emergencyContactName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="emergencyContact">Contact Number</FormLabel>
                    <FormInput
                      type="tel"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
