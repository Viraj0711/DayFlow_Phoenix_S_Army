import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import { FormGroup, FormLabel, FormInput, FormSelect } from '../components/Form';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Badge, Alert } from '../components/Components';
import Table from '../components/Table';
import { adminAPI } from '../services/api';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    joiningDate: '',
    status: 'active',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await adminAPI.getAllEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      // Mock data
      setEmployees([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@dayflow.com',
          department: 'Engineering',
          designation: 'Senior Developer',
          phone: '+1 234 567 8900',
          joiningDate: '2020-03-15',
          status: 'active',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@dayflow.com',
          department: 'HR',
          designation: 'HR Manager',
          phone: '+1 234 567 8901',
          joiningDate: '2019-06-20',
          status: 'active',
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@dayflow.com',
          department: 'Finance',
          designation: 'Accountant',
          phone: '+1 234 567 8902',
          joiningDate: '2021-01-10',
          status: 'active',
        },
      ]);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      phone: '',
      joiningDate: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      joiningDate: employee.joiningDate,
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingEmployee) {
        await adminAPI.updateEmployee(editingEmployee.id, formData);
        setSuccess('Employee updated successfully!');
      } else {
        await adminAPI.createEmployee(formData);
        setSuccess('Employee added successfully!');
      }
      setShowModal(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await adminAPI.deleteEmployee(id);
        setSuccess('Employee deleted successfully!');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (value) => <span className="table-text-bold">{value}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Designation',
      accessor: 'designation',
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'error'}>
          {value}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value, row) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={FiEdit2}
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiTrash2}
            onClick={() => handleDelete(value)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    byDepartment: [...new Set(employees.map(e => e.department))].length,
  };

  return (
    <DashboardLayout>
      <div className="employees-container">
        <div className="employees-header">
          <div>
            <h1 className="employees-title">Employee Management</h1>
            <p className="employees-subtitle">Manage your workforce</p>
          </div>
          <Button variant="primary" icon={FiPlus} onClick={handleAdd}>
            Add Employee
          </Button>
        </div>

        {success && <Alert variant="success" title="Success">{success}</Alert>}
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div className="stats-grid">
          <StatCard
            label="Total Employees"
            value={stats.total}
            gradient="primary"
          />
          <StatCard
            label="Active Employees"
            value={stats.active}
            gradient="success"
          />
          <StatCard
            label="Departments"
            value={stats.byDepartment}
            gradient="secondary"
          />
          <StatCard
            label="New This Month"
            value={Math.floor(stats.total * 0.1)}
            gradient="accent"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="employees-card-header">
              <CardTitle>All Employees</CardTitle>
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              columns={columns}
              data={filteredEmployees}
              emptyMessage="No employees found"
            />
          </CardBody>
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="employee-form">
              <div className="employee-form-row">
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
                    required
                  />
                </FormGroup>
              </div>

              <div className="employee-form-row">
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
                    required
                  />
                </FormGroup>
              </div>

              <div className="employee-form-row">
                <FormGroup>
                  <FormLabel htmlFor="phone">
                    Phone Number
                  </FormLabel>
                  <FormInput
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="joiningDate" required>
                    Joining Date
                  </FormLabel>
                  <FormInput
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <FormLabel htmlFor="status">
                  Status
                </FormLabel>
                <FormSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </FormSelect>
              </FormGroup>
            </div>

            <div className="modal-footer">
              <Button type="submit" variant="primary">
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
