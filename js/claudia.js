/* ==========================================================
   CLAUDIA — chat en vivo de unonuevecr.com
   ----------------------------------------------------------
   · Mismo cerebro que el WhatsApp (workflow de n8n «claudia»),
     pero la conversación pasa aquí, en la página: el botón ya
     no manda a WhatsApp.
   · Se ve como un chat de WhatsApp: burbujas, hora, «en línea»
     y «escribiendo…», con respuestas rápidas al estilo ManyChat.
   · La conversación se guarda en esta pestaña (sessionStorage),
     así sigue igual al pasar de la portada al test.
   · Trae sus propios estilos (clases cw-*), no depende de la página.
   ========================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://n8n-unonueve-n8n.i5i6e4.easypanel.host/webhook/claudia';
  var WHATSAPP = 'https://wa.me/50660508446?text=' + encodeURIComponent('Hola, vengo de la página y quiero información.');
  var SALUDO = '¡Hola! Soy Claudia, de UNONUEVECR 👋 Contame a qué se dedica tu negocio y te digo cómo te podemos ayudar.';
  var RAPIDAS = [
    { t: 'Ver una demostración', m: 'Quiero ver una demostración del sistema' },
    { t: 'Agendar una reunión', m: 'Quiero agendar una reunión' },
    { t: 'Hacer el test', m: 'Quiero hacer el test de diagnóstico' },
    { t: '¿Cuánto cuesta?', m: '¿Cuánto cuesta un sistema para mi negocio?' }
  ];

  /* ---------- memoria de la pestaña ---------- */
  function leer(k, def) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var sesion = leer('un9_sesion_id', null);
  if (!sesion) {
    try { sesion = sessionStorage.getItem('un9_sesion'); } catch (e) {}
    if (!sesion) sesion = 'web-' + Math.random().toString(36).slice(2) + '-' + Date.now();
    guardar('un9_sesion_id', sesion);
  }
  var historial = leer('un9_chat', []);   // [{q:'bot'|'yo', t:'texto', h:'10:42'}]

  /* ---------- estilos ---------- */
  var CSS =
    '.cw{position:fixed;right:20px;bottom:20px;z-index:900;font:15px/1.45 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111b21}' +
    '.cw *{box-sizing:border-box}' +
    '.cw section,.cw header,.cw form{margin:0}.cw section.cw-panel{padding:0!important}.cw header.cw-cab{padding:11px 12px!important;position:static}' +
    '.cw-lanzar{position:relative;width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 10px 28px rgba(0,0,0,.28);transition:transform .2s}' +
    '.cw-lanzar:hover{transform:translateY(-2px) scale(1.04)}' +
    '.cw-lanzar svg{width:30px;height:30px;fill:#fff}' +
    '.cw-badge{position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;border-radius:10px;background:#E0463A;color:#fff;font:700 12px/20px Inter,sans-serif;text-align:center;padding:0 5px;border:2px solid #fff}' +
    '.cw-asoma{position:absolute;right:72px;bottom:6px;width:max-content;max-width:min(270px,calc(100vw - 110px));background:#fff;color:#111b21;border-radius:14px 14px 4px 14px;padding:11px 32px 11px 14px;box-shadow:0 10px 30px rgba(0,0,0,.22);font-size:14px;cursor:pointer;animation:cw-in .35s ease}' +
    '.cw-asoma b{display:block;font-size:12px;color:#008069;margin-bottom:2px}' +
    '.cw-asoma button{position:absolute;top:4px;right:6px;border:0;background:none;color:#667781;font-size:18px;cursor:pointer;line-height:1}' +
    '.cw-panel{position:absolute;right:0;bottom:0;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100vh - 40px));display:flex;flex-direction:column;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35);background:#efeae2;animation:cw-in .25s ease}' +
    '.cw-panel[hidden]{display:none}' +
    '.cw-cab{display:flex;align-items:center;gap:11px;padding:11px 12px;background:#008069;color:#fff}' +
    '.cw-ava{width:40px;height:40px;border-radius:50%;background:#14110E;display:grid;place-items:center;flex:none;overflow:hidden}' +
    '.cw-ava svg{width:26px;height:26px;fill:#EFE7DC}' +
    '.cw-cab div{flex:1;min-width:0}' +
    '.cw-cab strong{display:block;font-size:16px;font-weight:600}' +
    '.cw-cab small{display:block;font-size:12.5px;opacity:.85}' +
    '.cw-cerrar{border:0;background:none;color:#fff;font-size:26px;line-height:1;cursor:pointer;opacity:.9;padding:4px 6px}' +
    '.cw-msgs{flex:1;overflow-y:auto;padding:14px 12px 8px;display:flex;flex-direction:column;gap:4px;' +
      'background-color:#efeae2;background-image:radial-gradient(rgba(0,0,0,.035) 1px,transparent 1px);background-size:18px 18px}' +
    '.cw-aviso{align-self:center;background:#fff5c4;color:#54656f;font-size:12px;border-radius:8px;padding:6px 10px;margin:2px 0 8px;text-align:center;max-width:92%}' +
    '.cw-m{position:relative;max-width:82%;padding:7px 10px 18px;border-radius:8px;font-size:14.5px;box-shadow:0 1px .5px rgba(11,20,26,.13);white-space:pre-wrap;word-wrap:break-word;margin-top:4px}' +
    '.cw-m.bot{align-self:flex-start;background:#fff;border-top-left-radius:0}' +
    '.cw-m.yo{align-self:flex-end;background:#d9fdd3;border-top-right-radius:0}' +
    '.cw-m.bot:before,.cw-m.yo:before{content:"";position:absolute;top:0;width:8px;height:10px}' +
    '.cw-m.bot:before{left:-7px;background:linear-gradient(225deg,#fff 50%,transparent 50%)}' +
    '.cw-m.yo:before{right:-7px;background:linear-gradient(135deg,#d9fdd3 50%,transparent 50%)}' +
    '.cw-m .h{position:absolute;right:8px;bottom:3px;font-size:11px;color:#667781}' +
    '.cw-m.yo .h:after{content:" ✓✓";color:#53bdeb}' +
    '.cw-m a{color:#027eb5;word-break:break-all}' +
    '.cw-esc{align-self:flex-start;background:#fff;border-radius:8px;border-top-left-radius:0;padding:12px 14px;display:flex;gap:4px;box-shadow:0 1px .5px rgba(11,20,26,.13);margin-top:4px}' +
    '.cw-esc i{width:7px;height:7px;border-radius:50%;background:#8696a0;animation:cw-pun 1.2s infinite}' +
    '.cw-esc i:nth-child(2){animation-delay:.15s}.cw-esc i:nth-child(3){animation-delay:.3s}' +
    '.cw-rap{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;margin:8px 0 4px}' +
    '.cw-rap button{border:1px solid #008069;background:#fff;color:#008069;border-radius:999px;padding:7px 12px;font:600 13px Inter,sans-serif;cursor:pointer}' +
    '.cw-rap button:hover{background:#008069;color:#fff}' +
    '.cw-form{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f0f2f5}' +
    '.cw-input{flex:1;border:0;border-radius:22px;padding:11px 16px;font:15px Inter,sans-serif;background:#fff;color:#111b21;outline:none}' +
    '.cw-enviar{width:44px;height:44px;border-radius:50%;border:0;background:#00a884;color:#fff;cursor:pointer;display:grid;place-items:center;flex:none}' +
    '.cw-enviar svg{width:20px;height:20px;fill:#fff}' +
    '.cw-enviar[disabled]{opacity:.55;cursor:default}' +
    '.cw-pie{font-size:10.5px;color:#8696a0;text-align:center;padding:0 10px 7px;background:#f0f2f5}' +
    '.cw-pie a{color:#8696a0}' +
    '.cw.abierto .cw-lanzar,.cw.abierto .cw-asoma{display:none}' +
    '@keyframes cw-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
    '@keyframes cw-pun{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}' +
    '@media(max-width:600px){.cw{right:14px;bottom:14px}' +
      '.cw.abierto{inset:0;right:0;bottom:0}.cw.abierto .cw-panel{position:fixed;inset:0;width:100%;height:100%;border-radius:0}}' +
    '@media(prefers-reduced-motion:reduce){.cw *{animation:none!important;transition:none!important}}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  /* ---------- marcado ---------- */
  var ICONO_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6 2 11c0 2.6 1.2 4.9 3.2 6.6L4.5 22l4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-4 10-9S17.5 2 12 2zm-4 10.2a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z"/></svg>';
  var LOGO = '<svg viewBox="0 0 647.47 557.92" aria-hidden="true"><path d="M102.04,0v543.23h-38.91V52.12L5.14,114.52l-5.14-4.4L102.04,0Z"/><path d="M137.27,372.92c0-18.35,14.68-33.03,33.04-33.03s32.3,14.68,32.3,33.03-14.68,32.3-32.3,32.3-33.04-14.68-33.04-32.3ZM137.27,524.88c0-17.62,14.68-32.3,33.04-32.3s32.3,14.68,32.3,32.3-14.68,33.03-32.3,33.03-33.04-14.68-33.04-33.03Z"/><path d="M352.36,549.84c140.21,0,224.63-132.14,246.66-255.47-26.43,65.33-90.29,106.44-161.5,106.44-116.72,0-199.68-83.69-199.68-199.67S326.67,2.2,437.52,2.2c129.2,0,209.95,104.98,209.95,228.31,0,162.97-123.33,326.67-295.11,326.67v-7.34ZM605.62,225.37c0-99.84-53.59-216.56-168.11-216.56-101.31,0-158.57,101.31-158.57,192.33s57.26,192.33,158.57,192.33c94.7,0,168.11-73.41,168.11-168.11Z"/></svg>';
  var raiz = document.createElement('div');
  raiz.className = 'cw notranslate';
  raiz.setAttribute('translate', 'no');
  raiz.innerHTML =
    '<button class="cw-lanzar" type="button" aria-label="Abrir el chat con Claudia">' + ICONO_CHAT + '<span class="cw-badge" hidden>1</span></button>' +
    '<section class="cw-panel" hidden role="dialog" aria-label="Chat con Claudia, de UNONUEVECR">' +
      '<header class="cw-cab"><span class="cw-ava">' + LOGO + '</span>' +
        '<div><strong>Claudia · UNONUEVECR</strong><small class="cw-estado">en línea</small></div>' +
        '<button class="cw-cerrar" type="button" aria-label="Cerrar el chat">×</button></header>' +
      '<div class="cw-msgs" aria-live="polite"><div class="cw-aviso">🔒 Asistente virtual de UNONUEVECR. Te responde al instante, a cualquier hora.</div></div>' +
      '<form class="cw-form" autocomplete="off">' +
        '<input class="cw-input" type="text" placeholder="Escribí un mensaje" maxlength="600" aria-label="Mensaje">' +
        '<button class="cw-enviar" type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>' +
      '</form>' +
      '<div class="cw-pie">Al escribir aceptás nuestra <a href="/privacidad/">política de privacidad</a>.</div>' +
    '</section>';

  function montar() {
    document.body.appendChild(raiz);
    var lanzar = raiz.querySelector('.cw-lanzar');
    var badge = raiz.querySelector('.cw-badge');
    var panel = raiz.querySelector('.cw-panel');
    var msgs = raiz.querySelector('.cw-msgs');
    var form = raiz.querySelector('.cw-form');
    var input = raiz.querySelector('.cw-input');
    var enviarBtn = raiz.querySelector('.cw-enviar');
    var estado = raiz.querySelector('.cw-estado');
    var asoma = null;

    function hora() {
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    /* texto → nodos, con los enlaces clicables (sin innerHTML con datos de afuera) */
    function pintarTexto(el, texto) {
      var partes = String(texto).split(/(https?:\/\/[^\s<>()"']+|unonuevecr\.com\/[^\s<>()"']*)/g);
      for (var i = 0; i < partes.length; i++) {
        var p = partes[i];
        if (!p) continue;
        if (i % 2 === 1) {
          var limpio = p.replace(/[.,;:!?)]+$/, '');
          var resto = p.slice(limpio.length);
          var a = document.createElement('a');
          a.href = /^https?:/.test(limpio) ? limpio : 'https://' + limpio;
          var mismo = /^https?:\/\/(www\.)?unonuevecr\.com/.test(a.href);
          if (!mismo) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          a.textContent = limpio;
          el.appendChild(a);
          if (resto) el.appendChild(document.createTextNode(resto));
        } else {
          el.appendChild(document.createTextNode(p));
        }
      }
    }

    function burbuja(quien, texto, h, sinGuardar) {
      var d = document.createElement('div');
      d.className = 'cw-m ' + quien;
      pintarTexto(d, texto);
      var s = document.createElement('span'); s.className = 'h'; s.textContent = h || hora();
      d.appendChild(s);
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      if (!sinGuardar) { historial.push({ q: quien, t: texto, h: s.textContent }); guardar('un9_chat', historial.slice(-60)); }
      return d;
    }

    function rapidas() {
      quitarRapidas();
      var c = document.createElement('div'); c.className = 'cw-rap';
      for (var i = 0; i < RAPIDAS.length; i++) {
        var b = document.createElement('button'); b.type = 'button';
        b.textContent = RAPIDAS[i].t; b.setAttribute('data-m', RAPIDAS[i].m);
        c.appendChild(b);
      }
      c.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (b) enviar(b.getAttribute('data-m'));
      });
      msgs.appendChild(c);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function quitarRapidas() { var r = msgs.querySelector('.cw-rap'); if (r) r.remove(); }

    /* conversación guardada de esta pestaña */
    for (var i = 0; i < historial.length; i++) burbuja(historial[i].q, historial[i].t, historial[i].h, true);

    function abrir() {
      raiz.classList.add('abierto');
      panel.hidden = false;
      badge.hidden = true;
      if (asoma) { asoma.remove(); asoma = null; }
      guardar('un9_chat_visto', 1);
      if (!historial.length) burbuja('bot', SALUDO);
      var yaEscribio = historial.some(function (m) { return m.q === 'yo'; });
      if (!yaEscribio && !msgs.querySelector('.cw-rap')) rapidas();
      msgs.scrollTop = msgs.scrollHeight;
      if (window.matchMedia('(min-width:601px)').matches) setTimeout(function () { input.focus(); }, 60);
    }
    function cerrar() { raiz.classList.remove('abierto'); panel.hidden = true; }

    lanzar.addEventListener('click', abrir);
    raiz.querySelector('.cw-cerrar').addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) cerrar(); });
    /* cualquier enlace o botón de la página con data-chat abre el chat */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-chat]'); if (!t) return;
      e.preventDefault(); abrir();
    });

    /* mensajito que asoma, una vez por pestaña, si nunca abrió el chat */
    if (!historial.length && !leer('un9_chat_visto', 0)) {
      setTimeout(function () {
        if (!panel.hidden) return;
        badge.hidden = false;
        asoma = document.createElement('div');
        asoma.className = 'cw-asoma';
        asoma.innerHTML = '<b>Claudia · UNONUEVECR</b>¿Te ayudo a ver qué se puede automatizar en tu negocio? <button type="button" aria-label="Cerrar">×</button>';
        asoma.addEventListener('click', function (e) {
          if (e.target.tagName === 'BUTTON') { e.stopPropagation(); asoma.remove(); asoma = null; guardar('un9_chat_visto', 1); return; }
          abrir();
        });
        raiz.appendChild(asoma);
      }, 9000);
    }

    /* ---------- envío ---------- */
    var enviando = false, primero = !historial.some(function (m) { return m.q === 'yo'; });
    function enviar(texto) {
      texto = String(texto || '').trim();
      if (!texto || enviando) return;
      quitarRapidas();
      burbuja('yo', texto);
      input.value = '';
      enviando = true; enviarBtn.disabled = true;
      estado.textContent = 'escribiendo…';
      var esc = document.createElement('div'); esc.className = 'cw-esc'; esc.innerHTML = '<i></i><i></i><i></i>';
      msgs.appendChild(esc); msgs.scrollTop = msgs.scrollHeight;

      if (primero) {
        primero = false;
        if (typeof window.un9Evento === 'function') window.un9Evento('chat_iniciado', { canal: 'web' }, { meta: 'Contact', eventID: 'chat-' + sesion });
      }

      var control = window.AbortController ? new AbortController() : null;
      var corte = setTimeout(function () { if (control) control.abort(); }, 60000);
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sesion, mensaje: texto }),
        signal: control ? control.signal : undefined
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          esc.remove();
          burbuja('bot', (d && d.reply) || 'No me llegó la respuesta. ¿Me lo escribís de nuevo?');
        })
        .catch(function () {
          esc.remove();
          var b = burbuja('bot', 'Se me trabó la conexión un momento. Probá enviarlo otra vez; si sigue fallando, también te atendemos por WhatsApp: ', null, true);
          var a = document.createElement('a'); a.href = WHATSAPP; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'abrir WhatsApp';
          b.insertBefore(a, b.lastChild);
        })
        .then(function () {
          clearTimeout(corte);
          enviando = false; enviarBtn.disabled = false;
          estado.textContent = 'en línea';
        });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); enviar(input.value); });

    /* si venía abierto de la página anterior, no lo abrimos solo: solo mostramos que hay conversación */
    window.un9Chat = { abrir: abrir };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
