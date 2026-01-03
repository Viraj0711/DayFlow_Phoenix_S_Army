#!/usr/bin/env node

/**
 * Security Configuration Validator
 * 
 * Validates that all security requirements are met before starting the application.
 * Run this before deploying to production.
 * 
 * Usage: node validate-security.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔒 DayFlow HRMS - Security Configuration Validator\n');
console.log('='.repeat(70));

let hasErrors = false;
let hasWarnings = false;
const errors = [];
const warnings = [];
const passed = [];

/**
 * Check if running in production
 */
const isProduction = process.env.NODE_ENV === 'production';

console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}\n`);

/**
 * Validate environment variable exists
 */
function validateExists(key, critical = false) {
  if (!process.env[key]) {
    const message = `❌ ${key} is not set`;
    if (critical && isProduction) {
      errors.push(message);
      hasErrors = true;
    } else {
      warnings.push(message);
      hasWarnings = true;
    }
    return false;
  }
  passed.push(`✅ ${key} is set`);
  return true;
}

/**
 * Validate secret strength
 */
function validateSecretStrength(key, minLength = 32) {
  if (!validateExists(key, true)) return false;
  
  const value = process.env[key];
  if (value.length < minLength) {
    const message = `❌ ${key} is too short (${value.length} chars, min ${minLength} required)`;
    if (isProduction) {
      errors.push(message);
      hasErrors = true;
    } else {
      warnings.push(message);
      hasWarnings = true;
    }
    return false;
  }
  
  // Check for default/weak values
  const weakPatterns = [
    'secret',
    'password',
    'change',
    'default',
    'example',
    'test',
    '12345',
    'admin'
  ];
  
  const lowerValue = value.toLowerCase();
  for (const pattern of weakPatterns) {
    if (lowerValue.includes(pattern)) {
      const message = `⚠️  ${key} appears to contain weak/default value`;
      warnings.push(message);
      hasWarnings = true;
      return false;
    }
  }
  
  passed.push(`✅ ${key} meets strength requirements (${value.length} chars)`);
  return true;
}

/**
 * Validate secrets are unique
 */
function validateSecretsUnique() {
  const secrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_SECRET,
    process.env.SESSION_SECRET,
  ].filter(Boolean);
  
  const uniqueSecrets = new Set(secrets);
  
  if (secrets.length !== uniqueSecrets.size) {
    const message = '❌ JWT secrets must be unique! Found duplicate secrets.';
    if (isProduction) {
      errors.push(message);
      hasErrors = true;
    } else {
      warnings.push(message);
      hasWarnings = true;
    }
    return false;
  }
  
  passed.push('✅ All secrets are unique');
  return true;
}

/**
 * Validate database configuration
 */
function validateDatabase() {
  validateExists('DB_HOST', true);
  validateExists('DB_PORT', true);
  validateExists('DB_NAME', true);
  validateExists('DB_USER', true);
  
  if (isProduction) {
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.length < 16) {
      errors.push('❌ DB_PASSWORD must be at least 16 characters in production');
      hasErrors = true;
    } else {
      passed.push(`✅ Database password meets requirements (${process.env.DB_PASSWORD.length} chars)`);
    }
  } else {
    validateExists('DB_PASSWORD', false);
  }
}

/**
 * Validate CORS configuration
 */
function validateCORS() {
  if (!process.env.CORS_ORIGIN) {
    warnings.push('⚠️  CORS_ORIGIN not set - will use defaults');
    hasWarnings = true;
    return;
  }
  
  const origins = process.env.CORS_ORIGIN.split(',');
  
  if (isProduction && origins.some(o => o === '*' || o.includes('localhost'))) {
    errors.push('❌ CORS_ORIGIN contains wildcard or localhost in production');
    hasErrors = true;
  } else {
    passed.push(`✅ CORS configured with ${origins.length} origin(s)`);
  }
}

/**
 * Check .env file exists
 */
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    errors.push('❌ .env file not found!');
    hasErrors = true;
    return false;
  }
  passed.push('✅ .env file exists');
  return true;
}

/**
 * Check .gitignore protects secrets
 */
function checkGitignore() {
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    warnings.push('⚠️  .gitignore file not found');
    hasWarnings = true;
    return;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes('.env')) {
    errors.push('❌ .env is not in .gitignore!');
    hasErrors = true;
  } else {
    passed.push('✅ .env is protected by .gitignore');
  }
}

// Run all validations
console.log('Running security checks...\n');

checkEnvFile();
checkGitignore();

console.log('Validating JWT Configuration...');
validateSecretStrength('JWT_ACCESS_SECRET', 32);
validateSecretStrength('JWT_REFRESH_SECRET', 32);
validateSecretStrength('JWT_SECRET', 32);
validateSecretsUnique();

console.log('\nValidating Database Configuration...');
validateDatabase();

console.log('\nValidating CORS Configuration...');
validateCORS();

console.log('\nValidating Email Configuration...');
validateExists('EMAIL_HOST');
validateExists('EMAIL_USER');
validateExists('EMAIL_PASSWORD');

// Print results
console.log('\n' + '='.repeat(70));
console.log('\n📊 VALIDATION RESULTS:\n');

if (passed.length > 0) {
  console.log('✅ PASSED CHECKS:\n');
  passed.forEach(p => console.log('  ' + p));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(w => console.log('  ' + w));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (MUST FIX):\n');
  errors.forEach(e => console.log('  ' + e));
  console.log('');
}

console.log('='.repeat(70));

// Summary
console.log('\n📈 SUMMARY:\n');
console.log(`  Passed:   ${passed.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Errors:   ${errors.length}`);

if (hasErrors) {
  console.log('\n❌ VALIDATION FAILED');
  console.log('Fix all errors before deploying to production!');
  console.log('\n💡 Quick Fix:');
  console.log('   Run: node generate-secrets.js');
  console.log('   Then copy the secrets to your .env file\n');
  process.exit(1);
} else if (hasWarnings && isProduction) {
  console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('Consider fixing warnings before production deployment.');
  process.exit(0);
} else {
  console.log('\n✅ VALIDATION PASSED');
  console.log('Security configuration looks good!');
  process.exit(0);
}
