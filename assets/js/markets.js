// ═══════════════════════════════════════════════════════
// RioMarket — configuración central de mercados (CL / AR)
// Fuente única de precios, WhatsApp, mensajes y renovación.
// Agregar un país nuevo (ej. México) = agregar una entrada
// a MARKETS + un botón en el selector. No tocar la lógica.
// ═══════════════════════════════════════════════════════
window.RioMarket = (function () {
  'use strict';

  var STORAGE_KEY = 'rl_market';

  // Vigencia de la promo: activa hasta el 30/09/2026 inclusive
  // (deja de estar activa a partir del 01/10/2026 00:00, hora local del visitante).
  var PROMO_DEADLINE = new Date(2026, 9, 1, 0, 0, 0);

  var MESSAGES = {
    hero:    'Hola%21%20Me%20interesa%20una%20Landing%20Page%20%F0%9F%9A%80',
    express: 'Hola%21%20Me%20interesa%20el%20plan%20Landing%20Express%20%F0%9F%9A%80',
    premium: 'Hola%21%20Me%20interesa%20el%20plan%20Landing%20Premium%20%F0%9F%9A%80',
    close:   'Hola%21%20Me%20interesa%20una%20Landing%20Page%20%F0%9F%9A%80'
  };

  var MARKETS = {
    CL: {
      code: 'CL',
      name: 'Chile',
      locale: 'es-CL',
      flag: 'https://flagcdn.com/20x15/cl.png',
      currency: 'CLP',
      whatsapp: '56985921512',
      express: { regular: 105000, promo: 50000 },
      premium: { regular: 130000, promo: 60000 },
      renewal: 13000,
      messages: MESSAGES
    },
    AR: {
      code: 'AR',
      name: 'Argentina',
      locale: 'es-AR',
      flag: 'https://flagcdn.com/20x15/ar.png',
      currency: 'ARS',
      whatsapp: '543781410164',
      express: { regular: 185000, promo: 120000 },
      premium: { regular: 230000, promo: 150000 },
      renewal: 17000,
      messages: MESSAGES
    }
  };

  var DEFAULT_MARKET = 'CL';
  var current = null;
  var listeners = [];

  function isPromoActive() {
    return Date.now() < PROMO_DEADLINE.getTime();
  }

  function formatMoney(amount, market) {
    try {
      return new Intl.NumberFormat(market.locale, { maximumFractionDigits: 0 }).format(amount);
    } catch (e) {
      return String(amount);
    }
  }

  function readStoredMarket() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && MARKETS[saved]) return saved;
    } catch (e) { /* localStorage no disponible (modo privado, etc.) */ }
    return null;
  }

  function detectByLocale() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.indexOf('America/Argentina') === 0 || tz === 'America/Buenos_Aires') return 'AR';
      if (tz === 'America/Santiago' || tz === 'America/Punta_Arenas') return 'CL';
    } catch (e) { /* Intl.DateTimeFormat no disponible */ }

    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      if (/-AR$/i.test(langs[i])) return 'AR';
      if (/-CL$/i.test(langs[i])) return 'CL';
    }
    return null;
  }

  function detect() {
    return readStoredMarket() || detectByLocale() || DEFAULT_MARKET;
  }

  function get() {
    return MARKETS[current];
  }

  function set(code, persist) {
    if (!MARKETS[code] || code === current) return;
    current = code;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* no-op si no hay storage */ }
    }
    for (var i = 0; i < listeners.length; i++) listeners[i](MARKETS[current]);
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  current = detect();

  return {
    MARKETS: MARKETS,
    codes: Object.keys(MARKETS),
    get: get,
    set: set,
    onChange: onChange,
    formatMoney: formatMoney,
    isPromoActive: isPromoActive,
    PROMO_DEADLINE: PROMO_DEADLINE
  };
})();
