# Project Documentation: AutoDoc Gramado Parks

## 1. Introduction

This document provides a comprehensive overview of the AutoDoc Gramado Parks system. The project automates the process of generating and signing equipment assignment terms for employees and service providers. It involves client-side scripts to collect PC inventory data, a web interface for user data input and term display, and a Node.js backend to manage the data and generate the final term document.

## 2. Project Version

-   **Name**: `my-express-app` (Note: This seems to be a placeholder name from the initial `package.json` setup and might not reflect the true project name.)
-   **Version**: `1.0.0`

*(Extracted from `package.json`)*

## 3. Technologies Used

-   **Programming Languages:**
    -   JavaScript (Client-side for HTML/EJS/HTA; Server-side for Node.js)
    -   VBScript (Client-side for HTA interactions, system information gathering via WMI, file operations)
    -   Batch Scripting (Client-side for orchestrating VBScript execution and process management)
-   **Frameworks & Environments:**
    -   Node.js (Server-side JavaScript runtime)
    -   Express.js (Web application framework for Node.js)
    -   HTML Application (HTA) (Windows technology for HTML-based applications with script access)
-   **Templating Engines:**
    -   EJS (Embedded JavaScript templating) (Server-side HTML generation)
-   **Key Libraries & APIs (Node.js/JavaScript):**
    -   `express`
    -   `body-parser`
    -   `ejs`
    -   Node.js built-in modules: `path`, `child_process`, `fs`, `os` (imported)
-   **Client-Side Technologies (Browser/HTA):**
    -   HTML
    -   CSS
    -   DOM API
    -   Fetch API
-   **Windows Specific Technologies (via VBScript/Batch):**
    -   WMI (Windows Management Instrumentation)
    -   Windows Script Host (WSH)
    -   Windows Command Line/Batch Commands

## 4. Dependencies

*(From `package.json`)*

-   **Dependencies:**
    -   `body-parser`: `^1.20.2`
    -   `ejs`: `^3.1.10`
    -   `express`: `^4.21.1`
    -   `express-session`: `^1.18.1` (Note: Listed in `package.json` but not actively used in `server.js` logic)
-   **DevDependencies:**
    -   `jest`: `^29.7.0` (For testing, setup but no tests shown in analysis)

## 5. Requirements Analysis

### Functional Requirements:

**User Interaction & Form Submission:**
-   **FR1:** System provides a web interface for users to initiate the equipment term generation process.
-   **FR2:** Users must accept LGPD and equipment usage terms before proceeding.
-   **FR3:** Users must submit a form with personal/professional details (Name, Username, User Type, CPF/CNPJ, RG, Tel, Unit, Sector, Job Title, Email, Observation).
-   **FR4:** System validates submitted CPF/CNPJ (basic validation).
-   **FR5:** System displays loading animations during processing.
-   **FR6:** System generates and displays a formatted equipment assignment term with user data, PC inventory, and current date/time.
-   **FR7 (Intended but Broken):** Users should trigger sending the generated term via email.

**Client-Side Data Collection (HTA/VBS/Batch):**
-   **FR8:** Initial HTA (`final..hta`) launches on user login to prompt for term signing.
-   **FR9:** Initial HTA displays a countdown timer (e.g., 10 min); logs off user on expiry.
-   **FR10:** "Assinar Termos" in HTA triggers a batch script (`CapturaDoSistema/executarVBS.bat`).
-   **FR11:** Batch script executes VBScripts (`getPCInfo.vbs`, `getPCInfo2.vbs`) for system info collection.
-   **FR12:** VBScripts collect PC info: Logged-in username, date, PC Type, Manufacturer, Model, S/N.
-   **FR13:** VBScripts collect details for connected monitors: Manufacturer, Model, S/N.
-   **FR14:** Collected info is appended to `informacoes.txt` on a network share, with user-specific start/end markers.
-   **FR15:** Initial HTA launches a web browser to the application's start page.

