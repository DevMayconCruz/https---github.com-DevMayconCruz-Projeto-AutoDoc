@echo off

:: Tentativa de fechar o arquivo ContagemRegressiva.hta
for /f "tokens=2" %%i in ('tasklist ^| findstr /I "mshta.exe"') do (
    taskkill /F /PID %%i
)

:: Aguardar um pouco para garantir que o arquivo foi fechado
timeout /t 1 /nobreak > NUL

:: Abrir o arquivo Final.hta
start "" "Z:\Projeto-AutoDocServidor\Final.hta"

