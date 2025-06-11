/**
 * @fileoverview
 * Código proprietário da Gramado Parks, protegido contra alterações e redistribuição não autorizadas.
 * 
 * @author Maycon Cruz
 * 
 * @description
 * Implementa a API para manipulação de formulários e execução de scripts batch, com
 * endpoints para recepção de dados, processamento e renderização dinâmica, 
 * seguindo padrões consistentes de nomenclatura e organização (em inglês) para garantir
 * legibilidade e manutenção alinhadas ao Clean Code.
 * 
 * @note
 * Recomenda-se manter o padrão inglês para variáveis, funções, métodos e endpoints
 * nas futuras atualizações, preservando a consistência e integridade do código.
 * 
 * @routes
 * - POST /formularios
 *     Recebe dados do formulário, lê o arquivo `informacoes.txt`, filtra registros pelo usuário
 *     informado e renderiza a view `formularios.ejs` com os dados combinados.
 * 
 * - GET /
 *     Renderiza a página inicial de boas-vindas.
 * 
 * - GET /executar-batch
 *     Executa um arquivo batch no servidor e retorna o resultado da execução.
 * 
 * - Outras rotas GET
 *     Servem páginas HTML específicas conforme a necessidade.
 * 
 * @functions
 * - collectUserDataBlock(userId: string): string
 *     Extrai do arquivo `informacoes.txt` o bloco bruto de dados correspondente ao usuário informado.
 * 
 * - parseUserData(rawData: string): Object
 *     Converte o bloco de texto extraído em estrutura de dados utilizável pela aplicação.
 * 
 * @middlewares
 * - bodyParser
 *     Interpreta corpos de requisições HTTP com dados JSON ou URL-encoded.
 * 
 * @staticFiles
 *     Configura diretórios públicos para servir arquivos estáticos (CSS, scripts, imagens).
 * 
 * @server
 *     Inicializa o servidor HTTP na porta 3000, escutando em todas as interfaces de rede disponíveis.
 */

const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const port = 3000;

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true })); // Use extended: true for potentially complex form data
app.use(bodyParser.json());

// Configurar o EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Certifique-se de que o diretório 'views' existe e contém formularios.ejs

// Configurar o diretório público para servir arquivos estáticos (CSS, JS, Imagens do HTML/EJS)
// Adicione outros diretórios se necessário
app.use(express.static(__dirname)); // Serve arquivos do diretório raiz (como Dados-colaborador.html)
app.use(express.static(path.join(__dirname, 'public'))); // Exemplo: se tiver uma pasta 'public'
app.use(express.static(path.join(__dirname, 'img'))); // Para imagens locais referenciadas
app.use('/img', express.static('\\\\Gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\img')); // Para imagens na rede

// Função para obter o caminho do arquivo informacoes.txt em um caminho de rede fixo
function getUserInfoFilePath() {
    return '\\\\gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\CapturaDoSistema\\informacoes.txt'; // Caminho de rede fixo
}



// Função para extrair o BLOCO de texto bruto do usuário especificado
function collectUserDataBlock(usuario, lines) {
    const userBlock = [];
    let collecting = false;
    const startMarker = `UsuarioLogado: ${usuario}`;
    const endMarker = `FimDeColetaDeDadosDe: ${usuario}`;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith(startMarker)) {
            collecting = true;
            // Não incluir a linha do marcador inicial no bloco,
            // userBlock.push(line);
            continue; // Pula para a próxima linha
        }

        if (collecting) {
            if (trimmedLine.startsWith(endMarker)) {
                collecting = false;
                // Não incluir a linha do marcador final no bloco, 
                // userBlock.push(line);
                break; // Encontrou o fim do bloco do usuário
            }
            // Adiciona a linha atual ao bloco do usuário
            userBlock.push(line);
        }
    }
    // Retorna as linhas como um único texto ou array, dependendo de como será usado no EJS
    return userBlock.join('\n'); // Retorna como string única com quebras de linha
}

