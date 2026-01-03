import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Badge, Alert } from '../components/Components';
import Table from '../components/Table';
import { FormGroup, FormLabel, FormTextarea } from '../components/Form';
import { adminAPI } from '../services/api';
import './LeaveApprovals.css';

const LeaveApprovals = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await adminAPI.getPendingLeaves();
      setPendingLeaves(response.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      // Mock data
      setPendingLeaves([
        {
          id: 1,
          employeeName: 'John Doe',
          employeeId: 'EMP001',
          leaveType: 'Sick Leave',
          startDate: '2026-01-10',
          endDate: '2026-01-12',
          days: 3,
          reason: 'Medical appointment and recovery',
          appliedOn: '2026-01-05',
          status: 'pending',
        },
        {
          id: 2,
          employeeName: 'Jane Smith',
          employeeId: 'EMP002',
          leaveType: 'Vacation',
          startDate: '2026-02-15',
          endDate: '2026-02-20',
          days: 6,
          reason: 'Family vacation',
          appliedOn: '2026-01-03',
          status: 'pending',
        },
        {
          id: 3,
          employeeName: 'Bob Johnson',
          employeeId: 'EMP003',
          leaveType: 'Casual Leave',
          startDate: '2026-01-15',
          endDate: '2026-01-16',
          days: 2,
          reason: 'Personal work',
          appliedOn: '2026-01-02',
          status: 'pending',
        },
      ]);
    }
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setAction('view');
    setComments('');
    setShowModal(true);
  };

  const handleApprove = (leave) => {
    setSelectedLeave(leave);
    setAction('approve');
    setComments('');
    setShowModal(true);
  };

  const handleReject = (leave) => {
    setSelectedLeave(leave);
    setAction('reject');
    setComments('');
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    setError('');
    setSuccess('');

    try {
      if (action === 'approve') {
        await adminAPI.approveLeave(selectedLeave.id, comments);
        setSuccess(`Leave request approved for ${selectedLeave.employeeName}`);
      } else if (action === 'reject') {
        await adminAPI.rejectLeave(selectedLeave.id, comments);
        setSuccess(`Leave request rejected for ${selectedLeave.employeeName}`);
      }
      setShowModal(false);
      fetchPendingLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process leave request');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (value, row) => (
        <div>
          <div className="table-text-bold">{value}</div>
          <div className="table-text-secondary">{row.employeeId}</div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
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
      header: 'Applied On',
      accessor: 'appliedOn',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant="warning">{value}</Badge>
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
            icon={FiEye}
            onClick={() => handleViewDetails(row)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiCheckCircle}
            onClick={() => handleApprove(row)}
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiXCircle}
            onClick={() => handleReject(row)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    pending: pendingLeaves.length,
    thisWeek: pendingLeaves.filter(l => {
      const applied = new Date(l.appliedOn);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return applied >= weekAgo;
    }).length,
    urgent: pendingLeaves.filter(l => {
      const start = new Date(l.startDate);
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      return start <= inThreeDays;
    }).length,
  };

  return (
    <DashboardLayout>
      <div className="leave-approvals-container">
        <div className="leave-approvals-header">
          <div>
            <h1 className="leave-approvals-title">Leave Approvals</h1>
            <p className="leave-approvals-subtitle">Review and approve leave requests</p>
          </div>
        </div>

        {success && <Alert variant="success" title="Success">{success}</Alert>}
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div className="stats-grid">
          <StatCard
            label="Pending Requests"
            value={stats.pending}
            gradient="warning"
          />
          <StatCard
            label="This Week"
            value={stats.thisWeek}
            gradient="primary"
          />
          <StatCard
            label="Urgent (Starting Soon)"
            value={stats.urgent}
            gradient="error"
          />
          <StatCard
            label="Avg. Processing Time"
            value="1.5 days"
            gradient="success"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardBody>
            <Table
              columns={columns}
              data={pendingLeaves}
              emptyMessage="No pending leave requests"
            />
          </CardBody>
        </Card>

        {selectedLeave && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={
              action === 'view'
                ? 'Leave Request Details'
                : action === 'approve'
                ? 'Approve Leave Request'
                : 'Reject Leave Request'
            }
          >
            <div className="leave-details">
              <div className="leave-detail-section">
                <h3>Employee Information</h3>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Name:</span>
                  <span className="leave-detail-value">{selectedLeave.employeeName}</span>
                </div>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Employee ID:</span>
                  <span className="leave-detail-value">{selectedLeave.employeeId}</span>
                </div>
              </div>

              <div className="leave-detail-section">
                <h3>Leave Information</h3>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Leave Type:</span>
                  <span className="leave-detail-value">{selectedLeave.leaveType}</span>
                </div>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Start Date:</span>
                  <span className="leave-detail-value">
                    {new Date(selectedLeave.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">End Date:</span>
                  <span className="leave-detail-value">
                    {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Total Days:</span>
                  <span className="leave-detail-value">{selectedLeave.days} days</span>
                </div>
                <div className="leave-detail-row">
                  <span className="leave-detail-label">Applied On:</span>
                  <span className="leave-detail-value">
                    {new Date(selectedLeave.appliedOn).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="leave-detail-section">
                <h3>Reason</h3>
                <p className="leave-reason">{selectedLeave.reason}</p>
              </div>

              {action !== 'view' && (
                <div className="leave-detail-section">
                  <FormGroup>
                    <FormLabel htmlFor="comments">
                      Comments {action === 'reject' && '(Required)'}
                    </FormLabel>
                    <FormTextarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add your comments here..."
                      rows={4}
                      required={action === 'reject'}
                    />
                  </FormGroup>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {action === 'view' ? (
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    variant={action === 'approve' ? 'primary' : 'error'}
                    onClick={handleSubmitAction}
                    disabled={action === 'reject' && !comments.trim()}
                  >
                    {action === 'approve' ? 'Approve' : 'Reject'} Leave
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaveApprovals;
