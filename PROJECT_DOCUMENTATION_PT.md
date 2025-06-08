# Documentação do Projeto: AutoDoc Gramado Parks

## 1. Introdução

Este documento fornece uma visão geral abrangente do sistema AutoDoc Gramado Parks. O projeto automatiza o processo de geração e assinatura de termos de cessão de equipamentos para funcionários e prestadores de serviço. Envolve scripts do lado do cliente para coletar dados de inventário de PCs, uma interface web para entrada de dados do usuário e exibição do termo, e um backend Node.js para gerenciar os dados e gerar o documento final do termo.

## 2. Versão do Projeto

-   **Nome**: `my-express-app` (Observação: Este parece ser um nome placeholder da configuração inicial do `package.json` e pode não refletir o nome verdadeiro do projeto.)
-   **Versão**: `1.0.0`

*(Extraído do `package.json`)*

## 3. Tecnologias Utilizadas

-   **Linguagens de Programação:**
    -   JavaScript (Client-side para HTML/EJS/HTA; Server-side para Node.js)
    -   VBScript (Client-side para interações HTA, coleta de informações do sistema via WMI, operações de arquivo)
    -   Batch Scripting (Client-side para orquestrar a execução de VBScript e gerenciamento de processos)
-   **Frameworks & Ambientes:**
    -   Node.js (Ambiente de execução JavaScript server-side)
    -   Express.js (Framework de aplicação web para Node.js)
    -   HTML Application (HTA) (Tecnologia Windows para aplicações baseadas em HTML com acesso a scripts)
-   **Mecanismos de Template:**
    -   EJS (Embedded JavaScript templating) (Geração de HTML server-side)
-   **Bibliotecas & APIs Chave (Node.js/JavaScript):**
    -   `express`
    -   `body-parser`
    -   `ejs`
    -   Módulos embutidos do Node.js: `path`, `child_process`, `fs`, `os` (importado)
-   **Tecnologias Client-Side (Browser/HTA):**
    -   HTML
    -   CSS
    -   DOM API
    -   Fetch API
-   **Tecnologias Específicas do Windows (via VBScript/Batch):**
    -   WMI (Windows Management Instrumentation)
    -   Windows Script Host (WSH)
    -   Linha de Comando do Windows/Comandos Batch

## 4. Dependências

*(Do `package.json`)*

-   **Dependências:**
    -   `body-parser`: `^1.20.2`
    -   `ejs`: `^3.1.10`
    -   `express`: `^4.21.1`
    -   `express-session`: `^1.18.1` (Observação: Listado no `package.json` mas não ativamente usado na lógica do `server.js`)
-   **DevDependencies:**
    -   `jest`: `^29.7.0` (Para testes, configurado mas nenhum teste mostrado na análise)

## 5. Análise de Requisitos

### Requisitos Funcionais:

**Interação do Usuário & Submissão de Formulário:**
-   **RF1:** O sistema fornece uma interface web para os usuários iniciarem o processo de geração do termo de equipamento.
-   **RF2:** Os usuários devem aceitar os termos da LGPD e de uso do equipamento antes de prosseguir.
-   **RF3:** Os usuários devem submeter um formulário com seus detalhes pessoais/profissionais (Nome, Nome de Usuário, Tipo de Usuário, CPF/CNPJ, RG, Tel, Unidade, Setor, Cargo, Email, Observação).
-   **RF4:** O sistema valida os números de CPF/CNPJ submetidos (validação básica).
-   **RF5:** O sistema exibe animações de carregamento durante o processamento.
-   **RF6:** O sistema gera e exibe um termo de cessão de equipamento formatado com dados do usuário, inventário do PC e data/hora atual.
-   **RF7 (Pretendido mas Quebrado):** Os usuários deveriam acionar o envio do termo gerado por email.

