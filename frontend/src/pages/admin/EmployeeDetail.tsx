import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee } from '@/types';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils';
import Badge from '@/components/Badge';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockEmployee: Employee = {
        id: '1',
        employeeId: 'EMP001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@dayflow.com',
        phoneNumber: '+91 98765 43210',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        dateOfJoining: '2023-01-15',
        dateOfBirth: '1990-05-20',
        address: '123 Tech Street, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
        status: 'active',
        employmentType: 'full-time',
        manager: 'John Smith',
        emergencyContact: {
          name: 'John Johnson',
          relationship: 'Spouse',
          phone: '+91 98765 43211',
        },
        documents: [
          {
            id: '1',
            name: 'Aadhar Card',
            type: 'identification',
            uploadedAt: '2023-01-15',
            url: '#',
          },
          {
            id: '2',
            name: 'PAN Card',
            type: 'identification',
            uploadedAt: '2023-01-15',
            url: '#',
          },
        ],
      };
      setEmployee(mockEmployee);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </button>
        <button
          onClick={() => navigate(`/admin/employees/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} />
          Edit Employee
        </button>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {getInitials(employee.firstName, employee.lastName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{employee.position}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge status={employee.status}>
                    {employee.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {employee.employeeId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <p className="text-gray-900">{employee.firstName}</p>
              </div>
              <div>
                <label className="label">Last Name</label>
                <p className="text-gray-900">{employee.lastName}</p>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <p className="text-gray-900">{formatDate(employee.dateOfBirth)}</p>
              </div>
              <div>
                <label className="label">Employment Type</label>
                <p className="text-gray-900 capitalize">{employee.employmentType}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={20} />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <a
                    href={`mailto:${employee.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {employee.email}
                  </a>
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <a
                    href={`tel:${employee.phoneNumber}`}
                    className="text-primary-600 hover:underline"
                  >
                    {employee.phoneNumber}
                  </a>
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-1" />
                  <div className="text-gray-900">
                    <p>{employee.address}</p>
                    <p>
                      {employee.city}, {employee.state} {employee.zipCode}
                    </p>
                    <p>{employee.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} />
              Employment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <p className="text-gray-900">{employee.department}</p>
              </div>
              <div>
                <label className="label">Position</label>
                <p className="text-gray-900">{employee.position}</p>
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-900">
                    {formatDate(employee.dateOfJoining)}
                  </p>
                </div>
              </div>
              {employee.manager && (
                <div>
                  <label className="label">Reporting Manager</label>
                  <p className="text-gray-900">{employee.manager}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {employee.documents && employee.documents.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Documents
              </h2>
              <div className="space-y-2">
                {employee.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Emergency Contact & Quick Actions */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Emergency Contact
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Name</label>
                <p className="text-gray-900">{employee.emergencyContact.name}</p>
              </div>
              <div>
                <label className="label">Relationship</label>
                <p className="text-gray-900 capitalize">
                  {employee.emergencyContact.relationship}
                </p>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <a
                  href={`tel:${employee.emergencyContact.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {employee.emergencyContact.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/admin/attendance?employee=${employee.id}`)}
                className="w-full btn-secondary text-left justify-start"
              >
                View Attendance
              </button>
              <button
                onClick={() => navigate(`/admin/leave-requests?employee=${employee.id}`)}
                className="w-full btn-secondary text-left justify-start"
              >
                View Leave History
              </button>
              <button
                onClick={() => navigate(`/admin/payroll?employee=${employee.id}`)}
                className="w-full btn-secondary text-left justify-start"
              >
                View Payroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
