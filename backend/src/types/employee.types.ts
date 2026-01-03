import { UserRole, EmploymentStatus } from './index';

/**
 * Employee profile response DTO (for /employees/me and /employees/:id)
 */
export interface EmployeeProfileDTO {
  id: string;
  employee_code: string;
  
  // Personal details
  personal: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    profile_picture: string | null;
  };
  
  // Address details
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  
  // Job details
  job: {
    department: string;
    designation: string;
    hire_date: string;
    employment_status: EmploymentStatus;
    manager_id: string | null;
    manager_name: string | null;
  };
  
  // Basic salary info (more detailed in payroll)
  salary: {
    basic_salary: number | null;
    currency: string;
  };
  
  created_at: string;
  updated_at: string;
}

/**
 * Employee list item DTO (for /employees list)
 */
export interface EmployeeListItemDTO {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employment_status: EmploymentStatus;
  hire_date: string;
  profile_picture: string | null;
}

/**
 * Create employee request DTO
 */
export interface CreateEmployeeRequestDTO {
  // User credentials
  email: string;
  password: string;
  role: UserRole;
  
  // Personal details
  employee_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string; // ISO date string
  gender: 'Male' | 'Female' | 'Other';
  profile_picture?: string | null;
  
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  
  // Job details
  department: string;
  designation: string;
  hire_date: string; // ISO date string
  employment_status: EmploymentStatus;
  manager_id?: string | null;
  
  // Salary (optional, can be set later)
  basic_salary?: number;
}

/**
 * Update employee (by employee) - limited fields
 */
export interface UpdateEmployeeSelfRequestDTO {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  profile_picture?: string | null;
}

/**
 * Update employee (by admin/HR) - all fields
 */
export interface UpdateEmployeeAdminRequestDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  profile_picture?: string | null;
  
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  
  department?: string;
  designation?: string;
  employment_status?: EmploymentStatus;
  manager_id?: string | null;
  
  // Can also update email and role
  email?: string;
  role?: UserRole;
}

/**
 * Query filters for listing employees
 */
export interface EmployeeListFilters {
  department?: string;
  designation?: string;
  employment_status?: EmploymentStatus;
  search?: string; // Search by name or email
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedEmployeeResponse {
  data: EmployeeListItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
