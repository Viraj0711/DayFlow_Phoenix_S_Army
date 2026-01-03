/**
 * Payroll Service
 * Business logic for payroll management with raw SQL
 */

import db from '../db/pool';
import logger from '../utils/logger';
import {
  PayrollRecord,
  PayrollWithEmployee,
  SalaryStructure,
  SalaryCalculationInput,
  SalaryCalculation,
  PaymentStatus,
  UpdatePayrollRequest,
} from '../types/payroll.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKING_DAYS_PER_MONTH = 26; // Standard working days

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get payroll records for an employee
 */
export async function getMyPayroll(
  employeeId: number,
  month?: number,
  year?: number
): Promise<{ records: PayrollRecord[]; total: number }> {
  const conditions: string[] = ['employee_id = $1'];
  const values: any[] = [employeeId];
  let paramCount = 2;

  if (month) {
    conditions.push(`month = $${paramCount}`);
    values.push(month);
    paramCount++;
  }

  if (year) {
    conditions.push(`year = $${paramCount}`);
    values.push(year);
    paramCount++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM payroll_records
    WHERE ${whereClause}
  `;

  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get records
  const dataQuery = `
    SELECT 
      id, employee_id, salary_structure_id, month, year,
      basic_salary, hra, transport_allowance, medical_allowance, special_allowance,
      provident_fund, professional_tax, income_tax, other_deductions,
      days_present, days_absent, days_leave, loss_of_pay_days, loss_of_pay_amount,
      bonus, incentive,
      gross_salary, total_deductions, net_salary,
      payment_status, payment_date, payment_reference,
      generated_by, generated_at
    FROM payroll_records
    WHERE ${whereClause}
    ORDER BY year DESC, month DESC
  `;

  const dataResult = await db.query<PayrollRecord>(dataQuery, values);

  return {
    records: dataResult.rows,
    total,
  };
}

/**
 * Get payroll records (Admin view with employee details)
 */
export async function getPayrollRecords(filters: {
  employeeId?: number;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}): Promise<{ records: PayrollWithEmployee[]; total: number }> {
  const {
    employeeId,
    month,
    year,
    page = 1,
    limit = 50,
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (employeeId) {
    conditions.push(`p.employee_id = $${paramCount}`);
    values.push(employeeId);
    paramCount++;
  }

  if (month) {
    conditions.push(`p.month = $${paramCount}`);
    values.push(month);
    paramCount++;
  }

  if (year) {
    conditions.push(`p.year = $${paramCount}`);
    values.push(year);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM payroll_records p
    INNER JOIN employees e ON p.employee_id = e.id
    ${whereClause}
  `;

  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get paginated records with employee details
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      p.id, p.employee_id, p.salary_structure_id, p.month, p.year,
      p.basic_salary, p.hra, p.transport_allowance, p.medical_allowance, p.special_allowance,
      p.provident_fund, p.professional_tax, p.income_tax, p.other_deductions,
      p.days_present, p.days_absent, p.days_leave, p.loss_of_pay_days, p.loss_of_pay_amount,
      p.bonus, p.incentive,
      p.gross_salary, p.total_deductions, p.net_salary,
      p.payment_status, p.payment_date, p.payment_reference,
      p.generated_by, p.generated_at,
      e.employee_code,
      e.first_name || ' ' || e.last_name as employee_name,
      e.department,
      e.designation
    FROM payroll_records p
    INNER JOIN employees e ON p.employee_id = e.id
    ${whereClause}
    ORDER BY p.year DESC, p.month DESC, e.first_name
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);

  const dataResult = await db.query<PayrollWithEmployee>(dataQuery, values);

  return {
    records: dataResult.rows,
    total,
  };
}

/**
 * Get single payroll record by ID
 */
export async function getPayrollById(
  id: number
): Promise<PayrollRecord | null> {
  const query = `
    SELECT 
      id, employee_id, salary_structure_id, month, year,
      basic_salary, hra, transport_allowance, medical_allowance, special_allowance,
      provident_fund, professional_tax, income_tax, other_deductions,
      days_present, days_absent, days_leave, loss_of_pay_days, loss_of_pay_amount,
      bonus, incentive,
      gross_salary, total_deductions, net_salary,
      payment_status, payment_date, payment_reference,
      generated_by, generated_at
    FROM payroll_records
    WHERE id = $1
  `;

  const result = await db.query<PayrollRecord>(query, [id]);
  return result.rows[0] || null;
}

// ============================================================================
// SALARY CALCULATION
// ============================================================================

/**
 * Calculate salary based on attendance and salary structure
 */
