const express = require('express');
const path = require('path');

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

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
