/* ============================================================
   particles.js — motor WebGL de partículas.
   Interpola entre dos nubes de puntos y las hace estallar
   a mitad de camino (el efecto del video de referencia).
   ============================================================ */
(function (global) {
  'use strict';

  const VERT = [
    'precision highp float;',
    'attribute vec3 aPosA;',
    'attribute vec3 aPosB;',
    'attribute vec3 aColA;',
    'attribute vec3 aColB;',
    'attribute vec3 aSeed;',
    'uniform float uT;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform vec2  uOffset;',
    'uniform float uScatter;',
    'uniform float uSize;',
    'uniform float uFade;',
    'uniform float uRot;',
    'uniform float uFocal;',
    'varying vec3  vColor;',
    'varying float vAlpha;',
    'const float PI = 3.14159265;',
    'void main(){',
    '  float t = uT;',
    '  vec3 base = mix(aPosA, aPosB, t);',
    '  float burst = sin(t * PI);',            // 0 en los extremos, 1 a mitad
    // La dispersión va sesgada hacia abajo: las partículas se difuminan y
    // "caen" hacia la forma siguiente, como en el video de referencia.
    '  vec3 dir = normalize(aSeed * 2.0 - 1.0 + vec3(0.0, -0.75, 0.0) + vec3(0.0001));',
    '  vec3 p = base + dir * burst * uScatter * (0.35 + aSeed.x * 1.6);',
    // respiración constante para que nunca se vea congelado
    '  p.x += sin(uTime * 0.55 + aSeed.y * 12.56) * 0.007;',
    '  p.y += cos(uTime * 0.47 + aSeed.z * 12.56) * 0.007;',
    '  p.z += sin(uTime * 0.40 + aSeed.x * 12.56) * 0.010;',
    // rotación en Y (para la red neuronal y el toroide)
    '  float a = uRot;',
    '  vec3 q = vec3(p.x * cos(a) + p.z * sin(a), p.y, -p.x * sin(a) + p.z * cos(a));',
    '  float persp = uFocal / max(0.15, uFocal - q.z);',
    '  gl_Position = vec4(q.x * persp / uAspect + uOffset.x, q.y * persp + uOffset.y, 0.0, 1.0);',
    '  gl_PointSize = uSize * persp * (0.55 + aSeed.x * 0.9);',
    '  vec3 c = mix(aColA, aColB, t);',
    '  vColor = mix(c, vec3(0.878, 0.694, 0.408), burst * 0.45);', // se dora al estallar
    '  vAlpha = uFade * (1.0 - burst * 0.45);',                    // y se difumina
    '}'
  ].join('\n');

  const FRAG = [
    'precision mediump float;',
    'varying vec3  vColor;',
    'varying float vAlpha;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  float r = dot(d, d);',
    '  if (r > 0.25) discard;',
    '  float a = smoothstep(0.25, 0.02, r) * vAlpha;',
    '  gl_FragColor = vec4(vColor, a);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('Shader: ' + gl.getShaderInfoLog(s));
    }
    return s;
  }

  function ParticleField(canvas, count) {
    this.canvas = canvas;
    this.count = count;
    this.shapes = [];
    this.stage = -1;
    this.t = 0;
    this.rot = 0;
    this.fade = 1;
    this.offset = [0, 0];
    this.scatter = 0.55;
    this.running = false;

    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });
    if (!gl) throw new Error('WebGL no disponible');
    this.gl = gl;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Program: ' + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);
    this.prog = prog;

    this.attr = {};
    ['aPosA', 'aPosB', 'aColA', 'aColB', 'aSeed'].forEach(function (n) {
      this.attr[n] = { loc: gl.getAttribLocation(prog, n), buf: gl.createBuffer() };
    }, this);

    this.uni = {};
    ['uT', 'uTime', 'uAspect', 'uOffset', 'uScatter', 'uSize', 'uFade', 'uRot', 'uFocal']
      .forEach(function (n) { this.uni[n] = gl.getUniformLocation(prog, n); }, this);

    // semillas aleatorias por partícula (fijas toda la vida)
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) seed[i] = Math.random();
    this._upload('aSeed', seed);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    this.resize();
  }

  ParticleField.prototype._upload = function (name, data) {
    const gl = this.gl, a = this.attr[name];
    gl.bindBuffer(gl.ARRAY_BUFFER, a.buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a.loc);
    gl.vertexAttribPointer(a.loc, 3, gl.FLOAT, false, 0, 0);
  };

  ParticleField.prototype.setShapes = function (shapes) {
    this.shapes = shapes;
    this.stage = -1;             // fuerza la primera subida
  };

  // stage = índice de forma actual; t = 0..1 hacia la siguiente
  ParticleField.prototype.setMorph = function (stage, t) {
    const n = this.shapes.length;
    if (!n) return;
    stage = Math.max(0, Math.min(n - 1, stage));
    if (stage !== this.stage) {
      this.stage = stage;
      const A = this.shapes[stage];
      const B = this.shapes[Math.min(n - 1, stage + 1)];
      this._upload('aPosA', A.pos);
      this._upload('aColA', A.col);
      this._upload('aPosB', B.pos);
      this._upload('aColB', B.col);
      // Solo las formas con volumen giran. Una forma plana (el rostro, los
      // iconos) girada 90° se vería de canto, como una raya.
      this.spinA = A.spin ? 1 : 0;
      this.spinB = B.spin ? 1 : 0;
    }
    this.t = Math.max(0, Math.min(1, t));
  };

  ParticleField.prototype.resize = function () {
    const dpr = Math.min(global.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || global.innerWidth;
    const h = this.canvas.clientHeight || global.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.aspect = w / h;
    this.dpr = dpr;
    this.wide = w > 860;
  };

  ParticleField.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    const self = this;
    let t0 = performance.now();

    function frame(now) {
      if (!self.running) return;
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      self.rot += dt * 0.12;
      self.draw(now / 1000);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  ParticleField.prototype.draw = function (time) {
    const gl = this.gl, u = this.uni;
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.shapes.length) return;

    gl.uniform1f(u.uT, this.t);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uAspect, this.aspect);
    gl.uniform2f(u.uOffset, this.offset[0], this.offset[1]);
    gl.uniform1f(u.uScatter, this.scatter);
    gl.uniform1f(u.uSize, 2.0 * this.dpr * (this.wide ? 1 : 0.9));
    gl.uniform1f(u.uFade, this.fade);
    const spin = (this.spinA || 0) + ((this.spinB || 0) - (this.spinA || 0)) * this.t;
    gl.uniform1f(u.uRot, this.rot * spin);
    gl.uniform1f(u.uFocal, 3.2);

    gl.drawArrays(gl.POINTS, 0, this.count);
  };

  global.ParticleField = ParticleField;

})(window);
