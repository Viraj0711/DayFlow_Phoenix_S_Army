import App from './app';
import config from './config';
import db from './db/pool';
import logger from './utils/logger';

const startServer = async () => {
  try {
    // Test database connection (optional for now)
    try {
      const dbConnected = await db.testConnection();
      if (!dbConnected) {
        logger.warn('⚠️  Database connection failed - running without database');
      }
    } catch (error) {
      logger.warn('⚠️  Database not available - running without database', error);
    }

    // Initialize Express app
    const appInstance = new App();
    const app = appInstance.getApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server started on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🗄️  Database: Connected to ${config.database.database}`);
      logger.info(`⚡ Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await db.close();
          logger.info('Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
