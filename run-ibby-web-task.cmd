@echo off
cd /d "%~dp0"
if not exist next-live\index.html (
  call npm run build >> ibby-task.log 2>>&1
)
"C:\Program Files\nodejs\node.exe" scripts\ibby-local-server.mjs >> ibby-task.log 2>>&1
