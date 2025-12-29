@echo off
REM Start PISIFM Backend
REM Script untuk menjalankan backend PISIFM

echo Starting PISIFM Backend...

cd /d "C:\Users\netcom\Documents\ifm_septian\project\PISIFM\pisifmbe"

echo Running backend on port 3001...
node dist/server.js

pause
