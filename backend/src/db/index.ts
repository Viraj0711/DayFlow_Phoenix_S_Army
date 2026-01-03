import { QueryResult, QueryResultRow } from 'pg';
import db from './pool';
import logger from '../utils/logger';

/**
 * Generic query function with type safety
 * @param text SQL query string
 * @param params Query parameters
 * @returns Promise with typed results
 */
export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result: QueryResult<T> = await db.query<T>(text, params);
    return result.rows;
  } catch (error) {
    logger.error('Database query error:', { text, params, error });
    throw error;
  }
}

/**
 * Query and return a single row
 * @param text SQL query string
 * @param params Query parameters
 * @returns Promise with typed single result or null
 */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T | null> {
  try {
    const result: QueryResult<T> = await db.query<T>(text, params);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database query error:', { text, params, error });
    throw error;
  }
}

/**
 * Execute a query and return the number of affected rows
 * @param text SQL query string
 * @param params Query parameters
 * @returns Promise with row count
 */
export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  try {
    const result = await db.query(text, params);
    return result.rowCount || 0;
  } catch (error) {
    logger.error('Database execute error:', { text, params, error });
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param callback Function containing queries to execute
 * @returns Promise with callback result
 */
export async function transaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

export default {
  query,
  queryOne,
  execute,
  transaction,
};
