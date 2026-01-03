import { z } from 'zod';
import { UserRole, EmploymentStatus } from '../types';

/**
 * Schema for updating employee's own profile (limited fields)
 */
export const updateEmployeeSelfSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(1).max(500).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    postal_code: z.string().min(1).max(20).optional(),
    profile_picture: z.string().url().nullable().optional(),
  }),
});

/**
 * Schema for creating new employee
 */
export const createEmployeeSchema = z.object({
  body: z.object({
    // User credentials
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(UserRole),
    
    // Personal details
    employee_code: z.string().min(1).max(50),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    phone: z.string().min(10).max(15),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.enum(['Male', 'Female', 'Other']),
    profile_picture: z.string().url().nullable().optional(),
    
    // Address
    address: z.string().min(1).max(500),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(20),
    
    // Job details
    department: z.string().min(1).max(100),
    designation: z.string().min(1).max(100),
    hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    employment_status: z.nativeEnum(EmploymentStatus),
    manager_id: z.string().uuid().nullable().optional(),
    
    // Salary (optional)
    basic_salary: z.number().positive().optional(),
  }),
});

/**
 * Schema for admin/HR updating employee (all fields)
 */
export const updateEmployeeAdminSchema = z.object({
  body: z.object({
    // Personal details
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(10).max(15).optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    profile_picture: z.string().url().nullable().optional(),
    
    // Address
    address: z.string().min(1).max(500).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    postal_code: z.string().min(1).max(20).optional(),
    
    // Job details
    department: z.string().min(1).max(100).optional(),
    designation: z.string().min(1).max(100).optional(),
    employment_status: z.nativeEnum(EmploymentStatus).optional(),
    manager_id: z.string().uuid().nullable().optional(),
    
    // User fields
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
});
