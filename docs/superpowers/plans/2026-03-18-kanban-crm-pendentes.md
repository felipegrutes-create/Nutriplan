# Kanban CRM — Pendentes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a aba Pendentes do `dashboard-feegow-v2.html` em um Kanban CRM estilo Pipedrive com 6 colunas, cards automáticos e persistência via Google Apps Script → Google Sheets (`CRM_Pendentes`).

**Architecture:** O dashboard carrega dados CRM em paralelo com os dados Feegow (ambos via fetch). Os dois datasets são merged por `paciente_key` (nome normalizado). O Kanban é renderizado client-side em puro JS/CSS. Salvar um card faz POST ao Apps Script Web App que faz upsert na aba `CRM_Pendentes`.

**Tech Stack:** Vanilla JS, CSS custom properties, Google Apps Script (Web App), Google Sheets API v4 (já existente para leitura), Chart.js (intocado).

**Spec:** `docs/superpowers/specs/2026-03-18-kanban-crm-pendentes-design.md`
**Base file:** `dashboard-feegow-v2.html`

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `dashboard-feegow-v2.html` | Modificar | HTML + CSS + JS — tudo num arquivo único |
| `crm-apps-script.gs` | Criar | Código a ser colado no Google Apps Script |

---

## Task 1: Criar o Google Apps Script Web App

**Files:**
- Create: `crm-apps-script.gs`

- [ ] **Step 1.1: Criar o arquivo `.gs` com os handlers GET e POST**

```javascript
// =========================================================
// Feegow CRM — Google Apps Script Web App
// Cole este código no Apps Script da planilha e faça deploy
// como Web App: Execute as = você, Who has access = Anyone
// =========================================================

const CRM_SHEET_NAME = 'CRM_Pendentes';
const CRM_HEADERS = [
  'paciente_key','contato1_data','contato2_data',
  'vendedora','valor','retorno_marcado','proposta_feita',
  'parc_pago','quitado','ultima_atualizacao'
];

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonOk({ records: [] });

    const headers = data[0];
    const records = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    return jsonOk({ records });
  } catch(err) {
    return jsonErr(err.message);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const key  = (body.paciente_key || '').trim();
    if (!key) return jsonErr('paciente_key obrigatório');

    const sheet = getOrCreateSheet();
    const data  = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyCol  = headers.indexOf('paciente_key');

    // Upsert: procura linha existente
    let targetRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][keyCol]).trim() === key) {
        targetRow = i + 1; // 1-based
        break;
      }
    }

    body.ultima_atualizacao = new Date().toISOString();
    const rowData = headers.map(h => body[h] !== undefined ? body[h] : '');

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return jsonOk({ success: true });
  } catch(err) {
    return jsonErr(err.message);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CRM_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CRM_SHEET_NAME);
    sheet.getRange(1, 1, 1, CRM_HEADERS.length).setValues([CRM_HEADERS]);
    sheet.getRange(1, 1, 1, CRM_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 1.2: Verificar se o arquivo foi criado**

```bash
ls d:/USER/Downloads/Projc_ClaudeCode/crm-apps-script.gs
```
Esperado: arquivo listado.

- [ ] **Step 1.3: Instrução de deploy (seguir manualmente)**

> 1. Abra a planilha em sheets.google.com
> 2. Menu **Extensões → Apps Script**
> 3. Cole todo o conteúdo de `crm-apps-script.gs` no editor (substitua o código existente)
> 4. Salve (Ctrl+S)
> 5. Clique em **Implantar → Nova implantação**
> 6. Tipo: **App da Web**
> 7. Executar como: **Eu** | Quem tem acesso: **Qualquer pessoa**
> 8. Clique em Implantar → copie a URL gerada (começa com `https://script.google.com/macros/s/...`)
> 9. Cole a URL na constante `CRM_SCRIPT_URL` no dashboard (Task 2, Step 2.1)

- [ ] **Step 1.4: Testar o endpoint GET manualmente (após deploy)**

Abra no browser:
```
https://script.google.com/macros/s/SEU_SCRIPT_ID/exec
```
Esperado: `{"records":[]}` (aba ainda vazia)

---

## Task 2: Adicionar constante CRM_SCRIPT_URL e CSS do Kanban

