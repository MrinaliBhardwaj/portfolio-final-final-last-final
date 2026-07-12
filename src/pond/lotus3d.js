// The flower itself — a real 3D lotus, fully procedural, no asset and no
// three.js. Petals are parametric surfaces (an arc-bent spine, cupped
// cross-section, rippled edges) generated once as a grid and POSED in the
// vertex shader: bloom, sway and lean are uniforms, so the flower opens live.
// One buffer holds the whole plant — four petal rings, seed pod, stamens,
// stem, a lily pad, and the same geometry re-drawn smaller as a side bud.
//
// It renders twice per frame into two small offscreen textures:
//   lit  — botanical shading (wrap key, cool fill, back translucency, rim)
//   wire — the reflection's phosphor mesh (uv grid + fresnel edge)
// The pond composite samples these above and below the waterline.

const GRID_U = 18;
const GRID_V = 8;
const LAYERS = [8, 7, 6, 5]; // petals per ring, outer → inner

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 aUV;
layout(location=1) in vec4 aInfo; // kind, p1, p2, p3
uniform mat4 uVP;
uniform float uBloom;
uniform float uSway;   // whole-plant tilt, radians
uniform float uLean;
uniform vec3 uPlace;   // world position of the petal ring
uniform float uScale;
uniform float uIsBud;
out vec2 vUv;
out vec3 vN;
out vec3 vPos;
flat out float vKind;
flat out vec4 vInfo;

const float LEN = 0.34;
const float R0 = 0.050;

