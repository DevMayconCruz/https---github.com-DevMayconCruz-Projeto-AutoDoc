const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Configurar o diretório público para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'img')));

// Roteamento para arquivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Boas-Vindas.html'));
});

app.get('/dados-colaborador', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dados-colaborador.html'));
});

app.get('/formularios', (req, res) => {
    res.sendFile(path.join(__dirname, 'formularios.html'));
});

app.get('/normas-glpd', (req, res) => {
    res.sendFile(path.join(__dirname, 'normasGLPD.html'));
});

// Endpoint para executar o arquivo batch
app.get('/execute-batch', (req, res) => {
    const batchPath = path.join('C:','Projeto-AutoDocServidor', 'CapturaDoSistema', 'executarVBS.bat');
    exec(`"${batchPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error}`);
            return res.status(500).send('Erro ao executar o script.');
        }
        console.log(`Saída: ${stdout}`);
        console.error(`Erro padrão: ${stderr}`);
        res.send('Script executado com sucesso.');
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
