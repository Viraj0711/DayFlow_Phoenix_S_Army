import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    maxConnections: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'hrms_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  },
  
  jwt: {
    accessTokenSecret: (() => {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_ACCESS_SECRET is required in production');
      }
      if (secret && secret.length < 32 && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
      }
      return secret || 'dev-only-access-secret-min-32-chars-required';
    })(),
    refreshTokenSecret: (() => {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET is required in production');
      }
      if (secret && secret.length < 32 && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
      }
      return secret || 'dev-only-refresh-secret-min-32-chars-required';
    })(),
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@hrms.com',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};

export default config;
