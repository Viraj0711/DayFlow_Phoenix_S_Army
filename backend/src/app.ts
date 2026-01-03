import express, { Application, Request, Response, NextFunction } from 'express';
import config from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { setupSecurity, sanitizeRequestData } from './middlewares/security';
import { apiLimiter } from './middlewares/rateLimiter';

// Import routes
import employeeRoutes from './routes/employee.routes';
import leaveRoutes from './routes/leave.routes';
import authRoutes from './routes/auth.routes';
// import attendanceRoutes from './routes/attendance.routes';
// import payrollRoutes from './routes/payroll.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware (helmet + CORS)
    setupSecurity(this.app);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Input sanitization
    this.app.use(sanitizeRequestData);

    // HTTP request logger
    if (config.isDevelopment) {
      const morgan = require('morgan');
      this.app.use(morgan('dev'));
    } else {
      const morgan = require('morgan');
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
      );
    }

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const { v4: uuidv4 } = require('uuid');
      (req as any).id = uuidv4();
      res.setHeader('X-Request-Id', (req as any).id);
      next();
    });

    // General API rate limiting
    this.app.use('/api/', apiLimiter);
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      });
    });

    // API version info
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'DayFlow HRMS API',
        version: '1.0.0',
        documentation: '/api/docs',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/leave-requests', leaveRoutes);
    // this.app.use('/api/attendance', attendanceRoutes);
    // this.app.use('/api/payroll', payrollRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;
