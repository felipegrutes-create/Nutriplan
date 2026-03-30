// ============================================
// INSTRUCOES: Cole este codigo no Google Apps Script
//
// 1. Abra sua planilha no Google Sheets
// 2. Menu: Extensoes > Apps Script
// 3. Apague tudo e cole este codigo
// 4. Clique em "Implantar" > "Nova implantacao"
// 5. Tipo: "App da Web"
// 6. Executar como: "Eu"
// 7. Quem tem acesso: "Qualquer pessoa"
// 8. Clique "Implantar"
// 9. Copie a URL e me envie
// ============================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.fecha || new Date().toISOString(),
      data.nombre || '',
      data.email || '',
      data.peso || '',
      data.meta || '',
      data.altura || '',
      data.edad || '',
      data.perfil || '',
      data.etapa || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Quiz Nutriplan Webhook ativo!')
    .setMimeType(ContentService.MimeType.TEXT);
}
