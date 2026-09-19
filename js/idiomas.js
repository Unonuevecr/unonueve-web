/* ==========================================================
   Selector de idioma (UNONUEVECR): ES · EN · PT · IT
   ----------------------------------------------------------
   · El sitio está escrito en español. Los otros idiomas los
     traduce Google Translate en el navegador del visitante.
   · Nada de Google se carga hasta que alguien elige otro
     idioma: quien navega en español no le manda nada a Google.
   · La elección vive en la galleta «googtrans» (la que lee el
     traductor) y se recuerda entre páginas.
   · En la portada se mete en el menú; en el resto de páginas
     queda como botón flotante arriba a la derecha.
   ========================================================== */
(function () {
  'use strict';
  var IDIOMAS = [
    { c: 'es', t: 'ES', n: 'Español' },
    { c: 'en', t: 'EN', n: 'English' },
    { c: 'pt', t: 'PT', n: 'Português' },
    { c: 'it', t: 'IT', n: 'Italiano' }
  ];

  function actual() {
    var m = document.cookie.match(/(?:^|; )googtrans=\/es\/([a-z-]+)/);
    return m && m[1] !== 'es' ? m[1] : 'es';
  }

  function galleta(valor) {
    var host = location.hostname;
    var dominios = ['', 'domain=' + host + ';'];
    if (host.split('.').length > 1) dominios.push('domain=.' + host.replace(/^www\./, '') + ';');
    for (var i = 0; i < dominios.length; i++) {
      if (valor) document.cookie = 'googtrans=' + valor + ';path=/;' + dominios[i] + 'max-age=31536000;SameSite=Lax';
      else document.cookie = 'googtrans=;path=/;' + dominios[i] + 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  function elegir(c) {
    if (c === actual()) return;
    galleta(c === 'es' ? '' : '/es/' + c);
    location.reload();
  }

  function cargarTraductor() {
    window.un9IniciarTraductor = function () {
      /* global google */
      new google.translate.TranslateElement({ pageLanguage: 'es', includedLanguages: 'en,pt,it', autoDisplay: false }, 'un9-gt');
    };
    var d = document.createElement('div'); d.id = 'un9-gt'; d.style.display = 'none'; document.body.appendChild(d);
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=un9IniciarTraductor';
    s.async = true;
    document.body.appendChild(s);
  }

  var CSS =
    '.un9i{position:relative;display:inline-flex;font:600 13px/1 Inter,system-ui,sans-serif;z-index:60}' +
    '.un9i>button{display:flex;align-items:center;gap:6px;background:transparent;color:inherit;border:1.5px solid rgba(239,231,220,.28);border-radius:999px;padding:8px 12px;cursor:pointer;font:inherit;letter-spacing:.5px}' +
    '.un9i>button:hover{border-color:#E0B168;color:#E0B168}' +
    '.un9i ul{position:absolute;right:0;top:calc(100% + 8px);list-style:none;margin:0;padding:6px;background:#14110E;border:1px solid rgba(239,231,220,.18);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.4);min-width:150px;display:none}' +
    '.un9i.abierto ul{display:block}' +
    '.un9i li button{display:flex;justify-content:space-between;width:100%;background:none;border:0;color:#EFE7DC;padding:10px 12px;border-radius:9px;cursor:pointer;font:500 14px Inter,system-ui,sans-serif;text-align:left}' +
    '.un9i li button:hover,.un9i li button[aria-current=true]{background:rgba(200,137,47,.18);color:#E0B168}' +
    '.un9i li b{font-weight:700;opacity:.6;font-size:12px}' +
    '.un9i.flota{position:fixed;top:14px;right:16px;color:#EFE7DC}' +
    '.un9i.flota>button{background:rgba(20,17,14,.85);backdrop-filter:blur(8px)}' +
    /* esconde la barra que Google mete arriba y el globo al pasar el mouse */
    '.goog-te-banner-frame,.skiptranslate iframe,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd{display:none!important}' +
    'body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}' +
    '@media(max-width:900px){nav .un9i>button{padding:7px 10px}}';

  function montar() {
    if (document.querySelector('.un9i')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var hoy = actual();
    var cont = document.createElement('div');
    cont.className = 'un9i notranslate'; cont.setAttribute('translate', 'no');
    var sel = IDIOMAS[0];
    for (var i = 0; i < IDIOMAS.length; i++) if (IDIOMAS[i].c === hoy) sel = IDIOMAS[i];
    var html = '<button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>' +
      sel.t + '</button><ul role="menu">';
    for (var j = 0; j < IDIOMAS.length; j++) {
      html += '<li><button type="button" role="menuitem" data-l="' + IDIOMAS[j].c + '"' + (IDIOMAS[j].c === hoy ? ' aria-current="true"' : '') + '>' +
        IDIOMAS[j].n + ' <b>' + IDIOMAS[j].t + '</b></button></li>';
    }
    cont.innerHTML = html + '</ul>';
    var boton = cont.querySelector('button');
    boton.addEventListener('click', function (e) {
      e.stopPropagation();
      var ab = cont.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', ab ? 'true' : 'false');
    });
    cont.querySelector('ul').addEventListener('click', function (e) {
      var b = e.target.closest('[data-l]'); if (b) elegir(b.getAttribute('data-l'));
    });
    document.addEventListener('click', function () { cont.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cont.classList.remove('abierto'); });

    var nav = document.querySelector('#nav .wrap');
    if (nav) {
      var cta = nav.querySelector('.btn');
      nav.insertBefore(cont, cta || null);
    } else {
      cont.classList.add('flota');
      document.body.appendChild(cont);
    }
    if (hoy !== 'es') {
      document.documentElement.setAttribute('lang', hoy);
      cargarTraductor();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