mat2 rot2(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

vec3 petalPoint(vec2 uv, vec4 info, float bloom){
  float az = info.y;
  float layerT = info.z;
  float rnd = info.w;
  float u = uv.x;
  float v = uv.y;
  float eb = smoothstep(0.0, 1.0, bloom);
  // outer rings open first and furthest; inner rings guard the heart
  float openL = clamp(eb * (1.12 - 0.30 * layerT) - 0.05 * layerT, 0.02, 1.0);
  float thetaB = mix(0.10, mix(1.35, 0.55, layerT), openL) + (rnd - 0.5) * 0.10;
  float len = LEN * mix(1.0, 0.60, layerT) * (0.95 + rnd * 0.10);
  // arc spine: curvature pulls the tip back up (the lotus cup)
  float kap = mix(-0.30, -0.95, openL) / len;
  float s = u * len;
  float th = thetaB + kap * s;
  float r0 = R0 * mix(1.0, 0.55, layerT);
  float rS = r0 + (cos(thetaB) - cos(th)) / kap;
  float zS = (sin(th) - sin(thetaB)) / kap;
  // obovate width, pointed tip
  float wid = len * mix(0.46, 0.40, layerT)
            * pow(sin(3.14159 * clamp(u * 0.94 + 0.03, 0.0, 1.0)), 0.62);
  float xw = (v - 0.5) * wid;
  // cupped cross-section, relaxing toward the tip; a faint ripple at the edge
  float cz = (0.38 - 0.16 * openL) * wid
           * (1.0 - pow(abs(v * 2.0 - 1.0), 2.0)) * (1.0 - 0.35 * u);
  cz += sin(v * 18.85 + rnd * 9.0) * 0.006 * u * len;
  vec3 R = vec3(cos(az), 0.0, sin(az));
  vec3 W = vec3(-sin(az), 0.0, cos(az));
  vec3 cupDir = R * (-cos(th)) + vec3(0.0, sin(th), 0.0);
  return R * rS + vec3(0.0, zS, 0.0) + W * xw + cupDir * cz;
}

vec3 shapePoint(vec2 uv){
  float kind = aInfo.x;
  float eb = smoothstep(0.0, 1.0, uBloom);
  if (kind < 0.5) {
    return petalPoint(uv, aInfo, uBloom);
  } else if (kind < 1.5) {
    // seed pod: a squashed sphere nested low inside the petal ring
    float th = uv.x * 6.2831853;
    float ph = uv.y * 3.14159;
    return vec3(0.0, 0.050, 0.0)
         + vec3(sin(ph) * cos(th), cos(ph) * 0.58, sin(ph) * sin(th)) * 0.035;
  } else if (kind < 2.5) {
    // stamen blade, unfolding only once the inner ring parts; folded ones
    // hide inside the pod
    float sOpen = smoothstep(0.40, 0.85, eb);
    float az = aInfo.y;
    float u = uv.x;
    vec3 R = vec3(cos(az), 0.0, sin(az));
    vec3 W = vec3(-sin(az), 0.0, cos(az));
    vec3 base = vec3(0.0, 0.05, 0.0);
    vec3 p = R * mix(0.040, 0.092, u) + vec3(0.0, 0.050 + u * 0.100, 0.0)
           + W * (uv.y - 0.5) * 0.012;
    return mix(base, p, sOpen);
  } else if (kind < 3.5) {
    // lily pad, world-anchored beside the stem
    float ang = uv.x * 6.2831853;
    float rad = uv.y * 0.165;
    float lift = 0.010 * smoothstep(0.82, 1.0, uv.y);
    return vec3(-0.19, 0.010 + lift - 0.006 * uv.y, 0.045)
         + vec3(cos(ang), 0.0, sin(ang)) * rad;
  }
  // stem: from under the water up into the flower base, with a lazy bend
  float t = uv.x;
  float ang = uv.y * 6.2831853;
  vec3 c = vec3(sin(t * 2.6) * 0.014, mix(-0.30, 0.0, t), 0.0);
  return c + vec3(cos(ang), 0.0, sin(ang)) * 0.013 * (1.0 - 0.25 * t);
}

vec3 place(vec3 p){
  float kind = aInfo.x;
  if (kind > 2.5 && kind < 3.5) return p; // the pad doesn't sway
  vec3 q = p * uScale;
  vec3 piv = vec3(0.0, -0.30, 0.0) * uScale;
  vec2 r = rot2(uSway + uLean * 0.45) * (q.xy - piv.xy);
  q = vec3(r.x + piv.x, r.y + piv.y, q.z);
  return uPlace + q;
}

void main(){
  float kind = aInfo.x;
  // the bud is the same plant, but keeps only petals and stem
  float keep = (uIsBud > 0.5 && kind > 0.5 && kind < 3.5) ? 0.0 : 1.0;
  vec3 p = shapePoint(aUV) * keep;
  float e = 0.012;
  vec3 pu = shapePoint(aUV + vec2(e, 0.0)) * keep;
  vec3 pv = shapePoint(aUV + vec2(0.0, e)) * keep;
  vec3 wp = place(p);
  vN = normalize(cross(place(pu) - wp, place(pv) - wp) + vec3(1e-6));
  vUv = aUV;
  vPos = wp;
  vKind = kind;
  vInfo = aInfo;
  gl_Position = uVP * vec4(wp, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform float uWireStyle;
uniform float uFlash;
uniform float uBloom;
uniform float uDim;
in vec2 vUv;
in vec3 vN;
in vec3 vPos;
flat in float vKind;
flat in vec4 vInfo;
out vec4 outColor;

const vec3 PHOS = vec3(0.294, 0.898, 0.553);

void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = vec3(0.0, 0.0, 1.0); // orthographic camera looks down -z

  if (uWireStyle > 0.5) {
    // the reflection's own rendering: a phosphor survey of the same body
    vec2 gd = vUv * (vKind < 0.5 ? vec2(8.0, 5.0) : vec2(10.0, 4.0));
    vec2 gg = abs(fract(gd + 0.5) - 0.5);
    vec2 fw = fwidth(gd) + 1e-4;
    vec2 ln = 1.0 - smoothstep(fw * 0.7, fw * 2.0, gg);
    float line = max(ln.x, ln.y);
    float edge = pow(1.0 - abs(dot(N, V)), 2.6);
    float a = clamp(line * 0.85 + edge * 0.75 + 0.05, 0.0, 1.0);
    outColor = vec4(PHOS * (line * 0.9 + edge * 0.8 + 0.06), a);
    return;
  }

  // lights: warm key upper-left, cool fill right, a moon behind for
  // translucency — petals glow when the light comes through them
  vec3 L1 = normalize(vec3(-0.5, 0.72, 0.55));
  vec3 L2 = normalize(vec3(0.65, 0.15, 0.35));
  vec3 L3 = normalize(vec3(0.10, 0.30, -0.92));
  float wrap = clamp((dot(N, L1) + 0.4) / 1.4, 0.0, 1.0);
  float fill = clamp(dot(N, L2), 0.0, 1.0);
  float sss = clamp(dot(-N, L3), 0.0, 1.0);
  float rim = pow(1.0 - abs(dot(N, V)), 3.0);
  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), 42.0);

  vec3 albedo;
  float sheen = 0.25;
  float rimAmt = 0.08; // strong rims belong to petals, not the waxy pad
  if (vKind < 0.5) {
    float u = vUv.x;
    float v = vUv.y;
    float layerT = vInfo.z;
    float rnd = vInfo.w;
    // deep rose base → cream tip, blushed edges, veined and creased
    albedo = mix(vec3(0.74, 0.30, 0.42), vec3(0.99, 0.93, 0.90), pow(u, 1.25));
    albedo = mix(albedo, vec3(0.94, 0.46, 0.62),
                 smoothstep(0.70, 1.0, u) * 0.55 + pow(abs(v * 2.0 - 1.0), 3.0) * 0.25);
    // veins fan from the base; a soft fold shadow runs up the middle
    float vein = smoothstep(0.80, 1.0, sin(v * 3.14159 * 16.0 + rnd * 4.0) * 0.5 + 0.5);
    albedo *= 1.0 - vein * 0.10 * (1.0 - u * 0.55);
    albedo *= 1.0 - smoothstep(0.06, 0.0, abs(v - 0.5)) * 0.12;
    // no two petals dyed alike
    albedo *= 0.94 + 0.12 * rnd;
    // inner rings are warmer, kissed by the gold heart
    albedo = mix(albedo, vec3(1.0, 0.86, 0.62),
                 (1.0 - u) * (layerT) * 0.35 * smoothstep(0.3, 0.9, uBloom));
    sheen = 0.30;
    rimAmt = 0.22;
  } else if (vKind < 1.5) {
    // seed pod: deep green-gold, pocked — the dots dissolve at the poles
    // where the uv grid pinches
    float poleFade = smoothstep(0.12, 0.32, vUv.y) * smoothstep(0.95, 0.70, vUv.y);
    float dots = smoothstep(0.28, 0.16,
      length(fract(vUv * vec2(9.0, 4.0)) - 0.5)) * poleFade;
    albedo = mix(vec3(0.56, 0.55, 0.24), vec3(0.20, 0.27, 0.12), dots * 0.85);
    sheen = 0.12;
  } else if (vKind < 2.5) {
    // stamens: filament to saturated anther
    albedo = mix(vec3(0.98, 0.85, 0.45), vec3(1.0, 0.66, 0.20),
                 smoothstep(0.55, 0.9, vUv.x));
    albedo *= 1.25; // slightly emissive — the treasure in the middle
    sheen = 0.1;
  } else if (vKind < 3.5) {
    // lily pad: deep green, radial veins, waxy rim light
    float vein = smoothstep(0.90, 1.0, sin(vUv.x * 6.2831853 * 14.0) * 0.5 + 0.5);
    albedo = mix(vec3(0.075, 0.19, 0.13), vec3(0.14, 0.30, 0.19), vUv.y);
    albedo = mix(albedo, vec3(0.20, 0.40, 0.24), vein * 0.5);
    sheen = 0.35;
  } else {
    albedo = vec3(0.16, 0.30, 0.19);
    sheen = 0.1;
  }

  vec3 col = albedo * (0.16
           + wrap * vec3(1.0, 0.93, 0.84) * 1.05
           + fill * vec3(0.45, 0.58, 0.72) * 0.35);
  if (vKind < 0.5) {
    col += vec3(1.0, 0.55, 0.62) * sss * 0.55 * (0.4 + 0.6 * vUv.x);
    // silk: the sheen runs in a band along the petal, not everywhere
    spec *= 0.5 + 0.9 * sin(vUv.y * 3.14159);
  }
  col += vec3(1.0, 0.96, 0.9) * (spec * sheen + rim * rimAmt);
  col += vec3(1.0, 0.82, 0.62) * uFlash * 0.55;
  col *= uDim;

  // gentle rolloff only — the albedos are authored in display space, so a
  // second gamma would wash the roses to chalk
  col = col / (1.0 + col * 0.10);
  outColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("lotus shader: " + log);
  }
  return sh;
}

