/* Foundry hero scenes: a photographic plate driven by a WebGL fragment shader.

   The plate is a real photograph of hot metal; the shader makes it move. Every effect is
   masked by the plate's own luminance, so only the parts that are actually hot shimmer,
   flicker and flow, while cold iron and dark bench stay rock steady. That masking is what
   keeps the motion reading as real rather than as a filter over a picture.

   Markup contract:
     <canvas class="scene" data-mode="crucible|ingot|anvil|assay"
             data-wide="assets/scene.jpg" data-tall="assets/scene-tall.jpg"></canvas>
   The same plate is set as a CSS background on the canvas's parent, so if WebGL is missing
   or the texture fails to load we drop the canvas and the still image is already in place.

   Half-resolution render, paused when hidden or scrolled out of view, and a single static
   frame under prefers-reduced-motion. No dependencies. */
(function () {
  "use strict";

  var VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

  var HEAD = [
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_t;",
    "uniform sampler2D u_tex;",
    "uniform float u_texAspect;",
    "uniform vec2 u_m;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
    "  for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.5; }",
    "  return v;",
    "}",
    "float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }",

    /* object-fit: cover, so the plate never stretches at any viewport ratio */
    "vec2 coverUV(vec2 uv){",
    "  float ca = u_res.x / u_res.y;",
    "  vec2 s = ca > u_texAspect ? vec2(1.0, u_texAspect / ca) : vec2(ca / u_texAspect, 1.0);",
    "  return (uv - 0.5) * s + 0.5;",
    "}",
    "vec3 plate(vec2 uv){ return texture2D(u_tex, clamp(uv, 0.001, 0.999)).rgb; }",
    ""
  ].join("\n");

  /* Each mode returns the final colour. `base` is the unwarped plate sample used only to
     derive the heat mask, so the mask never swims with the distortion it is driving. */
  var MODES = {
    /* Convection: two-scale swirl in the melt, hot veins breathing, haze rising off the top. */
    crucible: [
      "void main(){",
      "  vec2 uv0 = coverUV(gl_FragCoord.xy / u_res);",
      "  vec3 base = plate(uv0);",
      "  float heat = smoothstep(0.10, 0.52, lum(base));",
      "  float t = u_t * 0.085;",
      "  vec2 q = uv0 * 3.4;",
      "  vec2 slow = vec2(fbm(q + vec2(t, -t * 0.7)), fbm(q + vec2(4.7, 1.9) - t)) - 0.5;",
      "  vec2 fast = vec2(fbm(q * 3.1 + vec2(t * 3.0, 0.0)), fbm(q * 3.1 - vec2(0.0, t * 2.4))) - 0.5;",
      "  vec2 rise = vec2(0.0, -fbm(uv0 * vec2(6.0, 2.2) + vec2(0.0, u_t * 0.30)) * 0.5);",
      "  vec2 uv = uv0 + (slow * 0.028 + fast * 0.009 + rise * 0.010) * heat",
      "          + (u_m - 0.5) * 0.006 * heat;",
      "  vec3 c = plate(uv);",
      "  float pulse = fbm(uv0 * 2.2 + vec2(0.0, u_t * 0.42));",
      "  c *= 1.0 + heat * (pulse - 0.5) * 0.42;",
      "  c += vec3(1.0, 0.34, 0.06) * heat * heat * 0.10 * (0.5 + 0.5 * sin(u_t * 0.9 + uv0.x * 5.0));",
      "  gl_FragColor = vec4(c, 1.0);",
      "}"
    ].join("\n"),

    /* The pour: bright stream flows down, cast metal shimmers, a specular band travels the bars. */
    ingot: [
      "void main(){",
      "  vec2 uv0 = coverUV(gl_FragCoord.xy / u_res);",
      "  vec3 base = plate(uv0);",
      "  float L = lum(base);",
      "  float heat = smoothstep(0.12, 0.55, L);",
      "  float stream = smoothstep(0.45, 0.86, L);",
      "  float flow = fbm(vec2(uv0.x * 26.0, uv0.y * 5.0 - u_t * 1.55));",
      "  float melt = fbm(uv0 * 4.2 + vec2(u_t * 0.10, -u_t * 0.16));",
      "  vec2 uv = uv0",
      "          + vec2((flow - 0.5) * 0.013, (flow - 0.5) * 0.030) * stream",
      "          + vec2((melt - 0.5) * 0.010, 0.0) * (heat - stream * heat)",
      "          + (u_m - 0.5) * 0.005 * heat;",
      "  vec3 c = plate(uv);",
      "  c *= 1.0 + stream * (flow - 0.5) * 0.50;",
      "  float band = exp(-pow((uv0.x + uv0.y * 0.45 - fract(u_t * 0.075) * 2.0 + 0.4) * 5.5, 2.0));",
      "  c += vec3(1.0, 0.80, 0.36) * band * heat * 0.16;",
      "  c += vec3(1.0, 0.72, 0.24) * stream * 0.06 * (0.5 + 0.5 * sin(u_t * 1.7));",
      "  gl_FragColor = vec4(c, 1.0);",
      "}"
    ].join("\n"),

    /* The strike: baked sparks twinkle, fresh sparks fan from the strike point under gravity. */
    anvil: [
      "vec3 sparks(vec2 p, vec2 origin){",
      "  vec3 sum = vec3(0.0);",
      "  for (int i = 0; i < 40; i++){",
      "    float fi = float(i);",
      "    float seed = hash(vec2(fi, 3.7));",
      "    float life = 1.15 + seed * 1.5;",
      "    float age = fract((u_t + seed * 7.3) / life);",
      "    float ang = mix(-0.20, 1.36, hash(vec2(fi, 11.3)));",
      "    float spd = mix(0.42, 1.18, hash(vec2(fi, 19.1)));",
      "    vec2 v = vec2(cos(ang), sin(ang)) * spd;",
      "    vec2 pos = origin + v * age - vec2(0.0, 1.28 * age * age);",
      "    float d = length((p - pos) * vec2(1.0, 1.0));",
      "    float fade = (1.0 - age) * (1.0 - age);",
      "    float core = exp(-d * 620.0) * fade;",
      "    float glow = exp(-d * 95.0) * fade * 0.16;",
      "    sum += (vec3(1.0, 0.62, 0.24) * glow + vec3(1.0, 0.90, 0.72) * core);",
      "  }",
      "  return sum;",
      "}",
      "void main(){",
      "  vec2 uv0 = coverUV(gl_FragCoord.xy / u_res);",
      "  vec3 base = plate(uv0);",
      "  float L = lum(base);",
      "  float heat = smoothstep(0.13, 0.58, L);",
      "  float shim = fbm(uv0 * vec2(9.0, 4.0) + vec2(0.0, u_t * 0.55));",
      "  vec2 uv = uv0 + vec2((shim - 0.5) * 0.010, -(shim - 0.5) * 0.016) * heat",
      "          + (u_m - 0.5) * 0.004 * heat;",
      "  vec3 c = plate(uv);",
      /* baked sparks are small and bright: twinkle them per-pixel, fast and uncorrelated */
      "  float tw = noise(uv0 * 240.0 + vec2(u_t * 5.5, -u_t * 4.1));",
      "  float hot = smoothstep(0.34, 0.80, L);",
      "  c *= 1.0 + hot * (tw - 0.45) * 0.85;",
      "  float flash = pow(0.5 + 0.5 * sin(u_t * 2.15), 6.0);",
      "  c += vec3(1.0, 0.52, 0.16) * heat * flash * 0.13;",
      "  vec2 p = (gl_FragCoord.xy / u_res - 0.5) * vec2(u_res.x / u_res.y, 1.0);",
      "  c += sparks(p, vec2(-0.22, -0.10)) * 0.85;",
      "  gl_FragColor = vec4(c, 1.0);",
      "}"
    ].join("\n"),

    /* The cupel: almost still. The bead breathes and a thread of haze lifts off it. */
    assay: [
      "void main(){",
      "  vec2 uv0 = coverUV(gl_FragCoord.xy / u_res);",
      "  vec3 base = plate(uv0);",
      "  float L = lum(base);",
      "  float bead = smoothstep(0.42, 0.78, L);",
      "  float warm = smoothstep(0.16, 0.46, L);",
      "  float haze = fbm(uv0 * vec2(7.0, 2.6) + vec2(0.0, u_t * 0.22));",
      "  vec2 uv = uv0 + vec2((haze - 0.5) * 0.0055, -(haze - 0.5) * 0.0090) * (bead + warm * 0.35)",
      "          + (u_m - 0.5) * 0.0030 * warm;",
      "  vec3 c = plate(uv);",
      "  float breath = 0.5 + 0.5 * sin(u_t * 0.78);",
      "  c *= 1.0 + bead * (breath - 0.5) * 0.26;",
      "  c += vec3(1.0, 0.74, 0.30) * bead * bead * 0.09 * breath;",
      "  gl_FragColor = vec4(c, 1.0);",
      "}"
    ].join("\n")
  };

  function compile(gl, src, kind) {
    var s = gl.createShader(kind);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function boot(canvas) {
    var mode = canvas.getAttribute("data-mode");
    var frag = MODES[mode];
    if (!frag) { canvas.remove(); return; }

    var gl = canvas.getContext("webgl", {
      antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power"
    });
    if (!gl) { canvas.remove(); return; }

    var vs = compile(gl, VERT, gl.VERTEX_SHADER);
    var fs = compile(gl, HEAD + frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) { canvas.remove(); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uT = gl.getUniformLocation(prog, "u_t");
    var uAspect = gl.getUniformLocation(prog, "u_texAspect");
    var uM = gl.getUniformLocation(prog, "u_m");

    /* Pick the plate that matches the viewport shape, so mobile gets the portrait crop
       rather than the centre slice of a landscape frame. */
    var tall = canvas.getAttribute("data-tall");
    var wide = canvas.getAttribute("data-wide");
    var src = (tall && window.innerWidth / window.innerHeight < 0.9) ? tall : wide;

    var img = new Image();
    img.decoding = "async";
    img.onerror = function () { canvas.remove(); };
    img.onload = function () {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);
      gl.uniform1f(uAspect, img.naturalWidth / img.naturalHeight);
      run();
      canvas.classList.add("ready");
    };
    img.src = src;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    var running = false, onScreen = true, raf = 0, start = 0;

    function resize() {
      var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      var w = Math.max(1, Math.round(canvas.clientWidth * scale));
      var h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(t) {
      resize();
      smx += (mx - smx) * 0.045;
      smy += (my - smy) * 0.045;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform2f(uM, smx, smy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) {
        start = performance.now() - (start ? 0 : 0);
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    function run() {
      if (reduce) {
        draw(18.0);
        window.addEventListener("resize", function () { draw(18.0); });
        return;
      }
      start = performance.now();
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX / window.innerWidth;
        my = 1 - e.clientY / window.innerHeight;
      }, { passive: true });
      document.addEventListener("visibilitychange", function () {
        setRunning(!document.hidden && onScreen);
      });
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
          onScreen = entries[0].isIntersecting;
          setRunning(!document.hidden && onScreen);
        }).observe(canvas);
      }
      setRunning(true);
    }
  }

  var nodes = document.querySelectorAll("canvas.scene");
  for (var i = 0; i < nodes.length; i++) boot(nodes[i]);
})();
