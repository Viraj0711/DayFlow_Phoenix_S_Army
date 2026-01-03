#!/usr/bin/env node

/**
 * Security Secrets Generator
 * 
 * This script generates cryptographically secure random secrets
 * for use in the DayFlow HRMS application.
 * 
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 DayFlow HRMS - Security Secrets Generator\n');
console.log('=' .repeat(60));

/**
 * Generate a cryptographically secure random string
 */
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate all required secrets
const secrets = {
  JWT_ACCESS_SECRET: generateSecret(32),
  JWT_REFRESH_SECRET: generateSecret(32),
  JWT_SECRET: generateSecret(32),
  SESSION_SECRET: generateSecret(32),
  DB_PASSWORD: generateSecret(24),
};

console.log('\n✅ Generated Secure Secrets:\n');
console.log('Copy these to your .env file:\n');
console.log('-'.repeat(60));

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}

console.log('-'.repeat(60));

// Optionally save to a file
const saveToFile = process.argv.includes('--save');

if (saveToFile) {
  const envContent = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const filename = `.env.generated-${Date.now()}`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, envContent);
  console.log(`\n✅ Secrets saved to: ${filename}`);
  console.log('⚠️  IMPORTANT: Rename this file to .env and add other configuration!');
  console.log('⚠️  DELETE this file after copying secrets to your actual .env file!');
}

console.log('\n📋 Security Checklist:\n');
console.log('  ✅ Each secret is at least 32 characters long');
console.log('  ✅ All secrets are unique');
console.log('  ✅ Secrets are cryptographically random');
console.log('  ✅ Never commit these to version control');
console.log('  ✅ Store production secrets in a secure vault');
console.log('  ✅ Rotate secrets periodically');
console.log('  ✅ Use different secrets for dev/staging/production');

console.log('\n💡 Tips:\n');
console.log('  • Store production secrets in a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)');
console.log('  • Rotate secrets every 90 days');
console.log('  • Never share secrets via email or chat');
console.log('  • Use environment-specific secrets');
console.log('  • Monitor for secret exposure (use tools like GitGuardian)');

console.log('\n' + '='.repeat(60));
console.log('\n');
