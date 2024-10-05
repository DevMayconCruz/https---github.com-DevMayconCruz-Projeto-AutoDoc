Set objShell = CreateObject("WScript.Shell")

' Aguardar 7 segundos (7000 milissegundos)
WScript.Sleep 7000

' Executar o próximo arquivo HTA
objShell.Run "\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\Final.hta", 1, false
