import { UserRole } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        userId: string;
        employeeId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
