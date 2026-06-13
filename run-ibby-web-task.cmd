@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev --port 4200 --hostname 0.0.0.0 >> ibby-task.log 2>>&1
