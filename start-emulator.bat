@echo off
echo === Bắt đầu khởi động máy ảo Android ===

:: Chuyển vào thư mục emulator
cd /d "C:\Users\ASUS\AppData\Local\Android\Sdk\emulator"

:: Kiểm tra emulator đã chạy chưa
tasklist | findstr /I "emulator.exe" >nul
if %errorlevel% neq 0 (
    echo Đang mở máy ảo...
    start emulator.exe -avd TestFirst_Pixel_9_API_35 -no-snapshot
    timeout /t 30 >nul
) else (
    echo Máy ảo đã chạy
)
