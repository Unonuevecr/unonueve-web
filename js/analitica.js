/* ==========================================================
   Google Analytics 4 con aviso de cookies (UNONUEVECR)
   No mide nada hasta que la persona acepta. Si rechaza, no se
   carga Analytics. La decisión se recuerda en este navegador.
   Uso en la página: window.un9Evento('generate_lead', {...})
   ========================================================== */
(function () {
  'use strict';
  var ID = 'G-SL764JMT4N';
  var CLAVE = 'un9_cookies';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  var cargado = false;
  function cargar() {
    if (cargado) return;
    cargado = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ID, { anonymize_ip: true });
  }

  window.un9Evento = function (nombre, datos) {
    if (cargado) gtag('event', nombre, datos || {});
  };

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) {} }

  function aviso() {
    var d = document.createElement('div');
    d.className = 'un9-cookies';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML =
      '<p>Usamos cookies de <b>Google Analytics</b> para saber cuántas personas visitan la página y mejorarla. ' +
      'No las usamos para publicidad. <a href="/privacidad/">Más información</a></p>' +
      '<div><button type="button" data-v="no">Rechazar</button><button type="button" data-v="si">Aceptar</button></div>';
    var css = document.createElement('style');
    css.textContent =
      '.un9-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:950;max-width:560px;margin:0 auto;background:#14110E;color:#EFE7DC;' +
      'border:1px solid rgba(239,231,220,.18);border-radius:18px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.35);font:14px/1.5 Inter,system-ui,sans-serif;' +
      'display:flex;gap:14px;align-items:center;flex-wrap:wrap}' +
      '.un9-cookies p{flex:1 1 260px;margin:0}.un9-cookies a{color:#E0B168}' +
      '.un9-cookies div{display:flex;gap:8px}' +
      '.un9-cookies button{border-radius:999px;padding:10px 18px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;border:1.5px solid rgba(239,231,220,.25);background:transparent;color:#EFE7DC}' +
      '.un9-cookies button[data-v=si]{background:#C8892F;border-color:#C8892F;color:#14110E}' +
      '@media(max-width:600px){.un9-cookies{bottom:84px}}';
    document.head.appendChild(css);
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      guardar(b.dataset.v);
      if (b.dataset.v === 'si') cargar();
      d.remove();
    });
    document.body.appendChild(d);
  }

  var decision = leer();
  if (decision === 'si') cargar();
  else if (decision !== 'no') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aviso); else aviso();
  }
})();
