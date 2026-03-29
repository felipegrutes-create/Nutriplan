// =========================================================
// Feegow CRM — Google Apps Script Web App
// Cole este código no Apps Script da planilha e faça deploy
// como Web App: Execute as = você, Who has access = Anyone
// =========================================================

const CRM_SHEET_NAME = 'CRM_Pendentes';
const CRM_LOG_SHEET  = 'CRM_Log';
const CRM_HEADERS = [
  'paciente_key','contato1_data','contato2_data',
  'vendedora','valor','retorno_marcado','proposta_feita',
  'parc_pago','quitado','observacoes','classificacao','ultima_atualizacao'
];
const LOG_HEADERS = [
  'timestamp','acao','paciente_key','usuario',
  'dados_anteriores','coluna_origem','coluna_destino'
];
const DONOR_SHEET = 'Doadoras_Perfis';
const DONOR_HEADERS = ['id','codigo_perfil','dados','ultima_atualizacao'];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';

    // Retornar log de exclusões
    if (action === 'get_log') {
      const logSheet = getOrCreateLogSheet();
      const data = logSheet.getDataRange().getValues();
      if (data.length <= 1) return jsonOk({ logs: [] });
      const headers = data[0];
      const logs = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      return jsonOk({ logs });
    }

    // Retornar perfis de doadoras
    if (action === 'get_donors') {
      const dSheet = getOrCreateDonorSheet();
      const dData = dSheet.getDataRange().getValues();
      if (dData.length <= 1) return jsonOk({ profiles: [] });
      const dHeaders = dData[0];
      const profiles = dData.slice(1).map(row => {
        const obj = {};
        dHeaders.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      return jsonOk({ profiles });
    }

    // Retornar registros CRM (padrão)
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
    const action = body.action || 'save';

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (action === 'save_donor') {
        return handleSaveDonor(body);
      }

      const key = (body.paciente_key || '').trim();
      if (!key) return jsonErr('paciente_key obrigatório');

      if (action === 'delete') {
        return handleDelete(body, key);
      } else if (action === 'undo_delete') {
        return handleUndoDelete(body, key);
      } else {
        return handleSave(body, key);
      }
    } finally {
      lock.releaseLock();
    }
  } catch(err) {
    return jsonErr(err.message);
  }
}

function handleSave(body, key) {
  const sheet = getOrCreateSheet();
  const data  = sheet.getDataRange().getValues();
  if (data.length === 0) return jsonErr('Planilha sem cabeçalho');
  const headers = data[0];
  const keyCol  = headers.indexOf('paciente_key');
  if (keyCol === -1) return jsonErr('Header paciente_key não encontrado');

  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim() === key) {
      targetRow = i + 1;
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
}

function handleDelete(body, key) {
  const sheet = getOrCreateSheet();
  const data  = sheet.getDataRange().getValues();
  if (data.length === 0) return jsonErr('Planilha sem cabeçalho');
  const headers = data[0];
  const keyCol  = headers.indexOf('paciente_key');
  if (keyCol === -1) return jsonErr('Header paciente_key não encontrado');

  // Buscar dados anteriores
  let targetRow = -1;
  let oldData = {};
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim() === key) {
      targetRow = i + 1;
      headers.forEach((h, j) => { oldData[h] = data[i][j]; });
      break;
    }
  }

  // Gravar log antes de apagar
  const logSheet = getOrCreateLogSheet();
  logSheet.appendRow([
    new Date().toISOString(),
    'delete',
    key,
    body.usuario || 'desconhecido',
    JSON.stringify(oldData),
    body.coluna_origem || '',
    body.coluna_destino || ''
  ]);

  // Limpar registro CRM (manter apenas paciente_key)
  if (targetRow > 0) {
    const emptyRow = headers.map(h => h === 'paciente_key' ? key : (h === 'ultima_atualizacao' ? new Date().toISOString() : ''));
    sheet.getRange(targetRow, 1, 1, emptyRow.length).setValues([emptyRow]);
  }

  return jsonOk({ success: true, logged: true });
}

function handleUndoDelete(body, key) {
  // Restaurar dados de um log de exclusão
  const previousData = body.dados_anteriores;
  if (!previousData) return jsonErr('dados_anteriores obrigatório para undo');

  const sheet = getOrCreateSheet();
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyCol  = headers.indexOf('paciente_key');

  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim() === key) {
      targetRow = i + 1;
      break;
    }
  }

  previousData.ultima_atualizacao = new Date().toISOString();
  const rowData = headers.map(h => previousData[h] !== undefined ? previousData[h] : '');

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  // Gravar log do undo
  const logSheet = getOrCreateLogSheet();
  logSheet.appendRow([
    new Date().toISOString(),
    'undo_delete',
    key,
    body.usuario || 'desconhecido',
    JSON.stringify(previousData),
    '',
    ''
  ]);

  return jsonOk({ success: true });
}

function handleSaveDonor(body) {
  const id = (body.id || '').trim();
  if (!id) return jsonErr('id obrigatório para perfil');

  const sheet = getOrCreateDonorSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === id) {
      targetRow = i + 1;
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
}

function getOrCreateDonorSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONOR_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DONOR_SHEET);
    sheet.getRange(1, 1, 1, DONOR_HEADERS.length).setValues([DONOR_HEADERS]);
    sheet.getRange(1, 1, 1, DONOR_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
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

function getOrCreateLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CRM_LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CRM_LOG_SHEET);
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setFontWeight('bold');
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
