/**
 * Payroll Controller
 * HTTP request handlers for payroll endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as payrollService from '../services/payroll.service';
import logger from '../utils/logger';

/**
 * GET /api/payroll/me
 * Get payroll records for logged-in employee
 */
export async function getMyPayroll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = parseInt(req.user!.employeeId);
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const records = await payrollService.getMyPayroll(employeeId, month, year);

    res.json({
      success: true,
      data: records,
      message: 'Payroll records fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching my payroll:', error);
    next(error);
  }
}

/**
 * GET /api/payroll
 * Get payroll records (admin/HR only)
 */
export async function getPayrollRecords(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const result = await payrollService.getPayrollRecords({
      employeeId,
      month,
      year,
    });

    res.json({
      success: true,
      data: result.records,
      count: result.total,
      message: 'Payroll records fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching payroll records:', error);
    next(error);
  }
}

/**
 * POST /api/payroll/generate
 * Generate payroll for an employee (admin/HR only)
 */
export async function generatePayroll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { employeeId, month, year, bonus = 0, incentive = 0 } = req.body;

    if (!employeeId || !month || !year) {
      res.status(400).json({
        success: false,
        message: 'Employee ID, month, and year are required',
      });
      return;
    }

    const record = await payrollService.generatePayroll({
      employeeId: parseInt(employeeId),
      month: parseInt(month),
      year: parseInt(year),
      bonus: parseFloat(bonus.toString()),
      incentive: parseFloat(incentive.toString()),
    });

    res.status(201).json({
      success: true,
      data: record,
      message: 'Payroll generated successfully',
    });
  } catch (error) {
    logger.error('Error generating payroll:', error);
    next(error);
  }
}

/**
 * PATCH /api/payroll/:employeeId
 * Update payroll record (admin/HR only)
 */
export async function updatePayroll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = req.params.employeeId ? parseInt(req.params.employeeId) : 0;
    const { month, year } = req.query;

    if (!month || !year) {
      res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
      return;
    }

    const updates = req.body;

    const record = await payrollService.updatePayroll({
      employeeId,
      month: parseInt(month as string),
      year: parseInt(year as string),
      updates,
    });

    res.json({
      success: true,
      data: record,
      message: 'Payroll updated successfully',
    });
  } catch (error) {
    logger.error('Error updating payroll:', error);
    next(error);
  }
}
