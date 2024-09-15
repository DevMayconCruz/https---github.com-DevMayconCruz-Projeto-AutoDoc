@echo off
:: Define o caminho para o arquivo VBScript
set vbsFilePath="\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\CapturaDoSistema\getPCInfo.vbs"

:: Executa o arquivo VBScript
cscript //nologo %vbsFilePath%

:: Fecha automaticamente a janela do prompt de comando
exit