// Função para analisar os dados DENTRO do bloco do usuário (exemplo)
// Adapte esta função conforme a estrutura exata dos dados que você precisa extrair do bloco
function parseUserData(userBlockString) {
    const userData = {
        equipamentos: [],
        outrasInfos: {}
        // Adicione outras estruturas conforme necessário
    };
    const lines = userBlockString.split('\n');
    let currentEquipment = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return; // Ignora linhas vazias

        if (line.startsWith('Descritivo:')) {
            if (currentEquipment) {
                userData.equipamentos.push(currentEquipment);
            }
            currentEquipment = { descritivo: line.split(':')[1]?.trim() };
        } else if (currentEquipment) {
            if (line.startsWith('Fabricante:')) {
                currentEquipment.fabricante = line.split(':')[1]?.trim();
            } else if (line.startsWith('Modelo:')) {
                currentEquipment.modelo = line.split(':')[1]?.trim();
            } else if (line.startsWith('Número de Série:') || line.startsWith('Nmero de Srie:')) {
                 // Tratar possível problema de encoding no marcador também
                currentEquipment.numeroSerie = line.split(':')[1]?.trim();
            }
            // Adicione outras extrações de dados do equipamento aqui
        } else {
            // Processar outras linhas que não são de equipamento, se houver
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().replace(/\[/g, '').replace(/\]/g, ''); // Limpa chave se necessário
                const value = parts.slice(1).join(':').trim();
                userData.outrasInfos[key] = value;
            }
        }
    });

    // Adiciona o último equipamento processado
    if (currentEquipment) {
        userData.equipamentos.push(currentEquipment);
    }

    console.log('Dados parseados do bloco:', JSON.stringify(userData, null, 2));
    return userData;
}

// --- ROTAS HTML --- 

// Rota Raiz - Boas Vindas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Boas-Vindas.html'));
});

// Rota para a página de normas GLPD
app.get('/normas-glpd', (req, res) => {
    res.sendFile(path.join(__dirname, 'normasGLPD.html'));
});

// Rota para a página Dados-colaborador.html (GET)
app.get('/dados-colaborador', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dados-colaborador.html'));
});

// --- ROTA PRINCIPAL PARA PROCESSAR FORMULÁRIO E DADOS DO TXT ---

app.post('/formularios', (req, res) => {
    // 1. Obter dados do formulário
    const formData = req.body;
    const { usuario, email, telefone, tipoUso } = formData; // Pega o usuário e os novos campos informados no form

    if (!usuario) {
        return res.status(400).send('Nome de usuário não fornecido no formulário.');
    }

    // 2. Obter a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // 3. Ler e filtrar o arquivo informacoes.txt
    const filePath = getUserInfoFilePath();
    // Tentar ler com 'latin1' devido ao erro de encoding UTF-8. Ajuste se necessário (ex: 'cp1252')
    fs.readFile(filePath, 'latin1', (err, fileContent) => {
        let userDataBlock = ''; // Bloco de texto bruto do usuário
        let parsedUserData = {}; // Dados estruturados após parse
        let fileReadError = null;

        if (err) {
            console.error(`Erro ao ler o arquivo ${filePath}:`, err);
            fileReadError = `Erro ao ler o arquivo de informações (${filePath}). Verifique o caminho e as permissões.`;
            // Continuar mesmo com erro para renderizar o formulário, mas indicar o problema
        } else {
            const lines = fileContent.split(/\r?\n/); // Divide por quebra de linha Windows/Unix
            userDataBlock = collectUserDataBlock(usuario, lines);

            if (!userDataBlock) {
                console.warn(`Bloco de dados para o usuário '${usuario}' não encontrado em ${filePath}.`);
                fileReadError = `Bloco de dados para o usuário '${usuario}' não encontrado. Verifique o nome de usuário e o conteúdo do arquivo.`;
                // Bloco não encontrado, mas continuar para renderizar o form
            } else {
                 // Opcional: Fazer o parse do bloco se precisar dos dados estruturados no EJS
                 parsedUserData = parseUserData(userDataBlock);
            }
        }

        // 4. Renderizar o template EJS
        // Passar os dados do formulário, a data, o bloco de texto bruto e/ou os dados parseados
        res.render('formularios', {
            // Dados do formulário
            ...formData, // Passa todos os campos do formulário (nome, cpf, rg, etc.)
            // Data
            dataAtual,
            // Dados do arquivo TXT (escolha como passar para o EJS)
            userDataBlock: userDataBlock, // Passa o bloco de texto bruto
            parsedUserData: parsedUserData, // Passa os dados já parseados (se o parse foi feito)
            // Informação sobre erros
            fileReadError: fileReadError,
            // Novos campos específicos
            email: email || '',
            telefone: telefone || '',
            tipoUso: tipoUso || 'P' // Padrão para Permanente se não for especificado
        });
    });
});


