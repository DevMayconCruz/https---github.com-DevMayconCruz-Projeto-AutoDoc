@echo off
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "C:\caminho\para\seu\script\trocarHTA.bat", 0, False

:: Exibir uma mensagem opcional enquanto aguarda 7 segundos
echo Aguardando 7 segundos antes de fechar o HTA...
timeout /t 7 /nobreak > NUL

:: Tentativa de fechar o arquivo ContagemRegressiva.hta
echo Tentando fechar ContagemRegressiva.hta...

:: Encerra todos os processos mshta.exe (que executam HTAs)
for /f "tokens=2" %%i in ('tasklist ^| findstr /I "mshta.exe"') do (
    echo Encerrando o processo com PID %%i...
    taskkill /F /PID %%i
)

:: Aguardar um pouco para garantir que o arquivo foi fechado
timeout /t 1 /nobreak > NUL

@echo off
wscript.exe "\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\Conclusao\final.vbs"



