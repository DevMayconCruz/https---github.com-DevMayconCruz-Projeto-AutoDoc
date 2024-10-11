/**
 * Autor Maycon Cruz
 * Este código pertence à Gramado Parks e não pode ser modificado ou distribuído.
 * Eu resolvi criar as variáveis, métodos, funções e endpoints entre outros em inglês.
 * Peço que continuem programando assim nas atualizações para manter a consistência do
 * código e não ferir o conceito de código limpo.
 * Resumo do Código:
 *
 * Rota /informacoes-usuario: Lê um arquivo de texto e retorna informações do usuário.
 * Função parseUserData: Analisa os dados do usuário a partir das linhas do arquivo.
 * Serviço de Arquivos Estáticos: Configura diretórios públicos para servir arquivos estáticos.
 * Middleware bodyParser: Analisa o corpo das solicitações.
 * Rota Raiz /: Serve um arquivo HTML de boas-vindas.
 * Outras Rotas: Servem páginas HTML específicas.
 * Rota /informacoes-pc: Lê um arquivo de texto e retorna informações do PC e monitores.
 * Função parseData: Analisa os dados do arquivo TXT.
 * Rota /executar-batch: Executa um arquivo batch e retorna o resultado.
 * Servidor: Inicia o servidor na porta 3000 e escuta em todas as interfaces de rede.
 *
 * URLs Principais
Página de Boas-Vindas
URL: http://172.16.8.44:3000/

Página de Normas GLPD
URL: http://172.16.8.44:3000/normas-glpd

Página de Dados do Colaborador
URL: http://172.16.8.44:3000/dados-colaborador

Página de Formulários
URL: http://172.16.8.44:3000/formularios

Informações do Usuário
URL: http://172.16.8.44:3000/getUser

Data Atual
URL: http://172.16.8.44:3000/getDate

Informações do PC e Monitores
URL: http://172.16.8.44:3000/getPCInfo

Executar Arquivo Batch
URL: http://172.16.8.44:3000/execute-batch

 */
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const port = 3000;

// Função para obter o caminho do arquivo informacoes.txt do diretório do usuário
function getUserInfoFilePath() {
    const userProfile = process.env.USERPROFILE; // Obtém o perfil do usuário atual
    return path.join(userProfile, 'Documents', 'informacoes.txt'); // Constrói o caminho completo
}

// Rota para retornar informações do usuário
app.get('/getUser', (req, res) => {
    const filePath = getUserInfoFilePath(); // Usa a função para obter o caminho do arquivo

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo');
        }

        const lines = data.split('\n');
        const userData = parseUserData(lines);
        res.json(userData);
    });
});

// Função para analisar os dados do usuário
function parseUserData(lines) {
    let userData = {
        usuario: 'Desconhecido'
    };

    lines.forEach(line => {
        if (line.startsWith('UsuarioLogado:')) {
            userData.usuario = line.split(':')[1]?.trim() || 'Desconhecido';
        }
    });

    return userData;
}

// Rota para retornar a data atual
app.get('/getDate', (req, res) => {
    const date = new Date().toLocaleDateString('pt-BR');
    res.json({ data: date });
});

// Configurar o diretório público para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'img')));
app.use('/img', express.static('\\\\Gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\img'));

// Use o middleware bodyParser para analisar o corpo da solicitação
app.use(bodyParser.json());

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
    const filePath = getUserInfoFilePath(); // Usa a função para obter o caminho do arquivo

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
app.post('/execute-batch', (req, res) => {
    const batchFilePath = '\\\\Gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\Conclusao\\final.bat';

    exec(`"${batchFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar o batch: ${error.message}`);
            return res.status(500).send('Erro ao executar o script batch.');
        }

        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send('Erro no script batch.');
        }

        console.log(`Stdout: ${stdout}`);
        res.send('Batch file executed successfully.');
    });
});

// Serve arquivos estáticos
app.use(express.static('public'));

// Rota para obter o nome do usuário logado do arquivo txt
app.get('/getLoggedUser', (req, res) => {
    const filePath = getUserInfoFilePath(); // Usa a função para obter o caminho do arquivo

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).send('Erro ao ler o arquivo.');
        }

        // Extrair o nome do usuário logado (assumindo que está no formato "UsuarioLogado: maycon.cruz")
        const match = data.match(/UsuarioLogado:\s*(\S+)/);
        const loggedUser = match ? match[1] : 'Usuário não encontrado';

        res.json({ loggedUser });
    });
});

// Iniciar o servidor escutando em todas as interfaces de rede (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em  http://172.16.8.44:${port}`);
});
