/* ============================================================
   shapes.js — genera nubes de puntos para cada etapa del scroll.
   Cada forma devuelve { pos:Float32Array(N*3), col:Float32Array(N*3) }
   en unidades de mundo (alto visible ≈ 2.0, o sea y ∈ [-1,1]).
   ============================================================ */
(function (global) {
  'use strict';

  const SAMPLE = 620;               // resolución del lienzo de muestreo
  const INK  = [0.078, 0.067, 0.055];
  const GOLD = [0.784, 0.537, 0.184];
  const GOLD_SOFT = [0.878, 0.694, 0.408];

  /* ---------- utilidades ---------- */

  function makeCanvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  }

  // Elige N puntos de la lista de candidatos (con repetición si hacen falta).
  function pick(candidates, N, jitter) {
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const L = candidates.length;
    if (!L) return { pos, col };

    for (let i = 0; i < N; i++) {
      const c = candidates[(Math.random() * L) | 0];
      const j = jitter || 0;
      pos[i * 3]     = c[0] + (Math.random() - 0.5) * j;
      pos[i * 3 + 1] = c[1] + (Math.random() - 0.5) * j;
      pos[i * 3 + 2] = c[2] + (Math.random() - 0.5) * j;
      col[i * 3]     = c[3];
      col[i * 3 + 1] = c[4];
      col[i * 3 + 2] = c[5];
    }
    return { pos, col };
  }

  // Muestrea los píxeles opacos de un lienzo 2D.
  // colorFn(r,g,b,x,y) -> [r,g,b] normalizado. Si es null usa el color del píxel.
  function sampleCanvas(ctx, size, height, colorFn, step) {
    const data = ctx.getImageData(0, 0, size, size).data;
    const out = [];
    const s = step || 2;
    const scale = height / size;      // píxeles -> unidades de mundo
    const half = size / 2;

    for (let y = 0; y < size; y += s) {
      for (let x = 0; x < size; x += s) {
        const i = (y * size + x) * 4;
        if (data[i + 3] < 90) continue;
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        const c = colorFn ? colorFn(r, g, b, x / size, y / size) : [r, g, b];
        out.push([
          (x - half) * scale,
          -(y - half) * scale,          // y invertida (canvas crece hacia abajo)
          (Math.random() - 0.5) * 0.05, // profundidad leve, da vida
          c[0], c[1], c[2]
        ]);
      }
    }
    return out;
  }

  // Paleta por defecto de los iconos: tinta con chispas doradas.
  function inkGold(gold) {
    const p = gold === undefined ? 0.26 : gold;
    return function () {
      if (Math.random() < p) {
        const t = Math.random();
        return [
          GOLD[0] * (1 - t) + GOLD_SOFT[0] * t,
          GOLD[1] * (1 - t) + GOLD_SOFT[1] * t,
          GOLD[2] * (1 - t) + GOLD_SOFT[2] * t
        ];
      }
      return INK;
    };
  }

  /* ---------- forma 0 · el rostro (desde la foto) ---------- */

  function fromImage(img, N, height) {
    const size = SAMPLE;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d', { willReadFrequently: true });

    // encaja la foto dentro del lienzo cuadrado manteniendo proporción
    const r = Math.min(size / img.width, size / img.height) * 0.98;
    const w = img.width * r, h = img.height * r;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

    // Puntillismo por densidad (tipo grabado): en vez de pintar cada píxel con
    // su color, la LUZ del píxel decide cuántas partículas caen ahí.
    // Sombras -> muy denso; piel clara -> ralo. Así el rostro sí se lee sobre crema.
    const data = ctx.getImageData(0, 0, size, size).data;
    const cands = [];
    const scale = height / size;
    const half = size / 2;

    // 1) mapas de luz y de opacidad
    const L = new Float32Array(size * size);
    const A = new Float32Array(size * size);
    for (let k = 0; k < size * size; k++) {
      const i = k * 4;
      A[k] = data[i + 3] / 255;
      L[k] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    }

    // 2) bordes (Sobel simplificado): así los lentes, los ojos y los labios
    //    atraen partículas aunque sean claros.
    const E = new Float32Array(size * size);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const k = y * size + x;
        if (A[k] < 0.35) continue;
        const gx = L[k + 1] - L[k - 1];
        const gy = L[k + size] - L[k - size];
        E[k] = Math.sqrt(gx * gx + gy * gy);
      }
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const k = y * size + x;
        const i = k * 4;
        if (data[i + 3] < 90) continue;

        const r0 = data[i] / 255, g0 = data[i + 1] / 255, b0 = data[i + 2] / 255;
        const lum = L[k];

        // densidad = tono oscuro + fuerza del borde
        const tono = Math.pow(Math.max(0, 1 - lum), 1.35) * 1.15;
        const borde = Math.min(1, E[k] * 5.0);
        let p = tono * 0.62 + borde * 0.95;
        if (p <= 0.012) continue;
        if (p > 1) p = 1;
        if (Math.random() > p) continue;

        // tinta con matiz cálido en las zonas de piel + chispa dorada ocasional
        let c;
        if (Math.random() < 0.10) {
          c = GOLD_SOFT;
        } else {
          const warm = Math.min(1, lum * 0.9);
          c = [
            INK[0] + warm * 0.30,
            INK[1] + warm * 0.20,
            INK[2] + warm * 0.13
          ];
        }

        cands.push([
          (x - half) * scale,
          -(y - half) * scale,
          (Math.random() - 0.5) * 0.05,
          c[0], c[1], c[2]
        ]);
      }
    }
    return pick(cands, N, 0.003);
  }

  /* ---------- forma "foto real" ----------
     Muestrea la imagen en una GRILLA densa con el color verdadero de cada
     píxel. Con suficientes partículas se ve como la fotografía; al dispersarse
     se convierte en polvo. Es lo que hace el video de referencia.            */

  function fromPhoto(img, N, height, contraste) {
    // Resolución de grilla para que salgan ~N puntos opacos.
    // Se asume que el sujeto ocupa ~60% del rectángulo de la imagen.
    const ratio = img.height / img.width;
    let H = Math.round(Math.sqrt((N / 0.6) * ratio));
    let W = Math.round(H / ratio);
    H = Math.max(80, Math.min(1100, H));
    W = Math.max(80, Math.min(1100, W));

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);

    const data = ctx.getImageData(0, 0, W, H).data;
    const k = contraste === undefined ? 1.18 : contraste;
    const scale = height / H;
    const hx = W / 2, hy = H / 2;
    const cands = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (data[i + 3] < 100) continue;

        // contraste suave: la piel clara no puede quedar del color del fondo
        const r0 = Math.min(1, Math.max(0, (data[i]     / 255 - 0.5) * k + 0.44));
        const g0 = Math.min(1, Math.max(0, (data[i + 1] / 255 - 0.5) * k + 0.44));
        const b0 = Math.min(1, Math.max(0, (data[i + 2] / 255 - 0.5) * k + 0.44));

        cands.push([
          (x - hx) * scale,
          -(y - hy) * scale,
          (Math.random() - 0.5) * 0.035,
          r0, g0, b0
        ]);
      }
    }

    // Asignación 1:1 (barajada) para que la foto quede nítida, sin huecos.
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const L = cands.length;
    if (!L) return { pos: pos, col: col };

    for (let i = L - 1; i > 0; i--) {            // barajar
      const j = (Math.random() * (i + 1)) | 0;
      const t = cands[i]; cands[i] = cands[j]; cands[j] = t;
    }
    for (let i = 0; i < N; i++) {
      const cc = cands[i % L];
      const jit = i < L ? 0 : 0.004;             // los repetidos se separan un poco
      pos[i * 3]     = cc[0] + (Math.random() - 0.5) * jit;
      pos[i * 3 + 1] = cc[1] + (Math.random() - 0.5) * jit;
      pos[i * 3 + 2] = cc[2];
      col[i * 3]     = cc[3];
      col[i * 3 + 1] = cc[4];
      col[i * 3 + 2] = cc[5];
    }
    return { pos: pos, col: col };
  }

  /* ---------- helpers de dibujo para los iconos ---------- */

  function iconCanvas(draw) {
    const size = SAMPLE;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = size * 0.028;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    draw(ctx, size);
    return ctx;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fromIcon(draw, N, height, goldRatio) {
    const ctx = iconCanvas(draw);
    const cands = sampleCanvas(ctx, SAMPLE, height, inkGold(goldRatio), 2);
    return pick(cands, N, 0.006);
  }

  /* ---------- forma 1 · red neuronal (esfera 3D de nodos) ---------- */

  function neuralNet(N, radius) {
    const nodes = [];
    const NODES = 34;
    for (let i = 0; i < NODES; i++) {
      // distribución uniforme sobre la esfera (espiral de Fibonacci)
      const t = (i + 0.5) / NODES;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      nodes.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.92,
        radius * Math.cos(phi)
      ]);
    }

    const cands = [];

    // nodos: pequeños cúmulos dorados
    nodes.forEach(function (n) {
      for (let k = 0; k < 26; k++) {
        const rr = Math.pow(Math.random(), 0.5) * radius * 0.045;
        const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        cands.push([
          n[0] + rr * Math.sin(b) * Math.cos(a),
          n[1] + rr * Math.sin(b) * Math.sin(a),
          n[2] + rr * Math.cos(b),
          GOLD_SOFT[0], GOLD_SOFT[1], GOLD_SOFT[2]
        ]);
      }
    });

    // aristas: solo entre nodos cercanos, muestreadas a lo largo de la línea
    const maxD = radius * 0.82;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > maxD) continue;
        const steps = Math.max(6, (d * 90) | 0);
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          cands.push([
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t,
            INK[0], INK[1], INK[2]
          ]);
        }
      }
    }
    return pick(cands, N, 0.006);
  }

  /* ---------- forma 8 · toroide wireframe (como el video) ---------- */

  function torus(N, R, r) {
    const cands = [];
    const U = 150, V = 46;
    for (let i = 0; i < U; i++) {
      const u = (i / U) * Math.PI * 2;
      for (let j = 0; j < V; j++) {
        const v = (j / V) * Math.PI * 2;
        const cu = Math.cos(u), su = Math.sin(u);
        const cv = Math.cos(v), sv = Math.sin(v);
        // toroide inclinado para que se vea el hueco
        const x = (R + r * cv) * cu;
        const y0 = (R + r * cv) * su;
        const z0 = r * sv;
        const tilt = 1.05;
        const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
        const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
        const gold = Math.random() < 0.22;
        const c = gold ? GOLD_SOFT : INK;
        cands.push([x, y, z, c[0], c[1], c[2]]);
      }
    }
    return pick(cands, N, 0.004);
  }

  /* ---------- iconos de servicio ---------- */

  const ICONS = {
    // Generación de contenido — marco con botón de play
    contenido: function (ctx, s) {
      roundRect(ctx, s * 0.16, s * 0.24, s * 0.68, s * 0.52, s * 0.07);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.44, s * 0.40);
      ctx.lineTo(s * 0.64, s * 0.50);
      ctx.lineTo(s * 0.44, s * 0.60);
      ctx.closePath();
      ctx.stroke();
      // destellos
      [[0.12, 0.16], [0.86, 0.18], [0.90, 0.82]].forEach(function (p) {
        ctx.beginPath();
        ctx.moveTo(s * p[0], s * (p[1] - 0.035));
        ctx.lineTo(s * p[0], s * (p[1] + 0.035));
        ctx.moveTo(s * (p[0] - 0.035), s * p[1]);
        ctx.lineTo(s * (p[0] + 0.035), s * p[1]);
        ctx.stroke();
      });
    },

    // Automatizaciones — grafo de nodos enlazados
    automatizacion: function (ctx, s) {
      const pts = [
        [0.16, 0.50], [0.38, 0.24], [0.38, 0.76],
        [0.62, 0.38], [0.62, 0.64], [0.86, 0.50]
      ].map(function (p) { return [p[0] * s, p[1] * s]; });
      const links = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [3, 4]];
      ctx.lineWidth = s * 0.016;
      links.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(pts[l[0]][0], pts[l[0]][1]);
        ctx.lineTo(pts[l[1]][0], pts[l[1]][1]);
        ctx.stroke();
      });
      ctx.lineWidth = s * 0.026;
      pts.forEach(function (p, i) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], s * (i === 0 || i === 5 ? 0.062 : 0.045), 0, Math.PI * 2);
        ctx.stroke();
      });
    },

    // Finanzas — barras ascendentes con flecha
    finanzas: function (ctx, s) {
      const base = s * 0.76;
      const hs = [0.20, 0.32, 0.46, 0.60];
      hs.forEach(function (h, i) {
        const x = s * (0.20 + i * 0.17);
        roundRect(ctx, x, base - s * h, s * 0.10, s * h, s * 0.03);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(s * 0.18, s * 0.30);
      ctx.lineTo(s * 0.84, s * 0.30);
      ctx.moveTo(s * 0.72, s * 0.20);
      ctx.lineTo(s * 0.84, s * 0.30);
      ctx.lineTo(s * 0.72, s * 0.40);
      ctx.stroke();
    },

    // Mercadeo — diana con flecha
    mercadeo: function (ctx, s) {
      [0.34, 0.22, 0.10].forEach(function (r) {
        ctx.beginPath();
        ctx.arc(s * 0.50, s * 0.52, s * r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(s * 0.86, s * 0.16);
      ctx.lineTo(s * 0.54, s * 0.48);
      ctx.moveTo(s * 0.86, s * 0.16);
      ctx.lineTo(s * 0.72, s * 0.18);
      ctx.moveTo(s * 0.86, s * 0.16);
      ctx.lineTo(s * 0.84, s * 0.30);
      ctx.stroke();
    },

    // Servicio al cliente — burbuja de chat
    servicio: function (ctx, s) {
      ctx.beginPath();
      ctx.moveTo(s * 0.22, s * 0.24);
      ctx.lineTo(s * 0.78, s * 0.24);
      ctx.quadraticCurveTo(s * 0.86, s * 0.24, s * 0.86, s * 0.32);
      ctx.lineTo(s * 0.86, s * 0.60);
      ctx.quadraticCurveTo(s * 0.86, s * 0.68, s * 0.78, s * 0.68);
      ctx.lineTo(s * 0.40, s * 0.68);
      ctx.lineTo(s * 0.26, s * 0.82);
      ctx.lineTo(s * 0.28, s * 0.68);
      ctx.lineTo(s * 0.22, s * 0.68);
      ctx.quadraticCurveTo(s * 0.14, s * 0.68, s * 0.14, s * 0.60);
      ctx.lineTo(s * 0.14, s * 0.32);
      ctx.quadraticCurveTo(s * 0.14, s * 0.24, s * 0.22, s * 0.24);
      ctx.closePath();
      ctx.stroke();
      [0.34, 0.50, 0.66].forEach(function (x) {
        ctx.beginPath();
        ctx.arc(s * x, s * 0.46, s * 0.030, 0, Math.PI * 2);
        ctx.fill();
      });
    },

    // Fotografía — cámara
    foto: function (ctx, s) {
      ctx.beginPath();
      ctx.moveTo(s * 0.34, s * 0.30);
      ctx.lineTo(s * 0.40, s * 0.22);
      ctx.lineTo(s * 0.60, s * 0.22);
      ctx.lineTo(s * 0.66, s * 0.30);
      ctx.stroke();
      roundRect(ctx, s * 0.14, s * 0.30, s * 0.72, s * 0.46, s * 0.07);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.50, s * 0.53, s * 0.155, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.50, s * 0.53, s * 0.075, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.75, s * 0.38, s * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  global.UNShapes = {
    fromPhoto: fromPhoto,
    fromImage: fromImage,
    fromIcon: fromIcon,
    neuralNet: neuralNet,
    torus: torus,
    ICONS: ICONS
  };

})(window);
