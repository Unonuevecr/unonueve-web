/* Checklist web de Aura Restaurante (UNONUEVECR).
   Cada envío va al flujo de n8n «✅ Aura — checklist web» (ObzokeRDyPS9T7AY): lo anota en la pestaña «Lo que envía Aura»
   del plan de acción y le avisa a Gerson por WhatsApp. Las contraseñas se cifran aquí, en el navegador, con la llave pública
   de UNONUEVECR (RSA-OAEP 4096 + AES-GCM); la privada está solo en el Llavero de la Mac de Gerson. */
(function () {
  'use strict';

  var API = 'https://n8n-unonueve-n8n.i5i6e4.easypanel.host/webhook';
  var LLAVE_PUBLICA = 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxiQBJjuXfPL9mN01Ura/ohq5gou+9TaWfR5Eva0pLkk5rOJX4dQy5z6zWXUR6x1zQcqmnDqniNCCzcSXAmjX4dALugzGtsUkNf3LItBHXDzRdOhyvI+Ebhpa4krYCDUMy5unKb9tPIC9goFCwgYrJXog6y3Hd+DEgEX+IQqVBIWsi0kXoYsr+rOE6+/nyxtHKKiM/wxWMwAc9jsgibjo8SbxfnbwcWLCjozTQnPkSPoZRuVSN7U5VPbG9ed7YoZNsjtavE7nRl1XX3xdDyUWwNhzGOyYNOJDGwpVi5e9gOrKmzZaxy/bJfVD10FpDaGW5cMfrSdog8Zzlt0qldOzi7XoHgg2ziypOxbB0c0tHwQBUNM1YWW+I83GQwV6ZP5kmVY8Tx7+Dojn62tBLtGmpj5Ubm168FDJ31bbb+iJYe9tTDRIy3tHm/wGLRRqq83phD8Ni2sWKt5c9eMeOcRn+yx3VvErNvYioIxacxa54O//4Wwv2XVz2DB2oEdHh++zgCbumP32aIcYK9qthvigzsG+KwXUJYwitEqu62rMwsBVsykgdum3hkIIOAPCG0POX7LEXqQBQREqhROUyUHLw6Xhq9enJ2BAtlbaqI/k/XOka95EOiYD8ZESEjoHUC/27UHpBQAQJ1OMiwA+sM08fkIMKnB/lAKgRpfuwDAmTSkCAwEAAQ==';
  var PORTAFOLIO_META = '846762560664811';
  var CORREO = 'coti@unonuevecr.com';

  var SECCIONES = [
    { titulo: 'Material para el contenido', bajada: 'Súbanlo a Google Drive, iCloud, Dropbox o WeTransfer y peguen el enlace (que diga «cualquier persona con el enlace»).', items: [
      { id: 'm-fotos', titulo: 'Fotos y videos del restaurante', tipo: 'enlace', desc: 'Salón, barra, El Halo, la fachada de noche, el equipo, platos y cócteles. Entre más material, mejor arranca el contenido.' },
      { id: 'm-logo', titulo: 'Logo en vector', tipo: 'enlace', desc: 'El archivo original del logo: .ai, .eps, .svg o .pdf. Si lo hizo un diseñador, pídanselo «en vector».' },
      { id: 'm-cocteles', titulo: 'Fotos de los cócteles de El Espectro', tipo: 'enlace', desc: 'Una foto de cada uno de los siete: Ruber, Azureus, Aurantium, Flavus, Indicum, Viola y Viridis.' }
    ] },
    { titulo: 'Menús', bajada: 'Con esto se diseñan los menús para impresión y se publica la carta.', items: [
      { id: 'n-carta', titulo: 'Correcciones de la carta y postres', tipo: 'texto', desc: 'Confirmen las correcciones de la carta (Puré, Ralladura, Leche de Tigre, «Ocoo»…) y mándennos los postres: nombre, ingredientes y precio.', ph: 'Correcciones y postres…' },
      { id: 'n-degus', titulo: 'Precio de Cinco tiempos, Vol. 002', tipo: 'texto', desc: '¿Cuánto cuesta por persona el menú de degustación de jueves y viernes? (El Vol. 001 fue ₡39.950.)', ph: 'Ej.: ₡42.000 por persona, con maridaje sin alcohol' },
      { id: 'n-vinos', titulo: 'Menú de vinos', tipo: 'enlace', desc: 'La lista de vinos con precio por copa y por botella. Cuéntennos si son con alcohol o sin alcohol.' },
      { id: 'n-alcohol', titulo: 'Cócteles con alcohol y patente', tipo: 'texto', desc: 'Si van a servir cócteles con alcohol: nombres, ingredientes y precios, y confirmen que la patente de licores está al día.', ph: 'Cócteles, precios y estado de la patente…' }
    ] },
    { titulo: 'Eventos y programación', bajada: 'Planificamos a seis meses para que cada evento tenga su promoción a tiempo.', items: [
      { id: 'e-opening', titulo: 'Opening', tipo: 'opciones', opciones: ['Genesis', 'The First Essence', 'Senses', 'Opening', 'Otro nombre'], etiquetaOpciones: '¿Con qué nombre se queda?', desc: 'Nombre, fecha y hora de la noche de apertura (tentativo: viernes 30 de octubre, 6:00 p. m.).', ph: 'Fecha, hora, cupo, invitados…' },
      { id: 'e-sabados', titulo: 'Sábados con música en vivo o DJ', tipo: 'opciones', opciones: ['Aura After Dark', 'Aura Frequency', 'Otro nombre'], etiquetaOpciones: '¿Con qué nombre se queda?', desc: 'El nombre de las noches de sábado, la hora y quién toca.', ph: 'Hora de inicio, DJ o banda, fechas…' },
      { id: 'e-semana', titulo: 'Laboratorio Aura y Constelación', tipo: 'texto', desc: '¿Qué es «Laboratorio Aura» (martes) y qué es «Constelación» (miércoles)? ¿Qué se ofrece y a qué hora?', ph: 'Martes: … · Miércoles: …' },
      { id: 'e-seis', titulo: 'Actividades de los próximos seis meses', tipo: 'texto', desc: 'Fechas especiales, noches temáticas, menús de temporada, eventos privados: todo lo que tengan pensado hasta abril.', ph: 'Fecha · actividad · detalle…', enlaceOpcional: true },
      { id: 'e-produccion', titulo: 'Día de producción', tipo: 'texto', desc: 'Dos o tres fechas posibles para el primer día de fotos y video (hasta 4 horas) y quién recibe al equipo.', ph: 'Fechas posibles y quién nos recibe…' },
      { id: 'e-halo', titulo: 'Room El Halo', tipo: 'texto', desc: 'Capacidad del room, qué incluye y condiciones, para armar la ficha que se le manda a quien cotiza un evento privado.', ph: 'Capacidad, qué incluye, condiciones…' }
    ] },
    { titulo: 'Accesos', bajada: 'Lo más seguro es invitarnos con nuestro correo: ustedes conservan el control de sus cuentas.', items: [
      { id: 'a-meta', titulo: 'Meta: Instagram, Facebook y anuncios', tipo: 'acceso', plataforma: 'Meta (Instagram y Facebook)', pasos: [
        'Entrá a <b>business.facebook.com</b> con la cuenta que administra Aura.',
        'Andá a <b>Configuración</b> → <b>Usuarios</b> → <b>Socios</b> → <b>Agregar</b> → «Dar a un socio acceso a tus activos».',
        'Escribí el identificador del portafolio de UNONUEVECR: <code>' + PORTAFOLIO_META + '</code>',
        'Marcá la <b>página de Facebook</b>, la <b>cuenta de Instagram</b>, la <b>cuenta publicitaria</b> y el <b>píxel</b> (conjunto de datos), con control total.',
        'Guardá y avisanos con el botón de abajo.'
      ], notaInvitacion: 'Si Aura todavía no tiene portafolio comercial en Meta, usá la opción de la contraseña cifrada con el usuario de Instagram.' },
      { id: 'a-google', titulo: 'Perfil de empresa de Google', tipo: 'acceso', plataforma: 'Google (Perfil de empresa)', pasos: [
        'Buscá <b>«Aura Restaurante»</b> en Google con la cuenta dueña del perfil (o entrá a <b>business.google.com</b>).',
        'Tocá los tres puntos <b>⋮</b> → <b>Configuración del perfil</b> → <b>Personas y acceso</b>.',
        'Tocá <b>Agregar</b>, escribí <code>' + CORREO + '</code> y elegí el rol <b>Administrador</b>.',
        'Enviá la invitación y avisanos con el botón de abajo.'
      ] },
      { id: 'a-opentable', titulo: 'OpenTable', tipo: 'acceso', plataforma: 'OpenTable', pasos: [
        'Entrá al panel de OpenTable (GuestCenter) con la cuenta de Aura.',
        'Andá a <b>Configuración</b> → <b>Usuarios</b> → <b>Agregar usuario</b>.',
        'Escribí <code>' + CORREO + '</code> con permiso de administrador o de marketing.',
        'Avisanos con el botón de abajo.'
      ], notaInvitacion: 'Si su plan no deja agregar usuarios, usá la opción de la contraseña cifrada.' },
      { id: 'a-tiktok', titulo: 'TikTok', tipo: 'acceso', plataforma: 'TikTok', pasos: [
        'Si tienen <b>TikTok Business Center</b>: <b>Usuarios</b> → <b>Miembros</b> → <b>Invitar</b> y escribí <code>' + CORREO + '</code>.',
        'Si no lo tienen, usá la opción de la contraseña cifrada.'
      ] },
      { id: 'a-pago', titulo: 'Método de pago en Meta Ads', tipo: 'confirmar', desc: 'La tarjeta la agrega Aura directamente en Meta, nunca se la manden a nadie: <b>business.facebook.com</b> → <b>Facturación y pagos</b> → la cuenta publicitaria de Aura → <b>Agregar método de pago</b>. El presupuesto acordado es de al menos USD 150 al mes.', boton: 'Listo, ya está agregado' }
    ] },
    { titulo: 'Contrato y factura', bajada: 'Para completar el contrato y emitir la factura electrónica de cada mes.', items: [
      { id: 'c-datos', titulo: 'Datos para el contrato y la factura', tipo: 'datos', desc: 'Así se completan el contrato y la factura electrónica de cada pago.', campos: [
        ['Razón social', 'text', 'organization'], ['Cédula jurídica', 'text', 'off'], ['Representante legal (nombre completo)', 'text', 'name'],
        ['Cédula del representante', 'text', 'off'], ['Correo para la factura electrónica', 'email', 'email'], ['Teléfono', 'tel', 'tel'],
        ['Dirección exacta (provincia, cantón, distrito y señas)', 'text', 'street-address']
      ] }
    ] }
  ];

  var clave = '';
  var whatsapp = '';
  var estado = {};
  var total = 0;

  function $(id) { return document.getElementById(id); }
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } }
  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function fechaCorta(f) { return f && f.length >= 10 ? f.slice(8, 10) + '/' + f.slice(5, 7) : ''; }
  function enlaceWA(texto) { return 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(texto); }

  /* ---------- clave del enlace: viene en #k=…, se guarda y se borra de la barra ---------- */
  function tomarClave() {
    var m = location.hash.match(/k=([A-Za-z0-9_-]{16,64})/);
    if (m) {
      guardar('aura_ck_clave', m[1]);
      history.replaceState(null, '', location.pathname + location.search);
    }
    return m ? m[1] : leer('aura_ck_clave');
  }

  function bloquear(texto) {
    document.body.classList.add('esta-bloqueado');
    $('contenido').hidden = true;
    $('bloqueo').hidden = false;
    if (texto) $('bloqueoTexto').textContent = texto;
  }

  /* ---------- cifrado ---------- */
  function b64(buf) {
    var u = new Uint8Array(buf), s = '';
    for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return btoa(s);
  }
  function cifrar(obj) {
    var der = Uint8Array.from(atob(LLAVE_PUBLICA), function (c) { return c.charCodeAt(0); });
    var sutil = window.crypto && window.crypto.subtle;
    if (!sutil) return Promise.reject(new Error('Este navegador no puede cifrar. Pasale el acceso a Gerson por WhatsApp.'));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return Promise.all([
      sutil.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['wrapKey']),
      sutil.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    ]).then(function (r) {
      var datos = new TextEncoder().encode(JSON.stringify(obj));
      return Promise.all([sutil.encrypt({ name: 'AES-GCM', iv: iv }, r[1], datos), sutil.wrapKey('raw', r[1], r[0], { name: 'RSA-OAEP' })]);
    }).then(function (r) {
      return ['U9A1', b64(r[1]), b64(iv), b64(r[0])].join('.');
    });
  }

  /* ---------- envío ---------- */
  function enviar(datos) {
    var quien = $('quien').value.trim();
    if (!quien) {
      $('quien').focus();
      return Promise.reject(new Error('Escribí tu nombre arriba para saber quién lo envía.'));
    }
    guardar('aura_ck_nombre', quien);
    var cuerpo = { k: clave, quien: quien, id: datos.id, tipo: datos.tipo, contenido: datos.contenido || '', enlace: datos.enlace || '', cifrado: datos.cifrado || '' };
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    return fetch(API + '/aura-checklist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo enviar.');
        return d;
      });
    }).catch(function (e) {
      if (e.name === 'AbortError' || e.name === 'TypeError') throw new Error('No se pudo enviar: revisá tu conexión e intentá de nuevo, o mandáselo a Gerson por WhatsApp.');
      throw e;
    }).finally(function () { clearTimeout(reloj); });
  }

  function marcar(id, fecha) {
    var e = estado[id] || { n: 0, fecha: '' };
    e.n += 1;
    e.fecha = fecha || e.fecha;
    estado[id] = e;
    pintarEstado();
  }

  function pintarEstado() {
    var listos = 0;
    document.querySelectorAll('.ck-item').forEach(function (nodo) {
      var e = estado[nodo.dataset.id];
      var txt = nodo.querySelector('.ck-item__estado');
      if (e && e.n) {
        listos += 1;
        nodo.classList.add('es-listo');
        nodo.querySelector('.ck-item__num').textContent = '✓';
        txt.textContent = 'Enviado el ' + fechaCorta(e.fecha) + (e.n > 1 ? ' · ' + e.n + ' envíos' : '') + ' · podés mandar más';
      } else {
        nodo.classList.remove('es-listo');
        nodo.querySelector('.ck-item__num').textContent = nodo.dataset.num;
        txt.textContent = 'Pendiente';
      }
    });
    $('cuenta').textContent = listos + ' de ' + total + ' enviados';
    $('barra').style.width = (total ? Math.round(100 * listos / total) : 0) + '%';
  }

  /* ---------- formularios ---------- */
  function campo(etiqueta, tipo, ph, auto) {
    var c = el('div', 'ck-campo');
    var id = 'f' + Math.random().toString(36).slice(2, 9);
    var l = el('label', null, etiqueta);
    l.htmlFor = id;
    var i = tipo === 'area' ? el('textarea') : el('input');
    if (tipo !== 'area') i.type = tipo;
    i.id = id;
    if (ph) i.placeholder = ph;
    i.autocomplete = auto || 'off';
    i.maxLength = tipo === 'area' ? 3800 : 1400;
    c.appendChild(l);
    c.appendChild(i);
    return { caja: c, input: i };
  }

  function boton(texto, claro) {
    var b = el('button', 'ck-boton' + (claro ? ' ck-boton--claro' : ''), texto);
    b.type = 'button';
    return b;
  }

  function normalizarEnlace(v) {
    v = v.trim();
    if (!v) return '';
    if (!/^https?:\/\//i.test(v) && /^[\w-]+(\.[\w-]+)+/.test(v)) v = 'https://' + v;
    return v.replace(/^http:\/\//i, 'https://');
  }

  function accion(btn, msg, alEnviar, alListo) {
    btn.addEventListener('click', function () {
      msg.className = 'ck-mensaje';
      msg.textContent = '';
      var datos;
      try { datos = alEnviar(); } catch (e) { msg.className = 'ck-mensaje es-error'; msg.textContent = e.message; return; }
      var original = btn.textContent, listo = null;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      Promise.resolve(datos).then(function (v) { listo = v; return enviar(v); }).then(function (d) {
        marcar(listo.id, d.fecha);
        msg.className = 'ck-mensaje es-ok';
        msg.textContent = '✓ Recibido. Gerson ya tiene el aviso.';
        if (alListo) alListo();
      }).catch(function (e) {
        msg.className = 'ck-mensaje es-error';
        msg.textContent = e.message;
      }).finally(function () { btn.disabled = false; btn.textContent = original; });
    });
  }

  function formularioSimple(item, cuerpo) {
    var conEnlace = item.tipo === 'enlace' || item.enlaceOpcional;
    var sel, enl, txt;
    if (item.tipo === 'opciones') {
      var c = el('div', 'ck-campo');
      var l = el('label', null, item.etiquetaOpciones);
      sel = el('select');
      sel.appendChild(new Option('Elegí una opción', ''));
      item.opciones.forEach(function (o) { sel.appendChild(new Option(o, o)); });
      c.appendChild(l); c.appendChild(sel); cuerpo.appendChild(c);
    }
    if (conEnlace) {
      enl = campo(item.tipo === 'enlace' ? 'Enlace (Drive, iCloud, Dropbox, WeTransfer…)' : 'Enlace (opcional)', 'url', 'https://…', 'off');
      cuerpo.appendChild(enl.caja);
    }
    txt = campo(item.tipo === 'enlace' ? 'Comentario (opcional)' : 'Detalle', 'area', item.ph || '', 'off');
    cuerpo.appendChild(txt.caja);
    var b = boton('Enviar'), msg = el('div', 'ck-mensaje');
    cuerpo.appendChild(b); cuerpo.appendChild(msg);
    accion(b, msg, function () {
      var enlace = enl ? normalizarEnlace(enl.input.value) : '';
      if (enlace && !/^https:\/\/[^\s<>"']+$/i.test(enlace)) throw new Error('Revisá el enlace: tiene que empezar con https://');
      var partes = [];
      if (sel && sel.value) partes.push('Nombre elegido: ' + sel.value);
      if (txt.input.value.trim()) partes.push(txt.input.value.trim());
      var contenido = partes.join('\n');
      if (!enlace && !contenido) throw new Error(item.tipo === 'enlace' ? 'Pegá el enlace antes de enviar.' : 'Escribí algo antes de enviar.');
      return { id: item.id, tipo: enlace ? 'enlace' : 'texto', enlace: enlace, contenido: contenido };
    }, function () {
      if (enl) enl.input.value = '';
      txt.input.value = '';
      if (sel) sel.value = '';
    });
  }

  function formularioDatos(item, cuerpo) {
    var campos = item.campos.map(function (f) { var c = campo(f[0], f[1], '', f[2]); cuerpo.appendChild(c.caja); return { nombre: f[0], input: c.input }; });
    var b = boton('Enviar datos'), msg = el('div', 'ck-mensaje');
    cuerpo.appendChild(b); cuerpo.appendChild(msg);
    accion(b, msg, function () {
      var lineas = campos.filter(function (c) { return c.input.value.trim(); }).map(function (c) { return c.nombre + ': ' + c.input.value.trim(); });
      if (!lineas.length) throw new Error('Completá al menos un dato antes de enviar.');
      return { id: item.id, tipo: 'texto', contenido: lineas.join('\n') };
    });
  }

  function formularioConfirmar(item, cuerpo) {
    var b = boton(item.boton || 'Listo'), msg = el('div', 'ck-mensaje');
    cuerpo.appendChild(b); cuerpo.appendChild(msg);
    accion(b, msg, function () { return { id: item.id, tipo: 'confirmacion', contenido: item.boton || 'Listo' }; });
  }

  function formularioAcceso(item, cuerpo) {
    var pestanas = el('div', 'ck-opciones');
    var paneles = [];
    [['invitar', 'Invitarnos'], ['cifrada', 'Clave cifrada'], ['wa', 'WhatsApp']].forEach(function (p, i) {
      var t = boton(p[1]);
      t.className = i === 0 ? 'esta-activa' : '';
      t.addEventListener('click', function () {
        pestanas.querySelectorAll('button').forEach(function (x) { x.className = ''; });
        t.className = 'esta-activa';
        paneles.forEach(function (x) { x.classList.toggle('esta-activo', x.dataset.p === p[0]); });
      });
      pestanas.appendChild(t);
    });
    cuerpo.appendChild(pestanas);

    // 1. invitación sin contraseña
    var p1 = el('div', 'ck-panel esta-activo'); p1.dataset.p = 'invitar';
    p1.appendChild(el('div', 'ck-nota', 'Recomendado: sin pasar contraseñas y ustedes conservan el control de la cuenta.'));
    var ol = el('ol', 'ck-pasos');
    item.pasos.forEach(function (paso) { var li = el('li'); li.innerHTML = paso; ol.appendChild(li); });
    p1.appendChild(ol);
    if (item.notaInvitacion) p1.appendChild(el('div', 'ck-nota', item.notaInvitacion));
    var nota1 = campo('Comentario (opcional)', 'text', 'Ej.: ya invité desde la cuenta de Moisés', 'off');
    p1.appendChild(nota1.caja);
    var b1 = boton('Ya los invitamos'), m1 = el('div', 'ck-mensaje');
    p1.appendChild(b1); p1.appendChild(m1);
    accion(b1, m1, function () {
      return { id: item.id, tipo: 'confirmacion', contenido: 'Invitación enviada a UNONUEVECR (' + item.plataforma + ')' + (nota1.input.value.trim() ? ' · ' + nota1.input.value.trim() : '') };
    }, function () { nota1.input.value = ''; });

    // 2. contraseña cifrada en el navegador
    var p2 = el('div', 'ck-panel'); p2.dataset.p = 'cifrada';
    var usu = campo('Usuario o correo de la cuenta', 'text', '', 'off');
    var pas = campo('Contraseña', 'password', '', 'new-password');
    var envClave = el('div', 'ck-clave');
    var ver = boton('mostrar', true);
    ver.className = '';
    ver.addEventListener('click', function () { pas.input.type = pas.input.type === 'password' ? 'text' : 'password'; ver.textContent = pas.input.type === 'password' ? 'mostrar' : 'ocultar'; });
    pas.caja.removeChild(pas.input); envClave.appendChild(pas.input); envClave.appendChild(ver); pas.caja.appendChild(envClave);
    var notas = campo('Notas (opcional): códigos de respaldo o a quién le llega el código de verificación', 'area', '', 'off');
    [usu, pas, notas].forEach(function (c) { p2.appendChild(c.caja); });
    var candado = el('div', 'ck-candado');
    candado.appendChild(el('span', null, '🔒'));
    candado.appendChild(el('span', null, 'Se cifra en tu teléfono antes de salir. Solo Gerson la puede abrir, con una llave que está únicamente en su computadora.'));
    p2.appendChild(candado);
    var b2 = boton('Cifrar y enviar'), m2 = el('div', 'ck-mensaje');
    p2.appendChild(b2); p2.appendChild(m2);
    accion(b2, m2, function () {
      if (!usu.input.value.trim() || !pas.input.value) throw new Error('Escribí el usuario y la contraseña.');
      var secreto = { plataforma: item.plataforma, usuario: usu.input.value.trim(), contrasena: pas.input.value, notas: notas.input.value.trim() };
      pas.input.value = '';
      return cifrar(secreto).then(function (bloque) {
        return { id: item.id, tipo: 'acceso', contenido: item.plataforma, cifrado: bloque };
      });
    }, function () { usu.input.value = ''; notas.input.value = ''; });

    // 3. WhatsApp directo con Gerson (el enlace no lleva la contraseña)
    var p3 = el('div', 'ck-panel'); p3.dataset.p = 'wa';
    p3.appendChild(el('p', 'ck-item__desc', 'Abrí el chat con Gerson y mandale el usuario y la contraseña en un mensaje aparte. Cuando te confirme que entró, borrá ese mensaje.'));
    var aWa = el('a', 'ck-boton', 'Abrir WhatsApp con Gerson');
    aWa.target = '_blank'; aWa.rel = 'noopener';
    aWa.addEventListener('click', function () { aWa.href = enlaceWA('Hola Gerson, te paso el acceso de ' + item.plataforma + ' de Aura.'); });
    aWa.href = '#';
    p3.appendChild(aWa);
    var b3 = boton('Ya se lo pasé por WhatsApp', true), m3 = el('div', 'ck-mensaje');
    p3.appendChild(b3); p3.appendChild(m3);
    accion(b3, m3, function () { return { id: item.id, tipo: 'confirmacion', contenido: 'Acceso de ' + item.plataforma + ' pasado por WhatsApp' }; });

    paneles.push(p1, p2, p3);
    paneles.forEach(function (x) { cuerpo.appendChild(x); });
  }

  /* ---------- armar la página ---------- */
  function armar() {
    var cont = $('secciones'), num = 0;
    SECCIONES.forEach(function (s) {
      var sec = el('section', 'ck-seccion');
      sec.appendChild(el('h2', null, s.titulo));
      sec.appendChild(el('p', null, s.bajada));
      s.items.forEach(function (item) {
        num += 1;
        var caja = el('article', 'ck-item');
        caja.dataset.id = item.id;
        caja.dataset.num = String(num);
        var cab = el('button', 'ck-item__cabeza');
        cab.type = 'button';
        cab.setAttribute('aria-expanded', 'false');
        cab.appendChild(el('span', 'ck-item__num', String(num)));
        var tx = el('span', 'ck-item__texto');
        tx.appendChild(el('span', 'ck-item__titulo', item.titulo));
        tx.appendChild(el('span', 'ck-item__estado', 'Pendiente'));
        cab.appendChild(tx);
        cab.appendChild(el('span', 'ck-item__flecha', '›'));
        var cuerpo = el('div', 'ck-item__cuerpo');
        if (item.desc) { var d = el('p', 'ck-item__desc'); d.innerHTML = item.desc; cuerpo.appendChild(d); }
        if (item.tipo === 'acceso') formularioAcceso(item, cuerpo);
        else if (item.tipo === 'datos') formularioDatos(item, cuerpo);
        else if (item.tipo === 'confirmar') formularioConfirmar(item, cuerpo);
        else formularioSimple(item, cuerpo);
        cab.addEventListener('click', function () {
          var abierto = caja.classList.toggle('esta-abierto');
          cab.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });
        caja.appendChild(cab);
        caja.appendChild(cuerpo);
        sec.appendChild(caja);
      });
      cont.appendChild(sec);
    });
    total = num;
  }

  function iniciar() {
    clave = tomarClave();
    if (!clave) { bloquear(); return; }
    fetch(API + '/aura-checklist-estado?k=' + encodeURIComponent(clave)).then(function (r) {
      if (r.status === 401) { guardar('aura_ck_clave', ''); bloquear('Este enlace ya no es válido. Pedile a Gerson el enlace nuevo por WhatsApp.'); return null; }
      return r.json();
    }).then(function (d) {
      if (!d) return;
      estado = (d && d.items) || {};
      whatsapp = (d && d.whatsapp) || '';
      mostrar();
    }).catch(function () {
      mostrar(); // sin conexión con el estado: igual se puede usar; los envíos dirán si falla
    });
  }

  function mostrar() {
    armar();
    $('quien').value = leer('aura_ck_nombre');
    $('contenido').hidden = false;
    var pie = $('waPie');
    if (whatsapp) pie.href = enlaceWA('Hola Gerson, te escribo de Aura sobre el checklist.');
    else pie.hidden = true;
    pintarEstado();
  }

  iniciar();
})();