// ---- geometry: one interleaved buffer, 6 floats a vertex ----
function pushQuadGrid(arr, nu, nv, info) {
  // two triangles per cell; uv laid out so the vertex shader shapes it
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const u0 = i / nu;
      const u1 = (i + 1) / nu;
      const v0 = j / nv;
      const v1 = (j + 1) / nv;
      const quad = [
        [u0, v0], [u1, v0], [u1, v1],
        [u0, v0], [u1, v1], [u0, v1],
      ];
      for (const [u, v] of quad) arr.push(u, v, ...info);
    }
  }
}

function buildGeometry() {
  const a = [];
  const rand = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  // petal rings, staggered azimuths
  LAYERS.forEach((count, layer) => {
    const layerT = layer / (LAYERS.length - 1);
    for (let k = 0; k < count; k++) {
      const az = ((k + layer * 0.5) / count) * Math.PI * 2;
      pushQuadGrid(a, GRID_U, GRID_V, [0, az, layerT, rand(layer * 17 + k)]);
    }
  });
  pushQuadGrid(a, 20, 12, [1, 0, 0, 0]); // pod
  for (let k = 0; k < 26; k++) {
    const az = (k / 26) * Math.PI * 2 + 0.12;
    pushQuadGrid(a, 4, 1, [2, az, 0, rand(k + 99)]); // stamens
  }
  pushQuadGrid(a, 30, 5, [3, 0, 0, 0]); // lily pad
  pushQuadGrid(a, 12, 7, [4, 0, 0, 0]); // stem
  return new Float32Array(a);
}