**Coleta de Dados Client-Side (HTA/VBS/Batch):**
-   **RF8:** HTA inicial (`final..hta`) é lançado no login do usuário para solicitar a assinatura do termo.
-   **RF9:** HTA inicial exibe um temporizador de contagem regressiva (ex: 10 min); faz logoff do usuário ao expirar.
-   **RF10:** "Assinar Termos" no HTA aciona um script batch (`CapturaDoSistema/executarVBS.bat`).
-   **RF11:** Script batch executa VBScripts (`getPCInfo.vbs`, `getPCInfo2.vbs`) para coleta de informações do sistema.
-   **RF12:** VBScripts coletam informações do PC: Nome de usuário logado, data, Tipo de PC, Fabricante, Modelo, N/S.
-   **RF13:** VBScripts coletam detalhes dos monitores conectados: Fabricante, Modelo, N/S.
-   **RF14:** Informações coletadas são anexadas ao `informacoes.txt` em um compartilhamento de rede, com marcadores de início/fim específicos do usuário.
-   **RF15:** HTA inicial lança um navegador web para a página inicial da aplicação.

**Processamento Backend:**
-   **RF16:** Servidor recebe dados do usuário via formulário web (POST `/formularios`).
-   **RF17:** Servidor lê o arquivo `informacoes.txt` do compartilhamento de rede.
-   **RF18:** Servidor analisa `informacoes.txt` para extrair o bloco de dados do usuário relevante.
-   **RF19:** Servidor renderiza um template EJS (`views/formularios.ejs`) com dados combinados do formulário e do equipamento.
-   **RF20 (Pretendido mas Quebrado):** Servidor fornece um endpoint (`/execute-batch`) para acionar `Conclusao/final.bat`.
-   **RF21:** Servidor serve páginas HTML estáticas (Boas-vindas, LGPD, Entrada de Dados).
-   **RF22:** Servidor fornece um endpoint para a data atual (`/getDate`).

**Finalização Client-Side (Pretendido mas Quebrado/Parcialmente Implementado):**
-   **RF23:** `Conclusao/final.bat` lida com tarefas client-side pós-geração do termo.
-   **RF24:** Script batch aciona `Conclusao/final.vbs` para exibir `Conclusao/Final.HTA`.
-   **RF25:** `Conclusao/Final.HTA` fornece um botão "Concluir" para fechar instâncias HTA.

### Requisitos Não Funcionais:

**Sistema & Ambiente:**
-   **RNF1:** Aplicação acessível na rede local (usa IPs locais codificados).
-   **RNF2:** Scripts client-side requerem um ambiente Windows.
-   **RNF3:** Depende de um compartilhamento de arquivos de rede para `informacoes.txt` e alguns ativos.
-   **RNF4:** Backend Node.js/Express.js.
-   **RNF5:** EJS para templates server-side.

**Dados & Usabilidade:**
-   **RNF6:** Integridade dos dados entre a saída do script (`informacoes.txt` como UTF-16 LE) e o processamento do servidor (lido como `latin1`) deve ser garantida.
-   **RNF7:** Interface do usuário em Português (BR).
-   **RNF8:** Sistema guia o usuário através do processo de assinatura do termo.
-   **RNF9:** Feedback visual (telas de carregamento) para operações longas.
-   **RNF10:** `informacoes.txt` suporta anexos concorrentes.
-   **RNF11:** Preferência por convenções de nomenclatura em inglês no código para manutenibilidade.

**Confiabilidade & Tratamento de Erros:**
-   **RNF12:** Verificação básica de erros em scripts client-side.
-   **RNF13:** Servidor trata erros de leitura de arquivo para `informacoes.txt` de forma elegante.
-   **RNF14:** Sistema previne múltiplas execuções de ações críticas quando apropriado.

**Segurança (Implícito):**
-   **RNF15:** Timeout do HTA leva ao logoff do usuário (medida de segurança).
-   **RNF16:** Conformidade declarada com a LGPD para dados pessoais.

## 6. Fluxograma da Aplicação