**Files:**
- Modify: `dashboard-feegow-v2.html` — bloco `<style>` e topo do `<script>`

- [ ] **Step 2.1: Adicionar constante no topo do bloco `<script>`**

Localizar a linha:
```javascript
        const API_KEY  = "AIzaSyDH3QZe8MBWR50fNP9UfJ5CR0gNju2Uaqw";
```

Adicionar logo abaixo:
```javascript
        // URL do Apps Script Web App (preencher após deploy)
        const CRM_SCRIPT_URL = ""; // ex: "https://script.google.com/macros/s/XXX/exec"
```

- [ ] **Step 2.2: Adicionar CSS do Kanban ao final do bloco `<style>`**

Localizar `/* ===== RESPONSIVE ===== */` e inserir antes dele:

```css
        /* ===== KANBAN CRM ===== */
        .kanban-board {
            display: flex;
            gap: 14px;
            overflow-x: auto;
            padding-bottom: 16px;
            align-items: flex-start;
            scrollbar-width: thin;
            scrollbar-color: var(--dim) transparent;
        }

        .kanban-col {
            flex-shrink: 0;
            width: 230px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .kanban-col-header {
            padding: 12px 14px 10px;
            border-bottom: 1px solid var(--border);
            border-top: 2px solid var(--kcol-color, #475569);
        }

        .kanban-col-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .kanban-col-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--kcol-color, #94a3b8);
        }

        .kanban-col-count {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            background: color-mix(in srgb, var(--kcol-color, #475569) 15%, transparent);
            color: var(--kcol-color, #94a3b8);
        }

        .kanban-col-total {
            font-size: 13px;
            font-weight: 800;
            color: var(--kcol-color, #94a3b8);
            letter-spacing: -0.3px;
        }

        .kanban-col-total-label {
            font-size: 10px;
            color: var(--muted);
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 2px;
        }

        .kanban-col-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-height: 80px;
        }

        .crm-card {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-left: 3px solid var(--kcol-color, #475569);
            border-radius: 8px;
            padding: 11px 12px;
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
        }

        .crm-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        .crm-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
        }

        .crm-card-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text);
            line-height: 1.2;
        }

        .crm-urgency-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 3px;
        }

        .crm-card-prof {
            font-size: 11px;
            color: var(--muted);
            margin-bottom: 8px;
        }

        .crm-card-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3px;
            font-size: 10px;
            color: var(--muted);
            margin-bottom: 8px;
        }

        .crm-card-fields span { display: flex; align-items: center; gap: 3px; }

        .crm-val         { color: var(--text); font-weight: 500; }
        .crm-val.yellow  { color: #fbbf24; }
        .crm-val.green   { color: #34d399; }
        .crm-val.purple  { color: #818cf8; }

        .crm-card-badges { display: flex; gap: 4px; flex-wrap: wrap; }

        .crm-badge {
            font-size: 9px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 8px;
            letter-spacing: 0.2px;
        }

        /* CRM Modal */
        .crm-modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(8,13,26,0.85);
            backdrop-filter: blur(4px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .crm-modal-overlay.open { display: flex; }

        .crm-modal {
            background: var(--surface);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            width: 440px;
            max-width: 95vw;
            padding: 24px;
            position: relative;
            animation: fadeUp 0.2s ease;
        }

        .crm-modal-close {
            position: absolute;
            top: 14px; right: 16px;
            background: rgba(255,255,255,0.06);
            border: none; color: var(--muted);
            width: 28px; height: 28px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s;
        }

        .crm-modal-close:hover { background: rgba(255,255,255,0.12); color: var(--text); }

        .crm-modal-name { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
        .crm-modal-sub  { font-size: 12px; color: var(--muted); margin-bottom: 20px; }

        .crm-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 14px;
        }

        .crm-field { display: flex; flex-direction: column; gap: 4px; }

        .crm-field label {
            font-size: 10px;
            font-weight: 600;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .crm-input {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: 7px;
            padding: 8px 10px;
            font-size: 13px;
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            outline: none;
            transition: border-color 0.2s;
            width: 100%;
        }

        .crm-input:focus { border-color: rgba(0,212,170,0.4); }

        .crm-check-row {
            display: flex;
            gap: 20px;
            margin-bottom: 18px;
        }

        .crm-check-group {
            display: flex; align-items: center; gap: 8px; cursor: pointer;
        }

        .crm-check-group input[type=checkbox] {
            width: 16px; height: 16px;
            accent-color: var(--accent);
            cursor: pointer;
        }

        .crm-check-group span { font-size: 13px; color: var(--text); }

        .crm-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
        }

        .crm-btn {
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-family: 'Outfit', sans-serif;
            transition: all 0.15s;
        }

        .crm-btn-save   { background: var(--accent); color: #080d1a; }
        .crm-btn-save:hover { background: #00bfa0; }
        .crm-btn-cancel { background: rgba(255,255,255,0.06); color: var(--muted); }
        .crm-btn-cancel:hover { background: rgba(255,255,255,0.1); color: var(--text); }

        .crm-save-status {
            font-size: 12px;
            color: var(--muted);
            align-self: center;
            margin-right: auto;
        }

        .crm-empty-col {
            text-align: center;
            font-size: 11px;
            color: var(--dim);
            padding: 20px 0;
            font-style: italic;
        }
```

