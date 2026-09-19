/* ==========================================================
   Cookies, Google Analytics 4 y Pixel de Meta (UNONUEVECR)
   ----------------------------------------------------------
   · Nada de analítica ni publicidad se carga sin permiso.
   · Tres categorías: necesarias (siempre), analítica (GA4),
     publicidad (Pixel de Meta + API de Conversiones).
   · La decisión se guarda en este navegador (un9_consent) y
     se puede cambiar con window.un9Cookies.abrir() — el enlace
     «Preferencias de cookies» del pie de página.
   · Uso en la página:
       un9Evento('generate_lead', {...}, {meta:'Lead', eventID:'…'})
       un9Consentimiento() → {analitica:bool, publicidad:bool}
   ========================================================== */
(function () {
  'use strict';
  var GA_ID = 'G-SL764JMT4N';
  var PIXEL_ID = '1547698312824982';
  var CLAVE = 'un9_consent';
  var VERSION = 2;

  /* ---------- Google: modo de consentimiento, todo denegado por defecto ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });

  var gaCargado = false, metaCargado = false;

  function cargarGA() {
    if (gaCargado) return;
    gaCargado = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function cargarMeta() {
    if (metaCargado) return;
    metaCargado = true;
    /* código base oficial del Pixel de Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ---------- decisión guardada ---------- */
  function leer() {
    try { var d = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return d && d.v === VERSION ? d : null; } catch (e) { return null; }
  }
  function guardar(d) {
    d.v = VERSION; d.fecha = new Date().toISOString();
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); localStorage.removeItem('un9_cookies'); } catch (e) {}
  }
  function aplicar(d) {
    if (d.analitica) cargarGA();
    if (d.publicidad) {
      gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
      cargarMeta();
    }
  }

  window.un9Consentimiento = function () {
    var d = leer(); return { analitica: !!(d && d.analitica), publicidad: !!(d && d.publicidad) };
  };

  /* Evento a GA4 y, si corresponde, al Pixel (con eventID para deduplicar con la API de Conversiones) */
  window.un9Evento = function (nombre, datos, meta) {
    if (gaCargado) gtag('event', nombre, datos || {});
    if (metaCargado && meta && meta.meta) {
      var op = meta.eventID ? { eventID: meta.eventID } : {};
      if (meta.custom) window.fbq('trackCustom', meta.meta, meta.datos || {}, op);
      else window.fbq('track', meta.meta, meta.datos || {}, op);
    }
  };


  /* Datos para la API de Conversiones: identificador del evento (para deduplicar con el Pixel),
     correo y teléfono en SHA-256 (nunca viajan en claro hacia Meta) y cookies _fbp/_fbc. */
  function sha256(txt) {
    if (!txt || !window.crypto || !window.crypto.subtle || !window.TextEncoder) return Promise.resolve('');
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function galleta(n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function limpiar(t) { return String(t || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\u00f1 ]/g, ''); }
  window.un9DatosMeta = function (correo, whatsapp, nombre) {
    var id = 'un9-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    var tel = String(whatsapp || '').replace(/\D/g, ''); if (tel.length === 8) tel = '506' + tel;
    var em = String(correo || '').trim().toLowerCase();
    var partes = limpiar(nombre).split(/\s+/).filter(Boolean);
    var fn = partes[0] || '', ln = partes.length > 1 ? partes[partes.length - 1] : '';
    var c = window.un9Consentimiento();
    if (!c.publicidad) return Promise.resolve({ event_id: id, consentimiento_publicidad: false });
    return Promise.all([sha256(em), sha256(tel), sha256(fn), sha256(ln), sha256('cr'), sha256(tel)]).then(function (h) {
      var r = { event_id: id, consentimiento_publicidad: true, em_hash: h[0], ph_hash: h[1], fn_hash: h[2], ln_hash: h[3], country_hash: h[4], external_id: h[5],
        fbp: galleta('_fbp'), fbc: galleta('_fbc'), url_evento: location.href };
      /* coincidencias avanzadas del Pixel: se le pasan los mismos datos, ya cifrados */
      if (metaCargado) {
        var am = { country: h[4] };
        if (h[0]) am.em = h[0]; if (h[1]) am.ph = h[1]; if (h[2]) am.fn = h[2]; if (h[3]) am.ln = h[3]; if (h[5]) am.external_id = h[5];
        window.fbq('init', PIXEL_ID, am);
      }
      return r;
    }).catch(function () { return { event_id: id, consentimiento_publicidad: true }; });
  };

  /* ---------- interfaz ---------- */
  var CSS =
    '.un9c{position:fixed;left:16px;right:16px;bottom:16px;z-index:950;max-width:620px;margin:0 auto;background:#14110E;color:#EFE7DC;' +
    'border:1px solid rgba(239,231,220,.18);border-radius:20px;padding:18px 20px;box-shadow:0 18px 50px rgba(0,0,0,.4);font:14px/1.55 Inter,system-ui,sans-serif}' +
    '.un9c h2{font:700 16px Inter,system-ui,sans-serif;margin:0 0 6px}.un9c p{margin:0}.un9c a{color:#E0B168}' +
    '.un9c .bt{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;justify-content:flex-end}' +
    '.un9c button{border-radius:999px;padding:10px 18px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;border:1.5px solid rgba(239,231,220,.25);background:transparent;color:#EFE7DC}' +
    '.un9c button.si{background:#C8892F;border-color:#C8892F;color:#14110E}' +
    '.un9c .cat{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;border-top:1px solid rgba(239,231,220,.12);padding:12px 0}' +
    '.un9c .cat b{display:block}.un9c .cat span{color:#C4B9AB;font-size:13px}' +
    '.un9c .sw{position:relative;flex:none;width:46px;height:26px}.un9c .sw input{opacity:0;width:0;height:0}' +
    '.un9c .sw i{position:absolute;inset:0;border-radius:30px;background:#3a332c;cursor:pointer;transition:.2s}' +
    '.un9c .sw i:after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#EFE7DC;transition:.2s}' +
    '.un9c .sw input:checked+i{background:#C8892F}.un9c .sw input:checked+i:after{left:23px}' +
    '.un9c .sw input:disabled+i{opacity:.55;cursor:not-allowed}' +
    '@media(max-width:600px){.un9c{bottom:84px;max-height:70vh;overflow:auto}}';

  function panel(detalle) {
    var viejo = document.querySelector('.un9c'); if (viejo) viejo.remove();
    if (!document.getElementById('un9c-css')) {
      var st = document.createElement('style'); st.id = 'un9c-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var d = leer() || { analitica: false, publicidad: false };
    var el = document.createElement('div');
    el.className = 'un9c'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Preferencias de cookies');
    var html = '<h2>Tu privacidad</h2><p>Usamos cookies para que el sitio funcione, medir las visitas y, si nos dejás, mostrarte anuncios relevantes en Facebook e Instagram. Vos elegís. <a href="/privacidad/#cookies">Ver política</a></p>';
    if (detalle) {
      html +=
        '<div style="margin-top:12px">' +
        '<div class="cat"><div><b>Necesarias</b><span>Hacen funcionar el sitio, el test y el chat. No se pueden desactivar.</span></div><label class="sw"><input type="checkbox" checked disabled><i></i></label></div>' +
        '<div class="cat"><div><b>Analítica</b><span>Google Analytics: cuántas personas visitan y qué páginas usan. Datos agregados, sin publicidad.</span></div><label class="sw"><input type="checkbox" data-c="analitica"' + (d.analitica ? ' checked' : '') + '><i></i></label></div>' +
        '<div class="cat"><div><b>Publicidad</b><span>Pixel y API de Conversiones de Meta: medir qué anuncios funcionan y mostrarte anuncios de UNONUEVECR.</span></div><label class="sw"><input type="checkbox" data-c="publicidad"' + (d.publicidad ? ' checked' : '') + '><i></i></label></div>' +
        '</div><div class="bt"><button type="button" data-a="no">Rechazar todo</button><button type="button" data-a="guardar">Guardar selección</button><button type="button" class="si" data-a="si">Aceptar todo</button></div>';
    } else {
      html += '<div class="bt"><button type="button" data-a="config">Configurar</button><button type="button" data-a="no">Rechazar</button><button type="button" class="si" data-a="si">Aceptar todo</button></div>';
    }
    el.innerHTML = html;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a'), dec;
      if (a === 'config') { panel(true); return; }
      if (a === 'si') dec = { analitica: true, publicidad: true };
      else if (a === 'no') dec = { analitica: false, publicidad: false };
      else dec = { analitica: !!el.querySelector('[data-c=analitica]').checked, publicidad: !!el.querySelector('[data-c=publicidad]').checked };
      var antes = leer();
      guardar(dec);
      el.remove();
      /* si retiró un permiso ya concedido, recargamos para descargar los scripts */
      if (antes && ((antes.analitica && !dec.analitica) || (antes.publicidad && !dec.publicidad))) { location.reload(); return; }
      aplicar(dec);
    });
    document.body.appendChild(el);
  }

  window.un9Cookies = { abrir: function () { panel(true); } };

  function iniciar() {
    /* enlaces «Preferencias de cookies» en cualquier parte de la página */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cookies]'); if (!a) return;
      e.preventDefault(); panel(true);
    });
    var d = leer();
    if (d) aplicar(d); else panel(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
