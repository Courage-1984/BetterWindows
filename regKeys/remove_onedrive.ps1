# Stop OneDrive
taskkill /f /im OneDrive.exe

# Uninstall OneDrive (both 32-bit and 64-bit paths just in case)
Start-Process -FilePath "$env:SystemRoot\System32\OneDriveSetup.exe" -ArgumentList "/uninstall" -NoNewWindow -Wait -ErrorAction SilentlyContinue
Start-Process -FilePath "$env:SystemRoot\SysWOW64\OneDriveSetup.exe" -ArgumentList "/uninstall" -NoNewWindow -Wait -ErrorAction SilentlyContinue

# Remove leftover directories
Remove-Item "$env:USERPROFILE\OneDrive" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Microsoft\OneDrive" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:PROGRAMDATA\Microsoft OneDrive" -Recurse -Force -ErrorAction SilentlyContinue

# Remove OneDrive from Explorer and autostart
REG DELETE "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "OneDrive" /f
REG DELETE "HKCR\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}" /f
REG DELETE "HKCR\WOW6432Node\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}" /f

# Disable OneDrive via Group Policy
REG ADD "HKLM\SOFTWARE\Policies\Microsoft\Windows\OneDrive" /v "DisableFileSyncNGSC" /t REG_DWORD /d 1 /f