```mermaid
graph TD
    subgraph Client Machine (Windows Environment)
        A[Usuário Loga no Windows] --> B_HTA_INIT(HTA: final..hta Lançado);
        B_HTA_INIT -- Usuário Clica "Assinar Termos" --> C_BAT_EXEC(BAT: CapturaDoSistema/executarVBS.bat);
        C_BAT_EXEC --> D_VBS_GETINFO1(VBS: CapturaDoSistema/getPCInfo.vbs);
        D_VBS_GETINFO1 -- Anexa em --> F_FILE_INFO(TXT: \\NetworkShare\informacoes.txt);
        C_BAT_EXEC --> E_VBS_GETINFO2(VBS: CapturaDoSistema/getPCInfo2.vbs);
        E_VBS_GETINFO2 -- Anexa em --> F_FILE_INFO;
        B_HTA_INIT -- Lança Browser --> G_BROWSER_WELCOME(BROWSER: Boas-Vindas.html);

        subgraph Client Machine - Finalization (Intended/Broken)
            X_BAT_CONCLUSAO(BAT: Conclusao/final.bat) -- Executa --> Y_VBS_CONCLUSAO(VBS: Conclusao/final.vbs);
            Y_VBS_CONCLUSAO -- Lança --> Z_HTA_FINAL(HTA: Conclusao/Final.HTA);
            Z_HTA_FINAL -- Usuário Clica "Concluir" --> Z1_HTA_CLOSE(System: Fecha Todos os HTAs);
            Z_HTA_FINAL -- Timeout (10 min) --> Z2_USER_LOGOFF(System: Logoff do Usuário);
        end
    end

    subgraph Web Browser (Client Side)
        G_BROWSER_WELCOME -- Usuário Clica "Avançar" --> H_BROWSER_LGPD(BROWSER: normasGLPD.html);
        H_BROWSER_LGPD -- Usuário Aceita Termos & Clica "Avançar" --> I_BROWSER_FORM(BROWSER: Dados-colaborador.html);
        I_BROWSER_FORM -- Usuário Submete Formulário --> J_HTTP_POST_FORM(HTTP POST Request para /formularios);
        K_BROWSER_TERMVIEW(BROWSER: views/formularios.ejs Exibido) -- Usuário Clica "Enviar Termo por E-mail" --> L_JS_SIMULATE_EMAIL(JS: Simula Envio de Email - SEM CHAMADA AO SERVIDOR);
    end

    subgraph Server (Node.js Application)
        J_HTTP_POST_FORM --> M_SERVER_PROCESS(SERVER: server.js trata POST /formularios);
        M_SERVER_PROCESS -- Lê --> F_FILE_INFO;
        M_SERVER_PROCESS -- Analisa Dados & Renderiza EJS --> K_BROWSER_TERMVIEW;

        W_HTTP_EXEC_BATCH(HTTP POST Request para /execute-batch) -.-> X_BAT_CONCLUSAO;
        W_HTTP_EXEC_BATCH{Endpoint Existe};
        style W_HTTP_EXEC_BATCH fill:#fff,stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;
        linkStyle 11 stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;

    end

    %% Estilização para Fluxo Quebrado/Pretendido
    L_JS_SIMULATE_EMAIL -.-> W_HTTP_EXEC_BATCH;
    style L_JS_SIMULATE_EMAIL fill:#fff,stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;
    linkStyle 10 stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;


    %% Legenda/Notas
    Note1[Nota: Linhas tracejadas indicam caminhos pretendidos mas atualmente quebrados ou não operacionais.]
    Note2[Nota: informacoes.txt é UTF-16 LE do VBS, lido como Latin1 pelo Servidor - problema potencial.]
    Note3[Nota: final..hta também tem um timeout de 10 min para logoff do usuário, similar ao Conclusao/Final.HTA.]
```

## 7. Análise Detalhada & Principais Descobertas

