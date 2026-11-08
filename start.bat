@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo 패키지를 설치합니다...
  call npm install
)
echo 링크나무 개발 서버를 시작합니다... http://localhost:3000
start "" http://localhost:3000
call npm run dev
pause
