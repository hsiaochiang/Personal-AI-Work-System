@echo off
REM start-prod.bat — 啟動正式區 PAIS 服務（Port 3001）
REM 使用方式：以系統管理員或具所需權限的使用者在正式區執行此檔

SETLOCAL

REM 設定環境變數
SET PORT=3001
SET NODE_ENV=production

REM 進入 web 目錄並啟動 server.js
cd /d "%~dp0web"
echo 啟動正式區服務，PORT=%PORT% NODE_ENV=%NODE_ENV%
echo Running: node server.js
node server.js

if NOT "%ERRORLEVEL%"=="0" (
  echo.
  echo Node 結束，錯誤碼：%ERRORLEVEL%
  echo 請確認 Node.js 已安裝，或查看 %~dp0web\server.js 日誌
  pause
)

ENDLOCAL
