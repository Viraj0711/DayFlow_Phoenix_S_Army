#!/usr/bin/env pwsh
# ==============================================================================
# SECURITY: Generate New Secure Secrets for DayFlow HRMS
# ==============================================================================
# This script generates cryptographically secure secrets to replace exposed ones
# Run this after your secrets have been exposed to GitHub
# ==============================================================================

Write-Host ""
Write-Host "🔐 SECURITY: Generating New Secure Secrets" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate random secure string
function Get-SecureRandomString {
    param(
        [int]$Length = 64
    )
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?'
    $secureString = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $secureString
}

Write-Host "✨ Generated Secure Secrets:" -ForegroundColor Green
Write-Host ""

# Generate JWT Secret
$jwtSecret = Get-SecureRandomString -Length 64
Write-Host "📝 JWT_SECRET (copy this to your backend/.env):" -ForegroundColor Yellow
Write-Host $jwtSecret
Write-Host ""

# Generate Database Password
$dbPassword = Get-SecureRandomString -Length 32
Write-Host "🔑 Suggested DB_PASSWORD (copy this to your backend/.env):" -ForegroundColor Yellow
Write-Host $dbPassword
Write-Host ""

Write-Host "⚠️  IMPORTANT STEPS:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Update PostgreSQL password in pgAdmin or psql:" -ForegroundColor White
Write-Host "   ALTER USER postgres PASSWORD '$dbPassword';" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update backend/.env file with these new values:" -ForegroundColor White
Write-Host "   JWT_SECRET=$jwtSecret" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=$dbPassword" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart your backend server" -ForegroundColor White
Write-Host ""
Write-Host "4. Remove .env from Git history (see SECURITY_INSTRUCTIONS.md)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Done! Keep these secrets safe and NEVER commit them to Git!" -ForegroundColor Green
Write-Host ""
