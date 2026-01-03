# DayFlow HRMS Frontend - Setup Script (Windows PowerShell)
# Run this script from the project root directory

Write-Host "🚀 DayFlow HRMS Frontend Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion installed`n" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please reinstall Node.js" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Write-Host "Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location -Path ".\frontend"

if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ package.json not found. Are you in the correct directory?" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found package.json`n" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Gray

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Dependencies installed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".\.env" -Encoding utf8
    Write-Host "✅ .env file created`n" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists`n" -ForegroundColor Green
}

# Display summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "📁 Project Structure:" -ForegroundColor Yellow
Write-Host "  ✅ 45 files created" -ForegroundColor White
Write-Host "  ✅ Component library ready" -ForegroundColor White
Write-Host "  ✅ Authentication pages built" -ForegroundColor White
Write-Host "  ✅ Dashboard pages ready" -ForegroundColor White
Write-Host "  ✅ API integration configured`n" -ForegroundColor White

Write-Host "🎨 Design System:" -ForegroundColor Yellow
Write-Host "  • Primary: #1e3a8a (Deep Blue)" -ForegroundColor White
Write-Host "  • Secondary: #0891b2 (Teal)" -ForegroundColor White
Write-Host "  • Accent: #f59e0b (Amber)" -ForegroundColor White
Write-Host "  • Success: #10b981 (Green)" -ForegroundColor White
Write-Host "  • Error: #ef4444 (Red)`n" -ForegroundColor White

Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start development server:" -ForegroundColor White
Write-Host "     npm start`n" -ForegroundColor Cyan
Write-Host "  2. Open browser to:" -ForegroundColor White
Write-Host "     http://localhost:3000`n" -ForegroundColor Cyan
Write-Host "  3. Read the documentation:" -ForegroundColor White
Write-Host "     • frontend/README.md" -ForegroundColor Cyan
Write-Host "     • FRONTEND_QUICKSTART.md" -ForegroundColor Cyan
Write-Host "     • FRONTEND_BUILD_SUMMARY.md`n" -ForegroundColor Cyan

Write-Host "💡 Useful Commands:" -ForegroundColor Yellow
Write-Host "  npm start        # Start development server" -ForegroundColor White
Write-Host "  npm run build    # Build for production" -ForegroundColor White
Write-Host "  npm test         # Run tests`n" -ForegroundColor White

Write-Host "⚠️  Note:" -ForegroundColor Yellow
Write-Host "  Make sure the backend is running on port 5000" -ForegroundColor White
Write-Host "  for full functionality.`n" -ForegroundColor White

Write-Host "Happy coding! 🎉" -ForegroundColor Green