- [ ] **Step 2.3: Verificar visualmente que o CSS foi adicionado sem erros de sintaxe**

Abrir o arquivo no browser e verificar que as outras abas continuam funcionando normalmente.

---

## Task 3: Substituir HTML da seção Pendentes pelo Kanban

**Files:**
- Modify: `dashboard-feegow-v2.html` — seção `sec-pend`

- [ ] **Step 3.1: Localizar a seção atual e substituir**

Localizar no HTML:
```html
        <!-- PENDENTES -->
        <section id="sec-pend" class="section">
```

Substituir TODO o conteúdo interno da `<section>` (mantendo a tag `<section>` em si) pelo seguinte:

```html
        <!-- PENDENTES CRM KANBAN -->
        <section id="sec-pend" class="section">
            <p class="section-title">CRM de Retorno — Pendentes de 1ª Vez</p>

            <!-- KPI cards (mantidos do original) -->
            <div class="kpi-grid">
                <div class="kpi-card red">
                    <div class="value" id="pend-total">—</div>
                    <div class="label">Pacientes Pendentes</div>
                </div>
                <div class="kpi-card">
                    <div class="value" id="pend-2025">—</div>
                    <div class="label">Pendentes de 2025</div>
                </div>
                <div class="kpi-card">
                    <div class="value" id="pend-2026">—</div>
                    <div class="label">Pendentes de 2026</div>
                </div>
                <div class="kpi-card orange">
                    <div class="value" id="pend-critico">—</div>
                    <div class="label">Críticos (&gt;180 dias)</div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="search-box" style="margin-bottom:16px">
                <input type="text" id="kanbSearch" placeholder="Buscar paciente..." oninput="renderKanban()">
                <select id="kanbProf" onchange="renderKanban()">
                    <option value="">Todos os profissionais</option>
                </select>
                <select id="kanbAno" onchange="renderKanban()">
                    <option value="">Todos os anos</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                <select id="kanbVend" onchange="renderKanban()">
                    <option value="">Todas as vendedoras</option>
                    <option value="Alice Valentin">Alice Valentin</option>
                    <option value="Rayssa Guedes">Rayssa Guedes</option>
                </select>
            </div>

            <!-- Board Kanban -->
            <div class="kanban-board" id="kanbanBoard"></div>
        </section>

        <!-- Modal CRM -->
        <div class="crm-modal-overlay" id="crmModalOverlay" onclick="handleModalOverlayClick(event)">
            <div class="crm-modal">
                <button class="crm-modal-close" onclick="closeCRMModal()">✕</button>
                <div class="crm-modal-name" id="crmModalName">—</div>
                <div class="crm-modal-sub" id="crmModalSub">—</div>

                <div class="crm-form-grid">
                    <div class="crm-field">
                        <label>📞 Contato 1</label>
                        <input type="date" class="crm-input" id="crmC1">
                    </div>
                    <div class="crm-field">
                        <label>📞 Contato 2</label>
                        <input type="date" class="crm-input" id="crmC2">
                    </div>
                    <div class="crm-field">
                        <label>👤 Vendedora</label>
                        <select class="crm-input" id="crmVend">
                            <option value="">— Selecionar —</option>
                            <option value="Alice Valentin">Alice Valentin</option>
                            <option value="Rayssa Guedes">Rayssa Guedes</option>
                        </select>
                    </div>
                    <div class="crm-field">
                        <label>💰 Valor</label>
                        <input type="text" class="crm-input" id="crmValor" placeholder="R$ 0,00" oninput="maskCurrency(this)">
                    </div>
                    <div class="crm-field">
                        <label>📅 Retorno Marcado</label>
                        <select class="crm-input" id="crmRetorno">
                            <option value="">— Selecionar —</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                        </select>
                    </div>
                    <div class="crm-field">
                        <label>📄 Proposta Feita</label>
                        <select class="crm-input" id="crmProposta">
                            <option value="">— Selecionar —</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                        </select>
                    </div>
                </div>

                <div class="crm-check-row">
                    <label class="crm-check-group">
                        <input type="checkbox" id="crmParcPago">
                        <span>Parcialmente Pago</span>
                    </label>
                    <label class="crm-check-group">
                        <input type="checkbox" id="crmQuitado">
                        <span>Quitado</span>
                    </label>
                </div>

                <div class="crm-modal-footer">
                    <span class="crm-save-status" id="crmSaveStatus"></span>
                    <button class="crm-btn crm-btn-cancel" onclick="closeCRMModal()">Cancelar</button>
                    <button class="crm-btn crm-btn-save" onclick="saveCRMRecord()">💾 Salvar</button>
                </div>
            </div>
        </div>
```

