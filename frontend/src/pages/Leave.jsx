import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiFileText, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '../components/Form';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Badge, Alert } from '../components/Components';
import Table from '../components/Table';
import { leaveAPI } from '../services/api';
import './Leave.css';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ total: 20, used: 0, remaining: 20 });
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
    fetchBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      // Use mock data
      setLeaves([
        {
          id: 1,
          leaveType: 'Sick Leave',
          startDate: '2026-01-10',
          endDate: '2026-01-12',
          days: 3,
          status: 'approved',
          reason: 'Medical appointment',
          appliedOn: '2026-01-05',
        },
        {
          id: 2,
          leaveType: 'Casual Leave',
          startDate: '2025-12-24',
          endDate: '2025-12-26',
          days: 3,
          status: 'approved',
          reason: 'Family function',
          appliedOn: '2025-12-15',
        },
        {
          id: 3,
          leaveType: 'Vacation',
          startDate: '2026-02-15',
          endDate: '2026-02-20',
          days: 6,
          status: 'pending',
          reason: 'Personal vacation',
          appliedOn: '2026-01-03',
        },
      ]);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await leaveAPI.getLeaveBalance();
      setBalance(response.data || { total: 20, used: 6, remaining: 14 });
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance({ total: 20, used: 6, remaining: 14 });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const days = calculateDays();
    if (days > balance.remaining) {
      setError(`Insufficient leave balance. You have ${balance.remaining} days remaining.`);
      return;
    }

    try {
      await leaveAPI.applyLeave({
        ...formData,
        days,
      });
      setSuccess('Leave application submitted successfully!');
      setShowModal(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      fetchBalance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await leaveAPI.cancelLeave(id);
        setSuccess('Leave request cancelled successfully!');
        fetchLeaves();
        fetchBalance();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel leave');
      }
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: (value) => <span className="table-text-bold">{value}</span>,
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Days',
      accessor: 'days',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const variant = value === 'approved' ? 'success' : value === 'rejected' ? 'error' : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Reason',
      accessor: 'reason',
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value, row) => (
        row.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCancel(value)}
          >
            Cancel
          </Button>
        )
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="leave-container">
        <div className="leave-header">
          <div>
            <h1 className="leave-title">Leave Management</h1>
            <p className="leave-subtitle">Apply and track your leave requests</p>
          </div>
          <Button variant="primary" icon={FiPlus} onClick={() => setShowModal(true)}>
            Apply Leave
          </Button>
        </div>

        {success && <Alert variant="success" title="Success">{success}</Alert>}
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div className="stats-grid">
          <StatCard
            label="Total Leave Days"
            value={balance.total}
            gradient="primary"
          />
          <StatCard
            label="Used"
            value={balance.used}
            gradient="accent"
          />
          <StatCard
            label="Remaining"
            value={balance.remaining}
            gradient="success"
          />
          <StatCard
            label="Pending Requests"
            value={leaves.filter(l => l.status === 'pending').length}
            gradient="warning"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardBody>
            <Table
              columns={columns}
              data={leaves}
              emptyMessage="No leave requests found"
            />
          </CardBody>
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Apply for Leave"
        >
          <form onSubmit={handleSubmit}>
            <div className="leave-form">
              <FormGroup>
                <FormLabel htmlFor="leaveType" required>
                  Leave Type
                </FormLabel>
                <FormSelect
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                </FormSelect>
              </FormGroup>

              <div className="leave-form-row">
                <FormGroup>
                  <FormLabel htmlFor="startDate" required>
                    Start Date
                  </FormLabel>
                  <FormInput
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="endDate" required>
                    End Date
                  </FormLabel>
                  <FormInput
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </FormGroup>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="leave-days-info">
                  <FiCalendar />
                  <span>Total Days: {calculateDays()}</span>
                </div>
              )}

              <FormGroup>
                <FormLabel htmlFor="reason" required>
                  Reason
                </FormLabel>
                <FormTextarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a reason for your leave"
                  rows={4}
                  required
                />
              </FormGroup>

              <div className="leave-balance-warning">
                <Alert variant="info">
                  Available Balance: {balance.remaining} days
                </Alert>
              </div>
            </div>

            <div className="modal-footer">
              <Button type="submit" variant="primary">
                Submit Application
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

export default Leave;
