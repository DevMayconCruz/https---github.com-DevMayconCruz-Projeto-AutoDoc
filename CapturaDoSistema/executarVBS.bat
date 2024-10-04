@echo off
:: Define o caminho para o primeiro arquivo VBScript
set vbsFilePath1="\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\CapturaDoSistema\getPCInfo.vbs"

:: Define o caminho para o segundo arquivo VBScript
set vbsFilePath2="\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\CapturaDoSistema\getPCInfo2.vbs"

:: Executa o primeiro arquivo VBScript
cscript //nologo %vbsFilePath1%

:: Verifica se o primeiro script foi executado com sucesso
if %errorlevel% neq 0 (
    echo Erro ao executar %vbsFilePath1%
    exit /b %errorlevel%
)

:: Executa o segundo arquivo VBScript
cscript //nologo %vbsFilePath2%

:: Verifica se o segundo script foi executado com sucesso
if %errorlevel% neq 0 (
    echo Erro ao executar %vbsFilePath2%
    exit /b %errorlevel%
)

:: Fecha automaticamente a janela do prompt de comando após executar os dois arquivos
exit
