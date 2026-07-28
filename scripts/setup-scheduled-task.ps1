# Tao 1 Windows Scheduled Task chay scripts\regenerate-and-push.ps1 moi 3 tieng,
# de tu dong quet du lieu Same Day moi va (neu da noi GitHub) push cho Vercel deploy lai.
# Chay 1 lan: powershell -File scripts\setup-scheduled-task.ps1
# Go bo:      Unregister-ScheduledTask -TaskName "JT-Sameday-Dashboard-Regenerate" -Confirm:$false

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot
$TaskName = "JT-Sameday-Dashboard-Regenerate"
$ScriptPath = Join-Path $ProjectDir "scripts\regenerate-and-push.ps1"

$argStr = '-NoProfile -ExecutionPolicy Bypass -File "' + $ScriptPath + '"'
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argStr

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Hours 3) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null

Write-Output "Da tao Scheduled Task '$TaskName' - chay moi 3 tieng, bat dau tu bay gio."
Write-Output "Kiem tra:  Get-ScheduledTask -TaskName '$TaskName'"
Write-Output "Chay thu:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Output "Log:       $ProjectDir\logs\regenerate.log"
