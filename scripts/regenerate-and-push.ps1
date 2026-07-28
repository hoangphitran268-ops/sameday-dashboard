# Quet du lieu Same Day moi nhat, ghi lai src/data/dashboard-data.json,
# va (neu da co remote GitHub) tu dong commit + push de Vercel deploy lai.
# Chay thu cong: powershell -File scripts\regenerate-and-push.ps1
# Duoc goi tu dong moi 3 tieng boi Scheduled Task (xem setup-scheduled-task.ps1).

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:LANG = "en_US.UTF-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$logDir = Join-Path $ProjectDir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "regenerate.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $output = node "$ProjectDir\scripts\regenerate-data.mjs" 2>&1
    $joined = $output -join "`n"
    Add-Content -Path $logFile -Value "[$timestamp] OK`n$joined`n" -Encoding utf8
} catch {
    Add-Content -Path $logFile -Value "[$timestamp] LOI: $($_.Exception.Message)`n"
    exit 1
}

# Neu repo da co remote 'origin', tu commit + push (bo qua neu khong co gi thay doi)
$hasGit = Test-Path (Join-Path $ProjectDir ".git")
if ($hasGit) {
    $remote = git remote 2>$null
    if ($remote -contains "origin") {
        git add src/data/dashboard-data.json
        $changed = git status --porcelain -- src/data/dashboard-data.json
        if ($changed) {
            git commit -m "chore: auto-update sameday data ($timestamp)" | Out-Null
            git push origin HEAD 2>&1 | Add-Content -Path $logFile
            Add-Content -Path $logFile -Value "[$timestamp] Da push len GitHub."
        } else {
            Add-Content -Path $logFile -Value "[$timestamp] Khong co thay doi du lieu, bo qua push."
        }
    }
}