export function calculateSalary(input: SalaryCalculationInput): SalaryCalculation {
  const { salaryStructure, attendanceSummary, bonus = 0, incentive = 0 } = input;

  // Calculate pro-rated salary based on attendance
  const totalPresentDays = attendanceSummary.daysPresent + attendanceSummary.daysLeave;
  const workingDaysRatio = totalPresentDays / WORKING_DAYS_PER_MONTH;

  // Basic salary components (pro-rated)
  const basicSalary = salaryStructure.basic_salary * workingDaysRatio;
  const hra = salaryStructure.hra * workingDaysRatio;
  const transportAllowance = salaryStructure.transport_allowance * workingDaysRatio;
  const medicalAllowance = salaryStructure.medical_allowance * workingDaysRatio;
  const specialAllowance = salaryStructure.special_allowance * workingDaysRatio;

  // Gross salary = Basic + HRA + Allowances + Bonus + Incentive
  const grossSalary =
    basicSalary +
    hra +
    transportAllowance +
    medicalAllowance +
    specialAllowance +
    bonus +
    incentive;

  // Deductions (pro-rated)
  const providentFund = salaryStructure.provident_fund * workingDaysRatio;
  const professionalTax = salaryStructure.professional_tax * workingDaysRatio;
  const incomeTax = salaryStructure.income_tax * workingDaysRatio;

  // Loss of pay calculation
  const lossOfPayDays = attendanceSummary.daysAbsent;
  const lossOfPayAmount =
    (salaryStructure.basic_salary / WORKING_DAYS_PER_MONTH) * lossOfPayDays;

  // Total deductions = PF + PT + IT + LOP
  const totalDeductions =
    providentFund + professionalTax + incomeTax + lossOfPayAmount;

  // Net salary = Gross - Deductions
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary: Math.round(basicSalary * 100) / 100,
    hra: Math.round(hra * 100) / 100,
    transportAllowance: Math.round(transportAllowance * 100) / 100,
    medicalAllowance: Math.round(medicalAllowance * 100) / 100,
    specialAllowance: Math.round(specialAllowance * 100) / 100,
    grossSalary: Math.round(grossSalary * 100) / 100,
    providentFund: Math.round(providentFund * 100) / 100,
    professionalTax: Math.round(professionalTax * 100) / 100,
    incomeTax: Math.round(incomeTax * 100) / 100,
    otherDeductions: 0,
    lossOfPayAmount: Math.round(lossOfPayAmount * 100) / 100,
    bonus,
    incentive,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

// ============================================================================
// GENERATE PAYROLL
// ============================================================================

/**
 * Generate payroll for an employee for a specific month
 */
export async function generatePayroll(input: {
  employeeId: number;
  month: number;
  year: number;
  bonus?: number;
  incentive?: number;
}): Promise<PayrollRecord> {
  const { employeeId, month, year, bonus = 0, incentive = 0 } = input;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Get salary structure
    const salaryStructureQuery = `
      SELECT 
        id, employee_id, basic_salary, hra, transport_allowance, 
        medical_allowance, special_allowance, provident_fund, 
        professional_tax, income_tax, effective_from, effective_to,
        created_at, updated_at
      FROM salary_structures
      WHERE employee_id = $1
        AND effective_from <= make_date($2, $3, 1)
        AND (effective_to IS NULL OR effective_to >= make_date($2, $3, 1))
      ORDER BY effective_from DESC
      LIMIT 1
    `;

    const salaryResult = await client.query<SalaryStructure>(
      salaryStructureQuery,
      [employeeId, year, month]
    );

    if (!salaryResult.rows[0]) {
      throw new Error('No salary structure found for employee');
    }

    const salaryStructure = salaryResult.rows[0];

    // 2. Get attendance summary
    const attendanceQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('PRESENT', 'WORK_FROM_HOME', 'ON_DUTY'))::int as days_present,
        COUNT(*) FILTER (WHERE status = 'ABSENT')::int as days_absent,
        COUNT(*) FILTER (WHERE status = 'LEAVE')::int as days_leave
      FROM attendance_records
      WHERE employee_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
    `;

    const attendanceResult = await client.query<{
      days_present: number;
      days_absent: number;
      days_leave: number;
    }>(attendanceQuery, [employeeId, month, year]);

    const attendanceSummary = attendanceResult.rows[0] || {
      days_present: 0,
      days_absent: 0,
      days_leave: 0,
    };

    // 3. Calculate salary
    const calculation = calculateSalary({
      employeeId,
      month,
      year,
      salaryStructure,
      attendanceSummary: {
        daysPresent: attendanceSummary.days_present,
        daysAbsent: attendanceSummary.days_absent,
        daysLeave: attendanceSummary.days_leave,
      },
      bonus,
      incentive,
    });

    // 4. Insert or update payroll record
    const upsertQuery = `
      INSERT INTO payroll_records (
        employee_id, salary_structure_id, month, year,
        basic_salary, hra, transport_allowance, medical_allowance, special_allowance,
        provident_fund, professional_tax, income_tax, other_deductions,
        days_present, days_absent, days_leave, loss_of_pay_days, loss_of_pay_amount,
        bonus, incentive,
        gross_salary, total_deductions, net_salary,
        payment_status, generated_at
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20,
        $21, $22, $23,
        $24, NOW()
      )
      ON CONFLICT (employee_id, month, year)
      DO UPDATE SET
        basic_salary = EXCLUDED.basic_salary,
        hra = EXCLUDED.hra,
        transport_allowance = EXCLUDED.transport_allowance,
        medical_allowance = EXCLUDED.medical_allowance,
        special_allowance = EXCLUDED.special_allowance,
        provident_fund = EXCLUDED.provident_fund,
        professional_tax = EXCLUDED.professional_tax,
        income_tax = EXCLUDED.income_tax,
        days_present = EXCLUDED.days_present,
        days_absent = EXCLUDED.days_absent,
        days_leave = EXCLUDED.days_leave,
        loss_of_pay_days = EXCLUDED.loss_of_pay_days,
        loss_of_pay_amount = EXCLUDED.loss_of_pay_amount,
        gross_salary = EXCLUDED.gross_salary,
        total_deductions = EXCLUDED.total_deductions,
        net_salary = EXCLUDED.net_salary,
        generated_by = EXCLUDED.generated_by,
        generated_at = NOW()
      RETURNING *
    `;

    const upsertResult = await client.query<PayrollRecord>(upsertQuery, [
      employeeId,
      salaryStructure.id,
      month,
      year,
      calculation.basicSalary,
      calculation.hra,
      calculation.transportAllowance,
      calculation.medicalAllowance,
      calculation.specialAllowance,
      calculation.providentFund,
      calculation.professionalTax,
      calculation.incomeTax,
      calculation.otherDeductions,
      attendanceSummary.days_present,
      attendanceSummary.days_absent,
      attendanceSummary.days_leave,
      attendanceSummary.days_absent,
      calculation.lossOfPayAmount,
      calculation.bonus,
      calculation.incentive,
      calculation.grossSalary,
      calculation.totalDeductions,
      calculation.netSalary,
      PaymentStatus.PENDING,
    ]);

    if (!upsertResult.rows[0]) {
      throw new Error('Failed to generate payroll');
    }

    await client.query('COMMIT');

    logger.info('Payroll generated', {
      employeeId,
      month,
      year,
      netSalary: calculation.netSalary,
    });

    return upsertResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Generate payroll error', { employeeId, month, year, error });
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// UPDATE PAYROLL
// ============================================================================

/**
 * Update payroll record (Admin only)
 */
export async function updatePayroll(input: {
  employeeId: number;
  month: number;
  year: number;
  updates: UpdatePayrollRequest;
}): Promise<PayrollRecord | null> {
  const { employeeId, month, year, updates } = input;
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.basicSalary !== undefined) {
    fields.push(`basic_salary = $${paramCount++}`);
    values.push(updates.basicSalary);
  }

  if (updates.hra !== undefined) {
    fields.push(`hra = $${paramCount++}`);
    values.push(updates.hra);
  }

  if (updates.transportAllowance !== undefined) {
    fields.push(`transport_allowance = $${paramCount++}`);
    values.push(updates.transportAllowance);
  }

  if (updates.medicalAllowance !== undefined) {
    fields.push(`medical_allowance = $${paramCount++}`);
    values.push(updates.medicalAllowance);
  }

  if (updates.specialAllowance !== undefined) {
    fields.push(`special_allowance = $${paramCount++}`);
    values.push(updates.specialAllowance);
  }

  if (updates.providentFund !== undefined) {
    fields.push(`provident_fund = $${paramCount++}`);
    values.push(updates.providentFund);
  }

  if (updates.professionalTax !== undefined) {
    fields.push(`professional_tax = $${paramCount++}`);
    values.push(updates.professionalTax);
  }

  if (updates.incomeTax !== undefined) {
    fields.push(`income_tax = $${paramCount++}`);
    values.push(updates.incomeTax);
  }

  if (updates.otherDeductions !== undefined) {
    fields.push(`other_deductions = $${paramCount++}`);
    values.push(updates.otherDeductions);
  }

  if (updates.bonus !== undefined) {
    fields.push(`bonus = $${paramCount++}`);
    values.push(updates.bonus);
  }

  if (updates.incentive !== undefined) {
    fields.push(`incentive = $${paramCount++}`);
    values.push(updates.incentive);
  }

  if (updates.paymentStatus !== undefined) {
    fields.push(`payment_status = $${paramCount++}`);
    values.push(updates.paymentStatus);
  }

  if (updates.paymentDate !== undefined) {
    fields.push(`payment_date = $${paramCount++}`);
    values.push(updates.paymentDate);
  }

  if (updates.paymentReference !== undefined) {
    fields.push(`payment_reference = $${paramCount++}`);
    values.push(updates.paymentReference);
  }

  if (fields.length === 0) {
    // No updates provided, return current record
    const result = await getPayrollRecords({ employeeId, limit: 1 });
    return result.records[0] || null;
  }

  // Recalculate totals
  fields.push(`
    gross_salary = basic_salary + hra + transport_allowance + medical_allowance + special_allowance + bonus + incentive
  `);
  fields.push(`
    total_deductions = provident_fund + professional_tax + income_tax + other_deductions + loss_of_pay_amount
  `);
  fields.push(`
    net_salary = gross_salary - total_deductions
  `);

  values.push(employeeId, month, year);

  const query = `
    UPDATE payroll_records
    SET ${fields.join(', ')}
    WHERE employee_id = $${paramCount} AND month = $${paramCount + 1} AND year = $${paramCount + 2}
    RETURNING *
  `;

  const result = await db.query<PayrollRecord>(query, values);
  return result.rows[0] || null;
}
