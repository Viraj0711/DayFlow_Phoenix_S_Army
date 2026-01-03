import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../services/employee.service';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthRequest } from '../middlewares/auth';
import {
  CreateEmployeeRequestDTO,
  UpdateEmployeeSelfRequestDTO,
  UpdateEmployeeAdminRequestDTO,
  EmployeeListFilters,
} from '../types/employee.types';

/**
 * GET /employees/me
 * Get authenticated employee's own profile
 */
export async function getMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const profile = await employeeService.getMyProfile(req.user.id);
    ResponseHandler.success(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /employees/me
 * Update authenticated employee's own profile (limited fields)
 */
export async function updateMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const updates: UpdateEmployeeSelfRequestDTO = req.body;
    const profile = await employeeService.updateMyProfile(req.user.id, updates);
    
    ResponseHandler.success(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employees
 * List all employees with pagination (Admin/HR only)
 */
export async function listEmployees(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: EmployeeListFilters = {
      department: req.query.department as string,
      designation: req.query.designation as string,
      employment_status: req.query.employment_status as any,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await employeeService.listEmployees(filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employees/:id
 * Get specific employee by ID (Admin/HR only)
 */
export async function getEmployeeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const profile = await employeeService.getEmployeeById(id);
    
    ResponseHandler.success(res, profile, 'Employee retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employees
 * Create new employee (Admin/HR only)
 */
export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data: CreateEmployeeRequestDTO = req.body;
    const profile = await employeeService.createEmployee(data);
    
    ResponseHandler.created(res, profile, 'Employee created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /employees/:id
 * Update employee by ID (Admin/HR only - full update)
 */
export async function updateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates: UpdateEmployeeAdminRequestDTO = req.body;
    
    const profile = await employeeService.updateEmployee(id, updates);
    
    ResponseHandler.success(res, profile, 'Employee updated successfully');
  } catch (error) {
    next(error);
  }
}