- [ ] **Step 3.2: Verificar que o HTML foi substituído corretamente**

Abrir no browser, clicar na aba Pendentes — deve mostrar os KPI cards e os filtros mas o board vazio (ainda sem JS).

---

## Task 4: Implementar a camada de dados CRM (JS)

**Files:**
- Modify: `dashboard-feegow-v2.html` — bloco `<script>`, após as constantes

- [ ] **Step 4.1: Adicionar variáveis globais e constantes do Kanban**

Logo após a linha `const PEND_PER_PAGE = 30;`, adicionar:

```javascript
        // ===== CRM KANBAN GLOBALS =====
        let crmMap     = {};   // paciente_key → registro CRM
        let pendPatients = []; // retDetails filtrados (não retornaram)
        let crmModalKey = '';  // key do paciente aberto no modal

        const KANBAN_COLS = [
            { id:'sem-contato',      label:'📋 Sem Contato',    color:'#475569', showTotal:false },
            { id:'primeiro-contato', label:'📞 1º Contato',      color:'#f59e0b', showTotal:false },
            { id:'segundo-contato',  label:'📞 2º Contato',      color:'#f97316', showTotal:false },
            { id:'proposta-feita',   label:'📄 Proposta Feita',  color:'#6366f1', showTotal:true,  totalLabel:'Total em negociação' },
            { id:'retorno-marcado',  label:'📅 Retorno Marcado', color:'#00d4aa', showTotal:false },
            { id:'quitado',          label:'✅ Quitado',          color:'#10b981', showTotal:true,  totalLabel:'Total recebido' },
        ];
```

- [ ] **Step 4.2: Adicionar funções utilitárias CRM**

Logo após as funções utilitárias existentes (`set`, `groupByProf`, `barHoriz`, `showSection`), adicionar:

