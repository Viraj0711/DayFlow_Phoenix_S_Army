import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import { Employee } from '@/types';
import { formatDate, getInitials, downloadCSV } from '@/lib/utils';
import { Plus, Download, Mail, Phone, Eye, Edit } from 'lucide-react';

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployeesList();
  }, [searchQuery, filterStatus, employees]);

  const fetchEmployees = async () => {
    try {
      // Mock data - replace with actual API call
      const mockEmployees: Employee[] = [
        {
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
          address: '123 Tech Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          status: 'active',
          employmentType: 'full-time',
          emergencyContact: {
            name: 'John Johnson',
            relationship: 'Spouse',
            phone: '+91 98765 43211',
          },
        },
        {
          id: '2',
          employeeId: 'EMP002',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.c@dayflow.com',
          phoneNumber: '+91 98765 43212',
          department: 'Marketing',
          position: 'Marketing Manager',
          dateOfJoining: '2022-06-10',
          dateOfBirth: '1988-08-15',
          address: '456 Business Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          status: 'active',
          employmentType: 'full-time',
          emergencyContact: {
            name: 'Lisa Chen',
            relationship: 'Sister',
            phone: '+91 98765 43213',
          },
        },
        {
          id: '3',
          employeeId: 'EMP003',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.s@dayflow.com',
          phoneNumber: '+91 98765 43214',
          department: 'Human Resources',
          position: 'HR Specialist',
          dateOfJoining: '2023-03-20',
          dateOfBirth: '1992-11-30',
          address: '789 Corporate Blvd',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          status: 'on-leave',
          employmentType: 'full-time',
          emergencyContact: {
            name: 'Raj Sharma',
            relationship: 'Father',
            phone: '+91 98765 43215',
          },
        },
        {
          id: '4',
          employeeId: 'EMP004',
          firstName: 'David',
          lastName: 'Williams',
          email: 'david.w@dayflow.com',
          phoneNumber: '+91 98765 43216',
          department: 'Finance',
          position: 'Financial Analyst',
          dateOfJoining: '2021-09-05',
          dateOfBirth: '1985-03-12',
          address: '321 Finance St',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India',
          status: 'active',
          employmentType: 'full-time',
          emergencyContact: {
            name: 'Emma Williams',
            relationship: 'Wife',
            phone: '+91 98765 43217',
          },
        },
        {
          id: '5',
          employeeId: 'EMP005',
          firstName: 'Anjali',
          lastName: 'Patel',
          email: 'anjali.p@dayflow.com',
          phoneNumber: '+91 98765 43218',
          department: 'Engineering',
          position: 'Junior Developer',
          dateOfJoining: '2024-01-10',
          dateOfBirth: '1995-07-25',
          address: '555 Tech Park',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500001',
          country: 'India',
          status: 'active',
          employmentType: 'full-time',
          emergencyContact: {
            name: 'Ramesh Patel',
            relationship: 'Father',
            phone: '+91 98765 43219',
          },
        },
      ];
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployeesList = () => {
    let filtered = employees;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((emp) => emp.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(query) ||
          emp.lastName.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const exportData = filteredEmployees.map((emp) => ({
      'Employee ID': emp.employeeId,
      'Name': `${emp.firstName} ${emp.lastName}`,
      'Email': emp.email,
      'Phone': emp.phoneNumber,
      'Department': emp.department,
      'Position': emp.position,
      'Status': emp.status,
      'Joining Date': formatDate(emp.dateOfJoining),
    }));
    downloadCSV(exportData, 'employees');
  };

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's workforce
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => navigate('/admin/employees/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, ID, department..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({employees.filter((e) => e.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('on-leave')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'on-leave'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              On Leave ({employees.filter((e) => e.status === 'on-leave').length})
            </button>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-gray-900">{employee.department}</p>
                    </td>
                    <td>
                      <p className="text-gray-900">{employee.position}</p>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {employee.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge status={employee.status}>
                        {employee.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {formatDate(employee.dateOfJoining)}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/employees/${employee.id}`)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