**Backend Processing:**
-   **FR16:** Server receives user data via web form (POST `/formularios`).
-   **FR17:** Server reads `informacoes.txt` from the network share.
-   **FR18:** Server parses `informacoes.txt` for the relevant user's data block.
-   **FR19:** Server renders an EJS template (`views/formularios.ejs`) with combined form and equipment data.
-   **FR20 (Intended but Broken):** Server provides an endpoint (`/execute-batch`) to trigger `Conclusao/final.bat`.
-   **FR21:** Server serves static HTML pages (Welcome, LGPD, Data Input).
-   **FR22:** Server provides an endpoint for the current date (`/getDate`).

**Client-Side Finalization (Intended but Broken/Partially Implemented):**
-   **FR23:** `Conclusao/final.bat` handles post-term-generation client-side tasks.
-   **FR24:** Batch script triggers `Conclusao/final.vbs` to display `Conclusao/Final.HTA`.
-   **FR25:** `Conclusao/Final.HTA` provides a "Concluir" button to close HTA instances.

### Non-Functional Requirements:

**System & Environment:**
-   **NFR1:** Application accessible on the local network (uses hardcoded local IPs).
-   **NFR2:** Client-side scripts require a Windows environment.
-   **NFR3:** Relies on a network file share for `informacoes.txt` and some assets.
-   **NFR4:** Node.js/Express.js backend.
-   **NFR5:** EJS for server-side templating.

**Data & Usability:**
-   **NFR6:** Data integrity between script output (`informacoes.txt` as UTF-16 LE) and server processing (read as `latin1`) must be ensured.
-   **NFR7:** User interface in Portuguese (BR).
-   **NFR8:** System guides user through the term signing process.
-   **NFR9:** Visual feedback (loading screens) for long operations.
-   **NFR10:** `informacoes.txt` supports concurrent appends.
-   **NFR11:** Preference for English naming conventions in code for maintainability.

**Reliability & Error Handling:**
-   **NFR12:** Basic error checking in client-side scripts.
-   **NFR13:** Server handles file read errors for `informacoes.txt` gracefully.
-   **NFR14:** System prevents multiple executions of critical actions where appropriate.

**Security (Implicit):**
-   **NFR15:** HTA timeout leads to user logoff (security measure).
-   **NFR16:** Stated compliance with LGPD for personal data.

## 6. Application Flowchart

