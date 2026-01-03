// User & Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'admin' | 'hr';
  profilePicture?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  dateOfJoining?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Employee Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  dateOfJoining: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePicture?: string;
  status: 'active' | 'inactive' | 'on-leave';
  employmentType: 'full-time' | 'part-time' | 'contract';
  manager?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    url: string;
  }[];
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  remarks?: string;
}

export interface AttendanceOverview {
  totalEmployees: number;
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  date: string;
}

// Leave Types
export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'casual' | 'maternity' | 'paternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
  reviewComments?: string;
}

export interface LeaveBalance {
  employeeId: string;
  paid: number;
  sick: number;
  unpaid: number;
  casual: number;
  total: number;
}

// Payroll Types
export interface SalaryStructure {
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  salaryStructure: SalaryStructure;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'pending' | 'paid' | 'processing';
  paymentDate?: string;
  workingDays: number;
  presentDays: number;
  leaves: number;
}

// Reports Types
export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  attendancePercentage: number;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  month: string;
  year: number;
  salaryStructure: SalaryStructure;
  grossSalary: number;
  netSalary: number;
  generatedOn: string;
  pdfUrl?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  todayAttendance: {
    present: number;
    absent: number;
    notMarked: number;
  };
  monthlyStats: {
    newJoinees: number;
    resignations: number;
    averageAttendance: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
