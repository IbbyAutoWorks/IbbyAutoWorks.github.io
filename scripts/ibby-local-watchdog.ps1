$ErrorActionPreference = 'Continue'
$Repo = 'C:\Users\CAK3D\IbbyAuto-next-web-run'
$TaskName = 'CAK3D-IbbyAuto-Web-4200'
$Base = 'http://127.0.0.1:4200'
$Log = Join-Path $Repo 'ibby-watchdog.log'
function Log($message) { Add-Content -Path $Log -Value ("{0} {1}" -f (Get-Date).ToString('s'), $message) }
function Test-Page($path, $needle) {
  try {
    $response = Invoke-WebRequest -Uri ($Base + $path) -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 500) { return $false }
    if ($response.Content.Contains('Application error')) { return $false }
    if ($needle -and -not $response.Content.Contains($needle)) { return $false }
    return $true
  } catch { return $false }
}
try {
  $ok = (Test-Page '/' 'Ibby Auto Works') -and (Test-Page '/request' 'Customer work request') -and (Test-Page '/account' 'Cloud account')
  if ($ok) { Log 'healthy_deep'; exit 0 }
  Log 'unhealthy_deep; restarting task'
  Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { if ($_ -and $_ -ne $PID) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }
  Start-Sleep -Seconds 3
  Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
  Start-Sleep -Seconds 8
  $after = (Test-Page '/' 'Ibby Auto Works') -and (Test-Page '/request' 'Customer work request') -and (Test-Page '/account' 'Cloud account')
  Log ("restart deep check {0}" -f $after)
  if (-not $after) { exit 1 }
} catch { Log ("watchdog error: {0}" -f $_.Exception.Message); exit 1 }
