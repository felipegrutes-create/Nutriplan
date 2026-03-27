const Messages = (() => {
  function getTodayMessage(data) {
    const msgs = (data.mensajes && data.mensajes.messages) || [];
    if (!msgs.length) return null;
    const dayOfYear = getDayOfYear();
    const idx = (dayOfYear - 1) % msgs.length;
    return msgs[idx];
  }

  function getCelebration(data, streak) {
    const celebrations = (data.mensajes && data.mensajes.celebrations) || [];
    return celebrations.find(c => c.streak === streak) || null;
  }

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / 86400000);
  }

  function renderCard(data, streak) {
    const celebration = getCelebration(data, streak);
    if (celebration) {
      return `
        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:14px;padding:14px 16px;margin-bottom:16px;border:1px solid rgba(201,146,42,.2);text-align:center;position:relative;overflow:hidden">
          <div style="font-size:36px;margin-bottom:4px">${celebration.emoji}</div>
          <div style="font-size:16px;font-weight:800;color:#78350f">${celebration.title}</div>
          <div style="font-size:13px;color:#92400e;margin-top:4px">${celebration.text}</div>
        </div>`;
    }

    const msg = getTodayMessage(data);
    if (!msg) return '';

    return `
      <div style="background:linear-gradient(135deg,var(--verde),var(--verde-dark));border-radius:14px;padding:14px 16px;margin-bottom:16px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:.1">${msg.emoji}</div>
        <div style="font-size:11px;font-weight:700;opacity:.8;margin-bottom:4px">🌟 TU MENSAJE DEL DÍA</div>
        <div style="font-size:14px;line-height:1.5;font-weight:500">"${msg.text}"</div>
      </div>`;
  }

  return { getTodayMessage, getCelebration, renderCard };
})();
