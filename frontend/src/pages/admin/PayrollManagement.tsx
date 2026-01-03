import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { PayrollRecord, SalaryStructure } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { DollarSign, Download, Edit, Eye, Calendar } from 'lucide-react';

const PayrollManagement: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PayrollRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryStructure | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  useEffect(() => {
    filterRecordsList();
  }, [searchQuery, payrollRecords]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRecords: PayrollRecord[] = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          month: selectedMonth.split('-')[1],
          year: parseInt(selectedMonth.split('-')[0]),
          salaryStructure: {
            basicSalary: 50000,
            houseRentAllowance: 15000,
            medicalAllowance: 5000,
            transportAllowance: 3000,
            otherAllowances: 2000,
            providentFund: 6000,
            professionalTax: 200,
            incomeTax: 8000,
            otherDeductions: 0,
          },
          grossSalary: 75000,
          totalDeductions: 14200,
          netSalary: 60800,
          paymentStatus: 'paid',
          paymentDate: '2026-01-01',
          workingDays: 22,
          presentDays: 22,
          leaves: 0,
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'Michael Chen',
          month: selectedMonth.split('-')[1],
          year: parseInt(selectedMonth.split('-')[0]),
          salaryStructure: {
            basicSalary: 45000,
            houseRentAllowance: 13500,
            medicalAllowance: 4500,
            transportAllowance: 2500,
            otherAllowances: 1500,
            providentFund: 5400,
            professionalTax: 200,
            incomeTax: 6500,
            otherDeductions: 0,
          },
          grossSalary: 67000,
          totalDeductions: 12100,
          netSalary: 54900,
          paymentStatus: 'processing',
          workingDays: 22,
          presentDays: 20,
          leaves: 2,
        },
        {
          id: '3',
          employeeId: 'EMP003',
          employeeName: 'Priya Sharma',
          month: selectedMonth.split('-')[1],
          year: parseInt(selectedMonth.split('-')[0]),
          salaryStructure: {
            basicSalary: 40000,
            houseRentAllowance: 12000,
            medicalAllowance: 4000,
            transportAllowance: 2000,
            otherAllowances: 1000,
            providentFund: 4800,
            professionalTax: 200,
            incomeTax: 5500,
            otherDeductions: 0,
          },
          grossSalary: 59000,
          totalDeductions: 10500,
          netSalary: 48500,
          paymentStatus: 'pending',
          workingDays: 22,
          presentDays: 19,
          leaves: 3,
        },
      ];

      setPayrollRecords(mockRecords);
      setFilteredRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecordsList = () => {
    let filtered = payrollRecords;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.employeeName.toLowerCase().includes(query) ||
          record.employeeId.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleEditSalary = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setEditingSalary({ ...record.salaryStructure });
    setShowEditModal(true);
  };

  const handleSaveSalary = async () => {
    if (!selectedRecord || !editingSalary) return;

    try {
      // Calculate new totals
      const grossSalary =
        editingSalary.basicSalary +
        editingSalary.houseRentAllowance +
        editingSalary.medicalAllowance +
        editingSalary.transportAllowance +
        editingSalary.otherAllowances;

      const totalDeductions =
        editingSalary.providentFund +
        editingSalary.professionalTax +
        editingSalary.incomeTax +
        editingSalary.otherDeductions;

      const netSalary = grossSalary - totalDeductions;

      // Update the record
      const updatedRecord = {
        ...selectedRecord,
        salaryStructure: editingSalary,
        grossSalary,
        totalDeductions,
        netSalary,
      };

      setPayrollRecords((prev) =>
        prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r))
      );

      setShowEditModal(false);
      setSelectedRecord(null);
      setEditingSalary(null);
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const totalGrossSalary = filteredRecords.reduce(
    (sum, record) => sum + record.grossSalary,
    0
  );
  const totalNetSalary = filteredRecords.reduce(
    (sum, record) => sum + record.netSalary,
    0
  );
  const totalDeductions = filteredRecords.reduce(
    (sum, record) => sum + record.totalDeductions,
    0
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee salaries and payroll processing
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Month Selector & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card">
          <label className="label">Select Month</label>
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
              max={new Date().toISOString().slice(0, 7)}
            />
          </div>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Gross Salary</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalGrossSalary)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Deductions</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatCurrency(totalDeductions)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Net Salary</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(totalNetSalary)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Payout</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by employee name or ID..."
        />
      </div>

      {/* Payroll Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Working Days</th>
                <th>Present</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.employeeName}
                        </p>
                        <p className="text-sm text-gray-500">{record.employeeId}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-gray-900 font-medium">
                        {formatCurrency(record.grossSalary)}
                      </p>
                    </td>
                    <td>
                      <p className="text-red-600 font-medium">
                        {formatCurrency(record.totalDeductions)}
                      </p>
                    </td>
                    <td>
                      <p className="text-green-600 font-bold">
                        {formatCurrency(record.netSalary)}
                      </p>
                    </td>
                    <td>
                      <p className="text-gray-900">{record.workingDays}</p>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {record.presentDays}
                        {record.leaves > 0 && (
                          <span className="text-xs text-gray-500">
                            {' '}
                            ({record.leaves}L)
                          </span>
                        )}
                      </p>
                    </td>
                    <td>
                      <Badge status={record.paymentStatus}>
                        {record.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditSalary(record)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Salary"
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        title="Payroll Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Employee Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee Name</label>
                  <p className="text-gray-900">{selectedRecord.employeeName}</p>
                </div>
                <div>
                  <label className="label">Employee ID</label>
                  <p className="text-gray-900">{selectedRecord.employeeId}</p>
                </div>
                <div>
                  <label className="label">Month/Year</label>
                  <p className="text-gray-900">
                    {selectedRecord.month}/{selectedRecord.year}
                  </p>
                </div>
                <div>
                  <label className="label">Payment Status</label>
                  <Badge status={selectedRecord.paymentStatus}>
                    {selectedRecord.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Earnings
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedRecord.salaryStructure.basicSalary)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">House Rent Allowance</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.houseRentAllowance
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Allowance</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.medicalAllowance
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport Allowance</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.transportAllowance
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Allowances</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.otherAllowances
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">
                    Gross Salary
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(selectedRecord.grossSalary)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Deductions
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provident Fund</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedRecord.salaryStructure.providentFund)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.professionalTax
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Income Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedRecord.salaryStructure.incomeTax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Deductions</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedRecord.salaryStructure.otherDeductions
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">
                    Total Deductions
                  </span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(selectedRecord.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Net Salary
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(selectedRecord.netSalary)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Salary Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
          setEditingSalary(null);
        }}
        title="Edit Salary Structure"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedRecord(null);
                setEditingSalary(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSaveSalary} className="btn-primary">
              Save Changes
            </button>
          </>
        }
      >
        {editingSalary && (
          <div className="space-y-6">
            {/* Earnings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Basic Salary</label>
                  <input
                    type="number"
                    value={editingSalary.basicSalary}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        basicSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">House Rent Allowance</label>
                  <input
                    type="number"
                    value={editingSalary.houseRentAllowance}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        houseRentAllowance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Medical Allowance</label>
                  <input
                    type="number"
                    value={editingSalary.medicalAllowance}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        medicalAllowance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Transport Allowance</label>
                  <input
                    type="number"
                    value={editingSalary.transportAllowance}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        transportAllowance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Other Allowances</label>
                  <input
                    type="number"
                    value={editingSalary.otherAllowances}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        otherAllowances: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Deductions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Provident Fund</label>
                  <input
                    type="number"
                    value={editingSalary.providentFund}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        providentFund: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Professional Tax</label>
                  <input
                    type="number"
                    value={editingSalary.professionalTax}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        professionalTax: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Income Tax</label>
                  <input
                    type="number"
                    value={editingSalary.incomeTax}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        incomeTax: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Other Deductions</label>
                  <input
                    type="number"
                    value={editingSalary.otherDeductions}
                    onChange={(e) =>
                      setEditingSalary({
                        ...editingSalary,
                        otherDeductions: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayrollManagement;
