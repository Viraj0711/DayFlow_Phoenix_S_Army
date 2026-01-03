# ============================================================================
# Dayflow HRMS - Database Setup Script for Windows
# ============================================================================
# Run this script with: .\setup-database.ps1
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║        Dayflow HRMS - Database Setup (Windows)           ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Find PostgreSQL installation
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\13\bin",
    "C:\Program Files (x86)\PostgreSQL\16\bin",
    "C:\Program Files (x86)\PostgreSQL\15\bin"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path "$path\psql.exe") {
        $psqlPath = "$path\psql.exe"
        Write-Host "✅ Found PostgreSQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or specify the path to psql.exe manually." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Database configuration
$DB_NAME = "dayflow_hrms"
$DB_USER = "dayflow_user"
$DB_PASSWORD = Read-Host "Enter password for database user '$DB_USER'" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Cyan
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

try {
    # Step 1: Create database (connect as postgres user first)
    Write-Host "1️⃣  Creating database '$DB_NAME'..." -ForegroundColor Yellow
    
    $createDbQuery = @"
CREATE DATABASE $DB_NAME;
"@
    
    $createDbQuery | & $psqlPath -U postgres -h localhost -c $createDbQuery 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Database might already exist (continuing...)" -ForegroundColor Yellow
    }

    # Step 2: Create user
    Write-Host "2️⃣  Creating user '$DB_USER'..." -ForegroundColor Yellow
    
    $createUserQuery = @"
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD_PLAIN';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
"@
    
    $createUserQuery | & $psqlPath -U postgres -h localhost -d postgres -c $createUserQuery 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ User created successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  User might already exist (continuing...)" -ForegroundColor Yellow
    }

    # Step 3: Run schema migration
    Write-Host "3️⃣  Running schema migration..." -ForegroundColor Yellow
    
    $schemaPath = Join-Path $PSScriptRoot "database\schema.sql"
    
    if (-not (Test-Path $schemaPath)) {
        Write-Host "   ❌ Schema file not found at: $schemaPath" -ForegroundColor Red
        exit 1
    }
    
    & $psqlPath -U $DB_USER -h localhost -d $DB_NAME -f $schemaPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Schema migration completed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Schema migration failed" -ForegroundColor Red
        exit 1
    }

    # Step 4: Run email verification tokens migration
    Write-Host "4️⃣  Running email verification migration..." -ForegroundColor Yellow
    
    $migrationPath = Join-Path $PSScriptRoot "database\migrations\001_email_verification_tokens.sql"
    
    if (Test-Path $migrationPath) {
        & $psqlPath -U $DB_USER -h localhost -d $DB_NAME -f $migrationPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Migration completed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Migration failed" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  Migration file not found (skipping...)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "║              ✅ Database Setup Complete!                  ║" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
    Write-Host "User:     $DB_USER" -ForegroundColor Cyan
    Write-Host "Host:     localhost" -ForegroundColor Cyan
    Write-Host "Port:     5432" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy backend\.env.example to backend\.env" -ForegroundColor White
    Write-Host "2. Update database credentials in backend\.env" -ForegroundColor White
    Write-Host "3. Run: cd backend && npm install" -ForegroundColor White
    Write-Host "4. Run: npm run dev" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}
