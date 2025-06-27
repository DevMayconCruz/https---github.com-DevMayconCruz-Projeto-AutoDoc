/**
 * @fileoverview
 * ódigo proprietário da Gramado Parks, protegido contra alterações e redistribuição não autorizadas.
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
 * w
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
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar o EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar o diretório público para servir arquivos estáticos
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'img')));
app.use('/img', express.static('\\\\Gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\img'));

// Função para obter o caminho do arquivo informacoes.txt
function getUserInfoFilePath() {
    return '\\\\gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\CapturaDoSistema\\informacoes.txt';
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
            continue;
        }

        if (collecting) {
            if (trimmedLine.startsWith(endMarker)) {
                collecting = false;
                break;
            }
            userBlock.push(line);
        }
    }
    return userBlock.join('\n');
}
function parseUserData(userBlockString) {
    const userData = {
        equipamentos: [],
        outrasInfos: {},
        fonte: null
    };
    
    const lines = userBlockString.split('\n');
    let currentEquipment = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Processar equipamentos normais
        if (line.startsWith('Descritivo:')) {
            const descritivo = line.split(':')[1]?.trim();
            
            // Finalizar equipamento anterior
            if (currentEquipment) {
                userData.equipamentos.push(currentEquipment);
            }
            
            // Verificar se é uma fonte VÁLIDA (com informações subsequentes)
            if (descritivo.toLowerCase() === 'fonte') {
                // Não criar objeto ainda, só se tiver dados
                currentEquipment = null;
            } else {
                // É um equipamento normal
                currentEquipment = { descritivo };
            }
        }
        // Processar fabricante
        else if (line.startsWith('Fabricante:')) {
            const valor = line.split(':')[1]?.trim();
            
            if (currentEquipment) {
                currentEquipment.fabricante = valor;
            } 
            // Se não temos equipamento atual, pode ser uma fonte
            else if (!userData.fonte) {
                userData.fonte = { descritivo: 'fonte', fabricante: valor };
            } else if (userData.fonte) {
                userData.fonte.fabricante = valor;
            }
        }
        // Processar modelo
        else if (line.startsWith('Modelo:')) {
            const valor = line.split(':')[1]?.trim();
            
            if (currentEquipment) {
                currentEquipment.modelo = valor;
            } 
            // Se não temos equipamento atual, pode ser uma fonte
            else if (!userData.fonte) {
                userData.fonte = { descritivo: 'fonte', modelo: valor };
            } else if (userData.fonte) {
                userData.fonte.modelo = valor;
            }
        }
        // Processar número de série
        else if (line.startsWith('Número de Série:') || line.startsWith('Nmero de Srie:')) {
            const valor = line.split(':')[1]?.trim();
            if (currentEquipment) {
                currentEquipment.numeroSerie = valor;
            }
        }
        // Processar outras informações
        else {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                userData.outrasInfos[key] = value;
            }
        }
    });

    // Adicionar o último equipamento processado
    if (currentEquipment) {
        userData.equipamentos.push(currentEquipment);
    }

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
    const formData = req.body;
    const { usuario, email, telefone, tipoUso } = formData;

    if (!usuario) {
        return res.status(400).send('Nome de usuário não fornecido no formulário.');
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const filePath = getUserInfoFilePath();
    fs.readFile(filePath, 'latin1', (err, fileContent) => {
        let userDataBlock = '';
        let parsedUserData = {};
        let fileReadError = null;

        if (err) {
            console.error(`Erro ao ler o arquivo ${filePath}:`, err);
            fileReadError = `Erro ao ler o arquivo de informações (${filePath}). Verifique o caminho e as permissões.`;
        } else {
            const lines = fileContent.split(/\r?\n/);
            userDataBlock = collectUserDataBlock(usuario, lines);

            if (!userDataBlock) {
                console.warn(`Bloco de dados para o usuário '${usuario}' não encontrado em ${filePath}.`);
                fileReadError = `Bloco de dados para o usuário '${usuario}' não encontrado. Verifique o nome de usuário e o conteúdo do arquivo.`;
            } else {
                parsedUserData = parseUserData(userDataBlock);
            }
        }

        res.render('formularios', {
            ...formData,
            dataAtual,
            userDataBlock,
            parsedUserData,
            fileReadError,
            email: email || '',
            telefone: telefone || '',
            tipoUso: tipoUso || 'P',
            cpf: formData.cpf || '',
            // Valores padrão para as assinaturas
            assinatura1: "Gramado Parks-T.I",
            assinatura2: "",
            assinatura3: "Gramado Parks-T.I",
            assinatura4: ""
        });
    });
});

// Rota para retornar a data atual
app.get('/getDate', (req, res) => {
    const date = new Date().toLocaleDateString('pt-BR');
    res.json({ data: date });
});

// Endpoint para executar o arquivo batch
app.post('/execute-batch', (req, res) => {
    const batchFilePath = '\\\\gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\Conclusao\\final.bat';

    exec(`"${batchFilePath}"`, { encoding: 'latin1' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar o batch: ${error.message}`);
            const decodedStderr = stderr ? Buffer.from(stderr, 'binary').toString('latin1') : '';
            return res.status(500).send(`Erro ao executar o script batch: ${error.message}. Stderr: ${decodedStderr}`);
        }

        const decodedStdout = stdout ? Buffer.from(stdout, 'binary').toString('latin1') : '';
        const decodedStderr = stderr ? Buffer.from(stderr, 'binary').toString('latin1') : '';

        if (stderr) {
            console.warn(`Stderr (decoded): ${decodedStderr}`);
        }

        console.log(`Stdout (decoded): ${decodedStdout}`);
        res.send('Batch file executed successfully.');
    });
});

// Configuração do transporter de e-mail (CORRIGIDO)
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'termo.equipamentos@gramadoparks.com',
        pass: 'heerbrxuraixpefx'
    }
});


// Função para gerar PDF a partir do HTML renderizado
async function generatePDFFromHTML(htmlContent, outputPath) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
       
        // Força a aplicação de estilos que removem o "box" do container.
        // O !important garante que estas regras tenham prioridade máxima.
        await page.addStyleTag({ content: `
            body {
                padding: 0 !important;
                margin: 0 !important;
            }
            .container {
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
            .docusign-container {
                display: none !important;
            }
            .signature-line {
                border-bottom: 1px solid #333 !important;
                height: 80px !important;
                width: 300px !important;
                margin: 10px auto !important;
                background-size: contain !important;
                background-repeat: no-repeat !important;
                background-position: center bottom !important;
            }
        `});
       

        await page.emulateMediaType('print'); // Mantemos isso por segurança
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true, 
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });
        
        console.log(`PDF gerado com sucesso: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Endpoint para envio de e-mail
app.post('/enviar-email', async (req, res) => {
    try {
        const { 
            email, 
            nome, 
            unidade, 
            setor, 
            usuario, 
            telefone, 
            cpf, 
            rg, 
            cnpj, 
            tipoUsuario, 
            tipoUso, 
            assinatura1, 
            assinatura2,
            assinatura3,
            assinatura4
        } = req.body;

        if (!email || !nome || !unidade || !assinatura2 || !assinatura4) {
            return res.status(400).send('Dados obrigatórios não fornecidos (email, nome, unidade, assinatura do Colaborador/Prestador de Serviço e assinatura do Gestor)');
        }

        // Renderizar o formulário EJS com os dados
        const htmlContent = await new Promise(async (resolve, reject) => {
            const filePath = getUserInfoFilePath();
            let userDataBlock = "";
            let parsedUserData = {};
            let fileReadError = null;

            try {
                const fileContent = await fs.promises.readFile(filePath, "latin1");
                const lines = fileContent.split(/\r?\n/);
                userDataBlock = collectUserDataBlock(usuario, lines);

                if (!userDataBlock) {
                    console.warn(`Bloco de dados para o usuário '${usuario}' não encontrado em ${filePath}.`);
                    fileReadError = `Bloco de dados para o usuário '${usuario}' não encontrado.`;
                } else {
                    parsedUserData = parseUserData(userDataBlock);
                }
            } catch (err) {
                console.error(`Erro ao ler o arquivo ${filePath}:`, err);
                fileReadError = `Erro ao ler o arquivo de informações (${filePath}). Verifique o caminho e as permissões.`;
            }
         
           // Bloco para imagem/logo pdf
let logoBase64 = '';
try {
    // Caminho para a imagem, o mesmo que você usa no express.static
    const logoPath = '\\\\Gpk-fs02\\Publico\\TI\\Projeto-AutoDocServidor\\img\\gpk.png';
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
} catch (logoErr) {
    console.error('Erro ao ler o arquivo do logo:', logoErr);
}
            app.render("formularios", {
                ...req.body,
                usuario: usuario,
                dataAtual: new Date().toLocaleDateString("pt-BR"),
                userDataBlock: userDataBlock,
                parsedUserData: parsedUserData,
                fileReadError: fileReadError,
                // Passar as assinaturas para o template
                assinatura1: assinatura1 || "Gramado Parks-T.I",
                assinatura2: assinatura2 || "",
                assinatura3: assinatura3 || "Gramado Parks-T.I",
                assinatura4: assinatura4 || "",
                isPdfGeneration: true,
                 logoDataUri: logoBase64 // <-- ADICIONE ESTA LINHA
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Criar diretório para PDFs se não existir
        const pdfDir = path.join(__dirname, 'generated_pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        // Gerar PDFs
        const timestamp = Date.now();
        const pdfPath1 = path.join(pdfDir, `termo_empresa_${timestamp}.pdf`);
        const pdfPath2 = path.join(pdfDir, `termo_${nome.replace(/\s+/g, '_')}_${unidade.replace(/\s+/g, '_')}_${timestamp}.pdf`);

        const pdfGenerated1 = await generatePDFFromHTML(htmlContent, pdfPath1);
        const pdfGenerated2 = await generatePDFFromHTML(htmlContent, pdfPath2);

        if (!pdfGenerated1 || !pdfGenerated2) {
            return res.status(500).send('Erro ao gerar PDFs');
        }

        // Configurar o e-mail
        const mailOptions = {
            from: 'termo.equipamentos@gramadoparks.com',
            to: `${email};termo.equipamentos@gramadoparks.com`,
            subject: `Termo de Cessão, Guarda, Uso e Devolução de Equipamento - ${nome} - ${unidade}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #1B4D3E; margin-bottom: 10px;">📋 Termo de Cessão, Guarda, Uso e Devolução de Equipamento</h2>
                        <p style="color: #666; font-size: 14px;">Documento assinado digitalmente</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">ℹ️ Informações do Colaborador</h3>
                        <p><strong>Nome:</strong> ${nome}</p>
                        <p><strong>Unidade:</strong> ${unidade}</p>
                        <p><strong>Setor:</strong> ${setor}</p>
                        <p><strong>E-mail:</strong> ${email}</p>
                        <p><strong>Usuário:</strong> ${usuario}</p>
                    </div>
                    
                    <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin-bottom: 20px;">
                        <h3 style="color: #007bff; margin-top: 0;">✅ Status da Assinatura</h3>
                        <p style="margin-bottom: 10px;">✓ <strong>Colaborador/Prestador:</strong> Assinado digitalmente</p>
                        <p style="margin-bottom: 0;">✓ <strong>Gestor Responsável:</strong> Assinado digitalmente</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                        <p style="margin: 0; color: #856404;">
                            <strong>📎 Anexos:</strong> Os termos assinados estão anexados a este e-mail em formato PDF.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 12px; margin: 0;">
                            Este documento foi gerado automaticamente pelo sistema de gestão de equipamentos da Gramado Parks.
                        </p>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
                            Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                        </p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Termo_Empresa_${nome.replace(/\s+/g, '_')}_${unidade.replace(/\s+/g, '_')}.pdf`,
                    path: pdfPath1
                },
                {
                    filename: `Termo_${nome.replace(/\s+/g, '_')}_${unidade.replace(/\s+/g, '_')}.pdf`,
                    path: pdfPath2
                }
            ]
        };

        // Enviar o e-mail
        await emailTransporter.sendMail(mailOptions);
        
        console.log(`E-mail enviado com sucesso para: ${email}`);
        res.status(200).send('E-mail enviado com sucesso!');

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).send('Erro interno do servidor ao enviar e-mail.');
    }
});

// Inicializar o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://192.168.56.1:${port}`);
    console.log(`Sistema de Termo de Cessão, Guarda, Uso e Devolução de Equipamento`);
    console.log(`Versão com assinatura digital DocuSign no formulário de adesão`);
});

