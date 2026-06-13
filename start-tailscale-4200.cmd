@echo off
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev --port 4200 --hostname 0.0.0.0 > tailscale-dev.log 2>&1
