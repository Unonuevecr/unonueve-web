/* ==========================================================
   De qué campaña llegó la persona (UNONUEVECR)
   ----------------------------------------------------------
   · Si la página se abre con utm_*, gclid (Google Ads) o
     fbclid (Meta), se guarda en este navegador por 30 días.
   · Gana el primer anuncio (primer toque): si después vuelve
     sin parámetros, se sigue sabiendo de dónde vino.
   · window.un9Origen() → página actual + los parámetros de la
     campaña. Los formularios lo mandan como «origen» y el
     sistema de seguimiento (sistema.unonuevecr.com) lo lee.
   ========================================================== */
(function () {
  'use strict';
  var CLAVE = 'un9_campana', DIAS = 30;
  var CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

  function leer() {
    try { var d = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (d && Date.now() - d.t < DIAS * 86400000) return d; } catch (e) {}
    return null;
  }
  var p = new URLSearchParams(location.search), q = [];
  CAMPOS.forEach(function (k) { var v = p.get(k); if (v) q.push(k + '=' + encodeURIComponent(v.slice(0, 80))); });
  if (q.length && !leer()) { try { localStorage.setItem(CLAVE, JSON.stringify({ q: q.join('&'), t: Date.now() })); } catch (e) {} }

  window.un9Campana = function () { var d = leer(); return d ? d.q : ''; };
  window.un9Origen = function () { var c = window.un9Campana(); return (location.pathname + (c ? '?' + c : '')).slice(0, 300); };
})();
