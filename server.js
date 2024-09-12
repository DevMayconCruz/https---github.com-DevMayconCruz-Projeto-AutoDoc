const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
// Configurar o diretório público para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'img')));

app.use('/img', express.static('C:/Projeto-AutoDocServidor/img'));


// Use o middleware bodyParser para analisar o corpo da solicitação
app.use(bodyParser.json());

// Serve arquivos estáticos do diretório especificado
app.use(express.static('C:\\Users\\maycon.cruz.GPK\\Desktop\\TesteJS'));

// Serve o arquivo HTML de Boas-Vindas na rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Boas-Vindas.html'));
});

// Rota para a página de normas GLPD
app.get('/normas-glpd', (req, res) => {
    res.sendFile(path.join(__dirname, 'normasGLPD.html'));
});

// Rota para a página de dados do colaborador
app.get('/dados-colaborador', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dados-colaborador.html'));
});

// Rota para a página de formulários
app.get('/formularios', (req, res) => {
    res.sendFile(path.join(__dirname, 'formularios.html'));
});

// Rota para retornar informações do PC e monitores
app.get('/getPCInfo', (req, res) => {
    const filePath = path.join('C:\\', 'Projeto-AutoDocServidor', 'CapturaDoSistema', 'pcInfo.txt');
    
    // Garantir que o arquivo seja lido como UTF-8
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo');
        }
        
        const lines = data.split('\n');
        const equipmentData = parseData(lines);
        res.json(equipmentData);
    });
});

// Função para analisar os dados do arquivo TXT
// ... [código existente]

function parseData(lines) {
    const data = [];
    let currentItem = {};

    lines.forEach(line => {
        line = line.trim(); 
        
        console.log(`Analisando linha: ${line}`);
        
        if (line.startsWith('Descritivo:')) {
            if (Object.keys(currentItem).length > 0) {
                data.push(currentItem);
            }
            currentItem = { type: line.includes('Monitor') ? 'Monitor' : 'PC' };
            currentItem.descriptive = line.split(':')[1]?.trim() || 'Desconhecido';
        } else if (line.startsWith('Fabricante:')) {
            currentItem.brand = line.split(':')[1]?.trim() || 'Desconhecido';
        } else if (line.startsWith('Modelo:')) {
            currentItem.model = line.split(':')[1]?.trim() || 'Desconhecido';
        } else if (line.startsWith('Número de Série:') || line.startsWith('N�mero de S�rie:')) {
            currentItem.serial = line.split(':')[1]?.trim() || 'Desconhecido';
        }
    });

    if (Object.keys(currentItem).length > 0) {
        data.push(currentItem);
    }
    
    console.log('Dados analisados:', data);
    return data;
}



// Endpoint para executar o arquivo batch
app.get('/execute-batch', (req, res) => {
    const batchPath = path.join('C:', 'Projeto-AutoDocServidor', 'CapturaDoSistema', 'executarVBS.bat');
    
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
