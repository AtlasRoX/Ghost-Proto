# PowerShell installer for GhostProto
$repoUrl = "https://github.com/AtlasRoX/Ghost-Proto.git"

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   GhostProto CLI Installer   " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js is not installed. Please download and install Node.js (>=18) from https://nodejs.org" -ForegroundColor Red
    Exit 1
}

# Check Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Git is not installed. Please install Git first." -ForegroundColor Red
    Exit 1
}

Write-Host "[+] Installing GhostProto globally via npm..." -ForegroundColor Yellow
npm install -g $repoUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] GhostProto installed successfully!" -ForegroundColor Green
    Write-Host "[+] You can now run the tool anywhere by typing: ghostch" -ForegroundColor Green
} else {
    Write-Host "[!] Installation failed. Try running PowerShell as Administrator." -ForegroundColor Red
}