### Server-side (`server.js`)
-   Trata requisições HTTP usando Express.js.
-   Serve arquivos HTML estáticos (`Boas-Vindas.html`, `normasGLPD.html`, `Dados-colaborador.html`).
-   Fornece um endpoint principal `POST /formularios` que:
    -   Recebe dados do usuário de `Dados-colaborador.html`.
    -   Lê `informacoes.txt` de um caminho de rede fixo usando codificação `latin1`.
    -   Extrai o bloco de dados de um usuário específico de `informacoes.txt` usando `collectUserDataBlock()`.
    -   Analisa este bloco em dados estruturados (equipamento, outras informações) usando `parseUserData()`.
    -   Renderiza `views/formularios.ejs`, passando os dados combinados do formulário, dados do equipamento analisados, data atual e quaisquer erros de leitura de arquivo.
-   Inclui um endpoint `POST /execute-batch` destinado a executar `Conclusao/final.bat`, mas este não é atualmente chamado pelo fluxo principal da aplicação.
-   Usa EJS como motor de template.
-   Middleware: `bodyParser` para analisar corpos de requisição, `express.static` para servir arquivos estáticos de drives locais e de rede.
-   Nenhum gerenciamento de sessão explícito é implementado; a identificação do usuário depende do campo `usuario` submetido nos formulários.

### Coleta de Dados Client-side (HTAs, VBScripts, Arquivos Batch para `informacoes.txt`)
-   **Iniciação:** O processo começa com `final..hta` (diretório raiz), provavelmente lançado no login do Windows. Este HTA solicita ao usuário para iniciar o processo de assinatura e inclui um temporizador de inatividade/conclusão de 10 minutos que faz logoff do usuário.
-   **Execução de Script:** Clicar em "Assinar Termos" no `final..hta` executa `CapturaDoSistema/executarVBS.bat`.
-   **Coleta de Dados:**
    -   `executarVBS.bat` chama `CapturaDoSistema/getPCInfo.vbs` e `getPCInfo2.vbs` (o conteúdo de `getPCInfo2.vbs` é desconhecido, mas presume-se similar).
    -   `getPCInfo.vbs` usa WMI para coletar:
        -   Detalhes do PC (tipo, fabricante, modelo, número de série).
        -   Detalhes do monitor (fabricante, modelo, número de série para cada).
        -   Nome de usuário atual e data.
    -   Esta informação é anexada como um bloco a `\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\CapturaDoSistema\informacoes.txt`.
    -   **Codificação:** `getPCInfo.vbs` escreve `informacoes.txt` usando **codificação UTF-16 LE**.
-   **Lançamento do Navegador:** `final..hta` também abre o navegador web para a página inicial da aplicação (ex: `http://172.16.8.23:3000/`).

### Interface Web (HTML, EJS)
-   **`Boas-Vindas.html`:** Página de boas-vindas, redireciona para `normasGLPD.html`.
-   **`normasGLPD.html`:** Exibe termos LGPD/uso. Usuário deve marcar caixas para habilitar botão "Avançar", que redireciona para `Dados-colaborador.html`.
-   **`Dados-colaborador.html`:**
    -   Formulário principal para entrada do usuário (nome, nome de usuário, CPF/CNPJ, RG, unidade, setor, etc.).
    -   JavaScript client-side para população dinâmica (setor baseado na unidade), formatação de entrada e validação básica.
    -   Submete dados via `POST` para `/formularios`.
    -   Inclui uma animação de tela de carregamento que, ao concluir, tenta um redirecionamento client-side para `/formularios`, o que é redundante e potencialmente problemático.
-   **`views/formularios.ejs`:**
    -   Página renderizada pelo servidor exibindo o termo final.
    -   Populada com dados da submissão do formulário e do `informacoes.txt` analisado.
    -   Inclui um botão "Enviar Termo por E-mail". **Crucialmente, a função JavaScript `sendEmail()` associada apenas simula o envio de email com uma barra de progresso e NÃO faz uma chamada backend para `/execute-batch`**.