```mermaid
graph TD
    subgraph Client Machine (Windows Environment)
        A[User Logs into Windows] --> B_HTA_INIT(HTA: final..hta Launched);
        B_HTA_INIT -- User Clicks "Assinar Termos" --> C_BAT_EXEC(BAT: CapturaDoSistema/executarVBS.bat);
        C_BAT_EXEC --> D_VBS_GETINFO1(VBS: CapturaDoSistema/getPCInfo.vbs);
        D_VBS_GETINFO1 -- Appends to --> F_FILE_INFO(TXT: \\NetworkShare\informacoes.txt);
        C_BAT_EXEC --> E_VBS_GETINFO2(VBS: CapturaDoSistema/getPCInfo2.vbs);
        E_VBS_GETINFO2 -- Appends to --> F_FILE_INFO;
        B_HTA_INIT -- Launches Browser --> G_BROWSER_WELCOME(BROWSER: Boas-Vindas.html);

        subgraph Client Machine - Finalization (Intended/Broken)
            X_BAT_CONCLUSAO(BAT: Conclusao/final.bat) -- Executes --> Y_VBS_CONCLUSAO(VBS: Conclusao/final.vbs);
            Y_VBS_CONCLUSAO -- Launches --> Z_HTA_FINAL(HTA: Conclusao/Final.HTA);
            Z_HTA_FINAL -- User Clicks "Concluir" --> Z1_HTA_CLOSE(System: Close All HTAs);
            Z_HTA_FINAL -- Timeout (10 min) --> Z2_USER_LOGOFF(System: User Logoff);
        end
    end

    subgraph Web Browser (Client Side)
        G_BROWSER_WELCOME -- User Clicks "Avançar" --> H_BROWSER_LGPD(BROWSER: normasGLPD.html);
        H_BROWSER_LGPD -- User Accepts Terms & Clicks "Avançar" --> I_BROWSER_FORM(BROWSER: Dados-colaborador.html);
        I_BROWSER_FORM -- User Submits Form --> J_HTTP_POST_FORM(HTTP POST Request to /formularios);
        K_BROWSER_TERMVIEW(BROWSER: views/formularios.ejs Displayed) -- User Clicks "Enviar Termo por E-mail" --> L_JS_SIMULATE_EMAIL(JS: Simulates Email Sending - NO SERVER CALL);
    end

    subgraph Server (Node.js Application)
        J_HTTP_POST_FORM --> M_SERVER_PROCESS(SERVER: server.js handles POST /formularios);
        M_SERVER_PROCESS -- Reads --> F_FILE_INFO;
        M_SERVER_PROCESS -- Parses Data & Renders EJS --> K_BROWSER_TERMVIEW;

        W_HTTP_EXEC_BATCH(HTTP POST Request to /execute-batch) -.-> X_BAT_CONCLUSAO;
        W_HTTP_EXEC_BATCH{Endpoint Exists};
        style W_HTTP_EXEC_BATCH fill:#fff,stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;
        linkStyle 11 stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;

    end

    %% Styling for Broken/Intended Flow
    L_JS_SIMULATE_EMAIL -.-> W_HTTP_EXEC_BATCH;
    style L_JS_SIMULATE_EMAIL fill:#fff,stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;
    linkStyle 10 stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5;


    %% Legend/Notes
    Note1[Note: Dashed lines indicate intended but currently broken or non-operational paths.]
    Note2[Note: informacoes.txt is UTF-16 LE from VBS, read as Latin1 by Server - potential issue.]
    Note3[Note: final..hta also has a 10-min timeout to log off user, similar to Conclusao/Final.HTA.]
```

## 7. Detailed Analysis & Key Findings

### Server-side (`server.js`)
-   Handles HTTP requests using Express.js.
-   Serves static HTML files (`Boas-Vindas.html`, `normasGLPD.html`, `Dados-colaborador.html`).
-   Provides a main endpoint `POST /formularios` which:
    -   Receives user data from `Dados-colaborador.html`.
    -   Reads `informacoes.txt` from a fixed network path using `latin1` encoding.
    -   Extracts a specific user's data block from `informacoes.txt` using `collectUserDataBlock()`.
    -   Parses this block into structured data (equipment, other info) using `parseUserData()`.
    -   Renders `views/formularios.ejs`, passing the combined form data, parsed equipment data, current date, and any file read errors.
-   Includes an endpoint `POST /execute-batch` intended to run `Conclusao/final.bat`, but this is not currently called by the main application flow.
-   Uses EJS as the templating engine.
-   Middleware: `bodyParser` for parsing request bodies, `express.static` for serving static files from local and network drives.
-   No explicit session management is implemented; user identification relies on the `usuario` field submitted in forms.

### Client-side Data Collection (HTAs, VBScripts, Batch files for `informacoes.txt`)
-   **Initiation:** The process starts with `final..hta` (root directory), likely launched at Windows login. This HTA prompts the user to start the signing process and includes a 10-minute inactivity/completion timer that logs the user off.
-   **Script Execution:** Clicking "Assinar Termos" in `final..hta` runs `CapturaDoSistema/executarVBS.bat`.
-   **Data Gathering:**
    -   `executarVBS.bat` calls `CapturaDoSistema/getPCInfo.vbs` and `getPCInfo2.vbs` (contents of `getPCInfo2.vbs` are unknown but presumed similar).
    -   `getPCInfo.vbs` uses WMI to collect:
        -   PC details (type, manufacturer, model, serial number).
        -   Monitor details (manufacturer, model, serial number for each).
        -   Current username and date.
    -   This information is appended as a block to `\\Gpk-fs02\Publico\TI\Projeto-AutoDocServidor\CapturaDoSistema\informacoes.txt`.
    -   **Encoding:** `getPCInfo.vbs` writes `informacoes.txt` using **UTF-16 LE encoding**.
