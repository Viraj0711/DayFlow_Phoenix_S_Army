# ============================================================================
# DayFlow HRMS - Database Setup Script
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DayFlow HRMS - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$pgPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$pgPath16 = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$pgPath15 = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$pgPath14 = "C:\Program Files\PostgreSQL\14\bin\psql.exe"

$psqlExe = $null
if (Test-Path $pgPath) {
    $psqlExe = $pgPath
} elseif (Test-Path $pgPath16) {
    $psqlExe = $pgPath16
} elseif (Test-Path $pgPath15) {
    $psqlExe = $pgPath15
} elseif (Test-Path $pgPath14) {
    $psqlExe = $pgPath14
}

if (-not $psqlExe) {
    Write-Host "ERROR: PostgreSQL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "2. Install PostgreSQL (remember the postgres user password)" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "SUCCESS: PostgreSQL found at: $psqlExe" -ForegroundColor Green
Write-Host ""

# Get postgres password
Write-Host "Enter your PostgreSQL 'postgres' user password:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Database details
$dbName = "dayflow_hrms"
$dbUser = "postgres"

Write-Host ""
Write-Host "Creating database: $dbName..." -ForegroundColor Cyan

# Check if database exists
$checkDb = & $psqlExe -U $dbUser -lqt | Select-String -Pattern $dbName
if ($checkDb) {
    Write-Host ""
    Write-Host "WARNING: Database '$dbName' already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (yes/no)"
    if ($response -eq "yes") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & $psqlExe -U $dbUser -c "DROP DATABASE IF EXISTS $dbName;" 2>&1 | Out-Null
        Write-Host "SUCCESS: Database dropped" -ForegroundColor Green
    } else {
        Write-Host "Using existing database..." -ForegroundColor Yellow
    }
}

# Create database
Write-Host "Creating database..." -ForegroundColor Cyan
$createResult = & $psqlExe -U $dbUser -c "CREATE DATABASE $dbName;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database created successfully" -ForegroundColor Green
} else {
    if ($createResult -match "already exists") {
        Write-Host "SUCCESS: Database already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: Failed to create database" -ForegroundColor Red
        Write-Host $createResult -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Run schema files
Write-Host ""
Write-Host "Running schema files..." -ForegroundColor Cyan
Write-Host ""

$schemaPath = Join-Path $PSScriptRoot "src\db\schema"

# 1. Users schema
Write-Host "1/3 Creating users tables..." -ForegroundColor Cyan
$usersFile = Join-Path $schemaPath "users.sql"
& $psqlExe -U $dbUser -d $dbName -f $usersFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "  SUCCESS: Users schema created" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to create users schema" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 2. Employees schema
Write-Host "2/3 Creating employees tables..." -ForegroundColor Cyan
$employeesFile = Join-Path $schemaPath "employees.sql"
& $psqlExe -U $dbUser -d $dbName -f $employeesFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "  SUCCESS: Employees schema created" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to create employees schema" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 3. Leave management schema
Write-Host "3/3 Creating leave management tables..." -ForegroundColor Cyan
$leaveFile = Join-Path $schemaPath "leave_management.sql"
& $psqlExe -U $dbUser -d $dbName -f $leaveFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "  SUCCESS: Leave management schema created" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to create leave management schema" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify setup
Write-Host ""
Write-Host "Verifying setup..." -ForegroundColor Cyan
Write-Host ""

# List tables
Write-Host "Tables created:" -ForegroundColor Yellow
& $psqlExe -U $dbUser -d $dbName -c "\dt" 2>&1 | Write-Host

Write-Host ""
Write-Host "Seed users:" -ForegroundColor Yellow
& $psqlExe -U $dbUser -d $dbName -c "SELECT employee_id, email, role, email_verified FROM users;" 2>&1 | Write-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS: Database setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your backend/.env file with:" -ForegroundColor White
Write-Host "   DB_HOST=localhost" -ForegroundColor Gray
Write-Host "   DB_PORT=5432" -ForegroundColor Gray
Write-Host "   DB_NAME=dayflow_hrms" -ForegroundColor Gray
Write-Host "   DB_USER=postgres" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=your_password" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your backend server" -ForegroundColor White
Write-Host ""
Write-Host "3. Login at http://localhost:3000 with:" -ForegroundColor White
Write-Host "   Email: admin@dayflow.com" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null

Read-Host "Press Enter to exit"
