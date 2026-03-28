@echo off
REM SkillForge Deployment & Testing Script for Windows

echo.
echo ================================
echo SkillForge Deployment Tester
echo ================================
echo.

REM Configuration
set BACKEND_URL=https://skillforge-api.onrender.com
set FRONTEND_URL=https://skillforge-web.onrender.com

REM Allow overrides from command line
if not "%1"=="" set BACKEND_URL=%1
if not "%2"=="" set FRONTEND_URL=%2

echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo.

REM Test 1: Backend Health Check
echo [TEST 1] Backend Health Check...
curl -s "%BACKEND_URL%/api/health" > temp_health.txt
findstr /M "SkillForge API is running" temp_health.txt >nul
if errorlevel 1 (
    echo ❌ Backend health check failed
    type temp_health.txt
    del temp_health.txt
    exit /b 1
) else (
    echo ✅ Backend is running and healthy
    type temp_health.txt
)
del temp_health.txt
echo.

REM Test 2: Fallback Auth Endpoint
echo [TEST 2] Testing /auth/register endpoint (Fallback)...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set timestamp=%mydate%%mytime%

curl -s -X POST "%BACKEND_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Test User\", \"email\": \"test-%timestamp%@example.com\", \"password\": \"TestPass123!\", \"university\": \"Test University\", \"major_semester\": \"CS - 3rd\", \"interests\": \"Development\", \"country\": \"USA\", \"target_role\": \"Developer\", \"year\": 3, \"skill_level\": \"Intermediate\", \"preferred_stack\": \"MERN\", \"internship_timeline\": \"6 months\"}" > temp_register.txt
findstr /M "access_token" temp_register.txt >nul
if errorlevel 1 (
    echo ❌ Fallback registration failed
    type temp_register.txt
) else (
    echo ✅ Fallback registration endpoint works
)
del temp_register.txt
echo.

REM Test 3: API Auth Endpoint
echo [TEST 3] Testing /api/auth/register endpoint (API prefix)...
curl -s -X POST "%BACKEND_URL%/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Test User API\", \"email\": \"test-api-%timestamp%@example.com\", \"password\": \"TestPass123!\", \"university\": \"Test University\", \"major_semester\": \"CS - 3rd\", \"interests\": \"Development\", \"country\": \"USA\", \"target_role\": \"Developer\", \"year\": 3, \"skill_level\": \"Intermediate\", \"preferred_stack\": \"MERN\", \"internship_timeline\": \"6 months\"}" > temp_register_api.txt
findstr /M "access_token" temp_register_api.txt >nul
if errorlevel 1 (
    echo ❌ API registration failed
    type temp_register_api.txt
) else (
    echo ✅ API registration endpoint works
)
del temp_register_api.txt
echo.

REM Test 4: Frontend Status
echo [TEST 4] Frontend Deployment Status...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" "%FRONTEND_URL%"
echo.

echo.
echo ================================
echo Testing Complete!
echo ================================
echo.
echo Summary:
echo - Backend: %BACKEND_URL%
echo - Frontend: %FRONTEND_URL%
echo.
echo Next steps:
echo 1. Visit %FRONTEND_URL% in your browser
echo 2. Try to register a new account
echo 3. Check browser DevTools (F12) - Network tab
echo 4. Verify requests are going to the correct backend URL
echo.
