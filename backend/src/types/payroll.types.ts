/**
 * Payroll Module Type Definitions
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// DATABASE ROW INTERFACES
// ============================================================================

/**
 * Payroll record from database
 */
export interface PayrollRecord {
  id: number;
  employee_id: number;
  salary_structure_id: number | null;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  provident_fund: number;
  professional_tax: number;
  income_tax: number;
  other_deductions: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  loss_of_pay_days: number;
  loss_of_pay_amount: number;
  bonus: number;
  incentive: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  payment_status: PaymentStatus;
  payment_date: Date | null;
  payment_reference: string | null;
  generated_by: number | null;
  generated_at: Date;
}

/**
 * Payroll with employee details
 */
export interface PayrollWithEmployee extends PayrollRecord {
  employee_code: string;
  employee_name: string;
  department: string;
  designation: string;
}

/**
 * Salary structure from database
 */
export interface SalaryStructure {
  id: number;
  employee_id: number;
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  provident_fund: number;
  professional_tax: number;
  income_tax: number;
  effective_from: Date;
  effective_to: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Query parameters for payroll
 */
export interface PayrollQueryParams {
  employeeId?: string;
  month?: string;
  year?: string;
}

/**
 * Update payroll request
 */
export interface UpdatePayrollRequest {
  basicSalary?: number;
  hra?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  providentFund?: number;
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: number;
  bonus?: number;
  incentive?: number;
  paymentStatus?: PaymentStatus;
  paymentDate?: string;
  paymentReference?: string;
}

/**
 * Generate payroll request
 */
export interface GeneratePayrollRequest {
  employeeId: number;
  month: number;
  year: number;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Payroll response
 */
export interface PayrollResponse {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  period: string; // "January 2026"
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  daysPresent: number;
  daysAbsent: number;
  daysLeave: number;
  lossOfPayDays: number;
  lossOfPayAmount: number;
  bonus: number;
  incentive: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  paymentReference: string | null;
  generatedAt: string;
}

/**
 * Payroll with employee info
 */
export interface PayrollWithEmployeeResponse extends PayrollResponse {
  employee: {
    id: number;
    code: string;
    name: string;
    department: string;
    designation: string;
  };
}

/**
 * Payroll list response
 */
export interface PayrollListResponse {
  success: boolean;
  message: string;
  data: {
    records: PayrollResponse[] | PayrollWithEmployeeResponse[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Single payroll response
 */
export interface SinglePayrollResponse {
  success: boolean;
  message: string;
  data: PayrollResponse | PayrollWithEmployeeResponse;
}

// ============================================================================
// SERVICE LAYER TYPES
// ============================================================================

/**
 * Salary calculation input
 */
export interface SalaryCalculationInput {
  employeeId: number;
  month: number;
  year: number;
  salaryStructure: SalaryStructure;
  attendanceSummary: {
    daysPresent: number;
    daysAbsent: number;
    daysLeave: number;
  };
  bonus?: number;
  incentive?: number;
}

/**
 * Salary calculation result
 */
export interface SalaryCalculation {
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  lossOfPayAmount: number;
  bonus: number;
  incentive: number;
  totalDeductions: number;
  netSalary: number;
}
