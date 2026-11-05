@echo off
title CRM Warmindo Adzkiya - Turborepo Monorepo
echo ========================================================
echo   CRM Warmindo Adzkiya - Spring Boot ^& MySQL Monorepo
echo ========================================================
echo.

:: 1. Auto-detect JAVA_HOME jika belum ada di environment
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot" (
        set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
    )
)

:: 2. Cek apakah MySQL sudah berjalan di port 3306
netstat -ano | findstr :3306 | findstr LISTENING >nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] MySQL belum terdeteksi di port 3306.
    echo [INFO] Menyalakan MySQL Laragon secara otomatis...
    if exist "D:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" (
        start "" "D:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --defaults-file="D:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"
        timeout /t 3 /nobreak >nul
    )
)

:: 3. Verifikasi status MySQL
netstat -ano | findstr :3306 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] MySQL aktif di port 3306!
) else (
    echo [PERHATIAN] MySQL belum aktif. Buka Laragon dan klik Start All.
)

:: 4. Bebaskan port 8080 jika masih ada proses lama yang berjalan
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo [INFO] Mengosongkan port 8080 dari PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [INFO] Menjalankan Server CRM Warmindo Adzkiya...
echo URL Web CRM: http://localhost:8080
echo.
call mvnw.cmd spring-boot:run

pause
