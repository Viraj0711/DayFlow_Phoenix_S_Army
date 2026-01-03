# Database Setup Guide for Windows

## Option 1: Use PowerShell Script (Recommended)

Run the automated setup script:

```powershell
.\setup-database.ps1
```

This script will:
1. Find your PostgreSQL installation
2. Create the database
3. Create the user
4. Run all migrations

## Option 2: Use pgAdmin (GUI)

1. **Open pgAdmin**
   - Find it in Start Menu → PostgreSQL → pgAdmin

2. **Connect to PostgreSQL**
   - Right-click "Servers" → Create → Server
   - Name: Dayflow HRMS
   - Host: localhost
   - Port: 5432
   - Username: postgres

3. **Create Database**
   - Right-click "Databases" → Create → Database
   - Name: `dayflow_hrms`

4. **Create User**
   - Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `dayflow_user`
   - Password: Set a secure password
   - Privileges: Check "Can login"
   - Go to "Membership" tab → Add role: postgres

5. **Run Schema**
   - Select `dayflow_hrms` database
   - Tools → Query Tool
   - Open file: `database/schema.sql`
   - Click Execute (F5)

6. **Run Migration**
   - Same Query Tool
   - Open file: `database/migrations/001_email_verification_tokens.sql`
   - Click Execute (F5)

## Option 3: Add psql to PATH

1. **Find PostgreSQL bin folder:**
   - Usually: `C:\Program Files\PostgreSQL\15\bin`

2. **Add to PATH:**
   - Open System Properties → Advanced → Environment Variables
   - Edit "Path" under System Variables
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click OK

3. **Restart PowerShell/Terminal**

4. **Run commands:**
   ```powershell
   # Create database
   psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
   psql -U postgres -c "CREATE USER dayflow_user WITH ENCRYPTED PASSWORD 'your_password';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;"
   
   # Run migrations
   psql -U dayflow_user -d dayflow_hrms -f database/schema.sql
   psql -U dayflow_user -d dayflow_hrms -f database/migrations/001_email_verification_tokens.sql
   ```

## Option 4: Use Full Path to psql

```powershell
# Replace with your PostgreSQL version
$psql = "C:\Program Files\PostgreSQL\15\bin\psql.exe"

# Set password (you'll be prompted)
$env:PGPASSWORD = "your_password"

# Create database
& $psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
& $psql -U postgres -c "CREATE USER dayflow_user WITH ENCRYPTED PASSWORD 'your_password';"
& $psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;"

# Run migrations
& $psql -U dayflow_user -d dayflow_hrms -f database/schema.sql
& $psql -U dayflow_user -d dayflow_hrms -f database/migrations/001_email_verification_tokens.sql

# Clear password
$env:PGPASSWORD = $null
```

## Verify Installation

```powershell
# Check if database exists
psql -U postgres -c "\l" | Select-String "dayflow_hrms"

# Check tables
psql -U dayflow_user -d dayflow_hrms -c "\dt"

# Should show:
# - users
# - employees
# - attendance_records
# - leave_requests
# - salary_structures
# - payroll_records
# - notifications
# - audit_logs
# - system_settings
# - email_verification_tokens
```

## Troubleshooting

### PostgreSQL Not Installed
Download from: https://www.postgresql.org/download/windows/

### Permission Denied
Run PowerShell as Administrator

### Password Authentication Failed
- Default postgres password is set during PostgreSQL installation
- Reset if forgotten using: `ALTER USER postgres PASSWORD 'new_password';`

### Port 5432 Already in Use
Check if PostgreSQL is running:
```powershell
Get-Service -Name postgresql*
```

## Next Steps

After database setup:

1. **Create .env file:**
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

2. **Update .env with your database password:**
   ```env
   DB_PASSWORD=your_password_here
   ```

3. **Install dependencies:**
   ```powershell
   npm install
   ```

4. **Start server:**
   ```powershell
   npm run dev
   ```
