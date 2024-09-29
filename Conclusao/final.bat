@echo off
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "C:\caminho\para\seu\script\trocarHTA.bat", 0, False

:: Tentativa de fechar o arquivo ContagemRegressiva.hta
echo Tentando fechar ContagemRegressiva.hta...

:: Encerra todos os processos mshta.exe (que executam HTAs)
for /f "tokens=2" %%i in ('tasklist ^| findstr /I "mshta.exe"') do (
    echo Encerrando o processo com PID %%i...
    taskkill /F /PID %%i
)

:: Aguardar um pouco para garantir que o arquivo foi fechado
timeout /t 1 /nobreak > NUL

:: Abrir o arquivo Final.hta
echo Abrindo Final.hta...
start "" "\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\Final.hta"