-   **Browser Launch:** `final..hta` also opens the web browser to the application's start page (e.g., `http://172.16.8.23:3000/`).

### Web Interface (HTML, EJS)
-   **`Boas-Vindas.html`:** Welcome page, redirects to `normasGLPD.html`.
-   **`normasGLPD.html`:** Displays LGPD/usage terms. User must check boxes to enable "Avançar" button, which redirects to `Dados-colaborador.html`.
-   **`Dados-colaborador.html`:**
    -   Main form for user input (name, username, CPF/CNPJ, RG, unit, sector, etc.).
    -   Client-side JavaScript for dynamic population (setor based on unidade), input formatting, and basic validation.
    -   Submits data via `POST` to `/formularios`.
    -   Includes a loading screen animation that, upon completion, attempts a client-side redirect to `/formularios` which is redundant and potentially problematic.
-   **`views/formularios.ejs`:**
    -   Server-rendered page displaying the final term.
    -   Populated with data from the form submission and the parsed `informacoes.txt`.
    -   Includes a button "Enviar Termo por E-mail". **Crucially, the associated `sendEmail()` JavaScript function only simulates email sending with a progress bar and does NOT make a backend call to `/execute-batch`**.
-   **`forms.hta`:** An HTA file that seems like an older or alternative version of `views/formularios.ejs`. It *does* include JavaScript to call `/execute-batch`. This suggests the original intent was for the web interface to trigger the final batch script.

### Finalization/Email Process (including the identified break in flow and script errors)
-   **Intended Trigger:** The `POST /execute-batch` endpoint in `server.js` is designed to run `Conclusao/final.bat`.
-   **Current State:** This flow is **broken** because `views/formularios.ejs` (the active term display page) does not call `/execute-batch`.
-   **`Conclusao/final.bat`:**
    -   If it were executed, it's intended to perform cleanup and launch the final HTA.
    -   **Contains VBScript syntax errors** at the beginning, which would prevent it from running correctly as a batch file.
    -   It attempts to run a placeholder `trocarHTA.bat` (function unknown).
    -   It tries to kill `mshta.exe` processes.
    -   It then executes `Conclusao/final.vbs`.
-   **`Conclusao/final.vbs`:** This script launches `Conclusao/Final.HTA`.
-   **`Conclusao/Final.HTA`:**
    -   A final screen for the user, also with a 10-minute logoff timer.
    -   Provides a "Concluir" button which runs a VBScript to kill all `mshta.exe` processes (potentially disruptive if other HTAs are in use) and close itself.
-   **Email Sending Mechanism:** The actual mechanism for sending an email is not explicitly detailed in `Conclusao/final.bat` or `Conclusao/final.vbs`. It's possible `final.bat` was intended to call another script that performs the email action (e.g., using VBScript to interact with Outlook).

## 8. Identified Issues & Recommendations

1.  **Broken Email/Finalization Flow:**
    *   **Issue:** The "Enviar Termo por E-mail" button in `views/formularios.ejs` does not trigger the `POST /execute-batch` server endpoint. This means `Conclusao/final.bat` and subsequent scripts (`Conclusao/final.vbs`, `Conclusao/Final.HTA`) are never executed. The email sending functionality (if any was intended via these scripts) and final HTA cleanup do not occur.
    *   **Recommendation:** Modify the `sendEmail()` JavaScript function in `views/formularios.ejs` to make an asynchronous `fetch` call to the `POST /execute-batch` endpoint. Provide user feedback on success/failure of this call.