// ---- column-major mat4 helpers (just enough for one still camera) ----
function matMul(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}
function matOrtho(l, r, b, t, n, f) {
  return new Float32Array([
    2 / (r - l), 0, 0, 0,
    0, 2 / (t - b), 0, 0,
    0, 0, -2 / (f - n), 0,
    -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1,
  ]);
}
function matRotY(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}
function matRotX(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

// the composite must map this exact frame: x,y in [-0.38,0.38]x[-0.10,0.66]
export const LOTUS_FRAME = { x0: -0.38, y0: -0.1, size: 0.76 };

export function createLotusScene(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("lotus link: " + gl.getProgramInfoLog(prog));
  }
  const U = {};
  for (const n of [
    "uVP", "uBloom", "uSway", "uLean", "uPlace", "uScale", "uIsBud", "uWireStyle", "uFlash", "uDim",
  ]) {
    U[n] = gl.getUniformLocation(prog, n);
  }

  const verts = buildGeometry();
  const vertCount = verts.length / 6;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
  gl.bindVertexArray(null);

  let res = 0;
  const tex = { lit: null, wire: null };
  const fbo = { lit: null, wire: null };
  let depth = null;

  function setRes(next) {
    if (next === res) return;
    res = next;
    for (const k of ["lit", "wire"]) {
      if (tex[k]) gl.deleteTexture(tex[k]);
      if (fbo[k]) gl.deleteFramebuffer(fbo[k]);
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, res, res, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tex[k] = t;
      fbo[k] = gl.createFramebuffer();
    }
    if (depth) gl.deleteRenderbuffer(depth);
    depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, res, res);
    for (const k of ["lit", "wire"]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[k]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex[k], 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  setRes(768);

  function drawPlant(state, flash, isWire) {
    gl.uniform1f(U.uWireStyle, isWire ? 1 : 0);
    gl.uniform1f(U.uFlash, flash);
    // the flower
    gl.uniform1f(U.uBloom, state.bloom);
    gl.uniform1f(U.uSway, state.sway);
    gl.uniform1f(U.uLean, state.lean);
    gl.uniform3f(U.uPlace, 0, 0.185, 0);
    gl.uniform1f(U.uScale, 0.62);
    gl.uniform1f(U.uIsBud, 0);
    gl.uniform1f(U.uDim, 1);
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    // the side bud — the same plant, younger
    gl.uniform1f(U.uBloom, 0.06);
    gl.uniform1f(U.uSway, state.sway * 1.4 + 0.05);
    gl.uniform3f(U.uPlace, 0.205, 0.105, -0.12);
    gl.uniform1f(U.uScale, 0.30);
    gl.uniform1f(U.uIsBud, 1);
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    // and one more far behind, almost asleep — depth for free
    gl.uniform1f(U.uBloom, 0.02);
    gl.uniform1f(U.uSway, state.sway * 0.7 - 0.04);
    gl.uniform3f(U.uPlace, -0.245, 0.075, -0.30);
    gl.uniform1f(U.uScale, 0.17);
    gl.uniform1f(U.uDim, 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
  }

  function render(stateA, stateB, flash, time) {
    const yaw = 0.05 + 0.10 * Math.sin(time * 0.17);
    const vp = matMul(matOrtho(-0.38, 0.38, -0.1, 0.66, -2, 2), matMul(matRotX(-0.08), matRotY(yaw)));
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniformMatrix4fv(U.uVP, false, vp);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    for (const [k, st, wire] of [
      ["lit", stateA, false],
      ["wire", stateB, true],
    ]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[k]);
      gl.viewport(0, 0, res, res);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawPlant(st, wire ? 0 : flash, wire);
    }
    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    for (const k of ["lit", "wire"]) {
      gl.bindTexture(gl.TEXTURE_2D, tex[k]);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.bindVertexArray(null);
  }

  return {
    render,
    setRes,
    get textures() {
      return tex;
    },
    dispose() {
      gl.deleteProgram(prog);
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(buf);
      for (const k of ["lit", "wire"]) {
        if (tex[k]) gl.deleteTexture(tex[k]);
        if (fbo[k]) gl.deleteFramebuffer(fbo[k]);
      }
      if (depth) gl.deleteRenderbuffer(depth);
    },
  };
}
