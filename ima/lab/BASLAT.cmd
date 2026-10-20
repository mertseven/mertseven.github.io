@echo off
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto python
py -3 serve.py
goto end
:python
where python >nul 2>nul
if errorlevel 1 goto missing
python serve.py
goto end
:missing
echo Python 3 bulunamadi. Bu klasoru herhangi bir statik web sunucusuyla acabilirsiniz.
echo Ornek: VS Code Live Server veya bir web hosting servisi.
pause
:end
