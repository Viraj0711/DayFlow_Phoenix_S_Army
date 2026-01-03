import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { LeaveRequest } from '@/types';
import { formatDate, calculateDaysBetween } from '@/lib/utils';
import { Calendar, Filter, Check, X, MessageSquare } from 'lucide-react';

const LeaveRequests: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterLeavesList();
  }, [searchQuery, filterStatus, leaves]);

  const fetchLeaveRequests = async () => {
    try {
      // Mock data - replace with actual API call
      const mockLeaves: LeaveRequest[] = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          employeeEmail: 'sarah.j@dayflow.com',
          leaveType: 'paid',
          startDate: '2026-01-10',
          endDate: '2026-01-12',
          totalDays: 3,
          reason: 'Family vacation planned for months',
          status: 'pending',
          appliedOn: '2026-01-03',
        },
        {
          id: '2',
          employeeId: 'EMP023',
          employeeName: 'Michael Chen',
          employeeEmail: 'michael.c@dayflow.com',
          leaveType: 'sick',
          startDate: '2026-01-05',
          endDate: '2026-01-05',
          totalDays: 1,
          reason: 'Medical appointment with specialist',
          status: 'pending',
          appliedOn: '2026-01-02',
        },
        {
          id: '3',
          employeeId: 'EMP045',
          employeeName: 'Priya Sharma',
          employeeEmail: 'priya.s@dayflow.com',
          leaveType: 'casual',
          startDate: '2026-01-08',
          endDate: '2026-01-09',
          totalDays: 2,
          reason: 'Personal work - house relocation',
          status: 'pending',
          appliedOn: '2026-01-03',
        },
        {
          id: '4',
          employeeId: 'EMP012',
          employeeName: 'David Williams',
          employeeEmail: 'david.w@dayflow.com',
          leaveType: 'paid',
          startDate: '2025-12-28',
          endDate: '2025-12-30',
          totalDays: 3,
          reason: 'Year-end holiday',
          status: 'approved',
          appliedOn: '2025-12-20',
          reviewedBy: 'Admin',
          reviewedOn: '2025-12-21',
          reviewComments: 'Approved. Enjoy your holidays!',
        },
        {
          id: '5',
          employeeId: 'EMP056',
          employeeName: 'Anjali Patel',
          employeeEmail: 'anjali.p@dayflow.com',
          leaveType: 'unpaid',
          startDate: '2025-12-15',
          endDate: '2025-12-17',
          totalDays: 3,
          reason: 'Personal reasons',
          status: 'rejected',
          appliedOn: '2025-12-10',
          reviewedBy: 'Admin',
          reviewedOn: '2025-12-11',
          reviewComments: 'Already exceeded leave quota for this month.',
        },
      ];
      setLeaves(mockLeaves);
      setFilteredLeaves(mockLeaves.filter((l) => l.status === 'pending'));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeavesList = () => {
    let filtered = leaves;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((leave) => leave.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (leave) =>
          leave.employeeName.toLowerCase().includes(query) ||
          leave.employeeEmail.toLowerCase().includes(query) ||
          leave.employeeId.toLowerCase().includes(query) ||
          leave.reason.toLowerCase().includes(query)
      );
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  };

  const handleAction = (leave: LeaveRequest, type: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setActionType(type);
    setComments('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedLeave) return;

    try {
      // API call would go here
      const updatedLeave = {
        ...selectedLeave,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        reviewedBy: 'Admin',
        reviewedOn: new Date().toISOString(),
        reviewComments: comments,
      } as LeaveRequest;

      setLeaves((prev) =>
        prev.map((leave) => (leave.id === selectedLeave.id ? updatedLeave : leave))
      );

      setShowActionModal(false);
      setSelectedLeave(null);
      setComments('');
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-600 mt-1">
          Review and manage employee leave applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Check size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {rejectedCount}
              </p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <X size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by employee name, email, ID..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'approved'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({leaves.length})
            </button>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {leave.employeeName}
                        </p>
                        <p className="text-sm text-gray-500">{leave.employeeId}</p>
                      </div>
                    </td>
                    <td>
                      <Badge status={leave.leaveType} className="capitalize">
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {formatDate(leave.startDate)}
                        </p>
                        <p className="text-gray-500">
                          to {formatDate(leave.endDate)}
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                      </p>
                    </td>
                    <td>
                      <p className="text-gray-900 max-w-xs truncate">
                        {leave.reason}
                      </p>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {formatDate(leave.appliedOn)}
                      </p>
                    </td>
                    <td>
                      <Badge status={leave.status}>{leave.status}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {leave.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAction(leave, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(leave, 'reject')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowActionModal(true);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}
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

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedLeave(null);
          setComments('');
        }}
        title={
          selectedLeave?.status === 'pending'
            ? `${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request`
            : 'Leave Request Details'
        }
        size="md"
        footer={
          selectedLeave?.status === 'pending' ? (
            <>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedLeave(null);
                  setComments('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={
                  actionType === 'approve' ? 'btn-success' : 'btn-danger'
                }
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowActionModal(false);
                setSelectedLeave(null);
              }}
              className="btn-secondary"
            >
              Close
            </button>
          )
        }
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Employee Name</label>
                <p className="text-gray-900">{selectedLeave.employeeName}</p>
              </div>
              <div>
                <label className="label">Employee ID</label>
                <p className="text-gray-900">{selectedLeave.employeeId}</p>
              </div>
              <div>
                <label className="label">Leave Type</label>
                <Badge status={selectedLeave.leaveType} className="capitalize">
                  {selectedLeave.leaveType}
                </Badge>
              </div>
              <div>
                <label className="label">Total Days</label>
                <p className="text-gray-900">{selectedLeave.totalDays} days</p>
              </div>
              <div>
                <label className="label">Start Date</label>
                <p className="text-gray-900">
                  {formatDate(selectedLeave.startDate)}
                </p>
              </div>
              <div>
                <label className="label">End Date</label>
                <p className="text-gray-900">
                  {formatDate(selectedLeave.endDate)}
                </p>
              </div>
            </div>

            <div>
              <label className="label">Reason</label>
              <p className="text-gray-900">{selectedLeave.reason}</p>
            </div>

            {selectedLeave.status !== 'pending' && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Reviewed By</label>
                      <p className="text-gray-900">
                        {selectedLeave.reviewedBy}
                      </p>
                    </div>
                    <div>
                      <label className="label">Reviewed On</label>
                      <p className="text-gray-900">
                        {selectedLeave.reviewedOn &&
                          formatDate(selectedLeave.reviewedOn)}
                      </p>
                    </div>
                  </div>
                  {selectedLeave.reviewComments && (
                    <div className="mt-4">
                      <label className="label">Comments</label>
                      <p className="text-gray-900">
                        {selectedLeave.reviewComments}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedLeave.status === 'pending' && (
              <div>
                <label htmlFor="comments" className="label">
                  Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Add any comments or notes..."
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveRequests;