-   **`forms.hta`:** Um arquivo HTA que parece uma versão mais antiga ou alternativa de `views/formularios.ejs`. Ele *inclui* JavaScript para chamar `/execute-batch`. Isso sugere que a intenção original era que a interface web acionasse o script batch final.

### Processo de Finalização/Email (incluindo a quebra de fluxo identificada e erros de script)
-   **Gatilho Pretendido:** O endpoint `POST /execute-batch` no `server.js` é projetado para executar `Conclusao/final.bat`.
-   **Estado Atual:** Este fluxo está **quebrado** porque `views/formularios.ejs` (a página de exibição do termo ativa) não chama `/execute-batch`.
-   **`Conclusao/final.bat`:**
    -   Se fosse executado, destina-se a realizar a limpeza e lançar o HTA final.
    -   **Contém erros de sintaxe VBScript** no início, o que impediria sua execução correta como um arquivo batch.
    -   Tenta executar um `trocarHTA.bat` placeholder (função desconhecida).
    -   Tenta matar processos `mshta.exe`.
    -   Em seguida, executa `Conclusao/final.vbs`.
-   **`Conclusao/final.vbs`:** Este script lança `Conclusao/Final.HTA`.
-   **`Conclusao/Final.HTA`:**
    -   Uma tela final para o usuário, também com um temporizador de logoff de 10 minutos.
    -   Fornece um botão "Concluir" que executa um VBScript para matar todos os processos `mshta.exe` (potencialmente disruptivo se outros HTAs estiverem em uso) e se fecha.
-   **Mecanismo de Envio de Email:** O mecanismo real para enviar um email não é explicitamente detalhado em `Conclusao/final.bat` ou `Conclusao/final.vbs`. É possível que `final.bat` fosse destinado a chamar outro script que realiza a ação de email (ex: usando VBScript para interagir com o Outlook).

## 8. Problemas Identificados & Recomendações

1.  **Fluxo de Email/Finalização Quebrado:**
    *   **Problema:** O botão "Enviar Termo por E-mail" em `views/formularios.ejs` não aciona o endpoint do servidor `POST /execute-batch`. Isso significa que `Conclusao/final.bat` e scripts subsequentes (`Conclusao/final.vbs`, `Conclusao/Final.HTA`) nunca são executados. A funcionalidade de envio de email (se alguma foi pretendida através desses scripts) e a limpeza final do HTA não ocorrem.
    *   **Recomendação:** Modificar a função JavaScript `sendEmail()` em `views/formularios.ejs` para fazer uma chamada `fetch` assíncrona para o endpoint `POST /execute-batch`. Fornecer feedback ao usuário sobre o sucesso/falha desta chamada.

2.  **Incompatibilidade de Codificação para `informacoes.txt`:**
    *   **Problema:** `CapturaDoSistema/getPCInfo.vbs` escreve `informacoes.txt` usando codificação UTF-16 LE. No entanto, `server.js` lê este arquivo usando codificação `latin1`. Isso pode levar à interpretação incorreta de caracteres e corrupção de dados, especialmente se nomes de usuário ou detalhes de hardware contiverem caracteres não-ASCII.
    *   **Recomendação:** Alterar a codificação de leitura de arquivo no `server.js` para `utf16le` ao ler `informacoes.txt`: `fs.readFile(filePath, 'utf16le', (err, fileContent) => { ... });`.

3.  **Erros de Sintaxe em `Conclusao/final.bat`:**
    *   **Problema:** O script contém linhas de sintaxe VBScript (`Set WshShell = ...`, `WshShell.Run ...`) no início, o que causará erros quando executado como um arquivo batch.
    *   **Recomendação:** Remover ou comentar essas linhas VBScript. Se sua funcionalidade for necessária, ela deve ser incorporada em um script `.vbs` separado ou implementada corretamente dentro da lógica batch, se possível.

