# ============================================================================
# Dayflow HRMS - Create Admin User Script
# ============================================================================
# This script creates a verified admin user in the database
# Credentials: admin@dayflow.com / admin123
# ============================================================================

Write-Host "Creating admin user for Dayflow HRMS..." -ForegroundColor Cyan

# Database configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "dayflow_hrms"
$DB_USER = "postgres"

# Prompt for database password
$DB_PASSWORD = Read-Host "Enter PostgreSQL password for user $DB_USER" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

# Generate password hash using Node.js
Write-Host ""
Write-Host "Generating password hash..." -ForegroundColor Yellow

$hashScript = @"
const bcrypt = require('bcrypt');
(async () => {
    const hash = await bcrypt.hash('admin123', 10);
    console.log(hash);
})();
"@

# Save temp script
$tempScript = "temp_hash_generator.js"
$hashScript | Out-File -FilePath $tempScript -Encoding utf8

# Run Node.js script to generate hash
try {
    Push-Location "backend"
    $passwordHash = node "../$tempScript" 2>&1
    Pop-Location
    Remove-Item $tempScript -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate password hash"
    }
    
    Write-Host "Password hash generated successfully" -ForegroundColor Green
} catch {
    Write-Host "Error generating password hash: $_" -ForegroundColor Red
    Pop-Location
    Remove-Item $tempScript -ErrorAction SilentlyContinue
    exit 1
}

# Create SQL for inserting admin user
$sql = @"
-- Insert verified admin user
INSERT INTO users (
    employee_id,
    email,
    password_hash,
    role,
    email_verified,
    is_active
) VALUES (
    'EMP001',
    'admin@dayflow.com',
    '$passwordHash',
    'HR_ADMIN',
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE 
SET 
    email_verified = TRUE,
    is_active = TRUE,
    role = 'HR_ADMIN',
    password_hash = EXCLUDED.password_hash;

-- Verify the user was created
SELECT id, employee_id, email, role, email_verified, is_active 
FROM users 
WHERE email = 'admin@dayflow.com';
"@

# Save SQL to temp file
$tempSQL = "temp_insert_admin.sql"
$sql | Out-File -FilePath $tempSQL -Encoding utf8

# Execute SQL
Write-Host ""
Write-Host "Inserting admin user into database..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD_PLAIN
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $tempSQL 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" 
        Write-Host "Admin user created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Login Credentials:" -ForegroundColor Cyan
        Write-Host "  Email: admin@dayflow.com" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now log in to the website." -ForegroundColor Green
    } else {
        Write-Host "Error executing SQL: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item $tempSQL -ErrorAction SilentlyContinue
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