2.  **Encoding Mismatch for `informacoes.txt`:**
    *   **Issue:** `CapturaDoSistema/getPCInfo.vbs` writes `informacoes.txt` using UTF-16 LE encoding. However, `server.js` reads this file using `latin1` encoding. This can lead to incorrect character interpretation and data corruption, especially if usernames or hardware details contain non-ASCII characters.
    *   **Recommendation:** Change the file reading encoding in `server.js` to `utf16le` when reading `informacoes.txt`: `fs.readFile(filePath, 'utf16le', (err, fileContent) => { ... });`.

3.  **Syntax Errors in `Conclusao/final.bat`:**
    *   **Issue:** The script contains VBScript syntax lines (`Set WshShell = ...`, `WshShell.Run ...`) at the beginning, which will cause errors when run as a batch file.
    *   **Recommendation:** Remove or comment out these VBScript lines. If their functionality is needed, it should be incorporated into a separate `.vbs` script or correctly implemented within the batch logic if possible.

4.  **Hardcoded IP Addresses and Paths:**
    *   **Issue:** Multiple files (`Boas-Vindas.html`, `normasGLPD.html`, `final..hta`, VBScripts, Batch files) use hardcoded IP addresses (e.g., `172.16.8.23`, `172.16.8.28`) and network paths (e.g., `\\\\Gpk-fs02\\...`). This makes the application difficult to deploy in different environments or if server IPs/paths change.
    *   **Recommendation:**
        *   For web redirects, use relative paths or dynamically generate URLs on the server if possible.
        *   For server-side configurations (like network paths), consider using environment variables or a configuration file.
        *   For client-side scripts that need to point to the server, this is trickier. If the HTAs are always launched in an environment where the server hostname is resolvable, use hostnames instead of IPs. Otherwise, a configuration step or a small launcher that can be configured might be needed.

5.  **Redundant Client-Side Redirect:**
    *   **Issue:** In `Dados-colaborador.html`, the `mostrarTelaDeCarregamento()` JavaScript function performs a `window.location.href = '/formularios'` after the loading animation. This is redundant because the form is already set to `action="/formularios" method="POST"`. This could potentially lead to the form being submitted as GET if the JS redirect happens too quickly or interrupts the POST.
    *   **Recommendation:** Remove the `window.location.href` call from `mostrarTelaDeCarregamento()`. The browser will automatically navigate based on the form's POST response.

6.  **Aggressive HTA Closing:**
    *   **Issue:** `Conclusao/Final.HTA` uses `taskkill /F /IM mshta.exe` to close HTA instances. This will forcefully close *all* running `mshta.exe` processes, not just the ones related to this application, which could be disruptive to the user if they are using other HTAs.
    *   **Recommendation:** If possible, find a more targeted way to close specific HTA windows. This is notoriously difficult with `mshta.exe`. Alternatives could involve JavaScript `window.close()` within the HTAs themselves if they can detect that the process is complete, or a more sophisticated process management approach if necessary (though likely overkill). The current `Window.Close` in `Conclusao/Final.HTA` should close itself. The `taskkill` is likely for the initial `final..hta`.

7.  **Missing `getPCInfo2.vbs` and `trocarHTA.bat`:**
    *   **Issue:** `CapturaDoSistema/executarVBS.bat` calls `getPCInfo2.vbs`, and `Conclusao/final.bat` references a `trocarHTA.bat`. The contents and exact purpose of these files are unknown as they were not part of the analysis.
    *   **Recommendation:** Review these files to understand their functionality and ensure they are working as intended and are necessary for the process.

8.  **Unused `express-session` Dependency:**
    *   **Issue:** `package.json` includes `express-session`, but it's not used in `server.js`.
    *   **Recommendation:** If session management is not planned, remove the dependency to keep the project lean. If it is planned for future enhancements, document its intended use.

9.  **Placeholder Project Name:**
    *   **Issue:** The project name in `package.json` is `my-express-app`.
    *   **Recommendation:** Update to a more descriptive project name.

By addressing these issues, the application's robustness, maintainability, and user experience can be significantly improved.