4.  **Endereços IP e Caminhos Codificados:**
    *   **Problema:** Múltiplos arquivos (`Boas-Vindas.html`, `normasGLPD.html`, `final..hta`, VBScripts, arquivos Batch) usam endereços IP codificados (ex: `172.16.8.23`, `172.16.8.28`) e caminhos de rede (ex: `\\\\Gpk-fs02\\...`). Isso torna a aplicação difícil de implantar em diferentes ambientes ou se os IPs/caminhos do servidor mudarem.
    *   **Recomendação:**
        *   Para redirecionamentos web, use caminhos relativos ou gere URLs dinamicamente no servidor, se possível.
        *   Para configurações do lado do servidor (como caminhos de rede), considere usar variáveis de ambiente ou um arquivo de configuração.
        *   Para scripts do lado do cliente que precisam apontar para o servidor, isso é mais complicado. Se os HTAs são sempre lançados em um ambiente onde o nome do host do servidor é resolvível, use nomes de host em vez de IPs. Caso contrário, uma etapa de configuração ou um pequeno lançador que pode ser configurado pode ser necessário.

5.  **Redirecionamento Client-Side Redundante:**
    *   **Problema:** Em `Dados-colaborador.html`, a função JavaScript `mostrarTelaDeCarregamento()` realiza um `window.location.href = '/formularios'` após a animação de carregamento. Isso é redundante porque o formulário já está configurado para `action="/formularios" method="POST"`. Isso poderia potencialmente levar o formulário a ser submetido como GET se o redirecionamento JS acontecer muito rapidamente ou interromper o POST.
    *   **Recomendação:** Remover a chamada `window.location.href` de `mostrarTelaDeCarregamento()`. O navegador navegará automaticamente com base na resposta POST do formulário.

6.  **Fechamento Agressivo de HTA:**
    *   **Problema:** `Conclusao/Final.HTA` usa `taskkill /F /IM mshta.exe` para fechar instâncias HTA. Isso fechará forçadamente *todos* os processos `mshta.exe` em execução, não apenas os relacionados a esta aplicação, o que pode ser disruptivo para o usuário se ele estiver usando outros HTAs.
    *   **Recomendação:** Se possível, encontrar uma maneira mais direcionada de fechar janelas HTA específicas. Isso é notoriamente difícil com `mshta.exe`. Alternativas podem envolver JavaScript `window.close()` dentro dos próprios HTAs se eles puderem detectar que o processo está concluído, ou uma abordagem de gerenciamento de processos mais sofisticada, se necessário (embora provavelmente excessiva). O atual `Window.Close` em `Conclusao/Final.HTA` deve fechar a si mesmo. O `taskkill` é provavelmente para o `final..hta` inicial.

7.  **Ausência de `getPCInfo2.vbs` e `trocarHTA.bat`:**
    *   **Problema:** `CapturaDoSistema/executarVBS.bat` chama `getPCInfo2.vbs`, e `Conclusao/final.bat` referencia um `trocarHTA.bat`. O conteúdo e o propósito exato desses arquivos são desconhecidos, pois não fizeram parte da análise.
    *   **Recomendação:** Revisar esses arquivos para entender sua funcionalidade e garantir que estão funcionando conforme o esperado e são necessários para o processo.

8.  **Dependência `express-session` Não Utilizada:**
    *   **Problema:** `package.json` inclui `express-session`, mas não é usado no `server.js`.
    *   **Recomendação:** Se o gerenciamento de sessão não está planejado, remover a dependência para manter o projeto enxuto. Se estiver planejado para melhorias futuras, documentar seu uso pretendido.

9.  **Nome do Projeto Placeholder:**
    *   **Problema:** O nome do projeto no `package.json` é `my-express-app`.
    *   **Recomendação:** Atualizar para um nome de projeto mais descritivo.

Ao abordar esses problemas, a robustez, manutenibilidade e experiência do usuário da aplicação podem ser significativamente melhoradas.
