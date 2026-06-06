# Clears Explorer thumbnail and icon cache databases, then restarts Explorer.
# Run manually when thumbnails look stale or corrupted.

$explorerRunning = Get-Process -Name explorer -ErrorAction SilentlyContinue
if ($explorerRunning) {
    Stop-Process -Name explorer -Force
}

$cacheRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Explorer'
Get-ChildItem -Path $cacheRoot -Filter 'thumbcache_*.db' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $cacheRoot -Filter 'iconcache_*.db' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Start-Process explorer

Write-Host 'Thumbnail and icon caches cleared. Explorer restarted.' -ForegroundColor Green
