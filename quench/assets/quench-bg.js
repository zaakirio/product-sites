/* quench background: deep water with an ember glow cooling to teal, steam drifting up.
   Raw WebGL fullscreen shader, no dependencies. Renders at half resolution,
   pauses when hidden, draws a single static frame under prefers-reduced-motion. */
(function () {
  var canvas = document.getElementById("quench-bg");
  if (!canvas) return;
  var gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false });
  if (!gl) { canvas.remove(); return; }

  var VERT = [
    "attribute vec2 a;",
    "void main(){ gl_Position = vec4(a, 0.0, 1.0); }"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_t;",
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
    "  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; }",
    "  return v;",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  float aspect = u_res.x / u_res.y;",
    "  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);",
    "  vec2 par = (u_m - 0.5) * 0.08;",

    "  float t = u_t * 0.055;",
    "  vec2 q = (p + par) * 3.1;",

    "  vec2 warp = vec2(fbm(q + vec2(t, -t * 0.6)), fbm(q + vec2(5.2, 1.3) - t));",
    "  vec2 wq = q + 1.7 * warp + vec2(0.0, t * 0.35);",
    "  float h = fbm(wq);",
    "  float e = 0.028;",
    "  float hx = fbm(wq + vec2(e, 0.0)) - h;",
    "  float hy = fbm(wq + vec2(0.0, e)) - h;",
    "  vec3 nrm = normalize(vec3(-hx / e * 0.6, -hy / e * 0.6, 1.0));",

    "  vec3 L = normalize(vec3(-0.35, 0.75, 0.42));",
    "  float diff = max(dot(nrm, L), 0.0);",
    "  float spec = pow(max(dot(reflect(-L, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 34.0);",

    "  vec3 deep  = vec3(0.018, 0.036, 0.066);",
    "  vec3 mid   = vec3(0.055, 0.115, 0.185);",
    "  vec3 teal  = vec3(0.18, 0.60, 0.68);",
    "  vec3 ember = vec3(0.62, 0.17, 0.07);",

    "  vec3 col = mix(deep, mid, smoothstep(0.1, 0.95, h));",
    "  col += teal * diff * 0.24;",

    // ember glow low in the scene, quenched as it rises into teal water
    "  float emberMask = smoothstep(0.62, -0.08, uv.y) * (0.3 + 0.7 * fbm(q * 0.8 + vec2(0.0, -t * 0.8)));",
    "  col = mix(col, col + ember * 0.7, emberMask * 0.65);",
    "  col += teal * spec * (0.5 + 0.5 * smoothstep(0.0, 0.6, uv.y)) * 1.1;",
    "  col += vec3(0.75, 0.95, 1.0) * spec * spec * 0.5;",

    // steam: two soft layers drifting upward, strongest near the top edges
    "  vec2 sq = (p + par * 1.6) * 1.4;",
    "  float steam = fbm(sq * 1.2 + vec2(t * 0.5, -t * 1.4));",
    "  steam = smoothstep(0.45, 0.95, steam);",
    "  float steamMask = smoothstep(0.25, 0.95, uv.y) * (0.35 + 0.65 * smoothstep(0.12, 0.55, abs(p.x)));",
    "  col += vec3(0.42, 0.58, 0.68) * steam * steamMask * 0.2;",

    // darken the middle band so the console and headline stay readable
    "  float content = smoothstep(0.78, 0.3, abs(p.x)) * smoothstep(0.66, 0.32, abs(uv.y - 0.52));",
    "  col *= 1.0 - content * 0.3;",
    "  float vig = smoothstep(1.35, 0.35, length(p * vec2(0.75, 1.1)));",
    "  col *= 0.64 + 0.36 * vig;",

    // dither to kill banding on the dark gradients
    "  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
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
  var uM = gl.getUniformLocation(prog, "u_m");

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  var running = false, visible = true, raf = 0, start = performance.now();

  function resize() {
    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    var w = Math.max(1, Math.round(canvas.clientWidth * scale));
    var hpx = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== hpx) {
      canvas.width = w;
      canvas.height = hpx;
      gl.viewport(0, 0, w, hpx);
    }
  }

  function draw(now) {
    resize();
    smx += (mx - smx) * 0.04;
    smy += (my - smy) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - start) / 1000);
    gl.uniform2f(uM, smx, smy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) raf = requestAnimationFrame(frame);
    else cancelAnimationFrame(raf);
  }

  if (reduce) {
    resize();
    draw(start + 40000);
    window.addEventListener("resize", function () { draw(start + 40000); });
    return;
  }

  window.addEventListener("pointermove", function (e) {
    mx = e.clientX / window.innerWidth;
    my = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    setRunning(!document.hidden && visible);
  });
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    setRunning(!document.hidden && visible);
  }).observe(canvas);

  setRunning(true);
})();
