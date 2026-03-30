function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Quiz NOVO (tem campo "etapa")
    if (data.etapa) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Novo');
      sheet.appendRow([
        data.fecha || new Date().toISOString(),
        data.nombre || '',
        data.email || '',
        data.peso || '',
        data.meta || '',
        data.altura || '',
        data.edad || '',
        data.perfil || '',
        data.objetivo || '',
        data.motivacion || '',
        data.tiempo_luchando || '',
        data.actividad || '',
        data.tipo_cuerpo || '',
        data.cuerpo_ideal || '',
        data.zonas || '',
        data.sueno || '',
        data.agua || '',
        data.dieta || '',
        data.cocina_para || '',
        data.hora_cena || '',
        data.tiempo_cocina || '',
        data.etapa || ''
      ]);
    } else {
      // Quiz ANTIGO (mantém funcionando igual)
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.email || '',
        data.profile || '',
        data.answers?.q1 || '',
        data.answers?.q2 || '',
        data.answers?.q3 || '',
        data.answers?.q4 || '',
        data.answers?.q5 || '',
        data.answers?.q6 || '',
        data.answers?.q7 || '',
        data.answers?.q8 || '',
        data.duration_seconds || '',
        data.utm_source || '',
        data.utm_medium || '',
        data.utm_campaign || ''
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
