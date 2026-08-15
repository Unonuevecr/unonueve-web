/* ==========================================================
   CLAUDIA — asistente virtual de UNONUEVE en el chat de la web
   Habla con el workflow de n8n (mismo cerebro que el WhatsApp).
   ========================================================== */
(function () {
  'use strict';

  const ENDPOINT = 'https://n8n-unonueve-n8n.i5i6e4.easypanel.host/webhook/claudia';
  const WHATSAPP = 'https://wa.me/50660508446?text=' +
    encodeURIComponent('Hola, vengo de la página y quiero información.');

  // Una sesión por pestaña del navegador: así Claudia recuerda el hilo.
  let sesion = sessionStorage.getItem('un9_sesion');
  if (!sesion) {
    sesion = 'web-' + Math.random().toString(36).slice(2) + '-' + Date.now();
    sessionStorage.setItem('un9_sesion', sesion);
  }

  /* ---------- marcado ---------- */
  const raiz = document.createElement('div');
  raiz.className = 'cl';
  raiz.innerHTML =
    '<a class="cl__wa" href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" aria-label="Escribinos por WhatsApp">' +
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C5.2 10 10 5.2 16 5.2S26.8 10 26.8 16 22 26.6 16 26.6zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.1 2.9 1.2 3.4 1 4.1.9.7-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6 0-.1-.2-.2-.5-.3z"/></svg>' +
    '</a>' +
    '<button class="cl__toggle" type="button" aria-label="Abrir el chat con Claudia">' +
      '<span class="cl__toggle-txt">Hablá con Claudia</span>' +
    '</button>' +
    '<section class="cl__panel" hidden aria-live="polite">' +
      '<header class="cl__head">' +
        '<div>' +
          '<strong>Claudia</strong>' +
          '<span>Asistente virtual · responde al instante</span>' +
        '</div>' +
        '<button class="cl__close" type="button" aria-label="Cerrar el chat">×</button>' +
      '</header>' +
      '<div class="cl__msgs" id="clMsgs"></div>' +
      '<form class="cl__form" autocomplete="off">' +
        '<input class="cl__input" type="text" placeholder="Escribí tu mensaje…" maxlength="600" aria-label="Mensaje">' +
        '<button class="cl__send" type="submit" aria-label="Enviar">→</button>' +
      '</form>' +
    '</section>';
  document.body.appendChild(raiz);

  const btn    = raiz.querySelector('.cl__toggle');
  const panel  = raiz.querySelector('.cl__panel');
  const cerrar = raiz.querySelector('.cl__close');
  const msgs   = raiz.querySelector('.cl__msgs');
  const form   = raiz.querySelector('.cl__form');
  const input  = raiz.querySelector('.cl__input');

  /* ---------- utilidades ---------- */
  function burbuja(texto, quien) {
    const d = document.createElement('div');
    d.className = 'cl__msg cl__msg--' + quien;
    d.textContent = texto;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function escribiendo() {
    const d = document.createElement('div');
    d.className = 'cl__msg cl__msg--bot cl__typing';
    d.innerHTML = '<i></i><i></i><i></i>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  let saludado = false;
  function abrir() {
    panel.hidden = false;
    btn.classList.add('cl__toggle--oculto');
    if (!saludado) {
      saludado = true;
      burbuja('¡Hola! Soy Claudia, la asistente de UNONUEVE. Contame a qué se dedica tu negocio y te digo cómo te podemos ayudar.', 'bot');
    }
    setTimeout(function () { input.focus(); }, 60);
  }

  function cerrarPanel() {
    panel.hidden = true;
    btn.classList.remove('cl__toggle--oculto');
  }

  btn.addEventListener('click', abrir);
  cerrar.addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) cerrarPanel();
  });

  /* ---------- envío ---------- */
  let enviando = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || enviando) return;

    burbuja(texto, 'yo');
    input.value = '';
    enviando = true;
    const puntos = escribiendo();

    const control = new AbortController();
    const corte = setTimeout(function () { control.abort(); }, 60000);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sesion, mensaje: texto }),
      signal: control.signal
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        puntos.remove();
        burbuja((d && d.reply) || 'No me llegó respuesta. Probá de nuevo en un momento.', 'bot');
      })
      .catch(function () {
        puntos.remove();
        const d = burbuja('Se me trabó la conexión. Escribinos por WhatsApp y te atendemos de una vez.', 'bot');
        const a = document.createElement('a');
        a.className = 'cl__link';
        a.href = WHATSAPP;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Abrir WhatsApp →';
        d.appendChild(a);
      })
      .then(function () {
        clearTimeout(corte);
        enviando = false;
      });
  });
})();