```javascript
        // ===== CRM HELPERS =====

        function normalizeKey(name) {
            return (name || '')
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ');
        }

        function getCRMColumn(rec) {
            if (!rec) return 'sem-contato';
            const bool = v => v === true || v === 'TRUE';
            if (bool(rec.quitado))              return 'quitado';
            if (rec.retorno_marcado === 'Sim')  return 'retorno-marcado';
            if (rec.proposta_feita  === 'Sim')  return 'proposta-feita';
            if (rec.contato2_data)              return 'segundo-contato';
            if (rec.contato1_data)              return 'primeiro-contato';
            return 'sem-contato';
        }

        function urgencyColor(days) {
            if (days > 180) return '#ef4444';
            if (days > 90)  return '#f59e0b';
            if (days > 60)  return '#6366f1';
            return '#475569';
        }

        function fmtValor(raw) {
            const n = parseFloat(String(raw).replace(/[^\d,\.]/g, '').replace(',', '.'));
            if (!raw || isNaN(n)) return '—';
            return 'R$\u00a0' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function parseValorFloat(raw) {
            const n = parseFloat(String(raw).replace(/[^\d,\.]/g, '').replace(',', '.'));
            return isNaN(n) ? 0 : n;
        }

        function isoToInputDate(ddmmyyyy) {
            if (!ddmmyyyy) return '';
            const p = String(ddmmyyyy).split('/');
            if (p.length !== 3) return '';
            return `${p[2].length === 2 ? '20' + p[2] : p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
        }

        function inputDateToDDMMYYYY(iso) {
            if (!iso) return '';
            const [y, m, d] = iso.split('-');
            return `${d}/${m}/${y.slice(2)}`;
        }

        function maskCurrency(input) {
            let v = input.value.replace(/\D/g, '');
            if (!v) { input.value = ''; return; }
            v = (parseInt(v, 10) / 100).toFixed(2);
            input.value = 'R$ ' + v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
```

- [ ] **Step 4.3: Adicionar função `loadCRMData()`**

```javascript
        async function loadCRMData() {
            if (!CRM_SCRIPT_URL) return {};
            try {
                const res  = await fetch(CRM_SCRIPT_URL);
                const json = await res.json();
                const map  = {};
                (json.records || []).forEach(r => {
                    const k = normalizeKey(r.paciente_key);
                    if (k) map[k] = r;
                });
                return map;
            } catch(e) {
                console.warn('CRM load failed:', e.message);
                return {};
            }
        }
```

- [ ] **Step 4.4: Testar as funções utilitárias no console do browser**

Abrir o dashboard no browser, abrir DevTools (F12), colar no console:
```javascript
console.log(normalizeKey("  João Dá Silva  "));  // "joao da silva"
console.log(getCRMColumn(null));                  // "sem-contato"
console.log(getCRMColumn({ contato1_data: "10/03/26" })); // "primeiro-contato"
console.log(getCRMColumn({ quitado: true }));     // "quitado"
console.log(fmtValor(850));                       // "R$ 850,00"
console.log(isoToInputDate("10/03/26"));          // "2026-03-10"
```
Esperado: todos os valores corretos.

---

## Task 5: Renderizar o Kanban Board

**Files:**
- Modify: `dashboard-feegow-v2.html` — bloco `<script>`

- [ ] **Step 5.1: Adicionar função `renderCRMCard(patient, crmRec, colColor)`**

```javascript
        function renderCRMCard(patient, crmRec, colColor) {
            const key    = normalizeKey(patient.pac);
            const c1     = crmRec?.contato1_data || '';
            const c2     = crmRec?.contato2_data || '';
            const vend   = crmRec?.vendedora || '';
            const valor  = fmtValor(crmRec?.valor);
            const prop   = crmRec?.proposta_feita  === 'Sim';
            const ret    = crmRec?.retorno_marcado === 'Sim';
            const parc   = crmRec?.parc_pago === true  || crmRec?.parc_pago === 'TRUE';
            const quit   = crmRec?.quitado   === true  || crmRec?.quitado   === 'TRUE';
            const uColor = urgencyColor(patient.daysSince);

            const shortVend = vend
                ? vend.split(' ').map((w,i) => i===0 ? w : w[0]+'.').join(' ')
                : '—';

            const badges = [
                prop  ? '<span class="crm-badge badge-blue">Proposta ✓</span>'    : '',
                ret   ? '<span class="crm-badge badge-teal">Retorno ✓</span>'     : '',
                parc  ? '<span class="crm-badge badge-orange">Parc. Pago</span>'  : '',
                quit  ? '<span class="crm-badge badge-green">Quitado ✓</span>'    : '',
            ].filter(Boolean).join('');

            const safeKey = key.replace(/'/g, "\\'");
            return `
                <div class="crm-card" style="border-left-color:${colColor}" onclick="openCRMModal('${safeKey}')">
                    <div class="crm-card-top">
                        <div class="crm-card-name">${patient.pac}</div>
                        <div class="crm-urgency-dot" style="background:${uColor}"></div>
                    </div>
                    <div class="crm-card-prof">${patient.prof}</div>
                    <div class="crm-card-fields">
                        <span>📞 C1: <span class="crm-val ${c1?'yellow':''}">${c1 || '—'}</span></span>
                        <span>📞 C2: <span class="crm-val ${c2?'yellow':''}">${c2 || '—'}</span></span>
                        <span>👤 <span class="crm-val ${vend?'purple':''}">${shortVend}</span></span>
                        <span>💰 <span class="crm-val ${valor!=='—'?'green':''}">${valor}</span></span>
                    </div>
                    ${badges ? `<div class="crm-card-badges">${badges}</div>` : ''}
                </div>`;
        }
```

- [ ] **Step 5.2: Adicionar função `renderKanban()`**

```javascript
        function renderKanban() {
            const board   = document.getElementById('kanbanBoard');
            if (!board || !pendPatients.length) return;

            const srch = (document.getElementById('kanbSearch')?.value || '').toLowerCase();
            const prof = document.getElementById('kanbProf')?.value  || '';
            const ano  = document.getElementById('kanbAno')?.value   || '';
            const vend = document.getElementById('kanbVend')?.value  || '';

            // Filtrar pacientes
            const filtered = pendPatients.filter(p => {
                const crm = crmMap[normalizeKey(p.pac)] || {};
                if (srch && !p.pac.toLowerCase().includes(srch)) return false;
                if (prof && p.prof !== prof)           return false;
                if (ano  && p.yearDcri !== ano)        return false;
                if (vend && crm.vendedora !== vend)    return false;
                return true;
            });

            // Agrupar por coluna
            const groups = {};
            KANBAN_COLS.forEach(c => { groups[c.id] = []; });
            filtered.forEach(p => {
                const crm = crmMap[normalizeKey(p.pac)] || null;
                const col = getCRMColumn(crm);
                if (groups[col]) groups[col].push({ patient: p, crm });
            });

            // Renderizar colunas
            board.innerHTML = KANBAN_COLS.map(col => {
                const cards  = groups[col.id];
                const count  = cards.length;

                let totalHtml = '';
                if (col.showTotal) {
                    const total = cards.reduce((sum, {crm}) => sum + parseValorFloat(crm?.valor), 0);
                    totalHtml = `
                        <div class="kanban-col-total-label">${col.totalLabel}</div>
                        <div class="kanban-col-total">${fmtValor(total)}</div>`;
                }

                const cardsHtml = count
                    ? cards.map(({patient, crm}) => renderCRMCard(patient, crm, col.color)).join('')
                    : `<div class="crm-empty-col">Nenhum paciente</div>`;

                return `
                    <div class="kanban-col" style="--kcol-color:${col.color}">
                        <div class="kanban-col-header">
                            <div class="kanban-col-top">
                                <span class="kanban-col-title">${col.label}</span>
                                <span class="kanban-col-count">${count}</span>
                            </div>
                            ${totalHtml}
                        </div>
                        <div class="kanban-col-body">${cardsHtml}</div>
                    </div>`;
            }).join('');
        }
```

- [ ] **Step 5.3: Testar renderização básica no console**

No console do browser (após carregar dados):
```javascript
console.log(pendPatients.length);              // > 0
console.log(Object.keys(crmMap).length);      // 0 se CRM_SCRIPT_URL vazia
console.log(document.querySelectorAll('.crm-card').length); // número de cards
```

---

## Task 6: Implementar Modal CRM e Salvar

**Files:**
- Modify: `dashboard-feegow-v2.html` — bloco `<script>`

- [ ] **Step 6.1: Adicionar `openCRMModal(key)` e `closeCRMModal()`**

```javascript
        function openCRMModal(key) {
            crmModalKey = key;
            const patient = pendPatients.find(p => normalizeKey(p.pac) === key);
            const crm     = crmMap[key] || {};

            if (!patient) return;

            document.getElementById('crmModalName').textContent = patient.pac;
            document.getElementById('crmModalSub').textContent  =
                `${patient.prof} · ${patient.daysSince} dias sem retorno`;

            document.getElementById('crmC1').value      = isoToInputDate(crm.contato1_data);
            document.getElementById('crmC2').value      = isoToInputDate(crm.contato2_data);
            document.getElementById('crmVend').value    = crm.vendedora || '';
            document.getElementById('crmRetorno').value = crm.retorno_marcado || '';
            document.getElementById('crmProposta').value= crm.proposta_feita  || '';
            document.getElementById('crmParcPago').checked = crm.parc_pago === true || crm.parc_pago === 'TRUE';
            document.getElementById('crmQuitado').checked  = crm.quitado   === true || crm.quitado   === 'TRUE';

            const valorRaw = crm.valor ? parseValorFloat(crm.valor) : '';
            const input    = document.getElementById('crmValor');
            input.value    = valorRaw
                ? 'R$ ' + valorRaw.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
                : '';

            document.getElementById('crmSaveStatus').textContent = '';
            document.getElementById('crmModalOverlay').classList.add('open');
        }

        function closeCRMModal() {
            document.getElementById('crmModalOverlay').classList.remove('open');
            crmModalKey = '';
        }

        function handleModalOverlayClick(e) {
            if (e.target === document.getElementById('crmModalOverlay')) closeCRMModal();
        }
```

- [ ] **Step 6.2: Adicionar `saveCRMRecord()`**

```javascript
        async function saveCRMRecord() {
            const statusEl = document.getElementById('crmSaveStatus');
            statusEl.textContent = 'Salvando...';
            statusEl.style.color = 'var(--muted)';

            const c1Raw    = document.getElementById('crmC1').value;
            const c2Raw    = document.getElementById('crmC2').value;
            const valorStr = document.getElementById('crmValor').value;
            const valorNum = parseValorFloat(valorStr);

            const record = {
                paciente_key:      crmModalKey,
                contato1_data:     inputDateToDDMMYYYY(c1Raw),
                contato2_data:     inputDateToDDMMYYYY(c2Raw),
                vendedora:         document.getElementById('crmVend').value,
                valor:             valorNum || '',
                retorno_marcado:   document.getElementById('crmRetorno').value,
                proposta_feita:    document.getElementById('crmProposta').value,
                parc_pago:         document.getElementById('crmParcPago').checked,
                quitado:           document.getElementById('crmQuitado').checked,
            };

            // Atualiza estado local imediatamente (optimistic update)
            crmMap[crmModalKey] = record;
            renderKanban();

            if (!CRM_SCRIPT_URL) {
                statusEl.textContent = '⚠️ CRM_SCRIPT_URL não configurada — salvo localmente apenas';
                statusEl.style.color = 'var(--warning)';
                setTimeout(closeCRMModal, 2000);
                return;
            }

            try {
                const res  = await fetch(CRM_SCRIPT_URL, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(record),
                });
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                statusEl.textContent = '✓ Salvo no Sheets';
                statusEl.style.color = 'var(--success)';
                setTimeout(closeCRMModal, 1200);
            } catch(e) {
                statusEl.textContent = '✗ Erro: ' + e.message;
                statusEl.style.color = 'var(--danger)';
            }
        }
```

- [ ] **Step 6.3: Testar modal manualmente**

1. Abrir o dashboard, ir para aba Pendentes
2. Clicar em qualquer card → modal deve abrir com nome e profissional corretos
3. Preencher Contato 1, Vendedora e Valor → clicar Salvar
4. Modal deve fechar e card deve atualizar imediatamente no board
5. Card deve ter mudado de coluna (se Contato 1 preenchido → passa para "1º Contato")

---

## Task 7: Integrar com `buildUI()` e `init()`

**Files:**
- Modify: `dashboard-feegow-v2.html` — funções `buildUI()` e `init()`

- [ ] **Step 7.1: Atualizar a seção Pendentes dentro de `buildUI()`**

Localizar no `buildUI()` o bloco `// == PENDENTES ==` e **substituir completamente** por:

```javascript
            // == PENDENTES (KANBAN CRM) ==
            const retNao    = retDetails.filter(r => !r.returned);
            const pend2025  = retNao.filter(r => r.yearDcri === '2025').length;
            const pend2026  = retNao.filter(r => r.yearDcri === '2026').length;
            const pendCrit  = retNao.filter(r => r.daysSince > 180).length;

            set('pend-total',   fmt(retNao.length));
            set('pend-2025',    fmt(pend2025));
            set('pend-2026',    fmt(pend2026));
            set('pend-critico', fmt(pendCrit));

            // Popular filtro de profissionais do Kanban
            const kanbProf = document.getElementById('kanbProf');
            if (kanbProf) {
                const profs = [...new Set(retNao.map(r => r.prof))].sort();
                kanbProf.innerHTML = `<option value="">Todos os profissionais</option>`
                    + profs.map(p => `<option value="${p}">${p}</option>`).join('');
            }

            // Guardar globalmente e renderizar board
            pendPatients = retNao.sort((a, b) => b.daysSince - a.daysSince);
            renderKanban();
```

- [ ] **Step 7.2: Atualizar `init()` para carregar dados CRM em paralelo**

Localizar a função `init()` e substituir por:

```javascript
        async function init() {
            try {
                document.getElementById('loadingMsg').textContent = 'Carregando dados...';
                const [rows, crmData] = await Promise.all([
                    loadData(),
                    loadCRMData(),
                ]);
                crmMap = crmData;
                document.getElementById('loadingMsg').textContent = 'Processando dados...';
                const d = processData(rows);
                buildUI(d);
                document.getElementById('loadingOverlay').style.display = 'none';
            } catch(e) {
                document.getElementById('loadingOverlay').style.display = 'none';
                const eb = document.getElementById('errorBanner');
                eb.style.display  = 'block';
                eb.textContent    = `Erro ao carregar dados: ${e.message}`;
                console.error(e);
            }
        }
```

- [ ] **Step 7.3: Atualizar `reloadData()` para limpar o crmMap também**

Localizar a função `reloadData()` e substituir por:

```javascript
        async function reloadData() {
            document.getElementById('loadingOverlay').style.display = 'flex';
            document.getElementById('errorBanner').style.display    = 'none';
            Object.values(chartInstances).forEach(c => c.destroy());
            chartInstances = {};
            crmMap         = {};
            pendPatients   = [];
            await init();
        }
```

- [ ] **Step 7.4: Teste de integração final**

1. Abrir `dashboard-feegow-v2.html` no browser
2. Verificar que as abas 1–5 continuam funcionando normalmente
3. Abrir aba **Pendentes** → board Kanban deve aparecer com todos os pacientes na coluna "Sem Contato"
4. Usar filtros de busca e profissional → cards devem filtrar em tempo real
5. Clicar num card → modal abre com dados corretos
6. Salvar com `CRM_SCRIPT_URL` vazia → status "salvo localmente apenas" aparece → modal fecha → card muda de coluna
7. (Após configurar Apps Script) → testar save real → verificar aba `CRM_Pendentes` no Sheets

---

## Task 8: Configurar Apps Script URL e testar save real

**Files:**
- Modify: `dashboard-feegow-v2.html` — constante `CRM_SCRIPT_URL`

- [ ] **Step 8.1: Após fazer deploy do Apps Script (Task 1), inserir a URL**

Localizar:
```javascript
        const CRM_SCRIPT_URL = ""; // ex: "https://script.google.com/macros/s/XXX/exec"
```
Substituir pela URL real:
```javascript
        const CRM_SCRIPT_URL = "https://script.google.com/macros/s/SEU_ID_AQUI/exec";
```

- [ ] **Step 8.2: Testar save completo**

1. Abrir dashboard, aba Pendentes
2. Clicar num card → preencher todos os campos → Salvar
3. Status deve mostrar "✓ Salvo no Sheets"
4. Abrir Google Sheets → aba `CRM_Pendentes` → verificar que a linha foi criada
5. Recarregar o dashboard → card deve manter os dados e estar na coluna correta

- [ ] **Step 8.3: Testar upsert (editar um card já salvo)**

1. Clicar no mesmo card novamente → campos devem estar pré-preenchidos com os dados salvos
2. Alterar um campo → Salvar
3. Sheets deve atualizar a linha existente (não criar duplicata)

---

## Notas de Implementação

- **CORS**: O Apps Script com `doGet`/`doPost` publicado como "Anyone" responde sem precisar de CORS headers especiais. Se houver erro de CORS, verificar que o deploy foi feito como Web App (não como API Executable).
- **Optimistic update**: O card é atualizado localmente antes de confirmar o Sheets — isso mantém a UI responsiva mesmo com latência da API.
- **CRM_SCRIPT_URL vazia**: O sistema funciona normalmente offline (sem persistência real). Útil para testes antes do deploy do Apps Script.
