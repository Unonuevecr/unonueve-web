/* ============================================================
   app.js — contenido, scroll, cotizador y formularios.

   >>> TODO LO EDITABLE ESTÁ EN "CONFIG" Y EN "SERVICIOS". <<<
   ============================================================ */
(function () {
  'use strict';

  // El sitio es una historia con scroll: al recargar siempre se empieza arriba.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ==========================================================
     CONFIG — cambiá estos valores y listo
     ========================================================== */
  const CONFIG = {
    // Página de reserva de Google Calendar (enlace público, sin el /u/0/).
    // Vacío = muestra el botón de WhatsApp como respaldo.
    agendaUrl: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0yJ3iH09agBQ9Okk7JEdentch4nJozhvL6X1XcyGqulLOkpsG4LrW7HiO6h3UI-mPdFwMChGIW',

    // Web3Forms: llave pública del formulario (va en el HTML a propósito).
    // Vacío = el formulario abre el correo del usuario con todo el detalle.
    web3formsKey: '0747f1fa-892e-4a00-a295-d4775e1b953f',

    correo: 'coti@unonuevecr.com',

    // Redes: dejá en blanco las que no uses y no se muestran
    redes: {
      instagram: 'https://www.instagram.com/unonuevecr',
      tiktok:    'https://www.tiktok.com/@unonuevecr',
      facebook:  'https://www.facebook.com/unonuevecr',
      linkedin:  '',
      youtube:   ''
    },

    whatsapp: '50660508446',      // sin +, sin espacios
    moneda: '$'
  };

  /* ==========================================================
     SERVICIOS — textos del scroll + precios del cotizador
     mensual/setup en rangos [mínimo, máximo] USD
     ========================================================== */
  const SERVICIOS = [
    {
      id: 'contenido',
      imagen: 'assets/svc-contenido.png',
      num: '01',
      titulo: 'Contenido que <em>conecta</em>.',
      eyebrow: 'Generación de contenido y pauta',
      lead: 'Guiones, piezas y publicaciones pensadas por nivel de conciencia: no publicamos por publicar, publicamos para mover a alguien. Y lo que funciona, lo empujamos con pauta.',
      puntos: [
        'Cronograma mensual listo antes de que empiece el mes',
        'Piezas gráficas, carruseles y reels con tu identidad',
        'Pauta publicitaria administrada y medida'
      ],
      mensual: [799, 1199], setup: [0, 0],
      cotDesc: 'Cronograma, piezas, guiones y pauta publicitaria.'
    },
    {
      id: 'automatizacion',
      imagen: 'assets/svc-automatizacion.png',
      num: '02',
      titulo: 'Tu negocio <em>trabajando solo</em>.',
      eyebrow: 'Automatizaciones y bots',
      lead: 'Flujos y bots que atienden, cotizan, dan seguimiento y registran. Acá vive el servicio al cliente: un bot de WhatsApp que contesta a las 9 de la noche igual que a las 9 de la mañana.',
      puntos: [
        'Bot de WhatsApp con tu catálogo y tus precios, 24/7',
        'Seguimiento automático de cada lead hasta que alguien lo contacte',
        'Cobros, pedidos y reportes que se registran solos'
      ],
      mensual: [300, 500], setup: [500, 2000],
      cotDesc: 'Bots de WhatsApp, flujos y seguimiento automático.'
    },
    {
      id: 'mercadeo',
      imagen: 'assets/svc-mercadeo.png',
      num: '03',
      titulo: 'Estrategia, <em>no suerte</em>.',
      eyebrow: 'Mercadeo',
      lead: 'Antes de gastar en pauta definimos a quién le hablamos, en qué momento está y qué tiene que escuchar para comprar.',
      puntos: [
        'Investigación de mercado y de tu competencia',
        'Embudo y ángulos por nivel de conciencia',
        'Campañas medidas: sabemos qué peso trae qué'
      ],
      mensual: [540, 1199], setup: [0, 0],
      cotDesc: 'Estrategia, embudo y campañas medidas.'
    },
    {
      id: 'foto',
      imagen: 'assets/svc-foto.png',
      num: '04',
      titulo: 'Tu marca, <em>bien vista</em>.',
      eyebrow: 'Fotografía profesional',
      lead: 'Fotos de equipo, producto y local con calidad de catálogo. Porque la primera impresión de tu marca casi siempre es una imagen.',
      puntos: [
        'Retratos profesionales para todo tu equipo',
        'Producto y tienda listos para catálogo y redes',
        'Edición y entrega en formatos para web y redes'
      ],
      mensual: [0, 0], setup: [0, 0], porHora: [70, 100],
      cotDesc: 'Por hora de sesión (≈ ₡30.000): equipo, producto o local.'
    }
  ];

  // El caso del cliente NO cambia el precio mostrado: el cotizador da el
  // precio real. El descuento se ofrece al agendar la llamada.
  const TAMANOS = [
    { id: 'sesion', nombre: 'Sesión de fotografía', desc: 'Solo la sesión, sin mensualidad', mult: 1, rebaja: 0 },
    { id: 'marca',  nombre: 'Marca personal',       desc: 'Tu nombre es la marca',          mult: 1, rebaja: 20 },
    { id: 'emp',    nombre: 'Emprendedor',          desc: '1–3 personas',                   mult: 1, rebaja: 20 },
    { id: 'pyme',   nombre: 'Pyme',                 desc: '4–20 personas',                  mult: 1, rebaja: 15 },
    { id: 'emp2',   nombre: 'Empresa',              desc: '+20 personas',                   mult: 1, rebaja: 10 }
  ];

  // La urgencia es solo un dato para agendar la entrega: NO cambia el precio.
  const URGENCIAS = [
    { id: 'normal', nombre: 'Tiempo normal', desc: 'Calendario habitual', mult: 1.00 },
    { id: 'ya',     nombre: 'Urgente',       desc: 'Lo antes posible',    mult: 1.00 }
  ];

  /* ==========================================================
     1 · Pinta las etapas de servicio en el scroll
     ========================================================== */
  SERVICIOS.forEach(function (s, i) {
    const el = document.querySelector('.stage[data-stage="' + (i + 2) + '"]');
    if (!el) return;
    el.innerHTML =
      '<div class="stage__text">' +
        '<p class="eyebrow">' + s.eyebrow + '</p>' +
        '<h2 class="display display--md">' + s.titulo + '</h2>' +
        '<p class="lead">' + s.lead + '</p>' +
        '<ul class="svc__list">' +
          s.puntos.map(function (p) { return '<li>' + p + '</li>'; }).join('') +
        '</ul>' +
        '<a href="#cotizador" class="btn btn--ghost">Cotizar esto <span class="btn__arrow">→</span></a>' +
      '</div>';
  });

  /* ==========================================================
     2 · Partículas
     ========================================================== */
  const canvas = document.getElementById('gl');
  const stages = Array.prototype.slice.call(document.querySelectorAll('.stage'));
  let field = null;

  function buildShapes(imgs, N) {
    const S = window.UNShapes;
    const wide = window.innerWidth > 860;
    const k = wide ? 1 : 0.46;                                  // más chico en móvil
    const list = [];

    // 0 · el rostro real, como fotografía hecha de partículas
    list.push(S.fromPhoto(imgs.cara, N, wide ? 1.42 : 0.58, 1.18));

    // 1 · el cerebro
    list.push(S.fromPhoto(imgs.cerebro, N, (wide ? 1.30 : 0.56), 1.30));

    SERVICIOS.forEach(function (s) {                            // 2–5 · servicios
      list.push(S.fromPhoto(imgs[s.id], N, (wide ? 1.25 : 0.55), 1.22));
    });
    list.push(S.torus(N, 0.60 * k, 0.235 * k));                 // 6 · cierre

    list[list.length - 1].spin = 1;                             // solo el toroide gira
    return list;
  }

  // Las formas se calculan según el ancho de pantalla. Si el usuario agranda
  // la ventana (o gira el teléfono) hay que volver a generarlas, si no la
  // figura se queda del tamaño del modo anterior.
  let imgsCargadas = null;
  let particulasN = 0;
  let modoFormas = null;

  function modoPantalla() { return window.innerWidth > 860 ? 'ancho' : 'compacto'; }

  function reconstruir() {
    if (!field || !imgsCargadas) return;
    modoFormas = modoPantalla();
    field.setShapes(buildShapes(imgsCargadas, particulasN));
    field.stage = -1;            // obliga a volver a subir los búferes
    layout();
    onScroll();
  }

  function initParticles() {
    let N;
    try {
      N = window.innerWidth > 860 ? 150000 : 45000;
      field = new window.ParticleField(canvas, N);
    } catch (e) {
      // Sin WebGL: mostramos la foto como respaldo y seguimos.
      canvas.style.display = 'none';
      document.body.classList.add('no-gl');
      return;
    }

    // Carga rostro + cerebro antes de construir las formas
    const fuentes = { cara: 'assets/hero-head.png', cerebro: 'assets/brain.png' };
    SERVICIOS.forEach(function (s) { fuentes[s.id] = s.imagen; });
    const imgs = {};
    let faltan = Object.keys(fuentes).length;

    function listo() {
      if (--faltan > 0) return;
      imgsCargadas = imgs;
      particulasN = N;
      reconstruir();
      field.start();
    }

    Object.keys(fuentes).forEach(function (key) {
      const im = new Image();
      im.onload = function () { imgs[key] = im; listo(); };
      im.onerror = function () { imgs[key] = document.createElement('canvas'); listo(); };
      im.src = fuentes[key];
    });
  }

  function layout() {
    if (!field) return;
    field.resize();
    const wide = window.innerWidth > 860;
    // pantalla ancha: la figura a la derecha, el texto a la izquierda
    field.offset = wide ? [0.38, 0.04] : [0, 0.66];
    field.scatter = wide ? 0.58 : 0.30;
  }

  /* ==========================================================
     3 · Scroll → morph + textos
     ========================================================== */
  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  function update() {
    const vh = window.innerHeight;
    const y = window.scrollY + vh * 0.5;   // referencia: centro de la pantalla

    // etapa activa + progreso dentro de ella
    let idx = 0, local = 0;
    for (let i = 0; i < stages.length; i++) {
      const el = stages[i];
      const top = el.offsetTop;
      const h = el.offsetHeight;
      if (y >= top && y < top + h) { idx = i; local = (y - top) / h; break; }
      if (y >= top + h) { idx = i; local = 1; }
    }

    // se mantiene la forma un rato y luego se transforma
    const t = smoothstep(0.52, 1.0, local);
    if (field) field.setMorph(idx, t);

    // texto de la etapa: visible mientras no esté en plena transformación
    stages.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx && local < 0.72);
    });

    // el lienzo se desvanece al terminar la historia
    const last = stages[stages.length - 1];
    const end = last.offsetTop + last.offsetHeight;
    const fade = 1 - smoothstep(0, vh * 0.6, window.scrollY + vh - end);
    canvas.style.opacity = Math.max(0, fade);
    if (field) field.fade = Math.max(0, fade);

    // nav: fijo al bajar + invertido cuando pasa sobre una sección oscura
    const nav = document.getElementById('nav');
    nav.classList.toggle('is-stuck', window.scrollY > 40);

    let onDark = false;
    document.querySelectorAll('.panel--dark, .footer').forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.top <= 36 && r.bottom >= 36) onDark = true;
    });
    nav.classList.toggle('is-onDark', onDark);
  }

  /* ==========================================================
     4 · Cotizador
     ========================================================== */
  function money(n) {
    return CONFIG.moneda + Math.round(n).toLocaleString('en-US');
  }

  function optHTML(type, name, id, titulo, desc) {
    return '<label class="opt">' +
      '<input type="' + type + '" name="' + name + '" value="' + id + '">' +
      '<span class="opt__box">' +
        '<span class="opt__title">' + titulo + '<span class="opt__tick">✓</span></span>' +
        '<span class="opt__desc">' + desc + '</span>' +
      '</span></label>';
  }

  const boxServ = document.getElementById('optServicios');
  const boxTam  = document.getElementById('optTamano');
  const boxUrg  = document.getElementById('optUrgencia');

  boxServ.innerHTML = SERVICIOS.map(function (s, i) {
    return optHTML('checkbox', 'servicio', s.id, (i + 1) + '. ' + s.eyebrow, s.cotDesc);
  }).join('');

  boxTam.innerHTML = TAMANOS.map(function (t) {
    return optHTML('radio', 'tamano', t.id, t.nombre, t.desc);
  }).join('');

  boxUrg.innerHTML = URGENCIAS.map(function (u) {
    return optHTML('radio', 'urgencia', u.id, u.nombre, u.desc);
  }).join('');

  // valores por defecto
  boxTam.querySelector('input[value="pyme"]').checked = true;
  boxUrg.querySelector('input[value="normal"]').checked = true;

  const form = document.getElementById('quoteForm');
  const elMensual = document.getElementById('priceMonthly');
  const elSetup   = document.getElementById('priceSetup');
  const elHora    = document.getElementById('priceHora');

  function calcular() {
    const elegidos = Array.prototype.slice
      .call(form.querySelectorAll('input[name="servicio"]:checked'))
      .map(function (i) { return i.value; });

    const tamId = (form.querySelector('input[name="tamano"]:checked') || {}).value;
    const urgId = (form.querySelector('input[name="urgencia"]:checked') || {}).value;
    const tam = TAMANOS.find(function (t) { return t.id === tamId; }) || TAMANOS[1];
    const urg = URGENCIAS.find(function (u) { return u.id === urgId; }) || URGENCIAS[0];

    let mMin = 0, mMax = 0, sMin = 0, sMax = 0, hMin = 0, hMax = 0;
    elegidos.forEach(function (id) {
      const s = SERVICIOS.find(function (x) { return x.id === id; });
      if (!s) return;
      mMin += s.mensual[0]; mMax += s.mensual[1];
      sMin += s.setup[0];   sMax += s.setup[1];
      if (s.porHora) { hMin += s.porHora[0]; hMax += s.porHora[1]; }
    });

    // descuento por tamaño de negocio + recargo por urgencia
    const f = tam.mult * urg.mult;
    mMin *= f; mMax *= f;
    sMin *= f; sMax *= f;
    hMin *= f; hMax *= f;

    const txtM = elegidos.length === 0 ? '—'
      : (mMax === 0 ? 'Sin mensualidad' : money(mMin) + ' – ' + money(mMax));
    const txtS = elegidos.length === 0 ? '—'
      : (sMax === 0 ? 'Sin costo de arranque' : money(sMin) + ' – ' + money(sMax));
    const txtH = elegidos.length === 0 ? '—'
      : (hMax === 0 ? 'No incluida' : money(hMin) + ' – ' + money(hMax) + ' / hora');

    elMensual.textContent = txtM;
    elSetup.textContent = txtS;
    elHora.textContent = txtH;

    const nombres = elegidos.map(function (id) {
      return (SERVICIOS.find(function (x) { return x.id === id; }) || {}).eyebrow;
    });

    document.getElementById('hResumen').value =
      (nombres.join(', ') || 'ninguno') +
      ' | Caso: ' + tam.nombre +
      (tam.rebaja ? ' (le corresponde ' + tam.rebaja + '% al agendar)' : '') +
      ' | Urgencia: ' + urg.nombre;
    document.getElementById('hMensual').value = txtM;
    document.getElementById('hSetup').value = txtS;
    document.getElementById('hHora').value = txtH;

    return { nombres: nombres, tam: tam, urg: urg, txtM: txtM, txtS: txtS, txtH: txtH };
  }

  form.addEventListener('change', calcular);
  calcular();

  /* ==========================================================
     5 · Envío del formulario
     ========================================================== */
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('quoteSubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.classList.remove('is-error');

    if (form.botcheck.checked) return;                 // bot

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const negocio = form.negocio.value.trim();
    const rubro = form.rubro.value.trim();
    const quiere = form.mensaje.value.trim();

    if (!nombre || !correo || correo.indexOf('@') < 0) {
      msg.textContent = 'Necesito tu nombre y un correo válido para mandarte el detalle.';
      msg.classList.add('is-error');
      return;
    }
    if (!negocio || !rubro || !quiere) {
      msg.textContent = 'Contame el negocio, a qué se dedica y qué querés cotizar — con eso te doy el precio exacto.';
      msg.classList.add('is-error');
      return;
    }

    const d = calcular();

    // Sin llave de Web3Forms todavía → abrimos el correo con todo escrito.
    if (!CONFIG.web3formsKey) {
      const cuerpo =
        'Nombre: ' + nombre + '\n' +
        'Correo: ' + correo + '\n' +
        'WhatsApp: ' + form.whatsapp.value + '\n' +
        'Negocio: ' + negocio + '\n' +
        'Se dedica a: ' + rubro + '\n\n' +
        'Servicios: ' + (d.nombres.join(', ') || '—') + '\n' +
        'Tamaño: ' + d.tam.nombre + '\n' +
        'Urgencia: ' + d.urg.nombre + '\n\n' +
        'Estimado mensual: ' + d.txtM + '\n' +
        'Implementación: ' + d.txtS + '\n' +
        'Fotografía: ' + d.txtH + '\n\n' +
        'Qué quiere cotizar: ' + quiere;

      window.location.href = 'mailto:' + CONFIG.correo +
        '?subject=' + encodeURIComponent('Cotización desde unonuevecr.com — ' + nombre) +
        '&body=' + encodeURIComponent(cuerpo);

      msg.textContent = 'Te abrí el correo con todo el detalle listo para enviar.';
      return;
    }

    // Asunto útil en la bandeja + responder le contesta al cliente
    document.getElementById('hSubject').value =
      'Cotización — ' + negocio + ' (' + nombre + ')';
    document.getElementById('hReply').value = correo;

    btn.disabled = true;
    msg.textContent = 'Enviando…';

    const fd = new FormData(form);
    fd.append('access_key', CONFIG.web3formsKey);

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r.success) {
          form.reset();
          calcular();
          msg.textContent = '¡Listo! Recibí tu cotización. Te escribo con el precio exacto.';
        } else {
          throw new Error(r.message || 'error');
        }
      })
      .catch(function () {
        msg.textContent = 'No se pudo enviar. Escribime a ' + CONFIG.correo;
        msg.classList.add('is-error');
      })
      .then(function () { btn.disabled = false; });
  });

  /* ==========================================================
     6 · Agenda (Cal.com) y detalles
     ========================================================== */
  (function agenda() {
    const wa = document.getElementById('waFallback');
    if (wa) wa.href = 'https://wa.me/' + CONFIG.whatsapp;

    if (!CONFIG.agendaUrl) return;
    const host = document.getElementById('calEmbed');

    // Google Calendar se incrusta con ?gv=true
    const marco = document.createElement('iframe');
    marco.src = CONFIG.agendaUrl + '?gv=true';
    marco.title = 'Agendá una cita de 30 minutos con UNONUEVE';
    marco.loading = 'lazy';
    marco.referrerPolicy = 'no-referrer';
    marco.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    marco.style.cssText = 'width:100%;height:640px;border:0;display:block;';
    host.innerHTML = '';
    host.appendChild(marco);
    host.classList.add('calEmbed--live');
  })();

  // Redes sociales en el footer
  (function redes() {
    const host = document.getElementById('redes');
    if (!host) return;

    const ICO = {
      instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/>',
      tiktok:    '<path d="M15 3v10.6a3.6 3.6 0 1 1-3.6-3.6"/><path d="M15 3.2c.5 2.4 2.1 3.9 4.5 4.1"/>',
      facebook:  '<path d="M14.2 8.6V6.9c0-.8.3-1.3 1.3-1.3h1.6V2.7c-.4-.1-1.3-.2-2.3-.2-2.3 0-3.8 1.4-3.8 4v2.1H8.5V12h2.5v9.4h3.2V12h2.4l.4-3.4h-2.8z"/>',
      linkedin:  '<rect x="2.5" y="2.5" width="19" height="19" rx="3"/><path d="M7.2 10.2v7M7.2 6.7v.1M11.6 17.2v-4a2.6 2.6 0 0 1 5.2 0v4"/>',
      youtube:   '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10.2 9.4l5 2.6-5 2.6z"/>'
    };
    const NOM = {
      instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook',
      linkedin: 'LinkedIn', youtube: 'YouTube'
    };

    const links = Object.keys(CONFIG.redes)
      .filter(function (k) { return CONFIG.redes[k]; })
      .map(function (k) {
        return '<a href="' + CONFIG.redes[k] + '" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + '</svg>' +
          '<span>' + NOM[k] + '</span></a>';
      });

    if (!links.length) { host.closest('.footer__col').style.display = 'none'; return; }
    host.innerHTML = links.join('');
  })();

  document.getElementById('year').textContent = new Date().getFullYear();

  // animación de entrada de bloques normales
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.reveal, .step').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .step').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ==========================================================
     7 · Arranque
     ========================================================== */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) initParticles(); else canvas.style.display = 'none';

  window.addEventListener('scroll', onScroll, { passive: true });
  let tResize;
  window.addEventListener('resize', function () {
    layout();
    onScroll();
    if (modoPantalla() !== modoFormas) {          // solo al cruzar el umbral
      clearTimeout(tResize);
      tResize = setTimeout(reconstruir, 250);     // reconstruir es caro
    }
  });
  update();

})();
