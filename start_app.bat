@echo off
echo Starting Pharmacist Agent...

REM Start Backend
start cmd /k "cd backend && pip install -r requirements.txt && python main.py"

REM Start Frontend
start cmd /k "cd frontend && npm install && npm run dev"

echo Services started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
