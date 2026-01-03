/**
 * Script to create a verified admin user in the database
 * Run with: cd backend && node ../create-admin-user.js
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dayflow_hrms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',  // Default password, change if needed
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Generate password hash for 'admin123'
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Password hash generated');

    // Insert admin user
    const query = `
      INSERT INTO users (
        employee_id,
        email,
        password_hash,
        role,
        email_verified,
        is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      ON CONFLICT (email) DO UPDATE 
      SET 
        email_verified = TRUE,
        is_active = TRUE,
        role = 'HR_ADMIN',
        password_hash = EXCLUDED.password_hash
      RETURNING id, employee_id, email, role, email_verified;
    `;

    const values = [
      'EMP001',
      'admin@dayflow.com',
      passwordHash,
      'HR_ADMIN',
      true,
      true,
    ];

    const result = await pool.query(query, values);
    
    console.log('\n✓ Admin user created successfully!');
    console.log('\nUser Details:');
    console.log(result.rows[0]);
    console.log('\nLogin Credentials:');
    console.log('  Email: admin@dayflow.com');
    console.log('  Password: admin123');
    console.log('\nYou can now log in to the website.');

  } catch (error) {
    console.error('Error creating admin user:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminUser();