// Rota antiga para retornar informações do usuário (pode ser removida se não usada diretamente pelo frontend)
/*
app.post('/getUserData', (req, res) => {
    const { usuario } = req.body;
    const filePath = getUserInfoFilePath();

    fs.readFile(filePath, 'latin1', (err, data) => { // Usar latin1
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo');
        }
        const lines = data.split(/\r?\n/);
        const userBlock = collectUserDataBlock(usuario, lines);
        if (!userBlock) {
             return res.status(404).json({ error: `Usuário '${usuario}' não encontrado.` });
        }
        // Decidir se retorna o bloco bruto ou parseado
        const parsedData = parseUserData(userBlock);
        res.json(parsedData); // Exemplo: retorna dados parseados
    });
});
*/

// Rota para retornar a data atual (se usada pelo frontend)
app.get('/getDate', (req, res) => {
    const date = new Date().toLocaleDateString('pt-BR');
    res.json({ data: date });
});

// Rota para retornar informações do PC e monitores 
// Esta rota parece ler o *mesmo* arquivo informacoes.txt mas usa uma função parseData diferente
// e não filtra por usuário. Avaliar se deve ser mantida, removida ou integrada.
/*
app.get('/getPCInfo', (req, res) => {
    const filePath = getUserInfoFilePath();
    fs.readFile(filePath, 'latin1', (err, data) => { // Usar latin1
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo');
        }
        const lines = data.split(/\r?\n/);
        const equipmentData = parseData(lines); // CUIDADO: parseData original não filtra por usuário
        res.json(equipmentData);
    });
});

// Função parseData original 
function parseData(lines) {
    // ... (código original da função parseData)
    // Esta função lia o arquivo inteiro sem filtro de usuário.
}
*/

// Endpoint para executar o arquivo batch
app.post('/execute-batch', (req, res) => {
    // ATENÇÃO: Verifique se este caminho está correto e acessível pelo servidor Node.js
    const batchFilePath = '\\\\gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\Conclusao\\final.bat';

    exec(`"${batchFilePath}"`, { encoding: 'latin1' }, (error, stdout, stderr) => { // Especificar encoding para saída do batch
        if (error) {
            console.error(`Erro ao executar o batch: ${error.message}`);
            // Tentar decodificar stderr com latin1 também
            const decodedStderr = stderr ? Buffer.from(stderr, 'binary').toString('latin1') : '';
            console.error(`Stderr (raw): ${stderr}`);
            console.error(`Stderr (decoded): ${decodedStderr}`);
            return res.status(500).send(`Erro ao executar o script batch: ${error.message}. Stderr: ${decodedStderr}`);
        }

        // Tentar decodificar stdout e stderr com latin1
        const decodedStdout = stdout ? Buffer.from(stdout, 'binary').toString('latin1') : '';
        const decodedStderr = stderr ? Buffer.from(stderr, 'binary').toString('latin1') : '';

        if (stderr) {
            console.warn(`Stderr (decoded): ${decodedStderr}`);
            // Decidir se stderr deve ser tratado como erro dependendo do batch
        }

        console.log(`Stdout (decoded): ${decodedStdout}`);
        res.send('Batch file executed successfully.');
    });
});

// Rota antiga para obter o nome do usuário logado (REMOVER - lógica agora em /formularios)
/*
app.get('/getLoggedUser', (req, res) => {
    const filePath = getUserInfoFilePath();
    fs.readFile(filePath, 'latin1', (err, data) => { // Usar latin1
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).send('Erro ao ler o arquivo.');
        }
        const match = data.match(/UsuarioLogado:\s*(\S+)/);
        const loggedUser = match ? match[1] : 'Usuário não encontrado';
        res.json({ loggedUser });
    });
});
*/

// Iniciar o servidor escutando em todas as interfaces de rede (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port} e acessível na rede local (ex: http://192.168.0.34:${port})`);
});
