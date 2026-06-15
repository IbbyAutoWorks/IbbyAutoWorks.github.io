Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\CAK3D\IbbyAuto-next-web-run"
shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""C:\Users\CAK3D\IbbyAuto-next-web-run\scripts\ibby-local-watchdog.ps1""", 0, False
