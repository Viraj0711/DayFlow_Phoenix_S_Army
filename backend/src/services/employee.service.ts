import { transaction } from '../db';
import * as userRepo from '../repositories/userRepository';
import * as employeeRepo from '../repositories/employeeRepository';
import * as employeeProfileRepo from '../repositories/employeeProfileRepository';
import { PasswordUtils } from '../utils/passwordUtils';
import { AppError } from '../middlewares/errorHandler';
import {
  EmployeeProfileDTO,
  EmployeeListItemDTO,
  CreateEmployeeRequestDTO,
  UpdateEmployeeSelfRequestDTO,
  UpdateEmployeeAdminRequestDTO,
  EmployeeListFilters,
  PaginatedEmployeeResponse,
} from '../types/employee.types';
import { UserRole, EmploymentStatus } from '../types';

/**
 * Map database row to DTO
 */
function mapToEmployeeProfileDTO(
  row: employeeProfileRepo.EmployeeProfileRow
): EmployeeProfileDTO {
  return {
    id: row.id,
    employee_code: row.employee_code,
    
    personal: {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      date_of_birth: row.date_of_birth.toISOString().split('T')[0],
      gender: row.gender,
      profile_picture: row.profile_picture,
    },
    
    address: {
      street: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postal_code: row.postal_code,
    },
    
    job: {
      department: row.department,
      designation: row.designation,
      hire_date: row.hire_date.toISOString().split('T')[0],
      employment_status: row.employment_status,
      manager_id: row.manager_id,
      manager_name: row.manager_first_name && row.manager_last_name
        ? `${row.manager_first_name} ${row.manager_last_name}`
        : null,
    },
    
    salary: {
      basic_salary: row.basic_salary,
      currency: 'INR', // Can be configured
    },
    
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

/**
 * Get employee's own profile
 */
export async function getMyProfile(userId: string): Promise<EmployeeProfileDTO> {
  const profile = await employeeProfileRepo.getEmployeeProfileByUserId(userId);
  
  if (!profile) {
    throw new AppError('Employee profile not found', 404);
  }
  
  return mapToEmployeeProfileDTO(profile);
}

/**
 * Update employee's own profile (limited fields)
 */
export async function updateMyProfile(
  userId: string,
  updates: UpdateEmployeeSelfRequestDTO
): Promise<EmployeeProfileDTO> {
  // Get employee by user ID
  const employee = await employeeRepo.findEmployeeByUserId(userId);
  
  if (!employee) {
    throw new AppError('Employee profile not found', 404);
  }
  
  // Update with limited fields
  const updated = await employeeProfileRepo.updateEmployeeSelfFields(
    employee.id,
    updates
  );
  
  if (!updated) {
    throw new AppError('Failed to update profile', 500);
  }
  
  return mapToEmployeeProfileDTO(updated);
}

/**
 * Get employee by ID (Admin/HR)
 */
export async function getEmployeeById(
  employeeId: string
): Promise<EmployeeProfileDTO> {
  const profile = await employeeProfileRepo.getEmployeeProfileById(employeeId);
  
  if (!profile) {
    throw new AppError('Employee not found', 404);
  }
  
  return mapToEmployeeProfileDTO(profile);
}

/**
 * List all employees with pagination (Admin/HR)
 */
export async function listEmployees(
  filters: EmployeeListFilters
): Promise<PaginatedEmployeeResponse> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  
  const [employees, total] = await Promise.all([
    employeeProfileRepo.listEmployeesWithDetails(filters),
    employeeProfileRepo.countEmployeesWithFilters(filters),
  ]);
  
  return {
    data: employees.map(emp => ({
      ...emp,
      hire_date: new Date(emp.hire_date).toISOString().split('T')[0],
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Create new employee with user account (Admin/HR)
 * Uses transaction to ensure both user and employee are created atomically
 */
export async function createEmployee(
  data: CreateEmployeeRequestDTO
): Promise<EmployeeProfileDTO> {
  // Check if user already exists
  const existingUser = await userRepo.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }
  
  // Check if employee code already exists
  const existingEmployee = await employeeRepo.findEmployeeByCode(data.employee_code);
  if (existingEmployee) {
    throw new AppError('Employee code already exists', 400);
  }
  
  // Validate manager exists if provided
  if (data.manager_id) {
    const manager = await employeeRepo.findEmployeeById(data.manager_id);
    if (!manager) {
      throw new AppError('Manager not found', 404);
    }
  }
  
  // Hash password
  const hashedPassword = await PasswordUtils.hash(data.password);
  
  // Create user and employee in a transaction
  const result = await transaction(async () => {
    // 1. Create user
    const user = await userRepo.createUser({
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });
    
    // 2. Create employee linked to user
    const employee = await employeeRepo.createEmployee({
      user_id: user.id,
      employee_code: data.employee_code,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      date_of_birth: new Date(data.date_of_birth),
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      department: data.department,
      designation: data.designation,
      hire_date: new Date(data.hire_date),
      employment_status: data.employment_status,
      manager_id: data.manager_id || null,
    });
    
    return employee;
  });
  
  // Fetch full profile with joins
  const profile = await employeeProfileRepo.getEmployeeProfileById(result.id);
  
  if (!profile) {
    throw new AppError('Failed to retrieve created employee', 500);
  }
  
  return mapToEmployeeProfileDTO(profile);
}

/**
 * Update employee by ID (Admin/HR - full update)
 */
export async function updateEmployee(
  employeeId: string,
  updates: UpdateEmployeeAdminRequestDTO
): Promise<EmployeeProfileDTO> {
  const employee = await employeeRepo.findEmployeeById(employeeId);
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  
  // Validate manager if being updated
  if (updates.manager_id) {
    const manager = await employeeRepo.findEmployeeById(updates.manager_id);
    if (!manager) {
      throw new AppError('Manager not found', 404);
    }
    
    // Prevent self-referencing
    if (updates.manager_id === employeeId) {
      throw new AppError('Employee cannot be their own manager', 400);
    }
  }
  
  await transaction(async () => {
    // Update user fields if provided
    if (updates.email || updates.role) {
      await userRepo.updateUser(employee.user_id, {
        email: updates.email,
        role: updates.role,
      });
    }
    
    // Update employee fields
    const employeeUpdates: any = {};
    
    if (updates.first_name !== undefined) employeeUpdates.first_name = updates.first_name;
    if (updates.last_name !== undefined) employeeUpdates.last_name = updates.last_name;
    if (updates.phone !== undefined) employeeUpdates.phone = updates.phone;
    if (updates.date_of_birth !== undefined) {
      employeeUpdates.date_of_birth = new Date(updates.date_of_birth);
    }
    if (updates.gender !== undefined) employeeUpdates.gender = updates.gender;
    if (updates.profile_picture !== undefined) {
      employeeUpdates.profile_picture = updates.profile_picture;
    }
    if (updates.address !== undefined) employeeUpdates.address = updates.address;
    if (updates.city !== undefined) employeeUpdates.city = updates.city;
    if (updates.state !== undefined) employeeUpdates.state = updates.state;
    if (updates.country !== undefined) employeeUpdates.country = updates.country;
    if (updates.postal_code !== undefined) employeeUpdates.postal_code = updates.postal_code;
    if (updates.department !== undefined) employeeUpdates.department = updates.department;
    if (updates.designation !== undefined) employeeUpdates.designation = updates.designation;
    if (updates.employment_status !== undefined) {
      employeeUpdates.employment_status = updates.employment_status;
    }
    if (updates.manager_id !== undefined) employeeUpdates.manager_id = updates.manager_id;
    
    if (Object.keys(employeeUpdates).length > 0) {
      await employeeRepo.updateEmployee(employeeId, employeeUpdates);
    }
  });
  
  // Fetch updated profile
  const profile = await employeeProfileRepo.getEmployeeProfileById(employeeId);
  
  if (!profile) {
    throw new AppError('Failed to retrieve updated employee', 500);
  }
  
  return mapToEmployeeProfileDTO(profile);
}
