@echo off
echo Starting CrystalMaker System...

start "Model Service (Flask)" cmd /k "cd model && title Model Service (Port 5001) && python app.py"
timeout /t 3

start "Backend Service (Express)" cmd /k "cd backend && title Backend Service (Port 4000) && npm start"
timeout /t 3

start "Frontend (Vite)" cmd /k "cd frontend && title Frontend (Vite) && npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:4000
echo Model: http://localhost:5001
pause
