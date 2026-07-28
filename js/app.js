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
    // Cal.com: poné aquí tu enlace, ej. 'unonueve/30min'. Vacío = muestra WhatsApp.
    calLink: '',

    // Web3Forms: pegá tu access key gratis de web3forms.com.
    // Vacío = el formulario abre el correo del usuario con todo el detalle.
    web3formsKey: '',

    correo: 'coti@unonuevecr.com',
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
      icono: 'contenido',
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
      icono: 'automatizacion',
      num: '02',
      titulo: 'Tu negocio <em>trabajando solo</em>.',
      eyebrow: 'Automatizaciones y bots',
      lead: 'Flujos y bots que atienden, cotizan, dan seguimiento y registran. Acá vive el servicio al cliente: un bot de WhatsApp que contesta a las 9 de la noche igual que a las 9 de la mañana.',
      puntos: [
        'Bot de WhatsApp con tu catálogo y tus precios, 24/7',
        'Seguimiento automático de cada lead hasta que alguien lo contacte',
        'Cobros, pedidos y reportes que se registran solos'
      ],
      mensual: [500, 2000], setup: [0, 0],
      cotDesc: 'Bots de WhatsApp, flujos y seguimiento automático.'
    },
    {
      id: 'mercadeo',
      icono: 'mercadeo',
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
      icono: 'foto',
      num: '04',
      titulo: 'Tu marca, <em>bien vista</em>.',
      eyebrow: 'Fotografía profesional',
      lead: 'Fotos de equipo, producto y local con calidad de catálogo. Porque la primera impresión de tu marca casi siempre es una imagen.',
      puntos: [
        'Retratos profesionales para todo tu equipo',
        'Producto y tienda listos para catálogo y redes',
        'Edición y entrega en formatos para web y redes'
      ],
      mensual: [0, 0], setup: [70, 100],
      cotDesc: 'Por hora de sesión (≈ ₡30.000): equipo, producto o local.'
    }
  ];

  // El caso del cliente aplica DESCUENTO sobre el precio de lista
  const TAMANOS = [
    { id: 'emp',   nombre: 'Emprendedor',    desc: '1–3 personas · 20% desc.',  mult: 0.80 },
    { id: 'pyme',  nombre: 'Pyme',           desc: '4–20 personas · 15% desc.', mult: 0.85 },
    { id: 'emp2',  nombre: 'Empresa',        desc: '+20 personas · 10% desc.',  mult: 0.90 },
    { id: 'marca', nombre: 'Marca personal', desc: 'Tu nombre es la marca · 20% desc.', mult: 0.80 },
    { id: 'sesion', nombre: 'Sesión de fotos', desc: 'Solo la sesión, sin mensualidad', mult: 1.00 }
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
      list.push(S.fromIcon(S.ICONS[s.icono], N, 1.20 * k));
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
      window.__field = field;                 // útil para depurar en consola
    } catch (e) {
      // Sin WebGL: mostramos la foto como respaldo y seguimos.
      canvas.style.display = 'none';
      document.body.classList.add('no-gl');
      return;
    }

    // Carga rostro + cerebro antes de construir las formas
    const fuentes = { cara: 'assets/hero-head.png', cerebro: 'assets/brain.png' };
    const imgs = {};
    let faltan = 2;

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

  boxServ.innerHTML = SERVICIOS.map(function (s) {
    return optHTML('checkbox', 'servicio', s.id, s.eyebrow, s.cotDesc);
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

  function calcular() {
    const elegidos = Array.prototype.slice
      .call(form.querySelectorAll('input[name="servicio"]:checked'))
      .map(function (i) { return i.value; });

    const tamId = (form.querySelector('input[name="tamano"]:checked') || {}).value;
    const urgId = (form.querySelector('input[name="urgencia"]:checked') || {}).value;
    const tam = TAMANOS.find(function (t) { return t.id === tamId; }) || TAMANOS[1];
    const urg = URGENCIAS.find(function (u) { return u.id === urgId; }) || URGENCIAS[0];

    let mMin = 0, mMax = 0, sMin = 0, sMax = 0;
    elegidos.forEach(function (id) {
      const s = SERVICIOS.find(function (x) { return x.id === id; });
      if (!s) return;
      mMin += s.mensual[0]; mMax += s.mensual[1];
      sMin += s.setup[0];   sMax += s.setup[1];
    });

    // descuento por tamaño de negocio + recargo por urgencia
    const f = tam.mult * urg.mult;
    mMin *= f; mMax *= f;
    sMin *= f; sMax *= f;

    const txtM = elegidos.length === 0 ? '—'
      : (mMax === 0 ? 'Sin mensualidad' : money(mMin) + ' – ' + money(mMax));
    const txtS = elegidos.length === 0 ? '—'
      : (sMax === 0 ? 'Sin costo aparte' : money(sMin) + ' – ' + money(sMax) + ' / hora');

    elMensual.textContent = txtM;
    elSetup.textContent = txtS;

    const nombres = elegidos.map(function (id) {
      return (SERVICIOS.find(function (x) { return x.id === id; }) || {}).eyebrow;
    });

    document.getElementById('hResumen').value =
      (nombres.join(', ') || 'ninguno') +
      ' | Tamaño: ' + tam.nombre + ' | Urgencia: ' + urg.nombre;
    document.getElementById('hMensual').value = txtM;
    document.getElementById('hSetup').value = txtS;

    return { nombres: nombres, tam: tam, urg: urg, txtM: txtM, txtS: txtS };
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
        'Fotografía: ' + d.txtS + '\n\n' +
        'Qué quiere cotizar: ' + quiere;

      window.location.href = 'mailto:' + CONFIG.correo +
        '?subject=' + encodeURIComponent('Cotización desde unonuevecr.com — ' + nombre) +
        '&body=' + encodeURIComponent(cuerpo);

      msg.textContent = 'Te abrí el correo con todo el detalle listo para enviar.';
      return;
    }

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

    if (!CONFIG.calLink) return;
    const host = document.getElementById('calEmbed');
    host.innerHTML = '';
    host.setAttribute('data-cal-link', CONFIG.calLink);

    const s = document.createElement('script');
    s.src = 'https://app.cal.com/embed/embed.js';
    s.async = true;
    s.onload = function () {
      if (window.Cal) {
        window.Cal('init', { origin: 'https://cal.com' });
        window.Cal('inline', {
          elementOrSelector: '#calEmbed',
          calLink: CONFIG.calLink,
          config: { theme: 'light' }
        });
      }
    };
    document.body.appendChild(s);
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
